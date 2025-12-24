That is great. Since you named the folder **`image`** (singular) and likely kept the original filenames, I have updated the paths in the README below to point exactly to that folder and those specific files.

Here is the updated **`README.md`** code. You can copy-paste this directly.

---

```markdown
# FinAI - Your Smart Finance Partner 🚀

**FinAI** is an intelligent financial management platform designed to help users track expenses, manage budgets, and make smarter financial decisions using the power of AI. It features **FinPilot**, an AI assistant that analyzes spending habits and answers financial queries in natural language.

<p align="center">
  <img src="./image/Screenshot%202025-12-24%20112142.png" alt="FinAI Login Page" width="800">
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

* **Frontend:** React.js / Next.js, Tailwind CSS
* **Backend:** Node.js, Express.js
* **Database:** MongoDB
* **AI Engine:** Integration with LLMs (OpenAI/Gemini) for FinPilot
* **Authentication:** JWT (JSON Web Tokens)

## 📂 File Structure

```plaintext
finai-hackops/
├── client/                 # Frontend Application
│   ├── public/
│   ├── src/
│   │   ├── assets/         
│   │   ├── components/     # Reusable components (Sidebar, Chatbot)
│   │   ├── context/        # State management
│   │   ├── pages/          # Dashboard, Login, Signup
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
│
├── server/                 # Backend Application
│   ├── config/             
│   ├── controllers/        
│   ├── models/             # Database Schemas
│   ├── routes/             
│   ├── server.js           
│   └── package.json
│
├── image/                  # Project Screenshots
│   ├── Screenshot 2025-12-24 112142.png   # Login Screen
│   └── Screenshot 2025-12-24 113659.jpg   # Dashboard Screen
│
└── README.md

```

## 📸 Screenshots

### 1. Secure Login

*A clean, secure entry point for managing your finances.*

### 2. Dashboard & FinPilot AI

*The central hub where users can view insights and chat with FinPilot for real-time financial advice.*

## 🚀 Getting Started

### Prerequisites

* Node.js (v14+)
* MongoDB

### Installation

1. **Clone the repository**
```bash
git clone [https://github.com/vinodhan07/finai-hackops.git](https://github.com/vinodhan07/finai-hackops.git)
cd finai-hackops

```


2. **Install Dependencies**
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install

```


3. **Run the App**
Create a `.env` file in the server directory with your `MONGO_URI` and API keys.
```bash
# Start Backend (from server folder)
npm start

# Start Frontend (from client folder)
npm start

```



## 🤝 Contributing

Contributions are welcome! Please fork the repository and create a pull request.

```

### ⚠️ Double Check
I used the path `./image/` because you said you added an "image folder".
* If you named the folder **`images`** (plural), please change the code above from `image` to `images`.
* If you named the folder **`screenshots`**, change `image` to `screenshots`.

This code assumes you kept the original filenames (`Screenshot 2025...`). If you renamed the files inside GitHub, update the filenames in the code to match.

```
