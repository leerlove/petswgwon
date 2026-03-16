import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import './globals.css';

export const metadata: Metadata = {
  title: '펫세권 - Pawtopia',
  description: '내 주변 반려동물 동반 장소를 한눈에! GPS 기반 지도 탐색 서비스',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: '펫세권',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#4ECDC4',
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
          rel="stylesheet"
          crossOrigin="anonymous"
        />
      </head>
      <body className="bg-warm-900 font-pretendard" suppressHydrationWarning>
        <Script
          src={`https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_KEY}&autoload=false`}
          strategy="beforeInteractive"
        />
        <a href="#main-content" className="skip-nav">본문으로 건너뛰기</a>
        <div id="main-content" className="mx-auto max-w-[430px] min-h-screen bg-surface relative shadow-2xl overflow-hidden">
          {children}
        </div>
      </body>
    </html>
  );
}
