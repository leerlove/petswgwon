'use client';

import { useState } from 'react';
import type { Playground } from '@/types/playground';

const DAY_NAMES: Record<string, string> = {
  mon: '월요일', tue: '화요일', wed: '수요일', thu: '목요일', fri: '금요일', sat: '토요일', sun: '일요일',
};
const DAY_ORDER = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;

export default function PlaygroundInfoSection({ playground }: { playground: Playground }) {
  const [hoursOpen, setHoursOpen] = useState(false);

  const hours = playground.business_hours.hours || '';
  const closedDays = playground.business_hours.closedDays || '';
  const hasHours = !!hours;
  const is24h = hours.includes('24시간') || hours.includes('연중무휴');

  return (
    <div>
      <h3 className="font-bold text-[15px] text-warm-900 mb-3 flex items-center gap-2">
        <span className="text-lg">📍</span>장소 정보
      </h3>
      <div className="flex flex-col gap-3.5">
        {/* 주소 */}
        <div className="flex gap-3">
          <span className="text-warm-300 mt-0.5 shrink-0">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" /><circle cx="12" cy="9" r="2.5" /></svg>
          </span>
          <p className="text-sm text-warm-700 leading-snug">{playground.address}</p>
        </div>

        {/* 전화번호 */}
        <div className="flex items-center gap-3">
          <span className="text-warm-300 shrink-0">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" /></svg>
          </span>
          {(() => {
            const sanitized = playground.phone?.replace(/[^\d+\-]/g, '') || '';
            return sanitized ? (
              <a href={`tel:${sanitized}`} className="text-sm text-secondary font-semibold hover:underline">{playground.phone}</a>
            ) : (
              <span className="text-sm text-warm-300">전화번호 정보 없음</span>
            );
          })()}
        </div>

        {/* 영업시간 */}
        <div className="flex gap-3">
          <span className="text-warm-300 mt-0.5 shrink-0">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
          </span>
          <div className="flex-1">
            {hasHours ? (
              <>
                <button onClick={() => setHoursOpen(!hoursOpen)} className="flex items-center justify-between w-full" aria-expanded={hoursOpen}>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${is24h ? 'bg-primary-100 text-primary-dark border border-primary/20' : 'bg-primary-100 text-primary-dark border border-primary/20'}`}>
                      {is24h ? '24시간' : '운영중'}
                    </span>
                    <span className="text-sm text-warm-700">{hours}</span>
                  </div>
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className={`transition-transform duration-200 text-warm-300 ${hoursOpen ? 'rotate-180' : ''}`}><path d="M6 9l6 6 6-6" /></svg>
                </button>
                {hoursOpen && (
                  <div className="mt-2.5 flex flex-col gap-0.5 animate-slide-down bg-warm-50 rounded-lg p-2.5">
                    {DAY_ORDER.map((day) => (
                      <div key={day} className="flex justify-between text-xs py-1 px-1 rounded text-warm-500">
                        <span>{DAY_NAMES[day]}</span>
                        <span>{is24h ? '24시간' : hours}</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <span className="text-sm text-warm-300">영업시간 정보 없음</span>
            )}
          </div>
        </div>

        {/* 정기휴무 */}
        <div className="flex items-center gap-3">
          <span className="text-warm-300 shrink-0">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
          </span>
          <p className="text-sm text-warm-700">
            {closedDays ? (
              <span className="text-accent-rose font-semibold">{closedDays}</span>
            ) : is24h ? (
              <span className="text-warm-400">연중무휴</span>
            ) : (
              <span className="text-warm-400">휴무일 정보 없음</span>
            )}
          </p>
        </div>

        {/* 인스타그램 */}
        {playground.instagram && (
          <div className="flex items-center gap-3">
            <span className="text-warm-300 shrink-0">
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="5" /><circle cx="17.5" cy="6.5" r="1.5" /></svg>
            </span>
            <a href={`https://instagram.com/${playground.instagram}`} target="_blank" rel="noopener noreferrer" className="text-sm text-pink-500 font-semibold hover:underline">
              @{playground.instagram}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
