import { NextRequest, NextResponse } from 'next/server';
import { sendSMS } from '@/lib/solapi';

export async function POST(req: NextRequest) {
  const { to, text } = await req.json();

  if (!to || !text) {
    return NextResponse.json({ error: '수신번호와 메시지 필요' }, { status: 400 });
  }

  const success = await sendSMS(to, text);

  if (!success) {
    return NextResponse.json({ error: 'SMS 발송 실패' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
