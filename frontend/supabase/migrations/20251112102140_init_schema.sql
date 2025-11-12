create table if not exists public.scenes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- scene_models: 各シーン内モデル配置
create table if not exists public.scene_models (
  id uuid primary key default gen_random_uuid(),
  scene_id uuid not null references public.scenes(id) on delete cascade,
  name text,
  source_url text not null,
  position_x double precision not null default 0,
  position_y double precision not null default 0,
  position_z double precision not null default 0,
  rotation_x double precision not null default 0,
  rotation_y double precision not null default 0,
  rotation_z double precision not null default 0,
  scale_x double precision not null default 1,
  scale_y double precision not null default 1,
  scale_z double precision not null default 1,
  order_index int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- scene_pins: ピン情報
create table if not exists public.scene_pins (
  id uuid primary key default gen_random_uuid(),
  scene_id uuid not null references public.scenes(id) on delete cascade,
  scene_model_id uuid references public.scene_models(id) on delete set null,
  comment text,
  world_x double precision not null,
  world_y double precision not null,
  world_z double precision not null,
  local_x double precision,
  local_y double precision,
  local_z double precision,
  tag text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 推奨インデックス
create index if not exists scene_models_scene_idx on public.scene_models(scene_id);
create index if not exists scene_pins_scene_idx on public.scene_pins(scene_id);
create index if not exists scene_pins_model_idx on public.scene_pins(scene_model_id);