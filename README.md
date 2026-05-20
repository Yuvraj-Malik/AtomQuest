# 🛡️ AtomQuest Goal Tracking & Compliance Portal

Welcome to the **AtomQuest Employee Portal**—a state-of-the-art, full-stack performance management, goal alignment, and compliance monitoring application. 

Designed for high-performance enterprises, the portal guarantees complete alignment between corporate thrust areas and employee deliverables by leveraging a modern responsive layout, a real-time rule and escalation engine, E2E encrypted chat, and automated corporate notification pipelines.

---

## 🚀 Live Hosted Demo URL
👉 **[INSERT YOUR LIVE HOSTED URL HERE (e.g., https://atomquest-portal.vercel.app)]**

---

## 🎯 Key Features & Capabilities

### 1. 🧑‍💻 Multi-Role Performance Dashboards
Immediate, tailored layouts designed specifically for each stakeholder:
*   **System Admin**: Full enterprise visibility. Monitor compliance, configure active review cycles, override rules, inspect audit logs, and export system-wide performance reports.
*   **Line Manager**: Review team weightage allocations, approve or return goals for corrections, provide real-time check-in feedback, and submit quarterly review sign-offs.
*   **Employee**: Define Q1 goals, align weightages to exactly 100%, submit sheets for approval, self-report achievements, and view live feedback indicators.

### 2. ⚡ Compliance & Rule Escalation Engine
A background compliance processor automatically monitors performance cycle timelines and raises tiered warnings:
*   **Goal Submission Overdue**: Flags employees who haven't submitted their goal sheets within the set cycle window.
*   **Manager Approval Delayed**: Flags managers who delay reviewing and signing off on team goal sheets.
*   **Quarterly Check-In Missing**: Monitors active check-in periods and escalates missed submissions.
*   **Tiered Chain Levels**: Escalates issues from level 1 up to level 3 based on overdue days.

### 3. 💬 Encrypted Chat Hub
A real-time messaging workspace built directly into the portal, allowing employees and managers to discuss goal status:
*   **End-to-End Encryption (E2E)**: Messages are encrypted client-side using robust cryptographic keys so that credentials and performance discussions remain secure.
*   **Interactive Notifications**: Instant alerts when new comments or reviews are posted.

### 4. 📥 Corporate Notifications & Integrations
Simulated multi-channel notification engine alerts users about workflow transitions:
*   **Email (Outlook Sandbox)**: Rich email alerts for goal submissions, approvals, returns, and compliance updates.
*   **Microsoft Teams Bot Cards**: Interactive, beautifully formatted Teams adaptive cards sent to channels for manager approvals or compliance notices.

### 5. 📊 Excel & CSV Exporting Engine
Comprehensive reporting tools stream structured RFC-compliant CSVs and styled spreadsheet tables instantly. Excel files download with proper types, structured column bounds, and clean filename parameters.

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
*   **Styling**: High-fidelity, custom-crafted HSL Hues and HSL Dark Theme variables using **Vanilla CSS** and CSS Nesting for zero bundler overhead and fluid responsiveness down to `360px` screens.
*   **Serverless-Safe Data Cache**: A custom pre-bundling mechanism that compiles `database.json` and `chat.json` directly into Next.js lambda functions at build time, ensuring 100% database availability on platforms like Vercel.
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

## ✨ Developed with Pride
Designed to deliver modern, robust, and accessible enterprise-grade governance. For questions or system overrides, please contact the Talent Operations team!
