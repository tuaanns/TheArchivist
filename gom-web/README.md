# GOM Web - React Frontend

Frontend SPA cho hệ thống giám định gốm sứ GOM. React 19 + Vite + Tailwind CSS + Framer Motion.

## Tính năng

- **Authentication**: Email/Password, Google OAuth One-Tap, forgot/reset password
- **AI Analysis**: Upload ảnh gốm sứ → xem kết quả multi-agent debate
- **AI Chat**: Chat với chuyên gia AI về gốm sứ
- **History**: Xem lại lịch sử phân tích với chi tiết đầy đủ
- **Payment**: Mua token credits qua SePay QR
- **Ceramic Catalog**: Duyệt catalog dòng gốm sứ với 3D model viewer
- **Admin Dashboard**: Quản lý users, ceramics, payments, predictions, token history
- **Dark Mode**: Chuyển đổi theme sáng/tối
- **i18n**: Tiếng Việt và English
- **Animations**: Framer Motion + GSAP transitions
- **3D**: Three.js model viewer cho gốm sứ

## Tech Stack

| Package | Version | Vai trò |
|---|---|---|
| React | 19.2.5 | UI framework |
| Vite | 8.0.10 | Build tool |
| React Router | 7.14.2 | Hash-based routing |
| Tailwind CSS | 3.4.19 | Utility-first CSS |
| Framer Motion | 12.38.0 | Animations |
| GSAP | 3.15.0 | Advanced animations |
| Three.js | 0.184.0 | 3D rendering |
| i18next | 23.16.8 | Internationalization |
| Axios | 1.15.2 | HTTP client |
| Lucide React | 0.469.0 | Icons |

## Yêu cầu

- Node.js 18+ (khuyến nghị 20+)
- npm 9+

## Cài đặt

```bash
npm install
```

Nếu lỗi peer dependencies:
```bash
npm install --legacy-peer-deps
```

## Cấu hình

`.env.development`:
```env
VITE_API_BASE=http://127.0.0.1:8000/api
VITE_GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
```

`.env.production`:
```env
VITE_API_BASE=https://your-api-domain.com/api
VITE_GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
```

## Chạy

```bash
npm run dev       # Dev server tại http://localhost:3000
npm run build     # Build production → build/
npm run preview   # Preview production build
```

## Cấu trúc dự án

```
src/
├── components/
│   ├── ui/                # Button, Card, Input, Modal, Toast, Badge, Avatar...
│   ├── auth/              # NewAuthShell (login/register form)
│   ├── layout/            # AppLayout, AuthLayout, MainHeader, Footer, PageContainer
│   ├── motion/            # AnimatedEmptyState
│   └── 3d/                # ModelViewer (Three.js)
├── features/
│   ├── about/             # AboutPage, AboutCards
│   ├── admin/             # AdminLayout + pages (Dashboard, Users, Ceramics, Payments, Predictions, TokenHistory)
│   ├── analysis/          # AnalysisPage, HeroSection, UploadSection, ChatBox
│   ├── auth/              # Auth API client
│   ├── ceramics/          # CeramicsPage, CeramicDetailModal
│   ├── contact/           # ContactPage, ContactCards
│   ├── errors/            # NotFoundPage, UnauthorizedPage
│   ├── history/           # HistoryPage, HistoryDetailModal
│   ├── legal/             # TermsPage, PrivacyPage
│   ├── payment/           # PaymentPage, PackageCard, PaymentStepper
│   ├── profile/           # ProfilePage
│   └── transactions/      # TransactionsPage
├── hooks/
│   ├── useAuth.js         # Auth context (login, logout, user state)
│   ├── useNotify.jsx      # Global toast notification context (NotifyProvider + useNotify)
│   ├── useTheme.js        # Dark mode toggle
│   └── useView.js         # Viewport detection
├── i18n/
│   ├── index.js           # i18next configuration
│   └── locales/
│       ├── en.json        # English translations
│       └── vi.json        # Vietnamese translations
├── lib/
│   ├── apiClient.js       # Axios instance with auth interceptors
│   ├── constants.js       # App-wide constants
│   ├── storageApi.js      # Azure Blob Storage API client
│   └── utils.js           # Helpers (formatDate, formatVND, getErrorMessage, cn)
├── router/
│   ├── routes.jsx         # Route configuration
│   ├── ProtectedRoute.jsx # Auth guard
│   ├── GuestOnlyRoute.jsx # Guest-only guard
│   └── AdminRoute.jsx     # Admin role guard
├── App.jsx                # Root component (NotifyProvider → RouterProvider)
└── main.jsx               # Entry point

public/
├── banners/               # Background images
├── favicon/               # Favicon set
├── models/                # 3D GLB models + textures
├── placeholder-ceramic.svg
└── logo.png
```

## Design System

**Colors:**
```
navy:     #0F265C  (primary)
ceramic:  #C9D8E6  (accent)
ivory:    #F7F2E8  (background)
clay:     #8B3A3A  (secondary)

Dark mode:
dark-bg:      #0A0F1F
dark-surface: #111827
dark-text:    #F3F4F6
```

**Typography:** Playfair Display (headings), Be Vietnam Pro (body)

## Toast Notification System

Global singleton context pattern — `NotifyProvider` bọc toàn bộ app, mount `ToastContainer` một lần duy nhất:

```jsx
// Bất kỳ component nào cũng có thể gọi:
const { notify } = useNotify();
notify('Thành công!', 'success');
notify('Có lỗi xảy ra', 'error');
```

## i18n

Thêm ngôn ngữ: tạo `src/i18n/locales/{lang}.json`, copy từ `vi.json`, dịch, rồi update `src/i18n/index.js`.

```jsx
const { t } = useTranslation();
return <h1>{t('welcome')}</h1>;
```

## Troubleshooting

| Vấn đề | Giải pháp |
|---|---|
| Module not found | `rm -rf node_modules package-lock.json && npm install` |
| Port 3000 in use | Đổi port trong `vite.config.js` |
| CORS error | Kiểm tra `VITE_API_BASE` và backend CORS config |
| Google OAuth lỗi | Kiểm tra `VITE_GOOGLE_CLIENT_ID` và Authorized origins |
| Build fails | `rm -rf node_modules/.vite && npm run build` |

## Deployment

**Netlify:**
- Build command: `npm run build`
- Publish directory: `build`
- Environment variables: `VITE_API_BASE`, `VITE_GOOGLE_CLIENT_ID`

**Docker:**
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
RUN npm install -g serve
CMD ["serve", "-s", "build", "-p", "3000"]
EXPOSE 3000
```
