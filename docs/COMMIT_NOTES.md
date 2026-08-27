# 🚀 Push Commit Notes

This document contains structured, point-wise commit and release notes for repository changes.

---

## 📌 Commit Summary — 2026-08-26

### 🔐 Auth & Onboarding (`packages/frontend/src/app/login`, `signup`)
- **Password Policy Relaxation**: Updated [SignupPage](file:///c:/Learning/projects/devvolio/packages/frontend/src/app/signup/page.tsx) and [auth.controller.ts](file:///c:/Learning/projects/devvolio/packages/backend/src/controllers/auth.controller.ts) to remove restrictions against user names and numeric sequences/repetitions (e.g. `123`, `987`, `999`, `222`).
- **Live Password Criteria & Hover Card**: Refined the hover information card next to Create Password in [SignupPage](file:///c:/Learning/projects/devvolio/packages/frontend/src/app/signup/page.tsx) to exclusively check for:
  1. Length (8 to 16 characters)
  2. Case (At least 1 uppercase `A-Z` and 1 lowercase `a-z`)
  3. Symbol & Digit (At least 1 digit `0-9` and 1 special symbol `!@#$%^&*...`)
- **UI & Content Polish**: Replaced dummy placeholder text across [LoginPage](file:///c:/Learning/projects/devvolio/packages/frontend/src/app/login/page.tsx) and [SignupPage](file:///c:/Learning/projects/devvolio/packages/frontend/src/app/signup/page.tsx) with clean Devvolio branding (`alex@example.com`, custom subdomains).
- **Subdomain Verification**: Added real-time subdomain availability status checks with automated slug generation from user names.

### 💼 Portfolio & Home Components (`packages/frontend/src/components/home`)
- **Dynamic Contact Form**: Updated [ContactForm.tsx](file:///c:/Learning/projects/devvolio/packages/frontend/src/components/home/ContactForm.tsx) to generate personalized placeholders based on `ownerName` and `ownerEmail` props.
- **Portfolio Showcase**: Integrated interactive portfolio sections (`Hero`, `About`, `ExperienceTimeline`, `ProjectsGrid`, `SkillsMarquee`, and `StatsDashboard`).

### 🌐 Multi-Tenancy & Middleware (`packages/frontend/src/middleware.ts`)
- **Subdomain Routing**: Configured hostname rewrite middleware for seamless multi-tenant developer portfolio rendering.
- **Admin Access**: Added session redirection for standard user dashboards and SuperAdmin management portals.

### 🛠️ Backend Services (`packages/backend/src`)
- **Workspace Provisioning**: Automated creation of workspaces, default portfolio templates, and subscription tiers upon registration.
- **Resume AI Parser**: Integrated resume upload parsing and dynamic data synchronization pipelines.

---

## 📌 Commit Summary — 2026-08-26 (Database Wipe & SuperAdmin Governance Update)

### 🗄️ Database & Schema (`packages/backend/src/scripts`, `packages/shared/src/schemas`)
- **Database Wipe**: Created and executed [clearDatabase.ts](file:///c:/Learning/projects/devvolio/packages/backend/src/scripts/clearDatabase.ts) to permanently drop all collections in `devvolio_dev` database.
- **Default Admin Seeding**: Updated [defaultData.ts](file:///c:/Learning/projects/devvolio/packages/backend/src/config/defaultData.ts) constant `defaultAdmin` to use email `yash@devvolio.in`, password `Devvolio123$`, and role `superAdmin`. Successfully re-seeded the database using [seed.ts](file:///c:/Learning/projects/devvolio/packages/backend/src/scripts/seed.ts).
- **Schema Role Union**: Updated [User.ts](file:///c:/Learning/projects/devvolio/packages/shared/src/schemas/User.ts) to include `'superAdmin'` in the `IUser` interface and Mongoose `UserSchema` enum.
- **Portfolio Default Email**: Updated [Portfolio.ts](file:///c:/Learning/projects/devvolio/packages/shared/src/schemas/Portfolio.ts) default contact email to `yash@devvolio.in`.

### 🔐 Auth & Role Security Governance (`packages/frontend/src`, `packages/backend/src`)
- **SuperAdmin Middleware**: Updated [superAdmin.middleware.ts](file:///c:/Learning/projects/devvolio/packages/backend/src/middleware/superAdmin.middleware.ts) to authorize both `'super_admin'` and `'superAdmin'`.
- **Removed Hardcoded Privileges**: Removed hardcoded SuperAdmin access for `lakshraj2121@gmail.com` across [AdminLayout](file:///c:/Learning/projects/devvolio/packages/frontend/src/app/admin/layout.tsx), [AdminRootRedirect](file:///c:/Learning/projects/devvolio/packages/frontend/src/app/admin/page.tsx), [LoginPage](file:///c:/Learning/projects/devvolio/packages/frontend/src/app/login/page.tsx), and [SuperAdminGuard](file:///c:/Learning/projects/devvolio/packages/frontend/src/components/admin/SuperAdminGuard.tsx). `lakshraj2121@gmail.com` is now a standard user (`role: 'user'`) who can manage their admin panel and portfolio site.
- **SuperAdmin Designation**: Designated `yash@devvolio.in` as the sole platform SuperAdmin.
- **Scripts & Services Cleanup**: Replaced all references to `lakshraj2121@gmail.com` with `yash@devvolio.in` in [migrateToMultiTenant.ts](file:///c:/Learning/projects/devvolio/packages/backend/src/scripts/migrateToMultiTenant.ts), [resetAdminPassword.ts](file:///c:/Learning/projects/devvolio/packages/backend/src/scripts/resetAdminPassword.ts), [email.service.ts](file:///c:/Learning/projects/devvolio/packages/backend/src/services/email.service.ts), and [openAi.service.ts](file:///c:/Learning/projects/devvolio/packages/backend/src/services/openAi.service.ts).

### 📚 Documentation & Placeholders (`README.md`, `docs/`)
- Updated [README.md](file:///c:/Learning/projects/devvolio/README.md), [API.md](file:///c:/Learning/projects/devvolio/docs/API.md), [CHECKLISTS.md](file:///c:/Learning/projects/devvolio/docs/CHECKLISTS.md), and [DATABASE.md](file:///c:/Learning/projects/devvolio/docs/DATABASE.md) to reflect `yash@devvolio.in` and `Devvolio123$`.
- Updated UI input placeholders and payment prefill emails in [settings/page.tsx](file:///c:/Learning/projects/devvolio/packages/frontend/src/app/admin/settings/page.tsx) and [billing/page.tsx](file:///c:/Learning/projects/devvolio/packages/frontend/src/app/admin/billing/page.tsx).

---

## 📌 Commit Summary — 2026-08-26 (SuperAdmin Portal Isolation & Dynamic Tenant Scoping)

### 🗄️ Database & Multi-Tenant Lifecycle (`packages/backend/src`)
- **SuperAdmin Clean State**: Updated [seed.ts](file:///c:/Learning/projects/devvolio/packages/backend/src/scripts/seed.ts) to exclusively seed the SuperAdmin `User` (`yash@devvolio.in`, `role: 'superAdmin'`, `workspaces: []`, `activeWorkspaceId: undefined`). Removed dummy default workspace, portfolio, and initial collections creation from seeder.
- **Auto-Seed Cleanup**: Modified [database.ts](file:///c:/Learning/projects/devvolio/packages/backend/src/config/database.ts) `seedDefaultsIfEmpty` to only seed the SuperAdmin account when `User` collection is empty, without polluting global Settings, Experiences, Projects, or Skills.
- **Registration Provisioning**: Verified [auth.controller.ts](file:///c:/Learning/projects/devvolio/packages/backend/src/controllers/auth.controller.ts) to ensure Workspaces, Portfolios, and Subscriptions are only instantiated upon user registration, properly linked with `user.workspaces` and `user.activeWorkspaceId`.

### 🛡️ Controller Tenant ID Scoping (`packages/backend/src/controllers`, `utils`)
- **Tenant Resolver Helper**: Implemented [tenantHelper.ts](file:///c:/Learning/projects/devvolio/packages/backend/src/utils/tenantHelper.ts) with `getTenantIdFromRequest(req)` to resolve active tenant from `req.tenant.id`, `x-tenant-id` header, or `req.user.userId` workspace ownership.
- **Scoped CRUD Endpoints**: Updated [settings.controller.ts](file:///c:/Learning/projects/devvolio/packages/backend/src/controllers/settings.controller.ts), [project.controller.ts](file:///c:/Learning/projects/devvolio/packages/backend/src/controllers/project.controller.ts), [experience.controller.ts](file:///c:/Learning/projects/devvolio/packages/backend/src/controllers/experience.controller.ts), [skill.controller.ts](file:///c:/Learning/projects/devvolio/packages/backend/src/controllers/skill.controller.ts), and [message.controller.ts](file:///c:/Learning/projects/devvolio/packages/backend/src/controllers/message.controller.ts) to scope queries, mutations, and creations strictly to `tenantId`.

### 🖥️ Frontend & SuperAdmin Routing (`packages/frontend/src`)
- **SuperAdmin Isolation**: Removed the "Tenant Admin View" link in [superadmin/layout.tsx](file:///c:/Learning/projects/devvolio/packages/frontend/src/app/superadmin/layout.tsx).
- **Admin Guard Redirection**: Updated [AdminGuard.tsx](file:///c:/Learning/projects/devvolio/packages/frontend/src/components/admin/AdminGuard.tsx) to automatically redirect SuperAdmin users visiting `/admin/*` directly to `/superadmin`.

