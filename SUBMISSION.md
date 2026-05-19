# AtomQuest Employee Portal - Project Submission

This document contains the submission details, system architecture, and credentials for the AtomQuest Goal Tracking & Compliance Portal.

---

## 1. Live Hosted Demo URL
👉 **[INSERT YOUR LIVE HOSTED URL HERE (e.g., https://atomquest-portal.vercel.app)]**

---

## 2. Source Code Repository
👉 **[INSERT YOUR GITHUB URL HERE (e.g., https://github.com/Yuvraj-Malik/atomquest-portal)]**

---

## 3. System Architecture Diagram
The portal is designed as a **Full-Stack Next.js Architecture** combining server-rendered frontends, serverless Node.js REST API route handlers, and a fast localized filesystem JSON database cache.

### Architectural Flow (Mermaid Diagram)
```mermaid
graph TD
    subgraph Client Layer (React / UI)
        UI[Geist Minimalist UI]
        Emp[Employee Dashboard] --> UI
        Mgr[Manager Dashboard] --> UI
        Adm[Admin Dashboard] --> UI
        Sim[Integration & Compliance Simulator] --> UI
    end

    subgraph API Route Handlers (Next.js Serverless)
        Router{Next.js API Gateway}
        UI -- HTTP Requests --> Router
        Router --> |/api/goals| GoalsAPI[Goals Handler]
        Router --> |/api/checkins| CheckinAPI[Check-in Handler]
        Router --> |/api/escalations| EscalationAPI[Escalations Handler]
        Router --> |/api/reports/export| ExportAPI[Reports Export Handler]
    end

    subgraph Database Layer
        Cache[(In-Memory DB Cache)]
        FileDB[database.json File Storage]
        
        GoalsAPI & CheckinAPI & EscalationAPI & ExportAPI <--> Cache
        Cache <--> |Read / Write Sync| FileDB
    end

    subgraph External Services
        Supabase[Supabase Authentication]
        UI <--> |Session Identity| Supabase
    end

    style UI fill:#111,stroke:#333,stroke-width:2px,color:#fff
    style Cache fill:#1e3a8a,stroke:#3b82f6,stroke-width:2px,color:#fff
    style FileDB fill:#065f46,stroke:#10b981,stroke-width:2px,color:#fff
```

### Architectural Pillars:
1. **Frontend**: Next.js Client Components styled with minimalist Geist-themed vanilla CSS and custom media query grids for responsive layout adaptivity down to `360px` screens.
2. **Backend**: Fully decoupled Next.js API route handlers (/api) serving JSON payloads. Reports exports automatically generate and stream raw RFC 4180 CSV strings and styled spreadsheet tables with correct filename headers.
3. **Database Layer**: A custom filesystem-cached JSON store (`database.json`) optimized with in-memory caching to guarantee zero latency and complete state synchronization.
4. **Mobile Navigation**: Glassmorphic sliding nav drawer controlled by a unified custom event dispatcher and a smart floating hamburger toggle button leveraging a CSS `:has()` pseudo-selector rule to avoid duplicates.

---

## 4. User Journeys & Login Credentials
To make evaluation as fast as possible, you can switch between roles immediately using either **one-click Demo Login buttons** on the landing page, or typing these credentials:

| Role | Test Username / Email | Password | Allowed Journeys & Actions |
| :--- | :--- | :--- | :--- |
| **🔑 System Admin** | `admin@demo.com` | `admin@123` | Control evaluation cycles, override active periods, review organization-wide escalations, audit historical activity logs, and export raw CSV/Excel sheets. |
| **👔 Line Manager** | `manager@demo.com` | `manager@123` | Review direct reports' goal sheets, approve/send goals back for draft reviews, comment on employee accomplishments, and submit quarterly check-in reviews. |
| **🧑‍💻 Employee** | `employee@demo.com` | `employee@123` | Define quarterly goals, allocate weightages, submit goals for approval, view real-time feedback, and self-report performance accomplishments. |
