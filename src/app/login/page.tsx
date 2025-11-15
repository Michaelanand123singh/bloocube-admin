"use client";
import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { adminConfig } from '@/lib/api';
import Logo from "../../assets/Logo.png"
function LoginPageInner(){
  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');
  const [error,setError] = useState<string|null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
     setLoading(true); 
    try {
      const res = await fetch(`${adminConfig.apiUrl}/api/admin/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Include cookies in the request
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || data.error || 'Login failed');
      }
      if (data.data?.user?.role !== 'admin') {
        throw new Error('Access denied: not an admin');
      }
      // Tokens are now in HttpOnly cookies, so we don't need to store them in localStorage
      // Just store the user data
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
       setLoading(false); 
    }
  };

  const [loading, setLoading] = useState(false);

  return (
   <main className="min-h-[100dvh] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4 relative overflow-hidden">

  {/* Background decorative elements */}
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-violet-500/10 rounded-full blur-3xl"></div>
    <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl"></div>
  </div>

  <div className="w-full max-w-sm relative z-10 animate-fade-in">
    
    {/* Logo + Branding */}
    <div className="text-center mb-6">
      <img src={Logo.src} className="w-16 h-16 mx-auto mb-2" alt="Logo" />

      <h1 className="text-2xl font-bold text-white">
        Bloocube Admin
      </h1>

      <p className="text-slate-400 text-xs mt-1">
        Enterprise Management Portal
      </p>

      <div className="mt-2 inline-flex items-center gap-2 px-2.5 py-0.5 bg-slate-800/50 border border-slate-700/50 rounded-full">
        <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
        <span className="text-[11px] text-slate-400 font-medium">Secure Access</span>
      </div>
    </div>

    {/* Login Card */}
    <div className="card card-elevated p-6 animate-slide-up">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-white">Welcome back</h2>
        <p className="text-xs text-slate-400 -mt-0.5">Sign in to continue</p>
      </div>

      <form className="grid gap-4" onSubmit={onSubmit}>
        
        <div>
          <label className="block text-slate-300 text-xs font-medium mb-1.5">
            Email Address
          </label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@company.com"
            type="email"
            className="input py-2.5 text-sm"
            required
          />
        </div>

        <div>
          <label className="block text-slate-300 text-xs font-medium mb-1.5">
            Password
          </label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            type="password"
            className="input py-2.5 text-sm"
            required
          />
        </div>

        {error && (
          <div className="p-2.5 bg-red-500/10 border border-red-500/30 rounded-md animate-scale-in">
            <p className="text-red-400 text-xs font-medium">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary w-full py-2.5 text-sm font-semibold flex items-center justify-center gap-2 shadow-md shadow-violet-500/20 transition-all"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Processing...
            </>
          ) : (
            "Sign in to Admin"
          )}
        </button>

      </form>

      <div className="mt-5 pt-5 border-t border-slate-800/50">
        <a className="block text-center text-xs text-slate-400 hover:text-violet-400 transition-colors cursor-pointer">
          Forgot your password?
        </a>
      </div>
    </div>

    {/* Footer */}
    <div className="mt-6 text-center animate-fade-in" style={{ animationDelay: "150ms" }}>
      <p className="text-[16px] text-slate-500 font-medium mb-1">
        🔒 Authorized administrators only.
      </p>
      <p className="text-[12px] text-slate-600">
        © {new Date().getFullYear()} Bloocube. All rights reserved.
      </p>
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
