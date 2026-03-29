import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file') as File;
  const sessionId = formData.get('sessionId') as string;
  const zoneId = formData.get('zoneId') as string;
  const mediaType = formData.get('mediaType') as string;

  if (!file || !sessionId || !zoneId) {
    return NextResponse.json({ error: '필수 항목 누락' }, { status: 400 });
  }

  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const storagePath = `sessions/${sessionId}/${zoneId}/${timestamp}_${safeName}`;

  const { error: uploadErr } = await supabaseAdmin.storage
    .from('cleaning-media')
    .upload(storagePath, file, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadErr) return NextResponse.json({ error: uploadErr.message }, { status: 500 });

  const { data: urlData } = supabaseAdmin.storage
    .from('cleaning-media')
    .getPublicUrl(storagePath);

  const { data: media, error: dbErr } = await supabaseAdmin
    .from('cleaning_media')
    .insert({
      session_id: sessionId,
      zone_id: zoneId,
      media_type: mediaType || 'photo',
      storage_path: storagePath,
      public_url: urlData.publicUrl,
      file_name: file.name,
      file_size: file.size,
    })
    .select()
    .single();

  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 });

  return NextResponse.json({ media });
}
