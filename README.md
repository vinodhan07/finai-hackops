# FinAI - Your Smart Finance Partner 🚀

**FinAI** is an intelligent financial management platform designed to help users track expenses, manage budgets, and make smarter financial decisions using the power of AI. It features **FinPilot**, an AI assistant that analyzes spending habits and answers financial queries in natural language.

<p align="center">
  <img src="screenshots/login.png" alt="FinAI Login Page" width="800">
</p>

## 📋 Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Screenshots](#screenshots)
- [Contributing](#contributing)

## ✨ Features

* **🔐 Secure Authentication:** User sign-up and login functionality.
* **🤖 FinPilot (AI Assistant):** A built-in chatbot that can answer questions like "What did I spend on food last month?" or "Analyze my transportation expenses."
* **📊 Interactive Dashboard:** Visual overview of financial health with sidebar navigation.
* **💰 Budget Management:** Set and track monthly budgets across different categories.
* **🎯 Savings Goals:** Create and monitor progress toward specific financial targets.
* **📅 Bill Reminders:** Never miss a payment with automated alerts.
* **📱 QR Payment Integration:** Seamless payment options.

## 🛠️ Tech Stack

* **Frontend:** React.js, Tailwind CSS
* **Backend:** Node.js, Express.js
* **Database:** MongoDB
* **AI Engine:** Integration with LLMs (OpenAI/Gemini) for FinPilot
* **Authentication:** JWT (JSON Web Tokens)

## 📂 File Structure

```plaintext
finai-hackops/
├── client/                 # Frontend React Application
│   ├── public/
│   ├── src/
│   │   ├── assets/         # Logos and static images
│   │   ├── components/     # Reusable components
│   │   │   ├── Sidebar.js
│   │   │   ├── Navbar.js
│   │   │   └── Chatbot.js  # FinPilot Logic
│   │   ├── context/        # Auth and Finance Context
│   │   ├── pages/          # Page Views
│   │   │   ├── Dashboard.js
│   │   │   ├── Login.js
│   │   │   ├── Transactions.js
│   │   │   └── Profile.js
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
│
├── server/                 # Backend Node Application
│   ├── config/             # DB and Environment config
│   ├── controllers/        # Logic for API endpoints
│   ├── models/             # Mongoose Schemas (User, Expense)
│   ├── routes/             # API Routes (auth, chat, finance)
│   ├── server.js           # Server Entry Point
│   └── package.json
│
├── screenshots/            # Demo Images (MUST EXIST FOR README)
│   ├── login.png
│   └── dashboard.jpg
│
└── README.md
