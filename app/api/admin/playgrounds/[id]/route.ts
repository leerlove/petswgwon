import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/supabase/adminAuth';
import { PLAYGROUND_ALLOWED_ROLES } from '@/lib/supabase/adminRole';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(PLAYGROUND_ALLOWED_ROLES);
  if ('error' in auth) return auth.error;
  const { supabase } = auth;
  const { id } = await params;

  const { data, error } = await supabase
    .from('playgrounds')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Playground not found' }, { status: 404 });
  }

  return NextResponse.json(data);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(PLAYGROUND_ALLOWED_ROLES);
  if ('error' in auth) return auth.error;
  const { supabase } = auth;
  const { id } = await params;
  const body = await request.json();

  const { id: _id, created_at: _c, updated_at: _u, ...updateData } = body;

  const { data, error } = await supabase
    .from('playgrounds')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(PLAYGROUND_ALLOWED_ROLES);
  if ('error' in auth) return auth.error;
  const { supabase } = auth;
  const { id } = await params;

  const { error } = await supabase
    .from('playgrounds')
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
