-- 创建生成记录表
create table if not exists public.generations (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete cascade not null,
    prompt text not null,
    image_url text not null,
    parameters jsonb not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 创建生成历史表
create table if not exists public.generation_history (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete cascade not null,
    prompt text not null,
    image_url text not null,
    parameters jsonb not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 创建索引
create index if not exists generations_user_id_idx on public.generations(user_id);
create index if not exists generations_created_at_idx on public.generations(created_at);
create index if not exists generation_history_user_id_idx on public.generation_history(user_id);
create index if not exists generation_history_created_at_idx on public.generation_history(created_at);

-- 启用行级安全
alter table public.generations enable row level security;
alter table public.generation_history enable row level security;

-- 创建访问策略
create policy "用户只能查看自己的生成记录"
    on public.generations
    for all
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

create policy "用户只能查看自己的生成历史"
    on public.generation_history
    for all
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

-- 创建触发器函数
create or replace function public.handle_new_generation()
returns trigger as $$
begin
    insert into public.generation_history (
        user_id,
        prompt,
        image_url,
        parameters
    ) values (
        auth.uid(),
        new.prompt,
        new.image_url,
        new.parameters
    );
    return new;
end;
$$ language plpgsql security definer;

-- 创建触发器
drop trigger if exists on_generation_created on public.generations;
create trigger on_generation_created
    after insert on public.generations
    for each row
    execute function public.handle_new_generation(); 