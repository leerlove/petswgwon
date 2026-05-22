/**
 * place-image(비공개 버킷) 저장 경로/URL을 /api/image 프록시 URL로 변환한다.
 *
 * - place-image public-URL 형태(`.../object/public/place-image/<key>`)는 키만 추출
 * - 저장 키(`<id>/file.webp`)는 그대로 키로 사용
 * - 그 외 외부 http(s) URL은 변환하지 않고 그대로 반환
 * - width 지정 시 `?w=`로 서버측 리사이즈(+WebP/AVIF 협상)를 요청해 경량화
 *
 * 프록시(/api/image/[...path])가 ?w= 처리(Supabase render)와 인증 버킷 접근을 담당하므로,
 * 이미지 표시는 항상 이 함수를 거쳐 동일 규칙으로 처리한다.
 */
const PLACE_IMAGE_PUBLIC_PREFIX =
  'https://yngzeshxngfeyiabxeyi.supabase.co/storage/v1/object/public/place-image/';

export function proxyImageUrl(url: string, width?: number): string {
  if (!url) return url;

  let key: string | null = null;
  if (url.startsWith(PLACE_IMAGE_PUBLIC_PREFIX)) {
    key = url.slice(PLACE_IMAGE_PUBLIC_PREFIX.length);
  } else if (!url.startsWith('http')) {
    key = url;
  }

  // place-image 버킷이 아닌 외부 http URL은 리사이즈/프록시 없이 그대로 사용
  if (key === null) return url;

  return width ? `/api/image/${key}?w=${width}` : `/api/image/${key}`;
}
