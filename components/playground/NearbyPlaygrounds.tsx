'use client';

import { useMemo, memo } from 'react';
import { usePlaygroundStore } from '@/stores/playgroundStore';
import { PLAYGROUND_TYPE_LABELS } from '@/types/playground';
import type { Playground } from '@/types/playground';

function calcDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

interface Props {
  currentPlayground: Playground;
  onSelect?: (pg: Playground) => void;
}

function NearbyPlaygrounds({ currentPlayground, onSelect }: Props) {
  const allPlaygrounds = usePlaygroundStore((s) => s.playgrounds);

  const nearby = useMemo(() => {
    return allPlaygrounds
      .filter((p) => p.id !== currentPlayground.id)
      .map((p) => ({ ...p, distance: calcDistance(currentPlayground.lat, currentPlayground.lng, p.lat, p.lng) }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 8);
  }, [allPlaygrounds, currentPlayground.id, currentPlayground.lat, currentPlayground.lng]);

  if (nearby.length === 0) return null;

  const TYPE_COLORS: Record<string, string> = {
    playground: '#22c55e',
    cafe: '#f59e0b',
    hotel: '#8b5cf6',
    government: '#3b82f6',
    other: '#6b7280',
  };

  return (
    <div>
      <h3 className="font-bold text-[15px] text-warm-900 mb-3 flex items-center gap-2">
        <span className="text-lg">📌</span>주변 놀이터
        <span className="text-xs text-warm-300 font-normal ml-auto">{nearby.length}곳</span>
      </h3>
      <div className="flex gap-2.5 overflow-x-auto scrollbar-hide pb-2 -mx-1 px-1">
        {nearby.map((np) => {
          const color = TYPE_COLORS[np.playground_type] || TYPE_COLORS.other;
          return (
            <button
              key={np.id}
              onClick={() => onSelect?.(np)}
              className="shrink-0 w-[130px] bg-surface rounded-2xl border border-warm-50 shadow-card overflow-hidden hover:shadow-card-hover transition-all duration-200 press-scale"
              aria-label={`${np.name} 상세보기`}
            >
              <div className="h-[80px] flex items-center justify-center relative overflow-hidden" style={{ backgroundColor: color + '18' }}>
                <span className="text-3xl">🏃</span>
                <span className="absolute bottom-1.5 right-1.5 bg-white/90 backdrop-blur-sm text-[10px] font-bold px-1.5 py-0.5 rounded-full text-warm-500 shadow-sm">
                  {np.distance < 1 ? `${Math.round(np.distance * 1000)}m` : `${np.distance.toFixed(1)}km`}
                </span>
              </div>
              <div className="p-2.5">
                <p className="text-xs font-semibold text-warm-700 truncate leading-snug">{np.name}</p>
                <p className="text-[10px] text-warm-300 mt-0.5 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: color }} />
                  {PLAYGROUND_TYPE_LABELS[np.playground_type]}
                  {np.is_public && ' · 공공'}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default memo(NearbyPlaygrounds);
