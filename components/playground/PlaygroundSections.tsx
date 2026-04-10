'use client';

import { useState, memo } from 'react';
import Image from 'next/image';
import type { PlaygroundSection, SectionItem } from '@/types/playground';

function getImageUrl(path: string) {
  if (path.startsWith('http')) return path;
  return `/api/image/${path}`;
}

function ItemGallery({ item }: { item: SectionItem }) {
  const [current, setCurrent] = useState(0);
  const images = item.images;
  if (images.length === 0) return null;

  return (
    <div className="bg-surface rounded-2xl border border-warm-100 overflow-hidden shadow-card">
      {/* 이미지 슬라이드 */}
      <div className="relative h-[180px] overflow-hidden">
        <div className="flex transition-transform duration-300 ease-out h-full" style={{ transform: `translateX(-${current * 100}%)` }}>
          {images.map((img, i) => (
            <div key={i} className="w-full shrink-0 h-full relative">
              <Image
                src={getImageUrl(img)}
                alt={`${item.name} ${i + 1}`}
                fill
                sizes="(max-width: 430px) 100vw, 430px"
                className="object-cover"
              />
            </div>
          ))}
        </div>
        {images.length > 1 && (
          <>
            {current > 0 && (
              <button onClick={() => setCurrent(current - 1)} className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white" aria-label="이전">
                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"/></svg>
              </button>
            )}
            {current < images.length - 1 && (
              <button onClick={() => setCurrent(current + 1)} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white" aria-label="다음">
                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>
              </button>
            )}
            <div className="absolute bottom-2 right-2 bg-black/30 backdrop-blur-sm rounded-full px-2 py-0.5 text-[10px] text-white font-medium">
              {current + 1} / {images.length}
            </div>
          </>
        )}
      </div>
      {/* 항목 정보 */}
      <div className="p-3.5">
        <h4 className="font-bold text-sm text-warm-900">{item.name}</h4>
        {item.subtitle && (
          <p className="text-xs text-primary font-medium mt-0.5">{item.subtitle}</p>
        )}
        {item.description && (
          <p className="text-xs text-warm-500 mt-1 leading-relaxed">{item.description}</p>
        )}
      </div>
    </div>
  );
}

function PlaygroundSections({ sections }: { sections: PlaygroundSection[] }) {
  const [activeTab, setActiveTab] = useState(0);

  if (!sections || sections.length === 0) return null;

  return (
    <>
      {sections.map((section, sIdx) => (
        <div key={sIdx}>
          <div className="h-2 bg-surface-container" />
          <div className="px-4 py-4">
            <h3 className="font-bold text-[15px] text-warm-900 mb-3 flex items-center gap-2">
              <span className="text-lg">
                {section.type === 'rooms' ? '🛏️' : section.type === 'facilities' ? '🏊' : section.type === 'lobby' ? '🏨' : '📋'}
              </span>
              {section.title}
              <span className="text-xs text-warm-300 font-normal ml-auto">{section.items.length}개</span>
            </h3>

            {section.items.length <= 3 ? (
              /* 3개 이하: 세로 나열 */
              <div className="flex flex-col gap-3">
                {section.items.map((item, iIdx) => (
                  <ItemGallery key={iIdx} item={item} />
                ))}
              </div>
            ) : (
              /* 4개 이상: 탭 UI */
              <div>
                <div className="flex gap-1.5 overflow-x-auto no-scrollbar mb-3">
                  {section.items.map((item, iIdx) => (
                    <button
                      key={iIdx}
                      onClick={() => setActiveTab(iIdx)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors border ${
                        activeTab === iIdx
                          ? 'bg-primary text-white border-primary'
                          : 'bg-surface text-warm-600 border-warm-200 hover:border-warm-300'
                      }`}
                    >
                      {item.name}
                    </button>
                  ))}
                </div>
                {section.items[activeTab] && (
                  <ItemGallery item={section.items[activeTab]} />
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </>
  );
}

export default memo(PlaygroundSections);
