'use client';

import { useEffect, useRef, memo } from 'react';
import { loadKakaoMapSDK } from '@/lib/kakaoMap';

interface MiniMapProps {
  lat: number;
  lng: number;
  name: string;
  height?: number;
  markers?: { lat: number; lng: number }[];
}

function MiniMap({ lat, lng, name, height = 180, markers }: MiniMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<kakao.maps.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    loadKakaoMapSDK()
      .then(() => {
        if (!containerRef.current) return;

        const center = new kakao.maps.LatLng(lat, lng);
        const map = new kakao.maps.Map(containerRef.current, {
          center,
          level: markers && markers.length > 1 ? 6 : 4,
          draggable: false,
          scrollwheel: false,
          disableDoubleClick: true,
          disableDoubleClickZoom: true,
        });
        mapRef.current = map;

        // 메인 마커
        const mainMarker = new kakao.maps.Marker({ position: center, map });

        // 추가 마커 (핫플레이스용)
        if (markers && markers.length > 0) {
          const bounds = new kakao.maps.LatLngBounds();
          bounds.extend(center);
          markers.forEach((m) => {
            const pos = new kakao.maps.LatLng(m.lat, m.lng);
            new kakao.maps.Marker({ position: pos, map });
            bounds.extend(pos);
          });
          map.setBounds(bounds, 40);
        }

        // 클릭 시 카카오맵으로 이동
        kakao.maps.event.addListener(map, 'click', () => {
          window.open(
            `https://map.kakao.com/link/map/${encodeURIComponent(name)},${lat},${lng}`,
            '_blank',
            'noopener,noreferrer'
          );
        });
        kakao.maps.event.addListener(mainMarker, 'click', () => {
          window.open(
            `https://map.kakao.com/link/map/${encodeURIComponent(name)},${lat},${lng}`,
            '_blank',
            'noopener,noreferrer'
          );
        });
      })
      .catch(() => {
        // SDK 로드 실패 시 fallback
      });

    return () => {
      mapRef.current = null;
    };
  }, [lat, lng, name, markers]);

  return (
    <div className="rounded-2xl overflow-hidden border border-warm-100 relative group cursor-pointer">
      <div ref={containerRef} style={{ width: '100%', height }} />
      <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm text-[11px] font-semibold text-primary px-3 py-1.5 rounded-full shadow-sm group-hover:bg-white transition-colors pointer-events-none">
        카카오맵에서 보기 →
      </div>
    </div>
  );
}

export default memo(MiniMap);
