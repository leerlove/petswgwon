import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('blog_reviews')
    .select('*')
    .eq('place_id', id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[API] reviews fetch error:', error.message);
    return NextResponse.json([]);
  }

  return NextResponse.json(data ?? []);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('blog_reviews')
    .insert({
      place_id: id,
      summary: body.summary,
      content: body.content,
      author: body.author,
      source: '사용자리뷰',
      source_url: '#',
      date: new Date().toISOString().split('T')[0],
    })
    .select()
    .single();

  if (error) {
    console.error('[API] review create error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
