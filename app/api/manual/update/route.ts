import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const { zoneId, videoUrl } = await req.json();

    if (!zoneId) {
      return NextResponse.json({ error: 'zoneId 필요' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('cleaning_manuals')
      .update({
        video_url: videoUrl || null,
        updated_at: new Date().toISOString(),
      })
      .eq('zone_id', zoneId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}
