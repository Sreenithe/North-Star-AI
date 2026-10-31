// routes/engineers.js
const router = require('express').Router();
const db = require('../db');
const { authenticate, requireRole } = require('../middleware/auth');
const { calculateNorthStarScore } = require('../services/scoringEngine');

// GET /api/engineers — all engineers (manager/admin/hr)
router.get('/', authenticate, requireRole('manager', 'admin', 'hr'), async (req, res) => {
  try {
    const result = await db.query(`
      SELECT e.id, e.name, e.email, e.department, e.team, e.current_level, e.years_experience,
             e.joining_date, e.github_username,
             ps.north_star_score, ps.work_completion_score, ps.code_quality_score,
             ps.time_efficiency_score, ps.skill_acquisition_score,
             ps.predicted_next_level, ps.promotion_readiness_pct, ps.created_at as score_date
      FROM engineers e
      LEFT JOIN LATERAL (
        SELECT * FROM performance_scores WHERE engineer_id = e.id ORDER BY created_at DESC LIMIT 1
      ) ps ON true
      ORDER BY ps.north_star_score DESC NULLS LAST
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/engineers/:id — single engineer
router.get('/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  // Engineers can only view their own profile unless manager/admin
  if (req.user.role === 'engineer' && req.user.engineerId !== parseInt(id)) {
    return res.status(403).json({ error: 'Access denied' });
  }
  try {
    const engRes = await db.query(`
      SELECT e.*, m.name as manager_name
      FROM engineers e
      LEFT JOIN engineers m ON m.id = e.manager_id
      WHERE e.id = $1
    `, [id]);

    if (!engRes.rows.length) return res.status(404).json({ error: 'Engineer not found' });

    const scoresRes = await db.query(`
      SELECT * FROM performance_scores WHERE engineer_id=$1 ORDER BY created_at DESC LIMIT 6
    `, [id]);

    const skillsRes = await db.query(`
      SELECT * FROM skills WHERE engineer_id=$1 ORDER BY proficiency DESC
    `, [id]);

    const recsRes = await db.query(`
      SELECT * FROM ai_recommendations WHERE engineer_id=$1 AND is_completed=false ORDER BY priority DESC, created_at DESC LIMIT 10
    `, [id]);

    res.json({
      engineer: engRes.rows[0],
      scores: scoresRes.rows,
      skills: skillsRes.rows,
      recommendations: recsRes.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/engineers/:id/metrics — submit new performance metrics
router.post('/:id/metrics', authenticate, async (req, res) => {
  const { id } = req.params;
  if (req.user.role === 'engineer' && req.user.engineerId !== parseInt(id)) {
    return res.status(403).json({ error: 'Access denied' });
  }

  const m = req.body;
  try {
    // Insert metrics
    const metRes = await db.query(`
      INSERT INTO performance_metrics
      (engineer_id, period_start, period_end,
       sprints_completed, total_sprints, tickets_closed, tickets_assigned, on_time_delivery_pct,
       commits_count, prs_merged, prs_reviewed, bugs_introduced, bugs_fixed,
       code_review_score, sonar_maintainability,
       avg_cycle_time_hours, focus_time_pct, context_switches, overtime_hours,
       courses_completed, certifications_earned, new_technologies, mentoring_sessions)
      VALUES ($1, $2, $3, $4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23)
      RETURNING *
    `, [id, m.period_start || new Date(Date.now()-30*86400000), m.period_end || new Date(),
        m.sprints_completed||0, m.total_sprints||1, m.tickets_closed||0, m.tickets_assigned||1,
        m.on_time_delivery_pct||0, m.commits_count||0, m.prs_merged||0, m.prs_reviewed||0,
        m.bugs_introduced||0, m.bugs_fixed||0, m.code_review_score||0, m.sonar_maintainability||0,
        m.avg_cycle_time_hours||0, m.focus_time_pct||0, m.context_switches||0, m.overtime_hours||0,
        m.courses_completed||0, m.certifications_earned||0, m.new_technologies||0, m.mentoring_sessions||0]);

    const metric = metRes.rows[0];
    const score = calculateNorthStarScore(metric);

    // Get career ladder
    const ladderRes = await db.query(`SELECT * FROM career_ladder ORDER BY level_order`);
    const levels = ladderRes.rows;
    const cur = levels.find(l => score.northStarScore >= l.score_min && score.northStarScore < l.score_max) || levels[levels.length-1];
    const nextIdx = levels.findIndex(l => l.level_name === cur.level_name) + 1;
    const nxt = nextIdx < levels.length ? levels[nextIdx].level_name : 'Architect';
    const readiness = cur.score_max > cur.score_min
      ? ((score.northStarScore - parseFloat(cur.score_min)) / (parseFloat(cur.score_max) - parseFloat(cur.score_min))) * 100
      : 100;

    const scoreRes = await db.query(`
      INSERT INTO performance_scores
      (engineer_id, metric_id, period_label, work_completion_score, code_quality_score,
       time_efficiency_score, skill_acquisition_score, north_star_score,
       current_level, predicted_next_level, promotion_readiness_pct)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *
    `, [id, metric.id, m.period_label || 'Current Period',
        score.workCompletion, score.codeQuality, score.timeEfficiency, score.skillAcquisition,
        score.northStarScore, cur.level_name, nxt, readiness.toFixed(2)]);

    // Update engineer level
    await db.query(`UPDATE engineers SET current_level=$1, updated_at=NOW() WHERE id=$2`,
      [cur.level_name, id]);

    res.status(201).json({ metric, score: scoreRes.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error', detail: err.message });
  }
});

// GET /api/engineers/:id/score-history
router.get('/:id/score-history', authenticate, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT period_label, north_star_score, work_completion_score, code_quality_score,
             time_efficiency_score, skill_acquisition_score, current_level, promotion_readiness_pct,
             created_at
      FROM performance_scores WHERE engineer_id=$1 ORDER BY created_at ASC
    `, [req.params.id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;