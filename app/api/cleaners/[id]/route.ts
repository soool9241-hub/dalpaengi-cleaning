import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { name, phone } = await req.json();

    if (!name || !phone) {
      return NextResponse.json({ error: '\uC774\uB984\uACFC \uC804\uD654\uBC88\uD638\uB97C \uC785\uB825\uD574\uC8FC\uC138\uC694' }, { status: 400 });
    }

    const cleanPhone = phone.replace(/[^0-9]/g, '');

    const { data, error } = await supabaseAdmin
      .from('cleaners')
      .update({ name, phone: cleanPhone })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: '\uC774\uBBF8 \uB4F1\uB85D\uB41C \uC804\uD654\uBC88\uD638\uC785\uB2C8\uB2E4' }, { status: 409 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ cleaner: data });
  } catch {
    return NextResponse.json({ error: '\uC11C\uBC84 \uC624\uB958' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { error } = await supabaseAdmin
      .from('cleaners')
      .update({ is_active: false })
      .eq('id', id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: '\uC11C\uBC84 \uC624\uB958' }, { status: 500 });
  }
}
