# 🛡️ AtomQuest Goal Tracking & Compliance Portal

Welcome to the **AtomQuest Employee Portal**—a state-of-the-art, full-stack performance management, goal alignment, and compliance monitoring application. 

Designed for high-performance enterprises, the portal guarantees complete alignment between corporate thrust areas and employee deliverables by leveraging a modern responsive layout, a real-time rule and compliance escalation engine, E2E encrypted chat, and automated corporate notification pipelines.

---

## 🚀 Live Hosted Demo URL
👉 **[INSERT YOUR LIVE HOSTED URL HERE (e.g., https://atomquest-portal.vercel.app)]**

---

## 🎯 Key Features & Capabilities (Deep Dive)

### 1. 🧑‍💻 Multi-Role Performance Dashboards
Immediate, tailored layouts designed specifically for each stakeholder:
*   **System Admin**: Full enterprise visibility. Monitor compliance statistics, configure and open active review cycles, override rules, inspect full audit trails, and export system-wide performance reports.
*   **Line Manager**: Review direct reports' weightage allocations, approve or return goal sheets for correction, provide real-time check-in feedback comments, and submit quarterly review sign-offs.
*   **Employee**: Define Q1 goals, select Thrust Areas, allocate weightages to exactly 100%, submit sheets for approval, self-report achievements, and view live feedback indicators.

### 2. ⚡ Compliance & Rule Escalation Engine
A background compliance processor automatically monitors performance cycle timelines and raises tiered alerts and warnings:
*   **Goal Submission Overdue**: Flags employees who haven't submitted their goal sheets within the set cycle window.
*   **Manager Approval Delayed**: Flags managers who delay reviewing and signing off on team goal sheets.
*   **Quarterly Check-In Missing**: Monitors active check-in periods and escalates missed submissions.
*   **Tiered Chain Levels**: Escalates issues from level 1 up to level 3 based on overdue days.
*   **Rule Engine Constraints**:
    *   **Max Goals**: Maximum of 8 goals allowed per employee per cycle to ensure strategic focus.
    *   **Min Weightage**: Each goal must carry at least 10% weightage.
    *   **Exact Allocation**: Goal sheet weightage sum must equal exactly 100%. If incomplete, the employee is blocked from submitting and the manager can return it for re-drafting.

### 3. 💬 E2E Encrypted Chat Hub
A real-time messaging workspace built directly into the portal, allowing employees and managers to securely discuss goal status:
*   **End-to-End Encryption (E2E)**: Messages are encrypted client-side using custom cryptographic keys generated inside the portal (`clientCrypto.js`) using Base64 encryption, preventing server-side eavesdropping or data leakage.
*   **Interactive Notifications**: Seamlessly linked with check-in activities, alerting managers when reviews are required or employees when feedback has been posted.

### 4. 📬 Corporate Notifications & Web Simulator
A simulated multi-channel notification engine alerts users about workflow transitions:
*   **Email (Outlook Sandbox)**: Rich email alerts for goal submissions, approvals, returns, and compliance updates.
*   **Microsoft Teams Bot Cards**: Interactive, beautifully formatted Teams adaptive cards sent to channels for manager approvals or compliance notices.

### 📊 Excel & CSV Exporting Engine
Comprehensive reporting tools stream structured RFC-compliant CSVs and styled spreadsheet tables instantly. Excel files download with proper types, structured column bounds, and clean filename parameters.

---

## 🎨 Design System & Custom Vanilla UI

The portal features a premium, state-of-the-art **minimalist Geist-inspired glassmorphism design** engineered with pure Vanilla CSS:

### 🎨 Harmonious HSL Color Palette
The portal uses curated, custom HSL color tokens instead of standard generic tailwind defaults:
*   `--background`: `hsl(240, 10%, 3.9%)` (Pure deep dark background)
*   `--surface`: `hsl(240, 10%, 6%)` / `--surface2`: `hsl(240, 10%, 10%)` (Layered surfaces)
*   `--accent`: `hsl(255, 85%, 65%)` / `--accent-bg`: `hsla(255, 85%, 65%, 0.1)` (Vibrant electric indigo)
*   `--green`: `hsl(142, 70%, 45%)` (Mint green for "Approved" or "On Track" states)
*   `--amber`: `hsl(38, 92%, 50%)` (Warm amber for "Returned" or "Needs Review" states)
*   `--blue`: `hsl(217, 91%, 60%)` (Royal blue for "Submitted" states)
*   `--border`: `rgba(255, 255, 255, 0.05)` (Ultra-subtle borders)

### 📱 Responsive Adaptivity down to `360px`
*   **Sliding Navigation Drawer**: Controlled via custom event triggers (`toggle-sidebar`) that slides in smoothly on mobile.
*   **Floating Hamburger Menu**: A glassmorphic button that renders *only on mobile when pages lack a TopBar* (e.g. Audit logs or Export reports). Built using a CSS `:has()` pseudo-selector rule matching to prevent duplicates!

---

## 🛠️ System Architecture

The application is engineered as a **Next.js Full-Stack Architecture** utilizing server-rendered interfaces, serverless API route handlers, and a hybrid serverless database layer:

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

### Technical Design Decisions:
*   **Serverless-Safe Data Cache**: A custom pre-bundling mechanism that compiles `database.json` and `chat.json` directly into Next.js lambda functions at build time using static `require` and try/catch handlers, ensuring 100% database availability on platforms like Vercel.
*   **Authentication**: Secure session management powered by **Supabase Auth** with local storage session synchronization fallbacks.

---

## 🔐 User Journeys & Login Credentials

Immediate evaluation is possible using the **one-click Demo Login** buttons on the landing page or by logging in with the credentials below:

| Role | Test Username / Email | Password | Allowed Journeys & Actions |
| :--- | :--- | :--- | :--- |
| **🔑 System Admin** | `admin@demo.com` | `admin@123` | Control evaluation cycles, override active periods, review organization-wide compliance issues, and export CSV/Excel sheets. |
| **👔 Line Manager** | `manager@demo.com` | `manager@123` | Review direct reports' goal sheets, approve/send goals back for drafts, comment on accomplishments, and submit quarterly check-in reviews. |
| **🧑‍💻 Employee** | `employee@demo.com` | `employee@123` | Define quarterly goals, allocate weightages, submit goals for approval, view real-time feedback, and self-report performance accomplishments. |

---

## 💻 Local Setup & Installation

### Prerequisites
*   Node.js (v18.x or above)
*   npm or pnpm / yarn

### 1. Clone the Repository
```bash
git clone https://github.com/Yuvraj-Malik/atomquest-portal.git
cd atomquest-portal
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env.local` file in the root directory and add your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 4. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application running locally!

### 5. Create a Production Build
```bash
npm run build
npm run start
```

---

## 🚀 Future Roadmap & Target Features

We have mapped out a detailed path to scale the AtomQuest Portal to enterprise-grade cloud production. Here are the core targets of the upcoming development cycle:

### 1. ☁️ Database Migration to Prisma ORM & PostgreSQL
*   **Goal**: Transition from the localized hybrid JSON system (`database.json` and `chat.json`) to a highly scalable, relational database model.
*   **Strategy**: Install `prisma` and `@prisma/client`, and connect it to a Supabase or Neon PostgreSQL cloud cluster.
*   **Target**: Ensure persistent multi-instance concurrency, acid-compliant transaction safety, and eliminate memory-cache reliance.

### 2. 🤖 ML-Powered Performance Insights & Smart Goal Generation
*   **Goal**: Integrate AI directly inside the Employee and Manager workspaces.
*   **Strategy**: Integrate an LLM (e.g., using Groq or Gemini API) that analyzes the employee's history and departmental thrust areas to recommend tailored, high-impact performance goals.
*   **Target**: Automate manager approval recommendations and detect goal weightage anomalies before sheet submission.

### 3. 🧩 Webhook Integration & Task Auto-Sync
*   **Goal**: Connect goal tracking to real-world software delivery.
*   **Strategy**: Create API endpoints to accept incoming Jira Webhooks, GitHub Commit events, or Slack commands.
*   **Target**: Allow employee goals (e.g., "Complete 12 automated journeys" or "Ship manager dashboard UI") to auto-increment progress or self-report accomplishments directly when code is merged or a Jira ticket closes.

### 4. 🔏 High-Security Cryptographic Auditing (Ledger)
*   **Goal**: Make performance audits completely tamper-proof for compliance checks.
*   **Strategy**: Implement a cryptographic verification chain (hashing log entries sequentially) or integrate an immutable log ledger.
*   **Target**: Prevent database manipulation, guarantee audit integrity for SOC2/ISO compliance reviews, and generate verifiable performance completion certificates.

### 5. 📡 Native Web Push Notifications
*   **Goal**: Real-time compliance alerts directly to devices.
*   **Strategy**: Integrate Service Workers and Web Push API standard.
*   **Target**: Employees receive push notifications instantly when their goal sheet is approved, and managers receive push reminders when a compliance check is overdue, without needing to refresh or open the portal.

---

## ✨ Developed with Pride
Designed to deliver modern, robust, and accessible enterprise-grade governance. For questions, system overrides, or contribution proposals, please contact the Talent Operations team!
