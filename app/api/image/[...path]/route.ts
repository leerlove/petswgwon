import { NextRequest, NextResponse } from 'next/server';

const SUPABASE_URL = 'https://yngzeshxngfeyiabxeyi.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const imagePath = path.join('/');

  const res = await fetch(
    `${SUPABASE_URL}/storage/v1/object/authenticated/place-image/${imagePath}`,
    {
      headers: {
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
        Accept: 'image/*',
      },
    }
  );

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
