'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, LogIn, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';

export default function LoginPage() {
  const router = useRouter();
  const { login, user, isLoading: authLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (user) router.replace('/');
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError('Please fill in all fields'); return; }
    setError('');
    setLoading(true);
    const result = await login(email, password);
    if (result.success) {
      router.replace('/');
    } else {
      setError(result.error ?? 'Login failed');
      setLoading(false);
    }
  };

  if (!mounted || authLoading) return null;

  return (
    <div className="page">
      <div className="bg-grid" />

      <div className="card anim-scale-in">
        {/* Logo */}
        <div className="logo-wrap">
          <div className="logo-mark">A</div>
          <div>
            <p className="logo-name">ACME</p>
            <p className="logo-sub">HR Dashboard</p>
          </div>
        </div>

        <div className="card-body">
          <h1>Welcome back</h1>
          <p className="subtitle">Sign in to your account to continue</p>

          {/* Demo credentials hint */}
          <div className="hint-box">
            <p className="hint-title">Demo accounts</p>
            <p>admin@acme.com / admin123</p>
            <p>hr@acme.com / hr123</p>
          </div>

          <form onSubmit={handleSubmit} className="form">
            {error && (
              <div className="error-banner">
                <AlertCircle size={14} />
                {error}
              </div>
            )}

            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                placeholder="you@acme.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
                disabled={loading}
              />
            </div>

            <div className="field">
              <label htmlFor="password">Password</label>
              <div className="pass-wrap">
                <input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="current-password"
                  disabled={loading}
                />
                <button type="button" className="eye-btn" onClick={() => setShowPass(v => !v)} tabIndex={-1}>
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading
                ? <><Loader2 size={15} className="spin" /> Signing in...</>
                : <><LogIn size={15} /> Sign In</>
              }
            </button>
          </form>

          <p className="footer-link">
            Don&apos;t have an account?{' '}
            <Link href="/register">Create one</Link>
          </p>
        </div>
      </div>

      <style jsx>{`
        .page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg);
          padding: 20px;
          position: relative;
          overflow: hidden;
        }
        .bg-grid {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(var(--border) 1px, transparent 1px),
            linear-gradient(90deg, var(--border) 1px, transparent 1px);
          background-size: 40px 40px;
          opacity: 0.4;
          pointer-events: none;
        }
        .card {
          width: 100%; max-width: 420px;
          background: var(--card-bg);
          border: 1px solid var(--border);
          border-radius: 16px;
          box-shadow: var(--shadow-lg);
          overflow: hidden;
          position: relative; z-index: 1;
        }
        .logo-wrap {
          display: flex; align-items: center; gap: 12px;
          padding: 24px 28px 20px;
          border-bottom: 1px solid var(--border);
          background: linear-gradient(135deg, #1e40af08, #3b82f608);
        }
        .logo-mark {
          width: 40px; height: 40px;
          background: linear-gradient(135deg, #1e40af, #3b82f6);
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-family: var(--font-display); font-size: 20px; font-weight: 700; color: white;
          box-shadow: 0 2px 8px rgba(59,130,246,0.35);
        }
        .logo-name {
          font-family: var(--font-display); font-size: 18px; font-weight: 700;
          color: var(--text-primary); line-height: 1;
        }
        .logo-sub { font-size: 11px; color: var(--text-muted); margin-top: 2px; }
        .card-body { padding: 28px; }
        h1 {
          font-family: var(--font-display); font-size: 22px;
          color: var(--text-primary); margin: 0 0 4px;
        }
        .subtitle { font-size: 13px; color: var(--text-muted); margin: 0 0 20px; }
        .hint-box {
          background: var(--accent-subtle); border: 1px solid #bfdbfe;
          border-radius: 8px; padding: 10px 14px; margin-bottom: 20px;
          font-size: 11px; color: var(--text-muted); line-height: 1.8;
        }
        .hint-title { font-weight: 700; color: var(--accent); margin-bottom: 2px; font-size: 10px; text-transform: uppercase; letter-spacing: 0.06em; }
        .form { display: flex; flex-direction: column; gap: 16px; }
        .error-banner {
          display: flex; align-items: center; gap: 8px;
          background: var(--danger-subtle); border: 1px solid #fca5a5;
          border-radius: 8px; padding: 10px 14px;
          font-size: 12px; color: var(--danger);
        }
        .field { display: flex; flex-direction: column; gap: 6px; }
        label { font-size: 12px; font-weight: 600; color: var(--text-secondary); }
        input {
          width: 100%; padding: 10px 12px;
          background: var(--input-bg); border: 1px solid var(--border);
          border-radius: 8px; font-size: 13px; color: var(--text-primary);
          font-family: var(--font-body); outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-subtle); }
        input::placeholder { color: var(--text-muted); }
        input:disabled { opacity: 0.6; cursor: not-allowed; }
        .pass-wrap { position: relative; }
        .pass-wrap input { padding-right: 40px; }
        .eye-btn {
          position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer;
          color: var(--text-muted); display: flex; align-items: center;
          transition: color 0.13s;
        }
        .eye-btn:hover { color: var(--text-primary); }
        .submit-btn {
          display: flex; align-items: center; justify-content: center; gap: 8px;
          background: var(--accent); color: white; border: none; border-radius: 8px;
          padding: 11px; font-size: 13px; font-weight: 600;
          cursor: pointer; font-family: var(--font-body);
          transition: background 0.13s, transform 0.1s;
          margin-top: 4px;
        }
        .submit-btn:hover:not(:disabled) { background: var(--accent-hover); transform: translateY(-1px); }
        .submit-btn:active:not(:disabled) { transform: translateY(0); }
        .submit-btn:disabled { opacity: 0.65; cursor: not-allowed; }
        .spin { animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .footer-link { font-size: 12px; color: var(--text-muted); text-align: center; margin-top: 20px; }
        .footer-link :global(a) { color: var(--accent); font-weight: 600; text-decoration: none; }
        .footer-link :global(a:hover) { text-decoration: underline; }
      `}</style>
    </div>
  );
}
