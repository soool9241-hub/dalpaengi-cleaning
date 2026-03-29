import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { ZONES } from '@/lib/zones';

export async function POST(req: NextRequest) {
  const { cleanerName, cleanerPhone } = await req.json();

  if (!cleanerName) {
    return NextResponse.json({ error: '이름을 입력해주세요' }, { status: 400 });
  }

  const { data: session, error: sessionErr } = await supabaseAdmin
    .from('cleaning_sessions')
    .insert({
      cleaner_name: cleanerName,
      cleaner_phone: cleanerPhone || null,
      status: 'in_progress',
    })
    .select()
    .single();

  if (sessionErr) return NextResponse.json({ error: sessionErr.message }, { status: 500 });

  const checks = ZONES.flatMap(zone =>
    zone.tasks.map((task, index) => ({
      session_id: session.id,
      zone_id: zone.id,
      zone_name: zone.name,
      zone_category: zone.category,
      task_index: index,
      task_text: task,
      is_checked: false,
    }))
  );

  const { error: checksErr } = await supabaseAdmin
    .from('cleaning_checks')
    .insert(checks);

  if (checksErr) return NextResponse.json({ error: checksErr.message }, { status: 500 });

  return NextResponse.json({ session });
}
