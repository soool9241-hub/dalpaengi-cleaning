import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { sendSMS } from '@/lib/solapi';

export async function POST(req: NextRequest) {
  try {
    const { sessionId } = await req.json();

    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId 필요' }, { status: 400 });
    }

    const { data: session, error } = await supabaseAdmin
      .from('cleaning_sessions')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .eq('id', sessionId)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const { data: checks } = await supabaseAdmin
      .from('cleaning_checks')
      .select('is_checked')
      .eq('session_id', sessionId);

    const { data: media } = await supabaseAdmin
      .from('cleaning_media')
      .select('id')
      .eq('session_id', sessionId);

    const totalTasks = checks?.length || 0;
    const doneTasks = checks?.filter(c => c.is_checked).length || 0;
    const mediaCount = media?.length || 0;

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://dalpaengi-cleaning.vercel.app';
    const message = `[달팽이아지트 청소완료]\n청소자: ${session.cleaner_name}\n날짜: ${session.session_date}\n작업: ${doneTasks}/${totalTasks}\n미디어: ${mediaCount}건\n→ 검수가 필요합니다.\n검수 링크: ${appUrl}/review/${sessionId}`;

    if (process.env.OWNER_PHONE) {
      await sendSMS(process.env.OWNER_PHONE, message);
    }

    return NextResponse.json({ success: true, session });
  } catch {
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}
