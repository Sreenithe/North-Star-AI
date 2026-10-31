// routes/analytics.js
const router = require('express').Router();
const db = require('../db');
const { authenticate, requireRole } = require('../middleware/auth');

// GET /api/analytics/team — team-wide heatmap data
router.get('/team', authenticate, requireRole('manager','admin','hr'), async (req, res) => {
  try {
    const result = await db.query(`
      SELECT e.id, e.name, e.team, e.current_level, e.years_experience,
             ps.north_star_score, ps.work_completion_score, ps.code_quality_score,
             ps.time_efficiency_score, ps.skill_acquisition_score,
             ps.predicted_next_level, ps.promotion_readiness_pct,
             ps.bias_flag, ps.bias_note
      FROM engineers e
      LEFT JOIN LATERAL (
        SELECT * FROM performance_scores WHERE engineer_id=e.id ORDER BY created_at DESC LIMIT 1
      ) ps ON true
      ORDER BY ps.north_star_score DESC NULLS LAST
    `);

    // Team averages
    const avg = result.rows.reduce((acc, r) => {
      acc.north_star += parseFloat(r.north_star_score || 0);
      acc.work_completion += parseFloat(r.work_completion_score || 0);
      acc.code_quality += parseFloat(r.code_quality_score || 0);
      acc.time_efficiency += parseFloat(r.time_efficiency_score || 0);
      acc.skill_acquisition += parseFloat(r.skill_acquisition_score || 0);
      return acc;
    }, { north_star:0, work_completion:0, code_quality:0, time_efficiency:0, skill_acquisition:0 });
    const n = result.rows.length || 1;
    Object.keys(avg).forEach(k => avg[k] = (avg[k]/n).toFixed(1));

    // Level distribution
    const levelDist = result.rows.reduce((acc, r) => {
      const l = r.current_level || 'Unknown';
      acc[l] = (acc[l] || 0) + 1;
      return acc;
    }, {});

    // Promotion-ready (readiness > 70%)
    const promotionReady = result.rows.filter(r => parseFloat(r.promotion_readiness_pct) >= 70);

    res.json({
      engineers: result.rows,
      teamAverages: avg,
      levelDistribution: levelDist,
      promotionReady,
      totalCount: result.rows.length,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/analytics/career-ladder
router.get('/career-ladder', authenticate, async (req, res) => {
  try {
    const result = await db.query(`SELECT * FROM career_ladder ORDER BY level_order`);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/analytics/org-overview — for HR/admin
router.get('/org-overview', authenticate, requireRole('hr','admin'), async (req, res) => {
  try {
    const counts = await db.query(`
      SELECT
        COUNT(*) as total_engineers,
        COUNT(CASE WHEN ps.promotion_readiness_pct >= 70 THEN 1 END) as promotion_ready,
        AVG(ps.north_star_score)::DECIMAL(5,2) as avg_score,
        COUNT(CASE WHEN ps.north_star_score < 40 THEN 1 END) as at_risk,
        COUNT(CASE WHEN ps.bias_flag = true THEN 1 END) as bias_flagged
      FROM engineers e
      LEFT JOIN LATERAL (
        SELECT * FROM performance_scores WHERE engineer_id=e.id ORDER BY created_at DESC LIMIT 1
      ) ps ON true
    `);

    const levelDist = await db.query(`
      SELECT current_level, COUNT(*) as count
      FROM engineers
      GROUP BY current_level ORDER BY MIN(id)
    `);

    const teamPerf = await db.query(`
      SELECT e.team,
             AVG(ps.north_star_score)::DECIMAL(5,2) as avg_score,
             COUNT(*) as size
      FROM engineers e
      LEFT JOIN LATERAL (
        SELECT * FROM performance_scores WHERE engineer_id=e.id ORDER BY created_at DESC LIMIT 1
      ) ps ON true
      GROUP BY e.team
      ORDER BY avg_score DESC
    `);

    res.json({
      summary: counts.rows[0],
      levelDistribution: levelDist.rows,
      teamPerformance: teamPerf.rows,
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;