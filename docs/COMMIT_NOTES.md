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
