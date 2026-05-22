import { describe, it, expect } from 'vitest';
import { addImageToItem } from './sectionImages';

describe('addImageToItem', () => {
  it('빈 목록에 새 경로를 추가한다', () => {
    expect(addImageToItem([], 'a/1.webp')).toEqual(['a/1.webp']);
  });

  it('기존 목록 끝에 새 경로를 추가하고 순서를 보존한다', () => {
    expect(addImageToItem(['a/1.webp', 'a/2.webp'], 'a/3.webp')).toEqual([
      'a/1.webp',
      'a/2.webp',
      'a/3.webp',
    ]);
  });

  it('이미 존재하는 경로는 추가하지 않는다(중복 방지)', () => {
    const input = ['a/1.webp', 'a/2.webp'];
    expect(addImageToItem(input, 'a/1.webp')).toEqual(['a/1.webp', 'a/2.webp']);
  });

  it('빈 문자열/공백 경로는 무시한다', () => {
    expect(addImageToItem(['a/1.webp'], '')).toEqual(['a/1.webp']);
    expect(addImageToItem(['a/1.webp'], '   ')).toEqual(['a/1.webp']);
  });

  it('원본 배열을 변경하지 않고 새 배열을 반환한다(불변성)', () => {
    const input = ['a/1.webp'];
    const result = addImageToItem(input, 'a/2.webp');
    expect(result).not.toBe(input);
    expect(input).toEqual(['a/1.webp']);
  });

  it('드롭된 경로의 앞뒤 공백을 제거해 저장한다', () => {
    expect(addImageToItem([], '  a/1.webp  ')).toEqual(['a/1.webp']);
  });
});
