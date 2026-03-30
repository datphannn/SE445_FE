# Sprint 6 — Login/Register + ACEM → ACME

## Files thay đổi / thêm mới

```
src/
├── app/
│   ├── layout.tsx               ← Thêm AuthProvider wrap + đổi ACME title
│   ├── page.tsx                 ← Thêm AuthGuard (redirect /login nếu chưa đăng nhập)
│   ├── login/
│   │   └── page.tsx             ← MỚI: Trang đăng nhập
│   └── register/
│       └── page.tsx             ← MỚI: Trang đăng ký
├── lib/hooks/
│   ├── useAuth.tsx              ← MỚI: Auth context (login/register/logout)
│   └── useDashboard.tsx         ← Fix localStorage key: acem → acme
└── components/layout/
    ├── TopNav.tsx               ← ACME + user avatar + logout dropdown
    └── Sidebar.tsx              ← ACEM → ACME
```

## Demo accounts
- admin@acme.com / admin123
- hr@acme.com / hr123

## Cách dùng
Copy đè các file trên, npm run dev

## Improve: pnpm
