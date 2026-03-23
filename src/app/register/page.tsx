"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Eye,
  EyeOff,
  UserPlus,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { useAuth, AuthUser } from "@/lib/hooks/useAuth";

export default function RegisterPage() {
  const router = useRouter();
  const { register, user, isLoading: authLoading } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<AuthUser["role"]>("viewer");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (user) router.replace("/");
  }, [user, router]);

  // Password strength
  const strength = (() => {
    if (!password) return 0;
    let s = 0;
    if (password.length >= 8) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s;
  })();
  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][strength];
  const strengthColor = ["", "#ef4444", "#f59e0b", "#3b82f6", "#10b981"][
    strength
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setError("");
    setLoading(true);
    const result = await register(name, email, password, role);
    if (result.success) {
      router.replace("/");
    } else {
      setError(result.error ?? "Registration failed");
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
          <div className="logo-text">
            <h1 className="logo-name">ACME</h1>
            <p className="logo-sub">HR Dashboard</p>
          </div>
        </div>

        <div className="card-body">
          <div className="header-text">
            <h2>Create an account</h2>
            <p className="subtitle">
              Fill in your details to join the workspace
            </p>
          </div>

          <form onSubmit={handleSubmit} className="form">
            {error && (
              <div className="error-banner">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <div className="field">
              <label>Full Name</label>
              <input
                type="text"
                placeholder="e.g. Nguyen Van A"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="field">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="you@acme.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                disabled={loading}
              />
            </div>

            <div className="field">
              <label>System Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as AuthUser["role"])}
                disabled={loading}
              >
                <option value="viewer">Viewer — Read only access</option>
                <option value="manager">
                  Manager — Full department access
                </option>
                <option value="admin">Admin — System administrator</option>
              </select>
            </div>

            <div className="field">
              <label>Password</label>
              <div style={{ position: "relative", width: "100%" }}>
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="Min. 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  disabled={loading}
                  style={{ paddingRight: "44px" }}
                />
                <button
                  type="button"
                  className="eye-btn"
                  onClick={() => setShowPass((v) => !v)}
                  tabIndex={-1}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "transparent",
                    border: "none",
                    padding: "4px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 2,
                    borderRadius: "6px",
                  }}
                >
                  {showPass ? (
                    <EyeOff size={16} color="#94a3b8" />
                  ) : (
                    <Eye size={16} color="#94a3b8" />
                  )}
                </button>
              </div>
              {password && (
                <div className="strength-row">
                  <div className="strength-track">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="strength-seg"
                        style={{
                          background:
                            i <= strength
                              ? strengthColor
                              : "var(--border, #e5e7eb)",
                          opacity: i <= strength ? 1 : 0.6,
                        }}
                      />
                    ))}
                  </div>
                  <span
                    style={{
                      color: strengthColor,
                      fontSize: 11,
                      fontWeight: 600,
                    }}
                  >
                    {strengthLabel}
                  </span>
                </div>
              )}
            </div>

            <div className="field">
              <label>Confirm Password</label>
              <div style={{ position: "relative", width: "100%" }}>
                <input
                  type={showConfirm ? "text" : "password"}
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  disabled={loading}
                  style={{ paddingRight: "72px" }}
                />
                <button
                  type="button"
                  className="eye-btn"
                  onClick={() => setShowConfirm((v) => !v)}
                  tabIndex={-1}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "transparent",
                    border: "none",
                    padding: "4px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 2,
                    borderRadius: "6px",
                  }}
                >
                  {showConfirm ? (
                    <EyeOff size={16} color="#94a3b8" />
                  ) : (
                    <Eye size={16} color="#94a3b8" />
                  )}
                </button>
                {confirmPassword && password === confirmPassword && (
                  <CheckCircle2
                    size={16}
                    style={{
                      position: "absolute",
                      right: "40px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#10b981",
                      pointerEvents: "none",
                      zIndex: 2,
                    }}
                  />
                )}
              </div>
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 size={16} className="spin" /> Creating account...
                </>
              ) : (
                <>
                  <UserPlus size={16} /> Create Account
                </>
              )}
            </button>
          </form>

          <p className="footer-link">
            Already have an account? <Link href="/login">Sign in here</Link>
          </p>
        </div>
      </div>

      <style jsx>{`
        .page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg, #f8fafc);
          padding: 24px;
          position: relative;
          overflow: hidden;
          font-family: var(--font-body, system-ui, sans-serif);
        }
        .bg-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(var(--border, #e2e8f0) 1px, transparent 1px),
            linear-gradient(90deg, var(--border, #e2e8f0) 1px, transparent 1px);
          background-size: 40px 40px;
          opacity: 0.5;
          pointer-events: none;
        }
        .card {
          width: 100%;
          max-width: 440px;
          background: var(--card-bg, #ffffff);
          border: 1px solid var(--border, #e2e8f0);
          border-radius: 20px;
          box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.05);
          overflow: hidden;
          position: relative;
          z-index: 1;
        }
        .logo-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          padding: 32px 28px 24px;
          background: linear-gradient(
            135deg,
            rgba(30, 64, 175, 0.03),
            rgba(59, 130, 246, 0.08)
          );
          border-bottom: 1px solid var(--border, #e2e8f0);
        }
        .logo-mark {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #1e40af, #3b82f6);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-display, inherit);
          font-size: 24px;
          font-weight: 700;
          color: white;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }
        .logo-text {
          text-align: center;
        }
        .logo-name {
          font-family: var(--font-display, inherit);
          font-size: 20px;
          font-weight: 800;
          color: var(--text-primary, #0f172a);
          margin: 0;
          line-height: 1.2;
          letter-spacing: -0.5px;
        }
        .logo-sub {
          font-size: 12px;
          font-weight: 500;
          color: var(--accent, #3b82f6);
          margin: 2px 0 0;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .card-body {
          padding: 32px;
        }
        .header-text {
          text-align: center;
          margin-bottom: 24px;
        }
        h2 {
          font-family: var(--font-display, inherit);
          font-size: 22px;
          font-weight: 700;
          color: var(--text-primary, #0f172a);
          margin: 0 0 6px;
        }
        .subtitle {
          font-size: 14px;
          color: var(--text-muted, #64748b);
          margin: 0;
        }

        .form {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }
        .error-banner {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 10px;
          padding: 12px 16px;
          font-size: 13px;
          font-weight: 500;
          color: #b91c1c;
        }

        .field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        label {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-secondary, #334155);
        }
        input,
        select {
          width: 100%;
          padding: 12px 14px;
          background: var(--input-bg, #f8fafc);
          border: 1px solid var(--border, #cbd5e1);
          border-radius: 10px;
          font-size: 14px;
          color: var(--text-primary, #0f172a);
          font-family: inherit;
          outline: none;
          transition: all 0.2s ease;
        }
        input:focus,
        select:focus {
          background: #ffffff;
          border-color: var(--accent, #3b82f6);
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15);
        }
        input::placeholder {
          color: var(--text-muted, #94a3b8);
        }
        input:disabled,
        select:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          background: #f1f5f9;
        }

        select {
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 14px center;
          padding-right: 36px;
          cursor: pointer;
        }

        /* Giữ lại hiệu ứng hover cho icon mắt */
        .eye-btn {
          transition: all 0.2s ease;
        }
        .eye-btn:hover {
          background: #e2e8f0 !important;
        }
        .eye-btn:hover :global(svg) {
          stroke: #0f172a !important;
        }

        .strength-row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 8px;
          padding: 0 2px;
        }
        .strength-track {
          display: flex;
          gap: 4px;
          flex: 1;
        }
        .strength-seg {
          height: 5px;
          flex: 1;
          border-radius: 6px;
          transition:
            background 0.3s ease,
            opacity 0.3s ease;
        }

        .submit-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: var(--accent, #3b82f6);
          color: white;
          border: none;
          border-radius: 10px;
          padding: 14px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          font-family: inherit;
          transition: all 0.2s ease;
          margin-top: 8px;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
        }
        .submit-btn:hover:not(:disabled) {
          background: var(--accent-hover, #2563eb);
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(59, 130, 246, 0.35);
        }
        .submit-btn:active:not(:disabled) {
          transform: translateY(0);
        }
        .submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          box-shadow: none;
          transform: none;
        }

        .spin {
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .footer-link {
          font-size: 14px;
          color: var(--text-muted, #64748b);
          text-align: center;
          margin-top: 24px;
        }
        .footer-link :global(a) {
          color: var(--accent, #3b82f6);
          font-weight: 600;
          text-decoration: none;
          transition: color 0.2s;
        }
        .footer-link :global(a:hover) {
          color: var(--accent-hover, #2563eb);
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}
