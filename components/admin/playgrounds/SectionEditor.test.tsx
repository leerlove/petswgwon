import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import SectionEditor from './SectionEditor';
import type { PlaygroundSection } from '@/types/playground';

describe('SectionEditor 드래그앤드롭', () => {
  it('상단 갤러리에서 드롭한 경로가 해당 섹션 항목 images에 추가된다', () => {
    const sections: PlaygroundSection[] = [
      { type: 'rooms', title: '객실', items: [{ name: '디럭스', images: [] }] },
    ];
    const onChange = vi.fn();
    const { getByTestId } = render(
      <SectionEditor entityId="e1" sections={sections} onChange={onChange} />
    );

    fireEvent.drop(getByTestId('section-dropzone-0-0'), {
      dataTransfer: {
        getData: (type: string) =>
          type === 'application/x-petplace-image' ? 'e1/3.webp' : '',
      },
    });

    expect(onChange).toHaveBeenCalledTimes(1);
    const updated = onChange.mock.calls[0][0] as PlaygroundSection[];
    expect(updated[0].items[0].images).toEqual(['e1/3.webp']);
  });

  it('이미 존재하는 이미지를 드롭하면 중복 추가되지 않는다', () => {
    const sections: PlaygroundSection[] = [
      { type: 'rooms', title: '객실', items: [{ name: '디럭스', images: ['e1/3.webp'] }] },
    ];
    const onChange = vi.fn();
    const { getByTestId } = render(
      <SectionEditor entityId="e1" sections={sections} onChange={onChange} />
    );

    fireEvent.drop(getByTestId('section-dropzone-0-0'), {
      dataTransfer: { getData: () => 'e1/3.webp' },
    });

    const updated = onChange.mock.calls[0][0] as PlaygroundSection[];
    expect(updated[0].items[0].images).toEqual(['e1/3.webp']);
  });

  it('application/x-petplace-image가 비어도 text/plain 폴백 경로를 사용한다', () => {
    const sections: PlaygroundSection[] = [
      { type: 'rooms', title: '객실', items: [{ name: '디럭스', images: [] }] },
    ];
    const onChange = vi.fn();
    const { getByTestId } = render(
      <SectionEditor entityId="e1" sections={sections} onChange={onChange} />
    );

    fireEvent.drop(getByTestId('section-dropzone-0-0'), {
      dataTransfer: {
        getData: (type: string) =>
          type === 'text/plain' ? 'e1/fallback.webp' : '',
      },
    });

    expect(onChange).toHaveBeenCalledTimes(1);
    const updated = onChange.mock.calls[0][0] as PlaygroundSection[];
    expect(updated[0].items[0].images).toEqual(['e1/fallback.webp']);
  });

  it('드롭 데이터에 경로가 없으면 onChange를 호출하지 않는다', () => {
    const sections: PlaygroundSection[] = [
      { type: 'rooms', title: '객실', items: [{ name: '디럭스', images: [] }] },
    ];
    const onChange = vi.fn();
    const { getByTestId } = render(
      <SectionEditor entityId="e1" sections={sections} onChange={onChange} />
    );

    fireEvent.drop(getByTestId('section-dropzone-0-0'), {
      dataTransfer: { getData: () => '' },
    });

    expect(onChange).not.toHaveBeenCalled();
  });
});
