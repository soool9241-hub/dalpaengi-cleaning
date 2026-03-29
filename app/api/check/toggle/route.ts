import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  const { sessionId, zoneId, taskIndex, isChecked } = await req.json();

  const { error } = await supabaseAdmin
    .from('cleaning_checks')
    .update({
      is_checked: isChecked,
      checked_at: isChecked ? new Date().toISOString() : null,
    })
    .eq('session_id', sessionId)
    .eq('zone_id', zoneId)
    .eq('task_index', taskIndex);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
