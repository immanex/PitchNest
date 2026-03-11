-- USERS
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR PRIMARY KEY,
    email VARCHAR UNIQUE NOT NULL,
    hashed_password VARCHAR NOT NULL,
    full_name VARCHAR,
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS ix_users_email ON users(email);


-- USER PROFILES
CREATE TABLE IF NOT EXISTS user_profiles (
    id VARCHAR PRIMARY KEY,
    user_id VARCHAR UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR NOT NULL,
    ai_preferences JSON
);


-- STARTUP PROFILES
CREATE TABLE IF NOT EXISTS startup_profiles (
    id VARCHAR PRIMARY KEY,
    founder_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company_name VARCHAR NOT NULL,
    industry VARCHAR,
    stage VARCHAR,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


-- PITCHES
CREATE TABLE IF NOT EXISTS pitches (
    id VARCHAR PRIMARY KEY,

    pitch_name VARCHAR,

    user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    startup_id VARCHAR REFERENCES startup_profiles(id) ON DELETE SET NULL,

    pitch_pdf_url VARCHAR,

    industry VARCHAR,
    startup_type VARCHAR,
    experience_level VARCHAR,

    mode VARCHAR NOT NULL DEFAULT 'Practice',
    investor_archetype VARCHAR,

    room_id VARCHAR,

    overall_score FLOAT,
    communication_score FLOAT,
    clarity_score FLOAT,
    market_fit_score FLOAT,

    verdict VARCHAR,
    feedback_summary TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


-- AI RECOMMENDATIONS
CREATE TABLE IF NOT EXISTS ai_recommendations (
    id VARCHAR PRIMARY KEY,
    pitch_id VARCHAR NOT NULL REFERENCES pitches(id) ON DELETE CASCADE,
    category VARCHAR NOT NULL,
    content TEXT NOT NULL
);


-- ROOMS
CREATE TABLE IF NOT EXISTS rooms (
    id VARCHAR PRIMARY KEY,
    owner_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    closed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


-- ROOM MEMBERS (many-to-many)
CREATE TABLE IF NOT EXISTS room_members (
    room_id VARCHAR NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    PRIMARY KEY (room_id, user_id)
);


-- CHAT MESSAGES
CREATE TABLE IF NOT EXISTS chat_messages (
    id VARCHAR PRIMARY KEY,
    room_id VARCHAR NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    user_id VARCHAR REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);