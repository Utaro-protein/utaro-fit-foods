-- favorites の重複データを削除し、一意制約を追加する
-- 実行場所: Supabase SQL Editor

-- 1) 同一 (user_id, target_type, target_id) の重複を削除
delete from public.favorites f
using public.favorites d
where f.id > d.id
  and f.user_id = d.user_id
  and f.target_type = d.target_type
  and f.target_id = d.target_id;

-- 2) 将来の重複を防ぐ一意制約
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'favorites_user_target_unique'
  ) then
    alter table public.favorites
    add constraint favorites_user_target_unique
    unique (user_id, target_type, target_id);
  end if;
end $$;
