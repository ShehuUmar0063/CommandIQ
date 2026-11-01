# CommandIQ — Intelligent Enterprise Operations Platform

> **From business information to intelligent action.**

CommandIQ is an enterprise AI operations platform that transforms organizational documents, meeting minutes, and project updates into actionable insights, automated tasks, executive briefings, and verifiable decisions.

---

## 1. What CommandIQ Does

Enterprises generate vast volumes of unorganized records daily: meeting minutes, quarterly operating reviews, compliance mandates, and department updates. Employees lose hours manually parsing documents, extracting deliverables, and reconciling project statuses.

CommandIQ centralizes these operational activities through a unified AI-powered operations workspace:
- **Grounds AI in Real Data:** The assistant queries uploaded documents, active milestones, and company policies without fabricating facts or figures.
- **Workflow Automation:** Turns meeting minutes into tracked tasks with deadlines and responsible roles in one click.
- **Executive Reporting:** Compiles audit-ready management summaries and project progress reports with instantaneous PDF export.
- **Frictionless Access:** A modern enterprise interface with zero compulsory login or onboarding barriers.

---

## 2. Key Features

1. **Opening Page & Frictionless Entry:**
   - Enterprise-grade welcome experience.
   - Immediate access via "Enter CommandIQ" with zero registration hurdles.

2. **Operations Overview:**
   - Real-time KPIs: Total indexed documents, active tasks, monitored projects, and generated reports.
   - Project milestone progress meters with timeline deadlines.
   - Pending deliverables list with inline status completion.
   - AI Recommendations card grounded in live operational records.
   - One-click sample demonstration data toggle.

3. **AI Command Centre:**
   - Built on Google Gemini (`gemini-3.8-flash`) running securely on the backend.
   - Ingests full operational context: documents, deliverables, projects, and organizational policies.
   - Suggested prompts for fast executive inquiry.
   - Ability to convert recommendations directly into workspace tasks with one click.

4. **Document Intelligence:**
   - Supports DOCX, TXT, PDF, Markdown, and custom meeting notes.
   - Extracts readable text and parses key points, risks, and suggested deliverables.
   - Dedicated document viewer with tabs: Executive Summary, Key Points, Actionable Tasks, Risks & Recommendations, and Raw Content.
   - Direct "Extract Tasks" modal to review and batch-import into Task Management.

5. **Smart Task Management:**
   - Complete lifecycle tracking: `To Do`, `In Progress`, `Completed`, `Overdue`.
   - Priority assignments: `Low`, `Medium`, `High`, `Urgent`.
   - Cross-linking with specific projects and source documents.
   - AI Task Breakdown generator: takes high-level initiatives and decomposes them into executable subtasks.

6. **Project Monitoring:**
   - Track multi-department streams (Engineering, Operations, Compliance, IT).
   - Interactive milestone checklist and calculated completion rates.
   - "AI Health Audit" button: analyzes milestones and linked tasks to flag bottlenecks and recommended actions.

7. **AI Report Generator:**
   - Generate Weekly Activity Reports, Management Summaries, Project Reviews, and Task Performance Audits.
   - In-app editable preview.
   - **Download as PDF:** Uses client-side `jspdf` to export formatted, professional documents ready for stakeholders.

8. **Organisation Knowledge:**
   - Repository for internal guidelines, procurement protocols, change management freezes, and department leads.
   - Directly grounds the AI Assistant's reasoning.

9. **Settings & Data Management:**
   - Company profile configuration (Name, Tagline, Industry, Description).
   - Currency & Date format preferences.
   - Light and Dark operations room themes.
   - Full JSON Export and Import for workspace backup and migration.

---

## 3. Technologies Used

- **Frontend:** React 19, TypeScript, Tailwind CSS v4, Lucide Icons.
- **Backend:** Node.js, Express, Multer (file parsing), Mammoth (DOCX extraction).
- **AI Engine:** Google Gemini API (`@google/genai` TypeScript SDK, `gemini-3.8-flash`).
- **Reporting:** jsPDF for client-side formatted PDF generation.
- **Persistence:** Local browser storage for the MVP, architected for relational Cloud SQL or Firestore integration.

---

## 4. How to Install Dependencies

Make sure you have Node.js (version 20+ recommended) and npm installed:

```bash
npm install
```

---

## 5. How to Run Locally

Start the development server with tsx and Vite:

```bash
npm run dev
```

The application will be accessible at `http://localhost:3000`.

---

## 6. How to Configure the Gemini API Key

The application securely accesses the Gemini API from the Express backend via `process.env.GEMINI_API_KEY`.

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
2. Open `.env` and set your key:
   ```bash
   GEMINI_API_KEY="your_actual_gemini_api_key_here"
   ```
3. Restart the dev server (`npm run dev`).
4. In the application, navigate to **Settings** to see the green "Server-Side API Key Configured" badge.

*(Note: In Google AI Studio Build, the API key is automatically injected at runtime from your secrets panel).*

---

## 7. How to Build for Production

To create an optimized production build:

```bash
npm run build
```

This compiles client assets into `/dist`.

To run the production server:

```bash
NODE_ENV=production npm start
```

---

## 8. How to Deploy the Application

### Deploying to Cloud Run / Docker

A standard Node.js Docker container can serve this app:

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000
CMD ["npm", "start"]
```

### Deploying to Platforms (Render, Railway, Fly.io, Heroku)

1. Connect your GitHub repository.
2. Set Build Command: `npm run build`
3. Set Start Command: `npm start`
4. Add Environment Variable:
   - `GEMINI_API_KEY`: Your Google Gemini API Key.
5. Deploy!
