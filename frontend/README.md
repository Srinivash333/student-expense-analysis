# 🖥️ Student Expense Analysis — Frontend

This is the **React + Vite** frontend for the Student Expense Analysis & Forecasting platform.

---

## 🚀 Quick Start

```bash
npm install
npm run dev
# Opens at http://localhost:5173
```

> Make sure the backend server is running on `http://localhost:5000` first.

---

## 📁 Folder Structure

```
frontend/
├── src/
│   ├── components/
│   │   └── Sidebar.jsx          # Navigation sidebar
│   ├── pages/
│   │   ├── Dashboard.jsx        # Income/expense charts & summary cards
│   │   ├── UploadData.jsx       # CSV bulk upload + manual transaction form
│   │   ├── Predictions.jsx      # ML expense forecast page
│   │   └── Recommendations.jsx  # Personalised financial tips
│   ├── App.jsx                  # Route definitions
│   ├── main.jsx                 # React entry point
│   └── index.css                # Tailwind CSS global styles
├── index.html
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

---

## 🛠️ Tech Stack

| Tool | Purpose |
|---|---|
| **React 18** | UI framework |
| **Vite** | Build tool & dev server |
| **Tailwind CSS v4** | Utility-first styling |
| **React Router** | Client-side routing |
| **Axios** | HTTP requests to the backend API |
| **Recharts** | Charts on the Dashboard |
| **Lucide React** | Icons |

---

## 📄 Pages

| Route | Page | Description |
|---|---|---|
| `/dashboard` | Dashboard | Financial summary with charts per student |
| `/upload` | Upload Data | Bulk CSV upload or manual entry form |
| `/predictions` | Predictions | Next-month expense forecast via ML |
| `/recommendations` | Recommendations | Tips based on spending classification |

---

## 🔗 API Base URL

All API calls go to:

```
http://localhost:5000/api
```

Configure this in `vite.config.js` under the `proxy` key if needed.

---

## 📦 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Build production bundle |
| `npm run preview` | Preview production build locally |
