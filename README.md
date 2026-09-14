<div align="center">


  # TaxSense
  ### AI Tax Operating System for India

  <p align="center">
    <strong>Compare Regimes. Optimize Deductions. File With Confidence.</strong>
  </p>

  <p align="center">
    <a href="https://github.com/reshmanth-sai/TaxSense">
      <img src="https://img.shields.io/badge/GitHub-reshmanth--sai%2FTaxSense-181717?logo=github&logoColor=white" alt="GitHub Repository" />
    </a>
    <a href="https://react.dev">
      <img src="https://img.shields.io/badge/React-19.0-blue?logo=react&logoColor=white" alt="React 19" />
    </a>
    <a href="https://www.typescriptlang.org/">
      <img src="https://img.shields.io/badge/TypeScript-5.8-3178c6?logo=typescript&logoColor=white" alt="TypeScript 5.8" />
    </a>
    <a href="https://ai.google.dev/">
      <img src="https://img.shields.io/badge/Google_Gemini-v2-4285f4?logo=google&logoColor=white" alt="Google Gemini v2" />
    </a>
    <a href="https://opensource.org/licenses/MIT">
      <img src="https://img.shields.io/badge/License-MIT-green.svg" alt="License MIT" />
    </a>
  </p>

  <br />

</div>

<br />

---

## 📖 Table of Contents

- [🌐 Repository](#-repository)
- [🎯 The Problem](#-the-problem)
- [💡 Why TaxSense?](#-why-taxsense)
- [🖥️ Product Showcase](#️-product-showcase)
- [🔄 Product Workflow](#-product-workflow)
- [⭐ Feature Breakdown](#-feature-breakdown)
- [🤖 AI Capabilities](#-ai-capabilities)
- [📊 Product Comparison](#-product-comparison)
- [🎨 Design Philosophy](#-design-philosophy)
- [🛠️ Tech Stack](#️-tech-stack)
- [📂 Folder Structure](#-folder-structure)
- [🔐 Security & Privacy](#-security--privacy)
- [📈 Capabilities](#-capabilities)
- [⚡ Quick Start](#-quick-start)
- [🔑 Environment Variables](#-environment-variables)
- [🧮 Tax Engine & CBDT Rules](#-tax-engine--cbdt-rules)
- [🛣️ Roadmap](#️-roadmap)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)
- [🌟 The Vision](#-the-vision)

---

## 🌐 Repository

- 🔗 **GitHub Repository**: [https://github.com/reshmanth-sai/TaxSense](https://github.com/reshmanth-sai/TaxSense)

---

## 🎯 The Problem

Every year, millions of Indian salaried employees struggle to choose the right tax regime, miss eligible deductions under Section 80, and manually interpret confusing Form 16 salary certificates. 

Following recent Income Tax Department updates for **Assessment Year 2026-27 (Financial Year 2025-26)**, choosing between the Old and New Tax Regimes without exact rupee-for-rupee simulation causes taxpayers to lose **₹15,000 to ₹50,000+ annually** in overpaid taxes. Furthermore, manual data entry from salary slips into online filing portals often results in arithmetic typos, mismatched TDS, and scary defective return notices under Section 139(9).

**TaxSense** transforms this manual hassle into an intelligent, AI-guided workflow that extracts, verifies, optimizes, and prepares Income Tax Returns in seconds while keeping users completely informed and protected at every step.

---

## 💡 Why TaxSense?

Unlike traditional static tax calculators that simply compute numbers you type, **TaxSense acts as an AI assistant throughout your entire tax journey**:

- ✔ **Extracts Form 16 Automatically**: Ingests PDF, PNG, or JPG salary certificates via Gemini.
- ✔ **Verifies Income & TDS**: Automatically maps salary Section 17(1), standard deductions, and TDS lines.
- ✔ **Finds Missed Deductions**: Proactively audits 15+ Section 80 clauses (80C, 80D, NPS 80CCD, HRA, 80E).
- ✔ **Explains Recommendations**: Provides clear mathematical proofs and statutory Income Tax Act law citations.
- ✔ **Estimates Audit Readiness**: Checks identity, income, documents, deductions, TDS, and regime selection before export.
- ✔ **Generates Professional Summaries**: Exports ready-to-file PDF summaries and JSON archives.

---

## 🖥️ Product Showcase

> Screenshots coming soon. In the meantime, the sections below walk through what each part of the product actually does.

### 1. Command Center Dashboard
Real-time tax liability metrics, regime recommendations, filing deadline countdown, and active task progress.

### 2. Dual Regime Benchmark Engine
Instant side-by-side comparison between Old vs New Tax Regimes with live Section 87A rebate calculation.

### 3. AI Tax Copilot & Citation Engine
Conversational tax assistant grounded in Income Tax Department circulars and statutory laws.

### 4. Filing Readiness Checklist
Checks identity, income, uploaded documents, deductions, TDS, and regime selection before you export.

### 5. Document Vault
Local, in-browser storage for Form 16 documents, rent receipts, and Section 80 proofs — see [Security & Privacy](#-security--privacy) for what "local" means here.

---

## 🔄 Product Workflow

```
[ Upload Form 16 PDF ]
          │
          ▼
[ Gemini OCR & Field Extraction ]
          │
          ▼
[ Income & TDS Verification ]
          │
          ▼
[ Dual Regime Benchmark (Sec 115BAC) ]
          │
          ▼
[ Smart Deduction Optimization (Sec 80) ]
          │
          ▼
[ AI Audit & Compliance Check ]
          │
          ▼
[ Filing Readiness Checklist ]
          │
          ▼
[ Export PDF / JSON Package ]
```

---

## ⭐ Feature Breakdown

### 🤖 AI Intelligence
- **Form 16 Auto-OCR**: Uploaded Form 16 documents are sent to Google Gemini, which converts them into structured JSON profiles.
- **AI Tax Copilot**: Grounded conversational assistant powered by Google Gemini to answer tax queries with official CBDT law citations.
- **Deduction Discovery Engine**: Proactively scans salary structures to identify unclaimed HRA, 80D medical, and NPS allowances.
- **Filing Readiness Checklist**: Checks identity, income, documents, deductions, TDS, and regime selection before filing.

### 📊 Tax Optimization
- **Old vs New Regime Simulation**: Real-time side-by-side tax liability calculation under AY 2026-27 tax slabs.
- **Section 87A Rebate Calculator**: Automatically computes the ₹60,000 tax rebate for taxable income up to ₹12,00,000 under New Regime.
- **Capital Gains Module**: Supports STCG (20% u/s 111A) and LTCG (12.5% u/s 112A with ₹1.25L annual exemption).
- **Chapter VI-A Optimizer**: Interactive controls for 80C, 80D, 80CCD(1B), 80DD, 80E, and 80G deductions.

### 🔐 Privacy & Security
- **Local-First Architecture**: Your tax profile, deductions, and extracted Form 16 data live in your browser's `localStorage`, not on a central server.
- **No Account Required**: Use the app anonymously as a guest, with no sign-up.
- **Zero Permanent Retention**: Guest sessions can run in transient memory with no persistence, if you choose incognito mode.

### 📄 Productivity
- **Professional PDF Exporter**: Generates clean, ready-to-file ITR summary computation sheets.
- **JSON Profile Import/Export**: Backup and restore tax profiles seamlessly across devices.
- **Family Profile Switcher**: Switch between tax profiles for spouse, parents, or clients in a single workspace.

---

## 🤖 AI Capabilities

TaxSense leverages **Google Gemini v2** across the product pipeline:

- 📄 **Document Understanding**: Extracts key financial figures (`grossSalary`, `hraExemption`, `deduction80C`, `tdsPaid`) from Form 16 PDFs with varying layouts.
- 💡 **Deduction Optimization**: Analyzes allowance breakdowns to recommend optimal Section 80 claims.
- 💬 **Statutory Citation Engine**: Translates complex Income Tax Act sections into human-understandable guidance backed by official law citations.
- 🛡️ **Audit Risk Prediction**: Cross-checks salary numbers against reported TDS records to flag potential defective return risks.

---

## 📊 Product Comparison

| Capability | Traditional Tax Tools / Spreadsheets | TaxSense 2.0 |
| :--- | :---: | :---: |
| **Data Entry** | Manual Line-by-Line Typing | ⚡ **AI-Assisted Form 16 Extraction** |
| **Regime Selection** | Manual Guesswork | ⚖️ **Simultaneous Side-by-Side Benchmark** |
| **Deduction Discovery** | Static Checklist | 💡 **AI Unclaimed Deduction Audit** |
| **Data Storage** | Central Server Storage | 🔒 **Local Browser Storage** |
| **Tax Guidance** | Static FAQ Documentation | 💬 **Personalized AI Copilot with Law Citations** |
| **Compliance Check** | Post-Filing Notice Risk | 🛡️ **Pre-Filing Readiness Checklist** |
| **Interface Quality** | Legacy Form Grids | 🎨 **Volumetric Glass UI & Micro-Animations** |

---

## 🎨 Design Philosophy

TaxSense follows a calm, AI-first design language inspired by **Linear**, **Vercel**, and **Apple**:

- **Volumetric Glassmorphism**: Slate-950 canvas with frosted glass cards, soft glow borders, and hover spotlight sheens (`CardSpotlight`).
- **Progressive Disclosure**: Exposes complex tax knobs only when relevant, maintaining a clutter-free experience.
- **Hardware-Accelerated Motion**: Framer Motion spring physics (`stiffness: 250, damping: 28`) for butter-smooth 60 FPS transitions.
- **Monospaced Numerical Rhythm**: Uses JetBrains Mono / SF Mono for currency figures to prevent layout shifts.

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 19, TypeScript 5.8 |
| **Build Tool** | Vite 6.4 |
| **Styling** | Tailwind CSS 4.0 |
| **Animations** | Motion (Framer Motion v12) |
| **State Management** | Zustand 5.0 (with LocalStorage Hydration) |
| **AI Infrastructure** | Google Gemini API (`@google/genai` v2) |
| **Backend API** | Express.js 4.0 (Node.js) |
| **Database (Optional)** | Supabase Cloud DB |
| **PDF Engine** | `jsPDF`, `html2canvas` |

---

## 📂 Folder Structure

```
src/
 ├── components/
 │    ├── compliance/        # Filing Deadline & Compliance components
 │    ├── dashboard/         # Command Center & Readiness Scorecard
 │    ├── export/            # PDF Exporters
 │    ├── landing/           # Hero, Showcase & Section Cards
 │    │    └── helpers/      # CardSpotlight & Glass Card primitives
 │    ├── profile/           # Family Profile Switcher
 │    ├── security/          # Security Inspector Modal
 │    ├── sidebar/           # Responsive Navigation Sidebar
 │    └── vault/             # Document Vault components
 ├── lib/                    # Supabase client & API helpers
 ├── store/                  # Zustand global state persistence
 ├── types.ts                # TypeScript interfaces & tax schemas
 ├── utils/                  # CBDT calculation rules & audio pool
 ├── App.tsx                 # Core App Shell & View Router
 ├── index.css               # Tailwind 4 tokens & animations
 └── main.tsx                # Client Entrypoint
```

---

## 🔐 Security & Privacy

- **No central database**: There's no backend database in production. Your tax profile, deductions, and Document Vault files are stored in your browser's `localStorage`, not on a server. This isn't encrypted — anyone with access to your browser profile can read it, the same as any other site's local storage.
- **Form 16 processing**: Uploaded Form 16 files are sent to Google's Gemini API for OCR and field extraction (that's the one point where your document leaves your device), then the extracted fields are stored locally as described above.
- **Guest mode**: No account or sign-up is required. An "incognito" toggle keeps a guest session out of `localStorage` entirely, for the duration of that session.
- **No server-side rate limiting bypass**: The `/api/chat` and Form 16 extraction endpoints are IP-rate-limited to reduce abuse of the underlying Gemini API quota.

---

## 📈 Capabilities

| Metric | Value |
| :--- | :---: |
| **Supported Tax Sections** | **15+** |
| **Supported File Types** | **PDF, PNG, JPG** |

No formal OCR-accuracy or latency benchmarks have been run against this codebase yet — figures like that won't appear here until they're backed by an actual benchmark suite.

---

## ⚡ Quick Start

### Step 1: Clone the Repository
```bash
git clone https://github.com/reshmanth-sai/TaxSense.git
cd TaxSense
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Configure Environment Variables
```bash
cp .env.example .env
```
Add your Gemini API Key in `.env`:
```env
GEMINI_API_KEY="your-google-gemini-api-key"
VITE_SUPABASE_URL="https://your-supabase-project.supabase.co"
VITE_SUPABASE_ANON_KEY="your-supabase-anon-key"
PORT=3000
```

### Step 4: Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Step 5: Build for Production
```bash
npm run build
npm start
```

---

## 🔑 Environment Variables

| Variable | Required | Description |
| :--- | :---: | :--- |
| `GEMINI_API_KEY` | **Yes** | Google Gemini API Key from Google AI Studio |
| `VITE_GOOGLE_CLIENT_ID` | Optional | Google OAuth Client ID, required only if you want "Continue with Google" (guest mode works without it) |
| `VITE_SUPABASE_URL` | Optional | Supabase Endpoint URL — the app runs fully without Supabase configured; this is unused, dormant infrastructure for now |
| `VITE_SUPABASE_ANON_KEY` | Optional | Supabase Anonymous Client API Key (see above) |
| `PORT` | Optional | Express server port (Default: `3000`) |
| `APP_URL` | Optional | Application URL (Default: `http://localhost:3000`) |

---

## 🧮 Tax Engine & CBDT Rules (AY 2026-27 / FY 2025-26)

### 🆕 New Tax Regime (Section 115BAC)
- **Standard Deduction**: **₹75,000**
- **Section 87A Rebate**: Taxable Income up to **₹12,00,000** pays **₹0 Tax** (Max rebate ₹60,000).

| Net Taxable Income Slab | Tax Rate |
| :--- | :---: |
| Up to ₹4,00,000 | **0%** |
| ₹4,00,001 – ₹8,00,000 | **5%** |
| ₹8,00,001 – ₹12,00,000 | **10%** |
| ₹12,00,001 – ₹16,00,000 | **15%** |
| ₹16,00,001 – ₹20,00,000 | **20%** |
| ₹20,00,001 – ₹24,00,000 | **25%** |
| Above ₹24,00,000 | **30%** |

### 👵 Old Tax Regime
- **Standard Deduction**: **₹50,000**
- **Section 87A Rebate**: Taxable Income up to **₹5,00,000** pays **₹0 Tax** (Max rebate ₹12,500).

| Net Taxable Income Slab | Tax Rate |
| :--- | :---: |
| Up to ₹2,50,000 | **0%** |
| ₹2,50,001 – ₹5,00,000 | **5%** |
| ₹5,00,001 – ₹10,00,000 | **20%** |
| Above ₹10,00,000 | **30%** |

---

## 🛣️ Roadmap

### Completed
- [x] **AI Form 16 Ingestion**: PDF, PNG, JPG extraction via Gemini.
- [x] **Dual Regime Benchmark**: Simultaneous Old vs New Regime calculation.
- [x] **Grounded AI Copilot**: Tax guidance with statutory law citations.
- [x] **Filing Readiness Checklist**: Identity, income, documents, deductions, TDS, and regime checks.
- [x] **Document Vault**: Local, in-browser file storage.

### Planned
- [ ] **Direct AIS/TIS Sync**: Automated Income Tax Portal JSON import.
- [ ] **Form 26AS Matching**: Automated TDS reconciliation.
- [ ] **Cross-Platform Mobile App**: Native iOS & Android client.
- [ ] **Employer Tax Portal**: Bulk Form 16 generation & verification.

---

## 🤝 Contributing

Contributions are welcome! Follow these steps:

1. **Fork the Repository**: Click `Fork` on the top right.
2. **Create a Feature Branch**: `git checkout -b feature/amazing-feature`
3. **Commit your Changes**: `git commit -m "feat: add support for Sec 80GG"`
4. **Push to Branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**: Submit your PR for review!

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for details.

---

## 🌟 The Vision

> **TaxSense is evolving from an AI-powered tax calculator into a complete AI Tax Operating System for India—combining document intelligence, tax optimization, compliance guidance, and filing readiness into one unified platform.**

---

<div align="center">
  <sub>Made with ❤️ for Indian Taxpayers • <a href="https://github.com/reshmanth-sai/TaxSense">TaxSense Repository</a></sub>
</div>
