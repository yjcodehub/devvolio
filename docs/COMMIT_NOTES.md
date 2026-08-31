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

---

## 📌 Commit Summary — 2026-08-29 (Workspace Subdomain Linking, Collection Isolation & Admin UX Polish)

### 🌐 Dynamic Subdomain & Workspace Routing (`packages/frontend/src/components/admin`, `settings`)
- **Dynamic Local & Production Subdomains**: Updated [DomainSettingsTab.tsx](file:///c:/Learning/projects/devvolio/packages/frontend/src/components/admin/DomainSettingsTab.tsx) to dynamically resolve subdomains from the logged-in user's workspace slug (`http://${subdomain}.lvh.me:3000` and `https://${subdomain}.devvolio.in`), removing hardcoded `'yash'` fallbacks.
- **Settings Workspace Population**: Updated [settings.controller.ts](file:///c:/Learning/projects/devvolio/packages/backend/src/controllers/settings.controller.ts) to populate and return `workspace: { id, name, slug, status }` with settings payloads, and updated [settings/page.tsx](file:///c:/Learning/projects/devvolio/packages/frontend/src/app/admin/settings/page.tsx) to pass the user's workspace slug into the domain settings tab.
- **Custom Domain Status Lifecycle Clarity**: Added informative UI status explanation cards to [DomainSettingsTab.tsx](file:///c:/Learning/projects/devvolio/packages/frontend/src/components/admin/DomainSettingsTab.tsx) defining the exact scenarios for `pending` (awaiting DNS records/propagation), `active` (verified via CNAME/TXT query), and `failed` (verification lookup failed/mismatched).

### 🔒 Collection Isolation & Protected Reader Routes (`packages/backend/src/routes`, `controllers`)
- **Secured GET Readers**: Added `authenticate` middleware to reader endpoints across [skill.routes.ts](file:///c:/Learning/projects/devvolio/packages/backend/src/routes/skill.routes.ts), [project.routes.ts](file:///c:/Learning/projects/devvolio/packages/backend/src/routes/project.routes.ts), [experience.routes.ts](file:///c:/Learning/projects/devvolio/packages/backend/src/routes/experience.routes.ts), and [settings.routes.ts](file:///c:/Learning/projects/devvolio/packages/backend/src/routes/settings.routes.ts).
- **Strict Tenant Context Verification**: Updated [skill.controller.ts](file:///c:/Learning/projects/devvolio/packages/backend/src/controllers/skill.controller.ts), [project.controller.ts](file:///c:/Learning/projects/devvolio/packages/backend/src/controllers/project.controller.ts), and [experience.controller.ts](file:///c:/Learning/projects/devvolio/packages/backend/src/controllers/experience.controller.ts) so that:
  - `GET` requests strictly filter by `{ tenantId }` resolved from the user's workspace, returning `[]` if no tenant exists.
  - `CREATE` requests require a valid `tenantId` and reject unassociated requests with `400 Bad Request`.
  - `UPDATE` and `DELETE` requests strictly match `{ _id, tenantId }`, ensuring complete cross-workspace data isolation (e.g. Yash and Vidhi never see each other's projects, timeline entries, or skills).

### 👤 Admin Sidebar User Identity (`packages/frontend/src/app/admin/layout.tsx`)
- **User Identity Card**: Added a profile card in [layout.tsx](file:///c:/Learning/projects/devvolio/packages/frontend/src/app/admin/layout.tsx) above the "Term Session" button displaying the authenticated user's full name, email, and avatar badge.

### 🧹 Database Maintenance
- **Wiped Skills Collection**: Cleaned all residual documents from the `skills` collection in database `devvolio_dev` for a fresh start.

---

## 📌 Commit Summary — 2026-08-29 (Admin API Request Authorization & Generic Devvolio Terminal Defaults)

### 🔐 Authenticated Admin CRUD Queries (`packages/frontend/src/app/admin`)
- **Admin Fetch Authorization Headers**: Updated [skills/page.tsx](file:///c:/Learning/projects/devvolio/packages/frontend/src/app/admin/skills/page.tsx), [experience/page.tsx](file:///c:/Learning/projects/devvolio/packages/frontend/src/app/admin/experience/page.tsx), [projects/page.tsx](file:///c:/Learning/projects/devvolio/packages/frontend/src/app/admin/projects/page.tsx), [messages/page.tsx](file:///c:/Learning/projects/devvolio/packages/frontend/src/app/admin/messages/page.tsx), and [visibility/page.tsx](file:///c:/Learning/projects/devvolio/packages/frontend/src/app/admin/visibility/page.tsx) to supply `headers: getAuthHeaders()` and `credentials: 'include'` on all `GET`, `POST`, `PUT`, `PATCH`, and `DELETE` requests.
- **Immediate Data Refresh**: Resolved the issue where newly created or updated skills and experiences in a user's workspace were saved to the database but failed to fetch/render on the screen due to missing auth headers on the protected reader endpoints.

### 💻 Generic Devvolio Motion Terminal Defaults (`packages/frontend/src`, `packages/backend/src`)
- **Clean Default Terminal Sequence**: Replaced hardcoded personal developer information (`yash --role --skills`, `Software Engineer (Frontend) | 6+ Years`, `Immediate Joiner`, `Open to Pune...`) with clean Devvolio developer defaults:
  - `devvolio --role --skills` -> `> Software Engineer | Building modern web solutions`
  - `devvolio --status` -> `> Available for projects & engineering opportunities`
- **Dynamic Registration Portfolios**: Updated [auth.controller.ts](file:///c:/Learning/projects/devvolio/packages/backend/src/controllers/auth.controller.ts) during user signup to initialize `hero.terminalSequence` with the user's registered workspace slug (`${uniqueSlug} --role --skills`) so every new user (e.g. Vidhi) gets their own initial terminal sequence rather than falling back to personal text.
- **Updated Settings Placeholders & Seeder Config**: Updated [defaultData.ts](file:///c:/Learning/projects/devvolio/packages/backend/src/config/defaultData.ts), [Hero.tsx](file:///c:/Learning/projects/devvolio/packages/frontend/src/components/home/Hero.tsx), and [settings/page.tsx](file:///c:/Learning/projects/devvolio/packages/frontend/src/app/admin/settings/page.tsx) to match the standard Devvolio developer branding.

---

## 📌 Commit Summary — 2026-08-31 (Devvolio Form Placeholders & Generic Showcase Polish)

### 🗂️ Project Modal Form Placeholders (`packages/frontend/src/app/admin/projects/page.tsx`)
- **Devvolio Rebranding**: Replaced legacy and personal placeholder values in [projects/page.tsx](file:///c:/Learning/projects/devvolio/packages/frontend/src/app/admin/projects/page.tsx) modal popup:
  - Title: `FitPulse Pro` ➔ `Devvolio Platform`
  - Summary: `Mobile-first BMI tracking...` ➔ `Developer portfolio SaaS & multi-tenant workspace management platform...`
  - Case Study Outline: `# Case Study Outline...` ➔ `# Devvolio Case Study...`
  - Tech Stack: `Next.js, Tailwind CSS, Node.js` ➔ `React, Next.js, TypeScript, Node.js, Tailwind CSS`
  - URLs & Media: Cloudinary, GitHub repo (`https://github.com/devvolio/devvolio-core`), and Live URL (`https://devvolio.in`).

### ⏳ Experience & Timeline Modal Form Placeholders (`packages/frontend/src/app/admin/experience/page.tsx`)
- **Devvolio Rebranding**: Replaced company and work experience placeholders in [experience/page.tsx](file:///c:/Learning/projects/devvolio/packages/frontend/src/app/admin/experience/page.tsx) modal popup:
  - Role: `Software Engineer` ➔ `Senior Full Stack Engineer`
  - Company: `Relfor Labs Pvt Ltd` ➔ `Devvolio Technologies Inc.`
  - Location: `Pune, India` ➔ `Bengaluru, India (or Remote)`
  - Summary & Highlights: Replaced POS system billing highlights with multi-tenant developer workspace platform and high-throughput API bullet points.
  - Skills Used: `React, TypeScript, CSS` ➔ `TypeScript, React, Next.js, Node.js, Express, MongoDB, Tailwind CSS`.

### ⚙️ Settings & Home Expertise Polish (`packages/frontend/src`)
- **Settings Placeholders**: Updated [settings/page.tsx](file:///c:/Learning/projects/devvolio/packages/frontend/src/app/admin/settings/page.tsx) hero subtitle, hero title, tagline, bio, expertise, and contact email placeholders to modern Devvolio standards.
- **Home About Fallbacks**: Replaced legacy `defaultExpertises` entries in [About.tsx](file:///c:/Learning/projects/devvolio/packages/frontend/src/components/home/About.tsx) with clean, developer-centric specialties (Frontend Engineering, Backend Systems & APIs, Full Stack Solutions, Web Performance & DevOps).

---

## 📌 Commit Summary — 2026-08-31 (Security & Secret Sanitization)

### 🛡️ Backend Scripts Secret Sanitization (`packages/backend/src/scripts`)
- **Reset Admin Password Script**: Sanitized [resetAdminPassword.ts](file:///c:/Learning/projects/devvolio/packages/backend/src/scripts/resetAdminPassword.ts) by removing hardcoded password strings and reading `email` (`process.argv[2] || process.env.ADMIN_EMAIL`) and `password` (`process.argv[3] || process.env.ADMIN_RESET_PASSWORD || process.env.DEFAULT_ADMIN_PASSWORD`) dynamically from CLI arguments or environment variables.
- **Multi-Tenant Migration Script**: Sanitized [migrateToMultiTenant.ts](file:///c:/Learning/projects/devvolio/packages/backend/src/scripts/migrateToMultiTenant.ts) by removing the dummy bcrypt hash string and relying on standard password schema hooks with `process.env.DEFAULT_ADMIN_PASSWORD`.
- **GitGuardian & Push Protection Compliance**: Removed all potential high-entropy secret patterns from committed scripts to satisfy GitGuardian secret scanning and GitHub push protection.

