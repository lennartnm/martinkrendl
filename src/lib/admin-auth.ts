// src/lib/admin-auth.ts
// Session-Helpers für das Admin Panel

import { cookies } from 'next/headers';
import { supabase } from './supabase';

export const SESSION_COOKIE = 'admin_session';
export const SESSION_MAX_AGE = 60 * 60 * 8; // 8 Stunden

export async function getAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const { data, error } = await supabase
    .from('admin_sessions')
    .select('*, admin_users(*)')
    .eq('token', token)
    .gt('expires_at', new Date().toISOString())
    .single();

  if (error || !data) return null;
  return data;
}

export async function requireAdminSession() {
  const session = await getAdminSession();
  if (!session) {
    throw new Error('Unauthorized');
  }
  return session;
}

export async function createAdminSession(userId: string): Promise<string> {
  const token = crypto.randomUUID() + '-' + crypto.randomUUID();
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE * 1000).toISOString();

  const { error } = await supabase.from('admin_sessions').insert({
    user_id: userId,
    token,
    expires_at: expiresAt,
  });

  if (error) throw new Error('Could not create session');
  return token;
}

export async function deleteAdminSession(token: string) {
  await supabase.from('admin_sessions').delete().eq('token', token);
}
