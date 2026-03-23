# Sprint 2 — Changed Files Only

Chỉ copy 3 file này vào project Sprint 1 của bạn, giữ nguyên toàn bộ file khác.

## Files thay đổi

```
src/
├── components/
│   ├── layout/
│   │   └── Sidebar.tsx          ← Sidebar mới: drill-down + dept stats + animation
│   └── shared/
│       └── EmployeeTable.tsx    ← Table mới: stat cards + expand row + drawer + pagination
└── lib/
    └── data/
        └── mockData.ts          ← Thêm 4 nhân viên (009-012) + getDeptStats() helper
```

## Cách dùng

1. Giữ nguyên toàn bộ file từ Sprint 1
2. Copy đè 3 file này vào đúng đường dẫn tương ứng
3. Chạy lại: `npm run dev`

## Không cần cài thêm package nào
Tất cả dependencies đã có từ Sprint 1 (lucide-react, recharts, framer-motion).
