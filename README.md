# Cognifyz Full-Stack Web Development Internship 🚀

## Level 1: Beginner — Task 2: Inline Styles, Basic Interaction, and Server-Side Validation

This repository contains the complete implementation for **Level 1 - Task 2** of my Full-Stack Web Development Internship at **Cognifyz Technologies**. This project expands on basic server interactions by implementing a multi-field **User Registration Form**, dual-layer security validation, and an interactive **In-Memory Dashboard Database**.

---

## 📂 Project Architecture

The project strictly adheres to the file isolation requirements specified by the internship evaluation metrics:

```text
cognifyz-level1-task2/
├── middleware/
│   └── validateRegistration.js # Server-side structural validation (express-validator)
├── public/
│   └── js/
│       └── validation.js       # Client-side form interceptor & instant UI feedback
├── views/
│   └── register.ejs            # Dynamic EJS layout switching between Form & Dashboard
├── package.json                # Project details, dependencies, and start scripts
└── server.js                   # App core, route handlers, and in-memory runtime array
```

---

## ⚡ Key Technical Features Implemented

*   **In-Memory Local Storage Array**: Built a global state container (`const userDatabase = [];`) on the Express backend server to temporarily store valid user objects across multiple form submissions without requiring a database engine setup.
*   **Dynamic Dashboard Component**: Utilizes EJS rendering loops (`<% userDatabase.forEach() %>`) to continuously inject, build, and display the stored collection into a clean dashboard table in real time.
*   **Multi-Field Security Rules**: Evaluates standard and deep field data structures including Name, Email, Password parameters (enforcing a minimum 6-character rule), Role Selection dropdowns, and a Bio paragraph.
*   **Direct & Inline Variable Styling**: Integrates explicit inline layout variables directly inside elements to handle specific sizing constraints cleanly, combined with CSS variable design tokens for responsive flex containers.

---

## 🛠️ Step-by-Step Installation & Local Execution

To run and test this application locally:

1. **Clone this repository**:
   ```bash
   git clone https://github.com
   ```

2. **Navigate** into the project directory:
   ```bash
   cd cognifyz-level1-task2
   ```

3. **Install** all required node package modules:
   ```bash
   npm install
   ```

4. **Boot up** your Node.js engine server:
   ```bash
   npm start
   ```

5. **Interact** with the live app by loading this link in your web browser:
   `http://localhost:3000`

---

## 📦 Core Technical Stack Details

*   **Backend Runtime Env**: Node.js
*   **Framework Framework**: Express.js
*   **Template Engine**: EJS (Embedded JavaScript)
*   **Form Verification Engine**: express-validator

---

## 🧑‍💻 Creator Acknowledgement
*   **Developer**: angel sharon
*   **Role**: Full-Stack Web Development Intern
*   **Organization**: Cognifyz Technologies
