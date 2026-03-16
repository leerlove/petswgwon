import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/supabase/adminAuth';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/data?format=json
 * 전체 장소 데이터를 JSON으로 다운로드
 */
export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if ('error' in auth) return auth.error;
  const { supabase } = auth;

  const format = request.nextUrl.searchParams.get('format') ?? 'json';

  const { data, error } = await supabase
    .from('places')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (format === 'csv') {
    if (!data || data.length === 0) {
      return new NextResponse('', {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="places_${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    }

    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map((row) =>
        headers.map((h) => {
          const val = row[h];
          if (val === null || val === undefined) return '';
          const str = typeof val === 'object' ? JSON.stringify(val) : String(val);
          // CSV escape: wrap in quotes if contains comma, newline, or quote
          if (str.includes(',') || str.includes('\n') || str.includes('"')) {
            return `"${str.replace(/"/g, '""')}"`;
          }
          return str;
        }).join(',')
      ),
    ];

    return new NextResponse(csvRows.join('\n'), {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="places_${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  }

  // default: JSON
  return new NextResponse(JSON.stringify(data, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': `attachment; filename="places_${new Date().toISOString().split('T')[0]}.json"`,
    },
  });
}

/**
 * POST /api/admin/data
 * JSON 배열을 받아 upsert (id가 있으면 업데이트, 없으면 생성)
 * SERVICE_ROLE_KEY 사용 (RLS 우회)
 */
export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if ('error' in auth) return auth.error;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!Array.isArray(body)) {
    return NextResponse.json({ error: '데이터는 JSON 배열이어야 합니다.' }, { status: 400 });
  }

  if (body.length === 0) {
    return NextResponse.json({ error: '빈 배열입니다.' }, { status: 400 });
  }

  if (body.length > 5000) {
    return NextResponse.json({ error: '최대 5,000건까지 업로드 가능합니다.' }, { status: 400 });
  }

  const adminSupabase = createAdminClient();

  // Strip timestamps — let DB handle them
  const cleaned = body.map((row: Record<string, unknown>) => {
    const { created_at, updated_at, ...rest } = row;
    return rest;
  });

  const { data, error } = await adminSupabase
    .from('places')
    .upsert(cleaned, { onConflict: 'id' })
    .select('id');

  if (error) {
    console.error('[admin/data] upsert error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    message: `${data?.length ?? 0}건 처리 완료`,
    count: data?.length ?? 0,
  });
}
