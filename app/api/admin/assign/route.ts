import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { ZONES } from '@/lib/zones';

export async function POST(req: NextRequest) {
  try {
    const { assignments } = await req.json();
    // assignments: [{ cleanerName, cleanerPhone, zoneIds: string[] }]

    if (!assignments || !Array.isArray(assignments) || assignments.length === 0) {
      return NextResponse.json({ error: '\uBC30\uC815 \uC815\uBCF4\uAC00 \uD544\uC694\uD569\uB2C8\uB2E4' }, { status: 400 });
    }

    const today = new Date().toISOString().split('T')[0];
    const results = [];

    for (const assign of assignments) {
      const { cleanerName, cleanerPhone, zoneIds } = assign;

      if (!cleanerName || !zoneIds || zoneIds.length === 0) continue;

      // Create session with assigned zones
      const { data: session, error: sessionError } = await supabaseAdmin
        .from('cleaning_sessions')
        .insert({
          cleaner_name: cleanerName,
          cleaner_phone: cleanerPhone || null,
          session_date: today,
          status: 'in_progress',
          assigned_zones: zoneIds,
        })
        .select()
        .single();

      if (sessionError) {
        return NextResponse.json({ error: sessionError.message }, { status: 500 });
      }

      // Create check items only for assigned zones
      const checkItems: { session_id: string; zone_id: string; zone_name: string; zone_category: string; task_index: number; task_text: string; is_checked: boolean }[] = [];

      for (const zoneId of zoneIds) {
        const zone = ZONES.find(z => z.id === zoneId);
        if (!zone) continue;

        zone.tasks.forEach((task, index) => {
          checkItems.push({
            session_id: session.id,
            zone_id: zoneId,
            zone_name: zone.name,
            zone_category: zone.category,
            task_index: index,
            task_text: task,
            is_checked: false,
          });
        });
      }

      if (checkItems.length > 0) {
        const { error: checksError } = await supabaseAdmin
          .from('cleaning_checks')
          .insert(checkItems);

        if (checksError) {
          return NextResponse.json({ error: checksError.message }, { status: 500 });
        }
      }

      results.push({
        sessionId: session.id,
        cleanerName,
        zoneCount: zoneIds.length,
      });
    }

    return NextResponse.json({ success: true, results });
  } catch {
    return NextResponse.json({ error: '\uC11C\uBC84 \uC624\uB958' }, { status: 500 });
  }
}
