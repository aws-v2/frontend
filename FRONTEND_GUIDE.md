# Serwin Cloud: Frontend Implementation Guide

This document serves as the Technical Blueprint for the Serwin Cloud frontend architecture. It outlines the design system, modular structure, and routing strategy required to maintain a world-class infrastructure platform.

---

## 1. Design System & Branding (The "Serwin" Identity)

Serwin Cloud uses a **Unified Design Token System**. All styles must derive from global CSS variables to ensure consistency across the Public Landing Page, Auth flows, and the Console.

### 1.1 Core Design Tokens

Defined in `src/assets/styles/tokens.css`:

| Category     | Token             | Value     | Purpose                   |
| :----------- | :---------------- | :-------- | :------------------------ |
| **Brand**    | `--serwin-blue`   | `#2563eb` | Primary action color      |
| **Theme**    | `--bg-console`    | `#16191f` | AWS-style dark background |
| **Vertical** | `--color-compute` | `#06b6d4` | Compute (EC2) highlight   |
| **Vertical** | `--color-gaming`  | `#f43f5e` | Gaming highlight          |
| **Vertical** | `--color-ai`      | `#6366f1` | AI (Stargate) highlight   |
| **Vertical** | `--color-storage` | `#10b981` | Storage (S3) highlight    |

### 1.2 Tailwind Integration

Map tokens in `tailwind.config.js`:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        serwin: 'var(--serwin-blue)',
        compute: 'var(--color-compute)',
        gaming: 'var(--color-gaming)',
        ai: 'var(--color-ai)',
        storage: 'var(--color-storage)',
      },
      backdropBlur: {
        md: '12px',
      },
    },
  },
}
```

---

## 2. Information Architecture & Routing

We use a **Layout-Driven Routing Model** to separate user contexts.

### 2.1 Top-Level Layouts

1.  **PublicLayout**: Transparent gradients, glassmorphism, focus on conversion.
2.  **AuthLayout**: Minimalist, distraction-free for security operations.
3.  **ConsoleLayout**: Sidebar navigation, resource-dense dashboard views.

### 2.2 Route Configuration (`src/router/index.ts`)

```typescript
const routes = [
  {
    path: '/',
    component: () => import('@/shared/layouts/PublicLayout.vue'),
    children: [
      { path: '', component: LandingPage },
      { path: 'compute', component: () => import('@/modules/compute/pages/Landing.vue') },
      { path: 'storage', component: () => import('@/modules/storage/pages/Landing.vue') },
    ],
  },
  {
    path: '/console',
    component: () => import('@/shared/layouts/ConsoleLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: 's3/buckets', component: () => import('@/modules/s3/pages/BucketList.vue') },
      { path: 'lambda/functions', component: () => import('@/modules/lambda/pages/Functions.vue') },
    ],
  },
]
```

---

## 3. Modular Vertical Architecture

Every service (S3, EC2, GameLift, Stargate) is treated as an autonomous module.

### 3.1 Folder Structure

```text
src/modules/storage/
├── components/   # UI components unique to Storage
├── pages/        # Route-level views
├── store/        # Pinia/Vuex modules (e.g., S3 objects state)
├── services/     # API/SDK integration logic
└── routes.ts     # Local route definitions
```

### 3.2 Service Interaction

Use the **Singleton Pattern** for SDK clients (e.g., S3 client) within the `services/` directory to ensure connection consistency.

---

## 4. Interaction Standards

- **Lazy Loading**: Use `import()` for all route-level components.
- **Micro-Transitions**: Implement `<transition mode="out-in">` between layout switches.
- **Theme Guards**: If a user navigates to a `/gaming` sub-path, the global brand accent should dynamically transition via CSS variables.

---

_Compiled by the Senior Software Consultation Team | 2026_
