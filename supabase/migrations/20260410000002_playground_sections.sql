-- playgrounds 테이블에 sections JSONB 컬럼 추가
-- 호텔 객실, 부대시설 등 카테고리별 섹션 데이터 저장
ALTER TABLE playgrounds ADD COLUMN sections jsonb NOT NULL DEFAULT '[]';
