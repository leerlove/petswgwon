-- admin_users.role 에 'playground' 역할 추가 (PetPass 측 놀이터 전용 관리자)
-- 기존 CHECK( role IN ('admin','super_admin') )를 확장한다.
ALTER TABLE public.admin_users DROP CONSTRAINT IF EXISTS admin_users_role_check;
ALTER TABLE public.admin_users
  ADD CONSTRAINT admin_users_role_check
  CHECK (role IN ('admin', 'super_admin', 'playground'));
