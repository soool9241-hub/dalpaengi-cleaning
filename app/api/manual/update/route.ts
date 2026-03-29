import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  const { zoneId, videoUrl } = await req.json();

  const { error } = await supabaseAdmin
    .from('cleaning_manuals')
    .update({
      video_url: videoUrl || null,
      updated_at: new Date().toISOString(),
    })
    .eq('zone_id', zoneId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
