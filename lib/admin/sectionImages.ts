/**
 * 섹션 항목 이미지 배열 조작 헬퍼 (순수 함수).
 *
 * PlaygroundForm 상단 ImageManager 갤러리에서 드래그한 이미지를
 * SectionEditor 섹션 항목으로 넣을 때 사용한다. 동일 storage 경로를
 * 재사용하므로 재업로드가 필요 없다.
 */
import type { PlaygroundSection } from '@/types/playground';

/** 모든 섹션 항목에 사용된 이미지 경로 집합을 모은다. */
export function collectSectionImagePaths(
  sections: PlaygroundSection[] | undefined | null
): Set<string> {
  const used = new Set<string>();
  for (const section of sections ?? []) {
    for (const item of section.items ?? []) {
      for (const img of item.images ?? []) {
        if (img) used.add(img);
      }
    }
  }
  return used;
}

/**
 * 이미지 목록에서 어떤 섹션에도 배치되지 않은 것만 반환(순서 유지).
 * 섹션으로 "이동"된 이미지를 상단 갤러리(관리자/공개)에서 숨기는 데 사용.
 */
export function excludeSectionImages(
  images: string[] | undefined | null,
  sections: PlaygroundSection[] | undefined | null
): string[] {
  const used = collectSectionImagePaths(sections);
  return (images ?? []).filter((p) => !used.has(p));
}

/**
 * 섹션 항목 이미지 목록에 경로를 추가한다.
 * - 새 경로는 끝에 추가
 * - 이미 존재하면 그대로 반환(중복 방지)
 * - 빈 문자열/공백만 있는 값은 무시
 * 항상 새 배열을 반환한다(불변성 유지).
 */
export function addImageToItem(images: string[], path: string): string[] {
  const trimmed = path?.trim();
  if (!trimmed) return images.slice();
  if (images.includes(trimmed)) return images.slice();
  return [...images, trimmed];
}
