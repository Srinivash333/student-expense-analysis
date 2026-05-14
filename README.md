# 📊 Student Expense Analysis & Forecasting

A full-stack web application that helps students track, analyse, and forecast their personal finances. Upload messy CSV data or manually add transactions — the platform cleans the data, stores it in MongoDB, and runs a scikit-learn Machine Learning model to predict future expenses and classify spending behaviour.

---

## 🚀 Live Features

- 📁 **Bulk CSV Upload** — Upload raw, messy transaction data; the backend auto-cleans it.
- ✏️ **Manual Entry Form** — Add individual transactions through a clean tabbed UI.
- 🧹 **Data Cleaning Pipeline** — Normalises categories, removes outliers, fills missing fields, and calculates running balance.
- 📈 **Expense Forecasting** — Linear Regression model predicts next month's spending (in thousands ₹).
- 🧠 **Student Classification** — Decision Tree classifies each student as *Saver*, *Balanced*, or *Overspender*.
- 📊 **Financial Dashboard** — Bar charts, donut charts, and summary cards per student.
- 💡 **Recommendations** — Personalised financial tips based on spending archetype.

---

## 🗂️ Project Structure

```
Student_Expense_Analysis/
│
├── backend/                    # Node.js + Express REST API
│   ├── controllers/
│   │   ├── transactionController.js   # Upload, clean & store transactions
│   │   └── mlController.js            # Calls Python ML script
│   ├── models/
│   │   └── Transaction.js             # Mongoose schemas
│   ├── routes/
│   │   └── transactions.js            # API route definitions
│   └── server.js                      # Express entry point
│
├── frontend/                   # React + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/
│   │   │   └── Sidebar.jsx            # Navigation sidebar
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx          # Charts & summary cards
│   │   │   ├── UploadData.jsx         # CSV upload + manual entry form
│   │   │   ├── Predictions.jsx        # ML forecast page
│   │   │   └── Recommendations.jsx    # Financial tips page
│   │   ├── App.jsx                    # Routing setup
│   │   └── main.jsx                   # React entry point
│   └── index.html
│
├── data_science/               # Python ML & data generation
│   ├── generate_data.py               # Generates synthetic student CSV data
│   └── ml_models.py                   # Linear Regression + Decision Tree models
│
├── .gitignore
├── .gitattributes
└── README.md
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS v4, React Router, Axios, Recharts |
| **Backend** | Node.js 18, Express, Mongoose, Multer, csv-parser |
| **Database** | MongoDB (`student_finance_db`) |
| **Machine Learning** | Python 3.11+, pandas, numpy, scikit-learn, pymongo |
| **Version Control** | Git + GitHub |

---

## ⚙️ Setup & Installation

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) ≥ 18
- [Python](https://www.python.org/downloads/) ≥ 3.11
- [MongoDB Community Server](https://www.mongodb.com/try/download/community) (running locally on port `27017`)
- [Git](https://git-scm.com/)

---

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/Srinivash333/student-expense-analysis.git
cd student-expense-analysis
```

---

### 2️⃣ Backend Setup

```bash
cd backend
npm install
npm start
# API runs on http://localhost:5000
```

---

### 3️⃣ Frontend Setup

```bash
cd ../frontend
npm install
npm run dev
# UI runs on http://localhost:5173
```

---

### 4️⃣ Python / Data Science Setup

```bash
cd ../data_science
pip install pandas numpy scikit-learn pymongo
```

---

## 🗄️ Database

The app connects to a local MongoDB instance. No extra configuration is required for local development. The database name is:

```
student_finance_db
```

Two collections are created automatically:

| Collection | Purpose |
|---|---|
| `rawtransactions` | Raw uploaded CSV records |
| `cleantransactions` | Cleaned & normalised records used by ML |

---

## 📂 Generating Synthetic Data

Generate a realistic student finance dataset (≈ 8,000 rows) with monthly incomes in the ₹5,000 – ₹20,000 range:

```bash
cd data_science
python generate_data.py
```

This creates:
- `student_transactions.csv` — upload via the UI
- `student_transactions.json` — used directly by Python ML scripts

---

## 📤 Uploading Data

1. Open `http://localhost:5173` in the browser.
2. Go to **Upload Data**.
3. Choose **Bulk CSV Upload** or **Manual Entry**.
4. Click **Upload & Clean**.

The API returns a summary:

```json
{
  "message": "Upload and cleaning successful",
  "rawCount": 8182,
  "cleanedCount": 7479
}
```

---

## 🤖 Machine Learning Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/api/ml/predict/:studentId` | GET | Next-month expense forecast (Linear Regression) |
| `/api/ml/classify/:studentId` | GET | Spending archetype (Decision Tree) |

The backend calls the Python script via `child_process` and returns the JSON result to the frontend.

---

## 🔁 Git Workflow (for contributors)

```bash
# Stage your changes
git add .

# Commit
git commit -m "feat: describe your change"

# Push
git push
```

### First-time push to GitHub

```bash
git remote add origin https://github.com/Srinivash333/student-expense-analysis.git
git branch -M main
git push -u origin main
```

---

## 🐛 Known Issues / Troubleshooting

| Problem | Fix |
|---|---|
| "Student not found" on Predictions page | Upload data for that student first via Upload Data page |
| "Not enough data to predict" | Add at least 2 months of transactions for the student |
| Port conflict on 5173 | Vite will automatically switch to 5174; update API base URL if needed |
| Authentication failed on `git push` | Use a GitHub Personal Access Token (PAT) instead of your password |

---

## 📄 License

This project is licensed under the **MIT License**. You are free to use, modify, and distribute it.

---

## 👤 Author

**Srinivas**  
B.Tech Student | Data Science & Full-Stack Developer  
Built as an academic project to demonstrate end-to-end data engineering, REST API design, and ML integration.

---

> 💡 **Tip:** Run `python generate_data.py` first, then upload the CSV through the UI to instantly populate the dashboard with realistic student financial data!
