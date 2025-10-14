"use client";
import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { adminConfig } from '@/lib/api';

function LoginPageInner(){
  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');
  const [error,setError] = useState<string|null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch(`${adminConfig.apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || data.error || 'Login failed');
      }
      if (data.data?.user?.role !== 'admin') {
        throw new Error('Access denied: not an admin');
      }
      localStorage.setItem('token', data.data.tokens.accessToken);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      const nextPath = (searchParams.get('next') || '/dashboard') as any;
      router.replace(nextPath);
    } catch (err:any) {
      // Optional dev fallback behind env flag
      const allowDevLogin = process.env.NEXT_PUBLIC_ALLOW_DEV_ADMIN_LOGIN === 'true';
      if (allowDevLogin) {
        try {
          if (email && password) {
            const devUser = { id: 'dev-admin', name: 'Dev Admin', email, role: 'admin' };
            // Use a minimal fake JWT-like structure to avoid decoding errors in Navbar
            const payload = btoa(JSON.stringify({ name: devUser.name, email: devUser.email, role: devUser.role }));
            const devToken = `fake.${payload}.sig`;
            localStorage.setItem('token', devToken);
            localStorage.setItem('user', JSON.stringify(devUser));
            const nextPath = (searchParams.get('next') || '/dashboard') as any;
            router.replace(nextPath);
            return;
          }
        } catch {}
      }
      setError(err.message || 'Login failed');
    }
  };

  return (
    <main className="min-h-[100dvh] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="relative mb-6 text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
            <span className="text-white text-xl font-bold">B</span>
          </div>
          <h1 className="mt-3 text-2xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">Bloocube Admin</h1>
          <p className="text-slate-400 text-sm">Sign in to manage your platform</p>
        </div>

        <div className="rounded-2xl border border-slate-800/60 bg-slate-900/60 backdrop-blur-sm p-5 shadow-xl shadow-black/20">
          <form className="grid gap-3" onSubmit={onSubmit}>
            <div>
              <label className="block text-slate-400 text-xs mb-1">Email</label>
              <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="admin@company.com" type="email" className="w-full px-3 py-2 rounded-lg bg-slate-950/60 border border-slate-800/60 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-600/40 focus:border-violet-600/40"/>
            </div>
            <div>
              <label className="block text-slate-400 text-xs mb-1">Password</label>
              <input value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" type="password" className="w-full px-3 py-2 rounded-lg bg-slate-950/60 border border-slate-800/60 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-600/40 focus:border-violet-600/40"/>
            </div>
            {error && <div className="text-red-400 text-sm">{error}</div>}
            <button type="submit" className="mt-1 inline-flex justify-center items-center gap-2 px-4 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white font-medium transition-colors">Sign in</button>
          </form>

          <div className="mt-4 text-center">
            <a className="text-xs text-slate-400 hover:text-slate-300 cursor-pointer">Forgot password?</a>
          </div>
        </div>

        <div className="mt-6 text-center text-slate-500 text-xs">
          Protected area. Authorized administrators only.
        </div>
      </div>
    </main>
  )
}

export default function LoginPage(){
  return (
    <Suspense fallback={<main style={{display:'grid',placeItems:'center',minHeight:'100dvh'}}><div style={{color:'#9aa4b2'}}>Loading...</div></main>}>
      <LoginPageInner />
    </Suspense>
  );
}
