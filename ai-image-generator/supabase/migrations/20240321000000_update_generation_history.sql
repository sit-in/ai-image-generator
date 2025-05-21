-- 添加 storage_path 字段到 generation_history 表
alter table public.generation_history
add column if not exists storage_path text;

-- 创建存储桶（如果不存在）
insert into storage.buckets (id, name, public)
values ('generated-images', 'generated-images', true)
on conflict (id) do nothing;

-- 设置存储桶的访问策略
create policy "任何人都可以查看生成的图片"
on storage.objects for select
using ( bucket_id = 'generated-images' );

create policy "只有认证用户可以上传图片"
on storage.objects for insert
with check (
  bucket_id = 'generated-images'
  and auth.role() = 'authenticated'
);

create policy "用户只能删除自己的图片"
on storage.objects for delete
using (
  bucket_id = 'generated-images'
  and auth.uid() = (storage.foldername(name))[1]::uuid
); 