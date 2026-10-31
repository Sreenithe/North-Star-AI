// routes/auth.js
const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { authenticate } = require('../middleware/auth');

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'Email and password required' });

  try {
    const userRes = await db.query('SELECT * FROM users WHERE email=$1', [email]);
    if (!userRes.rows.length)
      return res.status(401).json({ error: 'Invalid credentials' });

    const user = userRes.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid)
      return res.status(401).json({ error: 'Invalid credentials' });

    // Get engineer profile if exists
    const engRes = await db.query(
      'SELECT id, name, current_level, department, team FROM engineers WHERE user_id=$1',
      [user.id]
    );
    const engineer = engRes.rows[0] || null;

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role, engineerId: engineer?.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      token,
      user: { id: user.id, email: user.email, role: user.role },
      engineer,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { email, password, name, role = 'engineer', department, team } = req.body;
  if (!email || !password || !name)
    return res.status(400).json({ error: 'Email, password, and name required' });

  try {
    const exists = await db.query('SELECT id FROM users WHERE email=$1', [email]);
    if (exists.rows.length)
      return res.status(409).json({ error: 'Email already registered' });

    const hash = await bcrypt.hash(password, 10);
    const userRes = await db.query(
      'INSERT INTO users (email, password_hash, role) VALUES ($1,$2,$3) RETURNING id, email, role',
      [email, hash, role]
    );
    const user = userRes.rows[0];

    const engRes = await db.query(
      `INSERT INTO engineers (user_id, name, email, department, team)
       VALUES ($1,$2,$3,$4,$5) RETURNING id, name`,
      [user.id, name, email, department, team]
    );

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role, engineerId: engRes.rows[0].id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({ token, user, engineer: engRes.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/auth/me
router.get('/me', authenticate, async (req, res) => {
  try {
    const userRes = await db.query('SELECT id, email, role FROM users WHERE id=$1', [req.user.userId]);
    const engRes = await db.query(
      `SELECT e.*, ps.north_star_score, ps.current_level, ps.predicted_next_level, ps.promotion_readiness_pct
       FROM engineers e
       LEFT JOIN performance_scores ps ON ps.engineer_id = e.id
       WHERE e.user_id = $1
       ORDER BY ps.created_at DESC LIMIT 1`,
      [req.user.userId]
    );
    res.json({ user: userRes.rows[0], engineer: engRes.rows[0] || null });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;