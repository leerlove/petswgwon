import { NextRequest, NextResponse } from 'next/server';

const SUPABASE_STORAGE_URL =
  'https://yngzeshxngfeyiabxeyi.supabase.co/storage/v1/object/public/place-image';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const imagePath = path.join('/');

  const res = await fetch(`${SUPABASE_STORAGE_URL}/${imagePath}`, {
    headers: { Accept: 'image/*' },
  });

  if (!res.ok) {
    return new NextResponse(null, { status: 404 });
  }

  const contentType = res.headers.get('content-type') || 'image/jpeg';
  const body = res.body;

  return new NextResponse(body, {
    status: 200,
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
