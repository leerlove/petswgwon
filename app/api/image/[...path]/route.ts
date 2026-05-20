import { NextRequest, NextResponse } from 'next/server';

const SUPABASE_URL = 'https://yngzeshxngfeyiabxeyi.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

const MAX_WIDTH = 1920;

/**
 * 이미지 프록시 (인증 버킷 place-image)
 * - ?w= 지정 시 Supabase 이미지 변환(render endpoint)으로 리사이즈 + 포맷 자동협상(webp/avif)
 * - 미지정 시 원본 객체 그대로 프록시
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const imagePath = path.join('/');

  const wParam = request.nextUrl.searchParams.get('w');
  const qParam = request.nextUrl.searchParams.get('q');
  const width = wParam ? Math.min(Math.max(parseInt(wParam, 10) || 0, 16), MAX_WIDTH) : 0;
  const quality = qParam ? Math.min(Math.max(parseInt(qParam, 10) || 0, 20), 100) : 80;

  let upstreamUrl: string;
  if (width) {
    // Supabase 이미지 변환 (Pro 플랜). format 미지정 시 Accept 헤더 기반 자동(webp/avif)
    upstreamUrl =
      `${SUPABASE_URL}/storage/v1/render/image/authenticated/place-image/${imagePath}` +
      `?width=${width}&quality=${quality}&resize=contain`;
  } else {
    upstreamUrl = `${SUPABASE_URL}/storage/v1/object/authenticated/place-image/${imagePath}`;
  }

  const res = await fetch(upstreamUrl, {
    headers: {
      Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
      Accept: request.headers.get('accept') || 'image/avif,image/webp,image/*',
    },
  });

  if (!res.ok) {
    return new NextResponse(null, { status: 404 });
  }

  const contentType = res.headers.get('content-type') || 'image/jpeg';

  return new NextResponse(res.body, {
    status: 200,
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
