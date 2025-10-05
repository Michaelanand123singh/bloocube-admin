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
    <main style={{display:'grid',placeItems:'center',minHeight:'100dvh'}}>
      <div style={{background:'#14141b',padding:'24px',borderRadius:12,width:360}}>
        <h1 style={{margin:'0 0 12px'}}>Admin Login</h1>
        <form style={{display:'grid',gap:8}} onSubmit={onSubmit}>
          <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" type="email" style={{padding:10,borderRadius:8,border:'1px solid #2a2a33',background:'#0f0f14',color:'#eef2f7'}}/>
          <input value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" type="password" style={{padding:10,borderRadius:8,border:'1px solid #2a2a33',background:'#0f0f14',color:'#eef2f7'}}/>
          <button type="submit" style={{padding:10,borderRadius:8,border:'1px solid #2a2a33',background:'#2563eb',color:'#fff'}}>Login</button>
          {error && <div style={{color:'#ef4444'}}>{error}</div>}
        </form>
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
