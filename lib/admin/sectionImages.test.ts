import { describe, it, expect } from 'vitest';
import { addImageToItem, collectSectionImagePaths, excludeSectionImages } from './sectionImages';
import type { PlaygroundSection } from '@/types/playground';

const sections: PlaygroundSection[] = [
  { type: 'rooms', title: '객실', items: [
    { name: 'A', images: ['e/2.webp', 'e/3.webp'] },
    { name: 'B', images: ['e/5.webp'] },
  ] },
  { type: 'facilities', title: '부대시설', items: [
    { name: 'C', images: [] },
  ] },
];

describe('collectSectionImagePaths', () => {
  it('모든 섹션/항목의 이미지 경로를 모은다', () => {
    expect(collectSectionImagePaths(sections)).toEqual(new Set(['e/2.webp', 'e/3.webp', 'e/5.webp']));
  });
  it('빈/누락 입력은 빈 집합', () => {
    expect(collectSectionImagePaths(undefined)).toEqual(new Set());
    expect(collectSectionImagePaths([])).toEqual(new Set());
  });
});

describe('excludeSectionImages', () => {
  it('섹션에 배치된 이미지는 제외하고 순서를 유지한다', () => {
    const images = ['e/1.webp', 'e/2.webp', 'e/3.webp', 'e/4.webp', 'e/5.webp'];
    expect(excludeSectionImages(images, sections)).toEqual(['e/1.webp', 'e/4.webp']);
  });
  it('섹션이 없으면 전체를 그대로 반환', () => {
    expect(excludeSectionImages(['e/1.webp'], [])).toEqual(['e/1.webp']);
    expect(excludeSectionImages(['e/1.webp'], undefined)).toEqual(['e/1.webp']);
  });
  it('images가 없으면 빈 배열', () => {
    expect(excludeSectionImages(undefined, sections)).toEqual([]);
  });
});

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
