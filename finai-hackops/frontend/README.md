# FinAI Frontend

This is the frontend application for FinAI, an intelligent financial management platform.

## 🚀 Features
- **Dashboard**: High-level overview of balances, income, and expenses.
- **Transactions**: Detailed list and management of all financial movements.
- **AI Analysis**: Interactive chat and automated insights page.
- **Budgeting**: Visual indicators for category-wise limits.
- **Google Sign-In**: Integrated OAuth flow for quick authentication.

## 🛠️ Technology Stack
- **Vite** - Build tool
- **React** - UI Library
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Reusable component library
- **Radix UI** - Accessible primitives

## 💻 Development Setup

Follow these steps to get the frontend application up and running on your local machine:

### 1. Prerequisites
Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18.0.0 or higher)
- [npm](https://www.npmjs.com/) (usually comes with Node.js)

### 2. Installation
1. **Navigate to the frontend directory** (if you are not already there):
   ```bash
   cd frontend
   ```
2. **Install the required dependencies**:
   ```bash
   npm install
   ```
   *This will install all necessary packages including React, Tailwind CSS, and the Google OAuth library.*

### 3. Configuration (Google Auth)
To use the Google Sign-In feature, you'll need a Google Client ID:
1.  Open `src/main.tsx`.
2.  Locate the `GOOGLE_CLIENT_ID` constant.
3.  Replace the placeholder with your actual Client ID.

### 4. Running the Development Server
Start the Vite development server with hot-module replacement (HMR):
```bash
npm run dev
```
Once the server starts, you can access the application at:
- **Local**: [http://localhost:5173/](http://localhost:5173/)

### 5. Building for Production
To create an optimized production build:
```bash
npm run build
```
The output will be generated in the `dist/` directory, ready to be deployed.

## 🏗️ Structure
- `src/components`: Reusable UI components.
- `src/contexts`: Application-level state (Auth, Budget).
- `src/pages`: Individual view components.
- `src/services`: API client and data fetching logic.
- `src/hooks`: Custom React hooks.

For full project instructions, please refer to the [Root README](../README.md).
