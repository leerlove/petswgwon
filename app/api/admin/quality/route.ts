import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/supabase/adminAuth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if ('error' in auth) return auth.error;
  const { supabase } = auth;

  const sp = request.nextUrl.searchParams;
  const field = sp.get('field');
  const page = parseInt(sp.get('page') ?? '1', 10);
  const limit = parseInt(sp.get('limit') ?? '50', 10);
  const offset = (page - 1) * limit;

  // 품질 요약
  const fields = ['thumbnail', 'phone', 'business_hours', 'pet_etiquette', 'images'] as const;
  const total = (await supabase.from('places').select('*', { count: 'exact', head: true })).count ?? 0;

  const summary = await Promise.all(
    fields.map(async (f) => {
      let query = supabase.from('places').select('*', { count: 'exact', head: true });
      if (f === 'thumbnail' || f === 'phone') {
        query = query.or(`${f}.eq.,${f}.is.null`);
      } else if (f === 'business_hours') {
        query = query.or(`${f}.eq.{},${f}.is.null`);
      } else {
        query = query.or(`${f}.eq.[],${f}.is.null`);
      }
      const { count: empty } = await query;
      const emptyCount = empty ?? 0;
      return {
        field: f,
        total,
        filled: total - emptyCount,
        empty: emptyCount,
        fillRate: total > 0 ? (total - emptyCount) / total : 0,
      };
    })
  );

  // 특정 필드의 빈 장소 목록
  let places = null;
  let fieldTotal = 0;
  if (field) {
    let query = supabase.from('places').select('id, name, category, sub_category, address, phone, updated_at', { count: 'exact' });
    if (field === 'thumbnail' || field === 'phone') {
      query = query.or(`${field}.eq.,${field}.is.null`);
    } else if (field === 'business_hours') {
      query = query.or(`${field}.eq.{},${field}.is.null`);
    } else {
      query = query.or(`${field}.eq.[],${field}.is.null`);
    }

    query = query.order('name').range(offset, offset + limit - 1);
    const { data, count } = await query;
    places = data;
    fieldTotal = count ?? 0;
  }

  return NextResponse.json({
    summary,
    places,
    total: fieldTotal,
    page,
    totalPages: Math.ceil(fieldTotal / limit),
  });
}
