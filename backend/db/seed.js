// db/seed.js — Seeds realistic demo data for PROPEL SOFT
require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function seed() {
  const client = await pool.connect();
  try {
    console.log('🌱 Seeding PROPEL SOFT demo data...');

    const hash = await bcrypt.hash('password123', 10);

    // Create users
    const userRes = await client.query(`
      INSERT INTO users (email, password_hash, role) VALUES
        ('admin@propelsoft.ai', $1, 'admin'),
        ('manager@propelsoft.ai', $1, 'manager'),
        ('sreenithe@propelsoft.ai', $1, 'engineer'),
        ('arjun@propelsoft.ai', $1, 'engineer'),
        ('priya@propelsoft.ai', $1, 'engineer'),
        ('rahul@propelsoft.ai', $1, 'engineer'),
        ('divya@propelsoft.ai', $1, 'engineer'),
        ('karthik@propelsoft.ai', $1, 'engineer'),
        ('meera@propelsoft.ai', $1, 'engineer'),
        ('vishnu@propelsoft.ai', $1, 'engineer')
      ON CONFLICT (email) DO NOTHING
      RETURNING id, email, role
    `, [hash]);

    console.log(`  Created ${userRes.rowCount} users`);

    // Create engineers
    const engRes = await client.query(`
      INSERT INTO engineers (user_id, name, email, department, team, current_level, years_experience, github_username)
      SELECT u.id, e.name, e.email, e.dept, e.team, e.level, e.yrs, e.github
      FROM (VALUES
        ('admin@propelsoft.ai','Alex Admin','admin@propelsoft.ai','Engineering','Platform','Architect',14,'alexadmin'),
        ('manager@propelsoft.ai','Maya Manager','manager@propelsoft.ai','Engineering','Backend','Team Lead',9,'mayamgr'),
        ('sreenithe@propelsoft.ai','Sreenithe V','sreenithe@propelsoft.ai','Engineering','Frontend','Junior Engineer',1.5,'sreenithe'),
        ('arjun@propelsoft.ai','Arjun Kumar','arjun@propelsoft.ai','Engineering','Backend','Mid Engineer',4,'arjun-k'),
        ('priya@propelsoft.ai','Priya S','priya@propelsoft.ai','Engineering','Frontend','Senior Engineer',7,'priya-dev'),
        ('rahul@propelsoft.ai','Rahul Sharma','rahul@propelsoft.ai','Engineering','DevOps','Junior Engineer',2,'rahulsh'),
        ('divya@propelsoft.ai','Divya R','divya@propelsoft.ai','Engineering','Backend','Fresher',0.5,'divya-r'),
        ('karthik@propelsoft.ai','Karthik M','karthik@propelsoft.ai','Engineering','Mobile','Mid Engineer',5,'karthikm'),
        ('meera@propelsoft.ai','Meera Nair','meera@propelsoft.ai','Engineering','Data','Senior Engineer',8,'meeran'),
        ('vishnu@propelsoft.ai','Vishnu P','vishnu@propelsoft.ai','Engineering','Frontend','Junior Engineer',1,'vishnup')
      ) AS e(uid_email, name, email, dept, team, level, yrs, github)
      JOIN users u ON u.email = e.uid_email
      ON CONFLICT (email) DO NOTHING
      RETURNING id, name
    `);

    console.log(`  Created ${engRes.rowCount} engineers`);

    // Set manager relationships
    await client.query(`
      UPDATE engineers SET manager_id = (SELECT id FROM engineers WHERE email='manager@propelsoft.ai')
      WHERE email IN ('sreenithe@propelsoft.ai','arjun@propelsoft.ai','priya@propelsoft.ai','rahul@propelsoft.ai',
                       'divya@propelsoft.ai','karthik@propelsoft.ai','meera@propelsoft.ai','vishnu@propelsoft.ai')
    `);

    // Get engineer IDs
    const engs = await client.query(`SELECT id, email FROM engineers`);
    const engMap = {};
    engs.rows.forEach(r => { engMap[r.email] = r.id; });

    // Performance metrics data per engineer
    const metricsData = [
      { email: 'sreenithe@propelsoft.ai', sc: 4, ts: 5, tc: 14, ta: 18, otd: 78, cc: 45, pm: 8, pr: 12, bi: 3, bf: 5, crs: 72, sm: 68, act: 18, ft: 65, ctx: 4, ot: 2, courses: 2, certs: 0, nt: 1, ms: 1 },
      { email: 'arjun@propelsoft.ai', sc: 5, ts: 5, tc: 22, ta: 25, otd: 88, cc: 98, pm: 18, pr: 24, bi: 2, bf: 8, crs: 82, sm: 80, act: 12, ft: 78, ctx: 3, ot: 4, courses: 3, certs: 1, nt: 2, ms: 3 },
      { email: 'priya@propelsoft.ai', sc: 5, ts: 5, tc: 28, ta: 29, otd: 97, cc: 145, pm: 28, pr: 35, bi: 1, bf: 12, crs: 91, sm: 88, act: 8, ft: 85, ctx: 2, ot: 3, courses: 4, certs: 2, nt: 3, ms: 5 },
      { email: 'rahul@propelsoft.ai', sc: 3, ts: 5, tc: 12, ta: 18, otd: 67, cc: 38, pm: 6, pr: 8, bi: 5, bf: 4, crs: 65, sm: 60, act: 22, ft: 58, ctx: 6, ot: 1, courses: 1, certs: 0, nt: 1, ms: 0 },
      { email: 'divya@propelsoft.ai', sc: 2, ts: 5, tc: 8, ta: 14, otd: 57, cc: 22, pm: 4, pr: 5, bi: 6, bf: 3, crs: 55, sm: 50, act: 28, ft: 50, ctx: 8, ot: 0, courses: 1, certs: 0, nt: 0, ms: 0 },
      { email: 'karthik@propelsoft.ai', sc: 4, ts: 5, tc: 20, ta: 23, otd: 87, cc: 89, pm: 15, pr: 20, bi: 2, bf: 7, crs: 79, sm: 76, act: 14, ft: 74, ctx: 3, ot: 3, courses: 3, certs: 1, nt: 2, ms: 2 },
      { email: 'meera@propelsoft.ai', sc: 5, ts: 5, tc: 30, ta: 31, otd: 97, cc: 167, pm: 32, pr: 40, bi: 1, bf: 15, crs: 93, sm: 90, act: 7, ft: 88, ctx: 1, ot: 2, courses: 5, certs: 3, nt: 4, ms: 6 },
      { email: 'vishnu@propelsoft.ai', sc: 3, ts: 5, tc: 11, ta: 17, otd: 65, cc: 32, pm: 6, pr: 9, bi: 4, bf: 3, crs: 62, sm: 58, act: 24, ft: 55, ctx: 7, ot: 1, courses: 1, certs: 0, nt: 1, ms: 1 },
    ];

    for (const m of metricsData) {
      const eid = engMap[m.email];
      if (!eid) continue;

    const metRes = await client.query(`
  INSERT INTO performance_metrics
  (engineer_id, period_start, period_end,
   sprints_completed, total_sprints,
   tickets_closed, tickets_assigned, on_time_delivery_pct,
   commits_count, prs_merged, prs_reviewed, bugs_introduced, bugs_fixed,
   code_review_score, sonar_maintainability,
   avg_cycle_time_hours, focus_time_pct, context_switches, overtime_hours,
   courses_completed, certifications_earned, new_technologies, mentoring_sessions)
  VALUES (
    $1, NOW() - INTERVAL '30 days', NOW(),
    $2,$3,$4,$5,$6,
    $7,$8,$9,$10,$11,
    $12,$13,
    $14,$15,$16,$17,
    $18,$19,$20,$21
  )
  RETURNING id
`, [
  eid,
  m.sc, m.ts,
  m.tc, m.ta,
  m.otd,
  m.cc, m.pm, m.pr,
  m.bi, m.bf,
  m.crs, m.sm,
  m.act, m.ft, m.ctx, m.ot,
  m.courses, m.certs, m.nt, m.ms
]);

      const metId = metRes.rows[0].id;

      // Calculate North Star Score
      const wc = Math.min(100, (m.sc / m.ts * 40 + m.tc / m.ta * 40 + m.otd * 0.2));
      const cq = Math.min(100, (m.crs * 0.4 + m.sm * 0.3 + Math.max(0, 100 - m.bi * 5) * 0.3));
      const te = Math.min(100, (m.ft * 0.5 + Math.max(0, 100 - m.act) * 0.3 + Math.max(0, 100 - m.ctx * 5) * 0.2));
      const sa = Math.min(100, (m.courses * 15 + m.certs * 20 + m.nt * 10 + m.ms * 8));
      const ns = Math.min(100, wc * 0.25 + cq * 0.30 + te * 0.20 + sa * 0.25);

      // Determine levels
      const levels = [
        { name: 'Fresher', min: 0, max: 40 },
        { name: 'Junior Engineer', min: 40, max: 55 },
        { name: 'Mid Engineer', min: 55, max: 70 },
        { name: 'Senior Engineer', min: 70, max: 82 },
        { name: 'Team Lead', min: 82, max: 92 },
        { name: 'Architect', min: 92, max: 100 },
      ];
      const cur = levels.find(l => ns >= l.min && ns < l.max) || levels[5];
      const nextIdx = levels.findIndex(l => l.name === cur.name) + 1;
      const nxt = nextIdx < levels.length ? levels[nextIdx].name : 'Architect';
      const readiness = cur.max > cur.min ? ((ns - cur.min) / (cur.max - cur.min)) * 100 : 100;

      await client.query(`
        INSERT INTO performance_scores
        (engineer_id, metric_id, period_label, work_completion_score, code_quality_score,
         time_efficiency_score, skill_acquisition_score, north_star_score,
         current_level, predicted_next_level, promotion_readiness_pct)
        VALUES ($1, $2, 'Q1 2025', $3, $4, $5, $6, $7, $8, $9, $10)
      `, [eid, metId, wc.toFixed(2), cq.toFixed(2), te.toFixed(2), sa.toFixed(2), ns.toFixed(2), cur.name, nxt, readiness.toFixed(2)]);
    }

    // Add skills
    const skillsData = [
      { email: 'sreenithe@propelsoft.ai', skills: [['React','framework','intermediate'],['JavaScript','language','intermediate'],['Git','devops','intermediate'],['Node.js','framework','beginner']] },
      { email: 'arjun@propelsoft.ai', skills: [['Java','language','advanced'],['Spring Boot','framework','advanced'],['PostgreSQL','database','intermediate'],['Docker','devops','intermediate'],['Kubernetes','devops','beginner']] },
      { email: 'priya@propelsoft.ai', skills: [['React','framework','expert'],['TypeScript','language','advanced'],['Next.js','framework','advanced'],['GraphQL','framework','intermediate'],['AWS','cloud','intermediate']] },
      { email: 'meera@propelsoft.ai', skills: [['Python','language','expert'],['TensorFlow','framework','advanced'],['Spark','framework','advanced'],['AWS','cloud','advanced'],['Kafka','devops','intermediate'],['PostgreSQL','database','advanced']] },
    ];
    for (const sd of skillsData) {
      const eid = engMap[sd.email];
      if (!eid) continue;
      for (const [sn, sc, sp] of sd.skills) {
        await client.query(`
          INSERT INTO skills (engineer_id, skill_name, category, proficiency, verified, acquired_date)
          VALUES ($1, $2, $3, $4, true, NOW() - INTERVAL '${Math.floor(Math.random()*365)} days')
          ON CONFLICT DO NOTHING
        `, [eid, sn, sc, sp]);
      }
    }

    console.log('✅ Demo data seeded successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('  Admin:    admin@propelsoft.ai / password123');
    console.log('  Manager:  manager@propelsoft.ai / password123');
    console.log('  Engineer: sreenithe@propelsoft.ai / password123');
    console.log('  (All demo users use password: password123)\n');

  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

seed();