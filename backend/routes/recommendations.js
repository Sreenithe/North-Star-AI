// routes/recommendations.js
const router = require('express').Router();
const db = require('../db');
const { authenticate } = require('../middleware/auth');


// POST /api/recommendations/generate/:engineerId
router.post('/generate/:engineerId', authenticate, async (req, res) => {
  const { engineerId } = req.params;

  try {
    // Fetch engineer data
    const engRes = await db.query(`
      SELECT e.name, e.current_level, e.years_experience, e.department, e.team
      FROM engineers e WHERE e.id=$1
    `, [engineerId]);

    if (!engRes.rows.length) return res.status(404).json({ error: 'Engineer not found' });
    const eng = engRes.rows[0];

    const scoreRes = await db.query(`
      SELECT * FROM performance_scores WHERE engineer_id=$1 ORDER BY created_at DESC LIMIT 1
    `, [engineerId]);

    if (!scoreRes.rows.length) return res.status(400).json({ error: 'No performance data found' });
    const score = scoreRes.rows[0];

    const skillsRes = await db.query(`
      SELECT skill_name, category, proficiency FROM skills WHERE engineer_id=$1
    `, [engineerId]);
    const skills = skillsRes.rows.map(s => `${s.skill_name}(${s.proficiency})`).join(', ');

    const prompt = `You are an AI career coach for software engineers. Analyze this engineer's performance and generate 5 personalized, actionable career recommendations.

Engineer Profile:
- Name: ${eng.name}
- Current Level: ${eng.current_level}
- Years Experience: ${eng.years_experience}
- Department: ${eng.department} / Team: ${eng.team}
- Skills: ${skills || 'Not specified'}

Performance Scores (0-100):
- North Star Score: ${score.north_star_score}
- Work Completion: ${score.work_completion_score}
- Code Quality: ${score.code_quality_score}
- Time Efficiency: ${score.time_efficiency_score}
- Skill Acquisition: ${score.skill_acquisition_score}
- Current Level: ${score.current_level}
- Predicted Next Level: ${score.predicted_next_level}
- Promotion Readiness: ${score.promotion_readiness_pct}%

Based on the WEAKEST scoring areas and career progression toward ${score.predicted_next_level}, provide EXACTLY 5 recommendations.

Respond ONLY with a valid JSON array (no markdown, no extra text):
[
  {
    "type": "course|certification|project|mentoring|skill_gap|career_move",
    "title": "Short actionable title",
    "description": "2-3 sentence specific recommendation explaining what to do and why it will help",
    "priority": "high|medium|low",
    "estimated_impact": 5.5,
    "resource_url": "https://relevant-url.com"
  }
]`;

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content[0].text.replace(/```json|```/g, '').trim();
    const recommendations = JSON.parse(text);

    // Save to DB
    const saved = [];
    for (const rec of recommendations) {
      const r = await db.query(`
        INSERT INTO ai_recommendations
        (engineer_id, score_id, recommendation_type, title, description, priority, estimated_impact, resource_url)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *
      `, [engineerId, score.id, rec.type, rec.title, rec.description,
          rec.priority, rec.estimated_impact, rec.resource_url]);
      saved.push(r.rows[0]);
    }

    res.json({ recommendations: saved });
  } catch (err) {
    console.error('Recommendation error:', err.message);
    // Fallback recommendations if AI fails
    res.status(500).json({ error: 'AI service unavailable', detail: err.message });
  }
});

// GET /api/recommendations/:engineerId
router.get('/:engineerId', authenticate, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT * FROM ai_recommendations WHERE engineer_id=$1
      ORDER BY priority DESC, created_at DESC
    `, [req.params.engineerId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /api/recommendations/:id/complete
router.patch('/:id/complete', authenticate, async (req, res) => {
  try {
    const result = await db.query(`
      UPDATE ai_recommendations SET is_completed=true, completed_at=NOW()
      WHERE id=$1 RETURNING *
    `, [req.params.id]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;