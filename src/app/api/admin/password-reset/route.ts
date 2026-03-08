// src/app/api/admin/password-reset/route.ts
// Handles password reset token generation and password change
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import bcrypt from 'bcrypt';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// POST /api/admin/password-reset
// body: { action: 'request', email } | { action: 'reset', token, password }
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { action } = body;

  // ── Request reset token ────────────────────────────────────────────────────
  if (action === 'request') {
    const email = String(body.email || '').trim().toLowerCase();
    if (!email) return NextResponse.json({ error: 'email required' }, { status: 400 });

    const { data: user } = await supabase
      .from('admin_users')
      .select('id')
      .eq('email', email)
      .single();

    // Always return ok to prevent email enumeration
    if (!user) return NextResponse.json({ ok: true });

    // Generate a secure token valid for 1 hour
    const token = crypto.randomUUID() + '-' + crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    // Store token in admin_sessions with special marker
    await supabase.from('admin_sessions').insert({
      user_id: user.id,
      token: 'pwreset_' + token,
      expires_at: expiresAt,
    });

    // In a real app you'd send an email here.
    // For now we return the token directly so admin can set it.
    return NextResponse.json({ ok: true, reset_token: token });
  }

  // ── Reset password with token ──────────────────────────────────────────────
  if (action === 'reset') {
    const { token, password } = body;
    if (!token || !password) return NextResponse.json({ error: 'token and password required' }, { status: 400 });
    if (password.length < 8) return NextResponse.json({ error: 'password_too_short' }, { status: 400 });

    const { data: session } = await supabase
      .from('admin_sessions')
      .select('*, admin_users(*)')
      .eq('token', 'pwreset_' + token)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (!session) return NextResponse.json({ error: 'invalid_or_expired_token' }, { status: 400 });

    const hash = await bcrypt.hash(password, 12);

    await supabase.from('admin_users').update({ password_hash: hash }).eq('id', session.user_id);
    // Invalidate the reset token
    await supabase.from('admin_sessions').delete().eq('token', 'pwreset_' + token);

    return NextResponse.json({ ok: true });
  }

  // ── Change password (authenticated) ────────────────────────────────────────
  if (action === 'change') {
    const { current_password, new_password } = body;
    // Validate session via cookie
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('admin_session')?.value;
    if (!sessionToken) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

    const { data: sess } = await supabase
      .from('admin_sessions')
      .select('*, admin_users(*)')
      .eq('token', sessionToken)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (!sess) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

    const user = (sess as any).admin_users;
    const valid = await bcrypt.compare(current_password, user.password_hash);
    if (!valid) return NextResponse.json({ error: 'wrong_password' }, { status: 400 });

    if (!new_password || new_password.length < 8) return NextResponse.json({ error: 'password_too_short' }, { status: 400 });

    const hash = await bcrypt.hash(new_password, 12);
    await supabase.from('admin_users').update({ password_hash: hash }).eq('id', user.id);

    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: 'unknown action' }, { status: 400 });
}
