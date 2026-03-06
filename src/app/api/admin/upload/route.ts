// src/app/api/admin/upload/route.ts
// Nimmt eine Datei entgegen, lädt sie in Supabase Storage hoch
// und gibt die öffentliche URL zurück

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getAdminSession } from '@/lib/admin-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const BUCKET = 'cms-media';
const MAX_SIZE = 50 * 1024 * 1024; // 50MB

export async function POST(req: NextRequest) {
  // Auth check
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: 'invalid_form_data' }, { status: 400 });
  }

  const file = formData.get('file') as File | null;
  const folder = String(formData.get('folder') || 'images'); // 'images' | 'videos'

  if (!file) {
    return NextResponse.json({ error: 'no_file' }, { status: 400 });
  }

  // Größencheck
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'file_too_large', maxMb: 50 }, { status: 413 });
  }

  // MIME-Type check
  const allowedImages = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  const allowedVideos = ['video/mp4', 'video/webm', 'video/quicktime'];
  const allowed = [...allowedImages, ...allowedVideos];

  if (!allowed.includes(file.type)) {
    return NextResponse.json({ error: 'invalid_file_type', type: file.type }, { status: 400 });
  }

  // Eindeutigen Dateinamen generieren
  const ext = file.name.split('.').pop()?.toLowerCase() || 'bin';
  const timestamp = Date.now();
  const random = Math.random().toString(36).slice(2, 8);
  const filename = `${folder}/${timestamp}-${random}.${ext}`;

  // Datei als ArrayBuffer lesen
  const buffer = await file.arrayBuffer();

  // In Supabase Storage hochladen
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .upload(filename, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    console.error('Storage upload error:', error);
    return NextResponse.json({ error: 'upload_failed', detail: error.message }, { status: 500 });
  }

  // Öffentliche URL abrufen
  const { data: urlData } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(data.path);

  return NextResponse.json({
    ok: true,
    url: urlData.publicUrl,
    path: data.path,
    name: file.name,
    size: file.size,
    type: file.type,
  });
}
