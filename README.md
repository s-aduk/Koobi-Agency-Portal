# Koobi Agency Portal

**The Premium Operational Intelligence Platform for Creative Agencies.**

Koobi is a streamlined, design-forward Client Portal SaaS designed to bridge the gap between creative teams and their high-value clients. It replaces fragmented communication with a single source of truth for project pipelines, financial transparency, and strategic growth.

![Koobi Agency Portal Hero](https://res.cloudinary.com/dnqbicyyh/image/upload/v1777495768/Koobi_screen_truym1.png)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react)
![Tailwind](https://img.shields.io/badge/Tailwind-CSS-38B2AC?logo=tailwind-css)
![AI](https://img.shields.io/badge/AI-Powered-0284C7?logo=google-gemini)

## ✨ Core Features

-   **Pulse Dashboard**: A real-time view of your agency's vital signs (Pipeline, Approvals, Invoices).
-   **Strategic AI (Koobi Intelligence)**: Built-in analysis using Google Gemini Pro to identify at-risk projects and growth opportunities.
-   **Client Dossiers**: Dedicated space for account management and relationship health tracking.
-   **Invoicing Ledger**: Transparent financial tracking for both agency owners and clients.
-   **Milestone Roadmap**: Visual progress tracking for complex creative deliverables.

## 🚀 Tech Stack

-   **Frontend**: React 18+ with Vite
-   **Design**: Tailwind CSS (Custom Design System)
-   **Animations**: Motion (formerly Framer Motion)
-   **Backend**: Node.js + Express (Vite Middleware Integration)
-   **Intelligence**: @google/genai (Gemini 1.5 Flash)
-   **Data Visualization**: Recharts (Customized for luxury UI)

## 🛠️ Local Development

1.  **Clone & Install**:
    ```bash
    npm install
    ```

2.  **Environment Setup**:
    Create a `.env` file in the root and add your Gemini API Key:
    ```env
    GEMINI_API_KEY=your_api_key_here
    ```

3.  **Run Development Server**:
    ```bash
    npm run dev
    ```

4.  **Production Build**:
    ```bash
    npm run build
    npm run start
    ```

## 📈 Roadmap (Production Scaling)

-   [ ] **Database Migration**: Transition from JSON-based storage to PostgreSQL (via Prisma) or MongoDB.
-   [ ] **Authentication**: Implement Clerk or NextAuth.js for secure client logins.
-   [ ] **File Management**: AWS S3 integration for creative asset approvals.
-   [ ] **Global State**: Transition to Zustand for more complex multi-client workflows.

---

Built for agencies that value **precision** and **design**.

## 👤 Credits

- **Author**: Stephen Adu Kwarteng
- **Agency**: Koobi Creative Hub
