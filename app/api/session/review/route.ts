import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { sendSMS } from '@/lib/solapi';

export async function POST(req: NextRequest) {
  const { sessionId, action, reviewerName, reviewNotes } = await req.json();

  const status = action === 'approve' ? 'reviewed' : 'rejected';

  const { data: session, error } = await supabaseAdmin
    .from('cleaning_sessions')
    .update({
      status,
      reviewer_name: reviewerName,
      reviewed_at: new Date().toISOString(),
      review_notes: reviewNotes || null,
    })
    .eq('id', sessionId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (session.cleaner_phone) {
    const resultText = action === 'approve'
      ? '검수 통과! 수고하셨습니다.'
      : `재청소 필요\n사유: ${reviewNotes || '확인 필요'}\n관리자에게 연락해주세요.`;

    const message = `[달팽이아지트 검수결과]\n${resultText}\n검수자: ${reviewerName}`;
    await sendSMS(session.cleaner_phone, message);
  }

  return NextResponse.json({ success: true, session });
}
