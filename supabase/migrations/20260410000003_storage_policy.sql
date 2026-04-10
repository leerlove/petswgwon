-- place-image 버킷에 대한 Storage RLS 정책
-- 서비스 롤 키가 아닌 인증된 사용자(관리자)도 업로드/삭제 가능하도록 설정

-- 인증된 사용자 업로드 허용
CREATE POLICY "Authenticated users can upload images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'place-image');

-- 인증된 사용자 삭제 허용
CREATE POLICY "Authenticated users can delete images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'place-image');

-- 인증된 사용자 조회 허용
CREATE POLICY "Authenticated users can list images"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'place-image');

-- 인증된 사용자 업데이트 허용
CREATE POLICY "Authenticated users can update images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'place-image');
