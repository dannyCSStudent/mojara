# 🐟 Mojara Market

**Mojara Market** is a cross-platform marketplace application designed to connect producers, vendors, and buyers through a clean, intelligent, and scalable mobile experience.

Built with **long-term infrastructure in mind**, Mojara is not just an app — it is a **platform foundation** engineered to grow into a data-driven, intelligence-assisted marketplace.

---

## 🚀 Vision

Most marketplace apps fail because they:
- Accumulate UI inconsistency
- Become difficult to scale
- Mix business logic with presentation
- Collapse under new features

**Mojara Market is built differently.**

From day one, the project prioritizes:
- Semantic UI systems
- Predictable architecture
- Cross-platform parity
- Intelligence-ready design

This allows Mojara to evolve from a simple marketplace into a **smart market network**.

---

## 🧱 Architecture Overview

### Frontend
- **Expo / React Native**
- **TypeScript**
- **NativeWind (Tailwind for RN)**
- **Monorepo-safe component architecture**

### Backend (Planned / In Progress)
- **FastAPI**
- **Supabase (Postgres + Auth + Storage)**
- **API-first design**

Detailed architecture:
- [`docs/architecture.md`](docs/architecture.md)

---

## 🎨 Phase 2 — UI Infrastructure (✅ Completed)

Phase 2 establishes a **production-grade design system** that eliminates UI entropy and enforces consistency.

### Implemented Systems

#### 🧩 Screen Layout System
- Safe Area handling
- Consistent padding
- Optional scroll behavior
- Clean screen composition

#### 🧠 Typography System (`AppText`)
- Semantic variants (title, headline, body, caption, etc.)
- Centralized styling
- Dark mode support
- No raw `<Text>` usage in screens

#### 🎨 Color & Theme Tokens
- Semantic colors (`primary`, `surface`, `danger`, etc.)
- Dark / light mode support
- Brand-safe and rebrand-ready

#### 🔘 Button System (`AppButton`)
- Semantic intent (`primary`, `success`, `danger`, etc.)
- Loading and disabled handling
- Monorepo-safe TypeScript integration
- No UI logic inside screens

#### 🧭 Header System
- Optional, reusable screen headers
- Clean title + action slots

#### 📭 Empty & Loading States
- Standardized placeholders
- Clean UX for async states

This phase ensures the UI layer is **stable, scalable, and future-proof**.

---

## 🧠 Phase 3 — Intelligence Layer (🔜 Next)

Phase 3 introduces **application intelligence**.

Planned capabilities include:
- Global app state management
- Auth-aware layouts
- API data orchestration
- Search, filtering, and sorting
- Market signals & analytics
- Trust and reputation indicators

This is where Mojara evolves from an interface into a **smart system**.

---

## 🗺️ Roadmap (High Level)

| Phase | Focus | Status |
|------|------|------|
| Phase 1 | Project scaffolding & foundations | ✅ |
| Phase 2 | UI infrastructure & design systems | ✅ |
| Phase 3 | App intelligence & data layer | 🔜 |
| Phase 4 | Marketplace logic & transactions | 🔜 |
| Phase 5 | Optimization, insights, and scale | 🔜 |

---

## 🧪 Development Principles

- **Semantic over stylistic**
- **Infrastructure before features**
- **One source of truth**
- **No silent technical debt**
- **Design systems > one-off components**

---

## 📦 Monorepo Structure (Simplified)

- mojara/
- ├─ apps/
- │ ├─ frontend-mobile/
- │ └─ backend-fastapi/
- ├─ packages/
- │ └─ ui/
- └─ README.md


---

## 🛠️ Getting Started (Frontend)

```bash
cd apps/frontend-mobile
npm install
npx expo start
```

## Environment

Frontend Expo config now reads runtime values from `EXPO_PUBLIC_*` env vars via [apps/frontend-mobile/app.config.js](/home/dee/Documents/repos/mojara/apps/frontend-mobile/app.config.js).

Example frontend env:

```bash
EXPO_PUBLIC_API_URL=http://localhost:8000
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Backend settings are centralized in [apps/backend-fastapi/app/config.py](/home/dee/Documents/repos/mojara/apps/backend-fastapi/app/config.py).

Example backend env:

```bash
APP_ENV=development
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
CORS_ALLOW_ORIGINS=http://localhost:19006,http://localhost:3000
```

## Validation

Local validation and CI use the same commands:

```bash
pnpm lint
pnpm check-types
pnpm test
pnpm --filter backend-fastapi permissions:check
pnpm --filter backend-fastapi schema:check
```

GitHub Actions runs these commands on pushes to `main` and on pull requests via [.github/workflows/ci.yml](/home/dee/Documents/repos/mojara/.github/workflows/ci.yml).

## 🧠 Long-Term Potential

- Mojara Market is designed to support:

- Multi-market expansion

- Intelligent pricing signals

- Trust and reputation scoring

- AI-assisted recommendations

- Vendor analytics

- Decentralized market insights

- This repository represents the foundation of that system.

## 📜 License

- Private / Proprietary (subject to change)

## ✊ Closing Note

- Mojara Market is being built deliberately.

- Every layer is designed to scale.
- Every abstraction has purpose.
- Every decision is future-facing.

- This is not a prototype.
- This is infrastructure.
