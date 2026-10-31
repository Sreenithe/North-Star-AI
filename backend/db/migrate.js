// db/migrate.js — Creates all tables for PROPEL SOFT
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('Running PROPEL SOFT database migrations...');

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL DEFAULT 'engineer' CHECK (role IN ('engineer','manager','hr','admin')),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS engineers (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        department VARCHAR(100),
        team VARCHAR(100),
        manager_id INTEGER REFERENCES engineers(id),
        joining_date DATE DEFAULT CURRENT_DATE,
        current_level VARCHAR(50) DEFAULT 'Fresher' 
          CHECK (current_level IN ('Fresher','Junior Engineer','Mid Engineer','Senior Engineer','Team Lead','Architect')),
        years_experience DECIMAL(4,1) DEFAULT 0,
        avatar_url VARCHAR(500),
        github_username VARCHAR(100),
        jira_username VARCHAR(100),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS performance_metrics (
        id SERIAL PRIMARY KEY,
        engineer_id INTEGER REFERENCES engineers(id) ON DELETE CASCADE,
        period_start DATE NOT NULL,
        period_end DATE NOT NULL,
        -- Work Completion (25%)
        sprints_completed INTEGER DEFAULT 0,
        total_sprints INTEGER DEFAULT 1,
        tickets_closed INTEGER DEFAULT 0,
        tickets_assigned INTEGER DEFAULT 1,
        on_time_delivery_pct DECIMAL(5,2) DEFAULT 0,
        -- Code Quality (30%)
        commits_count INTEGER DEFAULT 0,
        prs_merged INTEGER DEFAULT 0,
        prs_reviewed INTEGER DEFAULT 0,
        bugs_introduced INTEGER DEFAULT 0,
        bugs_fixed INTEGER DEFAULT 0,
        code_review_score DECIMAL(4,2) DEFAULT 0,
        sonar_maintainability DECIMAL(4,2) DEFAULT 0,
        -- Time Efficiency (20%)
        avg_cycle_time_hours DECIMAL(8,2) DEFAULT 0,
        focus_time_pct DECIMAL(5,2) DEFAULT 0,
        context_switches INTEGER DEFAULT 0,
        overtime_hours DECIMAL(6,2) DEFAULT 0,
        -- Skill Acquisition (25%)
        courses_completed INTEGER DEFAULT 0,
        certifications_earned INTEGER DEFAULT 0,
        new_technologies INTEGER DEFAULT 0,
        mentoring_sessions INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS performance_scores (
        id SERIAL PRIMARY KEY,
        engineer_id INTEGER REFERENCES engineers(id) ON DELETE CASCADE,
        metric_id INTEGER REFERENCES performance_metrics(id),
        period_label VARCHAR(50) NOT NULL,
        -- Component Scores (0-100 each)
        work_completion_score DECIMAL(5,2) DEFAULT 0,
        code_quality_score DECIMAL(5,2) DEFAULT 0,
        time_efficiency_score DECIMAL(5,2) DEFAULT 0,
        skill_acquisition_score DECIMAL(5,2) DEFAULT 0,
        -- Bias-adjusted composite
        north_star_score DECIMAL(5,2) DEFAULT 0,
        bias_flag BOOLEAN DEFAULT FALSE,
        bias_note TEXT,
        -- Career output
        current_level VARCHAR(50),
        predicted_next_level VARCHAR(50),
        promotion_readiness_pct DECIMAL(5,2) DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS skills (
        id SERIAL PRIMARY KEY,
        engineer_id INTEGER REFERENCES engineers(id) ON DELETE CASCADE,
        skill_name VARCHAR(100) NOT NULL,
        category VARCHAR(50) CHECK (category IN ('language','framework','cloud','database','devops','soft','other')),
        proficiency VARCHAR(20) CHECK (proficiency IN ('beginner','intermediate','advanced','expert')) DEFAULT 'beginner',
        verified BOOLEAN DEFAULT FALSE,
        acquired_date DATE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS ai_recommendations (
        id SERIAL PRIMARY KEY,
        engineer_id INTEGER REFERENCES engineers(id) ON DELETE CASCADE,
        score_id INTEGER REFERENCES performance_scores(id),
        recommendation_type VARCHAR(50) CHECK (recommendation_type IN ('course','certification','project','mentoring','skill_gap','career_move')),
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        priority VARCHAR(20) CHECK (priority IN ('high','medium','low')) DEFAULT 'medium',
        estimated_impact DECIMAL(4,1),
        resource_url VARCHAR(500),
        is_completed BOOLEAN DEFAULT FALSE,
        completed_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS career_ladder (
        id SERIAL PRIMARY KEY,
        level_name VARCHAR(50) UNIQUE NOT NULL,
        level_order INTEGER NOT NULL,
        score_min DECIMAL(5,2) NOT NULL,
        score_max DECIMAL(5,2) NOT NULL,
        typical_years_min DECIMAL(4,1),
        typical_years_max DECIMAL(4,1),
        description TEXT,
        key_competencies TEXT[]
      );
    `);

    // Seed career ladder
    await client.query(`
      INSERT INTO career_ladder (level_name, level_order, score_min, score_max, typical_years_min, typical_years_max, description, key_competencies)
      VALUES
        ('Fresher', 1, 0, 40, 0, 1, 'Entry-level engineer learning fundamentals', ARRAY['Basic coding','Version control','Team communication']),
        ('Junior Engineer', 2, 40, 55, 1, 3, 'Independently handles small features with guidance', ARRAY['Feature development','Unit testing','Code reviews','Bug fixing']),
        ('Mid Engineer', 3, 55, 70, 3, 6, 'Owns modules, mentors juniors, drives quality', ARRAY['System design','Mentoring','Performance optimization','Architecture input']),
        ('Senior Engineer', 4, 70, 82, 6, 10, 'Leads technical decisions, cross-team collaboration', ARRAY['System architecture','Technical leadership','Cross-team collaboration','Hiring']),
        ('Team Lead', 5, 82, 92, 8, 15, 'Manages team delivery and career growth', ARRAY['Team management','Roadmap planning','Stakeholder management','OKRs']),
        ('Architect', 6, 92, 100, 12, 99, 'Defines org-wide technical strategy', ARRAY['Enterprise architecture','Tech strategy','Innovation leadership','Executive communication'])
      ON CONFLICT (level_name) DO NOTHING;
    `);

    console.log('All tables created successfully!');
    console.log(' Career ladder seeded!');
  } catch (err) {
    console.error(' Migration failed:', err.message);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();