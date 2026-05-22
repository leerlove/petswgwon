/**
 * 섹션 항목 이미지 배열 조작 헬퍼 (순수 함수).
 *
 * PlaygroundForm 상단 ImageManager 갤러리에서 드래그한 이미지를
 * SectionEditor 섹션 항목으로 넣을 때 사용한다. 동일 storage 경로를
 * 재사용하므로 재업로드가 필요 없다.
 */

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
