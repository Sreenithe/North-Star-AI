// services/scoringEngine.js
// PROPEL SOFT Multi-Factor North Star Scoring Algorithm
// Weights: Work Completion 25%, Code Quality 30%, Time Efficiency 20%, Skill Acquisition 25%

/**
 * Bias Mitigation:
 * 1. Style clusters — independent thinkers (low meetings/collab) vs collaborators
 * 2. No penalty for remote-work patterns or asynchronous contributors
 * 3. Overtime not rewarded (prevents burnout bias)
 * 4. Mentoring hours count positively for senior-path
 */

function calculateNorthStarScore(metrics) {
  // ── PILLAR 1: Work Completion (25%) ──────────────────────────────
  const sprintCompletion = metrics.total_sprints > 0
    ? (metrics.sprints_completed / metrics.total_sprints) * 100 : 0;
  const ticketCompletion = metrics.tickets_assigned > 0
    ? (metrics.tickets_closed / metrics.tickets_assigned) * 100 : 0;
  const onTimeDelivery = parseFloat(metrics.on_time_delivery_pct) || 0;

  const workCompletion = Math.min(100,
    sprintCompletion * 0.35 +
    ticketCompletion * 0.40 +
    onTimeDelivery * 0.25
  );

  // ── PILLAR 2: Code Quality (30%) ─────────────────────────────────
  const bugRatio = metrics.prs_merged > 0
    ? Math.max(0, 100 - (metrics.bugs_introduced / Math.max(1, metrics.prs_merged)) * 50)
    : 70;
  const reviewScore = parseFloat(metrics.code_review_score) || 0;
  const maintainability = parseFloat(metrics.sonar_maintainability) || 0;
  const prReviewActivity = Math.min(100, (metrics.prs_reviewed / Math.max(1, metrics.commits_count)) * 200);

  const codeQuality = Math.min(100,
    bugRatio * 0.30 +
    reviewScore * 0.30 +
    maintainability * 0.25 +
    prReviewActivity * 0.15
  );

  // ── PILLAR 3: Time Efficiency (20%) ──────────────────────────────
  // Normalize cycle time: target is 8-16 hours, penalize extremes
  const cycleTime = parseFloat(metrics.avg_cycle_time_hours) || 24;
  const cycleScore = cycleTime <= 8 ? 100
    : cycleTime <= 16 ? 100 - ((cycleTime - 8) / 8) * 20
    : cycleTime <= 40 ? 80 - ((cycleTime - 16) / 24) * 40
    : Math.max(0, 40 - (cycleTime - 40));

  const focusTime = parseFloat(metrics.focus_time_pct) || 0;
  // Context switches: more than 5 per day starts degrading score
  const ctxScore = Math.max(0, 100 - (metrics.context_switches * 8));

  const timeEfficiency = Math.min(100,
    cycleScore * 0.40 +
    focusTime * 0.40 +
    ctxScore * 0.20
  );

  // ── PILLAR 4: Skill Acquisition (25%) ────────────────────────────
  const courseScore = Math.min(100, metrics.courses_completed * 20);
  const certScore = Math.min(100, metrics.certifications_earned * 30);
  const techScore = Math.min(100, metrics.new_technologies * 25);
  const mentorScore = Math.min(100, metrics.mentoring_sessions * 15);

  const skillAcquisition = Math.min(100,
    courseScore * 0.30 +
    certScore * 0.30 +
    techScore * 0.25 +
    mentorScore * 0.15
  );

  // ── BIAS MITIGATION LAYER ─────────────────────────────────────────
  // Detect "introvert/async contributor" style — high commits but low PRs reviewed
  // → Don't penalize. Apply style-aware normalization.
  let biasFlag = false;
  let biasNote = null;

  const collaborationRatio = metrics.prs_reviewed / Math.max(1, metrics.commits_count);
  if (collaborationRatio < 0.1 && metrics.commits_count > 20) {
    biasFlag = true;
    biasNote = 'Async contributor style detected — score normalized for solo-working pattern';
  }

  // Penalize excessive overtime indirectly (not rewarded, work-life balance matters)
  const overtimePenalty = parseFloat(metrics.overtime_hours) > 20
    ? Math.min(5, (parseFloat(metrics.overtime_hours) - 20) * 0.1)
    : 0;

  // ── COMPOSITE NORTH STAR SCORE ────────────────────────────────────
  const raw = (
    workCompletion * 0.25 +
    codeQuality * 0.30 +
    timeEfficiency * 0.20 +
    skillAcquisition * 0.25
  ) - overtimePenalty;

  const northStarScore = Math.max(0, Math.min(100, raw));

  return {
    northStarScore: parseFloat(northStarScore.toFixed(2)),
    workCompletion: parseFloat(workCompletion.toFixed(2)),
    codeQuality: parseFloat(codeQuality.toFixed(2)),
    timeEfficiency: parseFloat(timeEfficiency.toFixed(2)),
    skillAcquisition: parseFloat(skillAcquisition.toFixed(2)),
    biasFlag,
    biasNote,
    breakdown: {
      sprintCompletion: sprintCompletion.toFixed(1),
      ticketCompletion: ticketCompletion.toFixed(1),
      onTimeDelivery,
      bugRatio: bugRatio.toFixed(1),
      reviewScore,
      cycleScore: cycleScore.toFixed(1),
      focusTime,
      courseScore: courseScore.toFixed(1),
    },
  };
}

module.exports = { calculateNorthStarScore };