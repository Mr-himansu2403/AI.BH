-- AI Memory & Context Intelligence Schema
-- Phase 2: Enterprise AI Memory System

-- User Memory Profiles
CREATE TABLE user_memory_profiles (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    memory_type VARCHAR(50) NOT NULL, -- PERSONAL, PROFESSIONAL, PREFERENCES, CONTEXT
    category VARCHAR(100) NOT NULL,   -- programming_languages, interests, work_domain
    key_name VARCHAR(255) NOT NULL,   -- java_expertise, preferred_style, company_domain
    value_data TEXT NOT NULL,         -- JSON or text data
    confidence_score DECIMAL(3,2) DEFAULT 0.5, -- 0.0 to 1.0
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP, -- For GDPR compliance
    UNIQUE(user_id, memory_type, category, key_name)
);

-- Conversation Embeddings for Semantic Search
CREATE TABLE conversation_embeddings (
    id BIGSERIAL PRIMARY KEY,
    conversation_id BIGINT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message_content TEXT NOT NULL,
    embedding_vector FLOAT8[] NOT NULL, -- 1536 dimensions for OpenAI embeddings
    message_type VARCHAR(20) DEFAULT 'USER', -- USER, ASSISTANT
    topic_tags TEXT[], -- Extracted topics: ['java', 'spring-boot', 'api']
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_embeddings (user_id),
    INDEX idx_conversation_embeddings (conversation_id),
    INDEX idx_topic_tags USING GIN (topic_tags)
);

-- Memory Context Sessions
CREATE TABLE memory_contexts (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_id VARCHAR(100) NOT NULL,
    context_summary TEXT, -- AI-generated summary of conversation context
    relevant_memories JSONB, -- References to related user_memory_profiles
    context_score DECIMAL(3,2) DEFAULT 0.0, -- Relevance score
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- GDPR Compliance: Data Retention Policies
CREATE TABLE data_retention_policies (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    data_type VARCHAR(50) NOT NULL, -- CONVERSATIONS, MEMORIES, EMBEDDINGS
    retention_days INTEGER NOT NULL DEFAULT 365,
    auto_delete BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for Performance
CREATE INDEX idx_user_memory_type ON user_memory_profiles(user_id, memory_type);
CREATE INDEX idx_memory_expiry ON user_memory_profiles(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX idx_embedding_similarity ON conversation_embeddings USING ivfflat (embedding_vector vector_cosine_ops);
CREATE INDEX idx_context_session ON memory_contexts(user_id, session_id);