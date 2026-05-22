import { describe, it, expect } from 'vitest';
import { proxyImageUrl } from './imageProxy';

const PREFIX =
  'https://yngzeshxngfeyiabxeyi.supabase.co/storage/v1/object/public/place-image/';

describe('proxyImageUrl', () => {
  it('public place-image URL은 키만 추출해 프록시 URL로 변환한다', () => {
    expect(proxyImageUrl(`${PREFIX}123/thumb_0.jpg`)).toBe('/api/image/123/thumb_0.jpg');
  });

  it('width 지정 시 ?w= 를 붙여 경량화 요청한다', () => {
    expect(proxyImageUrl(`${PREFIX}123/thumb_0.jpg`, 400)).toBe(
      '/api/image/123/thumb_0.jpg?w=400'
    );
  });

  it('저장 키(상대 경로)는 그대로 프록시로 변환한다', () => {
    expect(proxyImageUrl('123/thumb_0.jpg', 800)).toBe('/api/image/123/thumb_0.jpg?w=800');
    expect(proxyImageUrl('123/thumb_0.jpg')).toBe('/api/image/123/thumb_0.jpg');
  });

  it('place-image가 아닌 외부 http URL은 그대로 반환한다(리사이즈 불가)', () => {
    const ext = 'https://images.unsplash.com/photo-1?w=1000';
    expect(proxyImageUrl(ext, 400)).toBe(ext);
  });

  it('빈 문자열은 그대로 반환한다', () => {
    expect(proxyImageUrl('', 400)).toBe('');
  });
});
