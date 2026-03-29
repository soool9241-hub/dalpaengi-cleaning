import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  const { mediaId, storagePath } = await req.json();

  if (storagePath) {
    await supabaseAdmin.storage
      .from('cleaning-media')
      .remove([storagePath]);
  }

  const { error } = await supabaseAdmin
    .from('cleaning_media')
    .delete()
    .eq('id', mediaId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
