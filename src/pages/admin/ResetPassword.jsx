import React, { useState } from 'react';
import { supabase } from '@/api/supabaseClient';
export default function ResetPassword() {
  const [message, setMessage] = useState('');
  return <main className="min-h-screen grid place-items-center bg-gray-50"><form className="p-8 bg-white rounded-xl space-y-5" onSubmit={async e => { e.preventDefault(); const password = new FormData(e.currentTarget).get('password'); const { error } = await supabase.auth.updateUser({ password }); setMessage(error ? error.message : 'Password updated. You can now sign in.'); }}><h1 className="text-2xl">Set your password</h1><input aria-label="New password" className="border p-3" name="password" type="password" minLength={12} required autoComplete="new-password" /><button className="block bg-gray-900 text-white p-3 rounded">Save password</button><p role="status">{message}</p><a href="/admin/login">Back to sign in</a></form></main>;
}
