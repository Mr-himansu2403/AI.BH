-- Enable the pgvector extension to work with embedding vectors
create extension if not exists vector;

-- Create a table to store episodic memories and document chunks
create table if not exists episodic_memories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  chat_id text not null,
  content text not null,
  embedding vector(1536), -- Default size for OpenAI text-embedding-3-small
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create a table for general enterprise knowledge (RAG)
create table if not exists enterprise_knowledge (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  metadata jsonb default '{}'::jsonb,
  embedding vector(1536),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create a function to search for memories
create or external security invoker function match_memories (
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  p_user_id uuid
)
returns table (
  id uuid,
  content text,
  similarity float
)
language sql stable
as $$
  select
    episodic_memories.id,
    episodic_memories.content,
    1 - (episodic_memories.embedding <=> query_embedding) as similarity
  from episodic_memories
  where episodic_memories.user_id = p_user_id
    and 1 - (episodic_memories.embedding <=> query_embedding) > match_threshold
  order by similarity descending
  limit match_count;
$$;

-- Set up Row Level Security (RLS)
alter table episodic_memories enable row level security;

create policy "Users can only access their own memories."
  on episodic_memories for select
  using ( auth.uid() = user_id );

create policy "Users can insert their own memories."
  on episodic_memories for insert
  with check ( auth.uid() = user_id );
