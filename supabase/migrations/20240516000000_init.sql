-- Users (extends Supabase auth.users)
create table profiles (
  id uuid references auth.users primary key,
  name text,
  email text,
  role text check (role in ('employee', 'manager', 'admin')),
  manager_id uuid references profiles(id),
  department text,
  created_at timestamptz default now()
);

-- Goal cycles (configured by admin)
create table cycles (
  id uuid primary key default gen_random_uuid(),
  name text, -- e.g. "FY 2025-26"
  goal_setting_opens date,
  q1_opens date,
  q2_opens date,
  q3_opens date,
  q4_opens date,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Goals
create table goals (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid references profiles(id),
  cycle_id uuid references cycles(id),
  thrust_area text,
  title text,
  description text,
  uom_type text check (uom_type in ('numeric_min', 'numeric_max', 'timeline', 'zero')),
  target_value numeric,
  target_date date,
  weightage numeric,
  status text check (status in ('draft', 'submitted', 'approved', 'returned')) default 'draft',
  is_shared boolean default false,
  shared_from uuid references goals(id),
  confidence text check (confidence in ('high', 'medium', 'low')),
  locked_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Quarterly achievements
create table achievements (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid references goals(id),
  quarter text check (quarter in ('Q1', 'Q2', 'Q3', 'Q4')),
  actual_value numeric,
  actual_date date,
  progress_status text check (progress_status in ('not_started', 'on_track', 'completed')),
  computed_score numeric, -- system computed
  last_updated timestamptz default now()
);

-- Manager check-ins
create table checkins (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid references profiles(id),
  manager_id uuid references profiles(id),
  quarter text,
  cycle_id uuid references cycles(id),
  comment text,
  completed_at timestamptz default now()
);

-- Audit log (append-only, never delete)
create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  table_name text,
  record_id uuid,
  changed_by uuid references profiles(id),
  action text, -- 'update', 'unlock', 'approve', 'return'
  old_value jsonb,
  new_value jsonb,
  changed_at timestamptz default now()
);

-- Goal momentum tracking
create table momentum_logs (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid references profiles(id),
  cycle_id uuid references cycles(id),
  quarter text,
  update_streak integer default 0, -- consecutive quarters updated on time
  early_submission boolean default false,
  last_activity timestamptz
);

-- Escalations
create table escalations (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid references profiles(id),
  cycle_id uuid references cycles(id),
  escalation_type text check (escalation_type in ('goal_not_submitted', 'goal_not_approved', 'checkin_not_completed')),
  days_overdue integer,
  resolved boolean default false,
  created_at timestamptz default now()
);
