'use client';

import type { Place } from '@/types';

export default function PetConditionCard({ place }: { place: Place }) {
  const { pet_conditions } = place;
  const dogs = [
    { label: '소형견', sub: '10kg 미만', allowed: pet_conditions.small_dog },
    { label: '중형견', sub: '10~25kg', allowed: pet_conditions.medium_dog },
    { label: '대형견', sub: '25kg 이상', allowed: pet_conditions.large_dog },
  ];

  return (
    <div className="bg-gradient-to-br from-warm-50 to-primary-50 rounded-2xl p-4 border border-warm-100">
      <h3 className="font-bold text-[15px] text-warm-900 mb-3 flex items-center gap-2">
        <span className="text-lg">🐾</span>
        반려견 동반 조건
      </h3>
      <div className="flex gap-2 mb-3">
        {dogs.map((d) => (
          <div key={d.label} className={`flex-1 rounded-xl p-2.5 text-center transition-all ${d.allowed ? 'bg-primary-100 border border-primary/30' : 'bg-accent-rose/10 border border-accent-rose/30'}`}>
            <div className={`text-lg mb-0.5 ${d.allowed ? 'text-primary-dark' : 'text-accent-rose'}`}>{d.allowed ? '✔️' : '❌'}</div>
            <div className="text-xs font-semibold text-warm-700">{d.label}</div>
            <div className="text-[10px] text-warm-400">{d.sub}</div>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-1.5 mt-2">
        <div className="flex items-center gap-2 text-sm text-warm-600">
          <span className="text-base">🔗</span>
          <span>동반방법: <strong>{pet_conditions.access_method}</strong></span>
        </div>
        <div className="flex items-center gap-2 text-sm text-warm-600">
          <span className="text-base">{pet_conditions.indoor_allowed ? '🏠' : '🌳'}</span>
          <span>{pet_conditions.indoor_allowed ? '실내 이용 가능' : '실외만 가능'}</span>
        </div>
      </div>
    </div>
  );
}
