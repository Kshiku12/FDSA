# 🚀 Placement Ready: Interactive DSA & SQL Prep Simulator

An immersive, fully-featured **Data Structures, Algorithms, and SQL Prep Application** built using **React, TypeScript, and Vite**. Designed to mimic modern coding sandboxes and simulated Online Tests (OTs), this project provides a unified hub for students and developers to practice coding challenges, visualize complex algorithms, revise core computer science concepts, and take timed mock assessments for tier-1 companies.

---

## 🌟 Key Features

### ⏱️ 1. Company Mock Assessment Simulator
- **Live Online Test (OT) Mode:** Simulate the exact round structures of companies like **Google**, **Amazon**, **Microsoft**, and **Swiggy** under strict timing conditions.
- **Cheating & Help Protection:** Locks code explanations, solutions, and visualizers during simulated tests to mimic real testing environments.
- **Scorecards & Assessment History:** Review solved questions, percentage scores, and performance tags (e.g., `OFFER FIT` vs `NEED GRIND`).

### 💻 2. Full-Featured Code Editor Sandbox
- **Language Support:** Write solutions in **JavaScript (Executable)**, **Python**, **C++**, and **Java**.
- **Local Test Runner:** Run and execute your code against **15 robust unit test cases** per problem.
- **Validation Engine:** JavaScript submissions are evaluated in a local browser sandbox with exact output verification before marking problems as complete.
- **Developer Features:** Support for auto-indent, tab-key support (`Tab` key maps to 4-space indents), custom font resizing, and quick template resets.

### 📊 3. Interactive DSA Memory Visualizers
- **Tree Visualizer:** Interactive canvas displaying binary tree structure from level-order inputs, allowing developers to see nodes and branches visually.
- **Linked List Visualizer:** Dynamic layout representing pointers (`next` references) and node values.
- **Graph & DP Canvas:** Visualizes adjacency lists, connectivity grids, and bottom-up DP table calculations to trace memoized states.

### 🗄️ 4. SQL Playground
- **SQL Sandbox:** Practice relational database queries directly in the browser.
- **Pre-loaded Questions:** Challenges ranging from basic selects to advanced joins, complete with database schema previews.

### 📚 5. CS Core Revision Hub
- Master core CS concepts with organized trackers for **Operating Systems (OS)**, **Database Management Systems (DBMS)**, **Computer Networks (CN)**, and **Object-Oriented Programming (OOPs)**.

---

## 🛠️ Tech Stack & Design System

- **Frontend Core:** React 18, TypeScript, Vite
- **Styling:** Custom Vanilla CSS (Sleek Dark Mode Theme, Glassmorphism Panels, Glow micro-animations, and Harmonious HSL color palette)
- **Icons:** `lucide-react`
- **Interactions:** `canvas-confetti` (for gamified success cues)
- **Data Layer:** Dynamic JSON database builder generating 1,800 structured problems.

---

## 📂 Project Structure

```bash
dsa_placement_app/
├── scripts/
│   └── generateLargeDatabase.js  # Dynamically compiles 1,800 problems & solution code
├── src/
│   ├── components/
│   │   ├── CodingSandbox.tsx     # Code Editor, Execution Terminal, & Sandbox
│   │   ├── MockTestSimulator.tsx # Timed Assessment and Scorecard engine
│   │   ├── CsCore.tsx            # CS Core MCQs and Theory Tracker
│   │   ├── SqlPlayground.tsx     # SQL Sandbox & practice console
│   │   ├── Dashboard.tsx         # User progress charts, badges & analytics
│   │   └── Visualizers/          # Tree, List, Graph & DP Canvas visualizers
│   ├── data/
│   │   ├── problemsDatabaseLarge.json # Large compiled JSON problem database
│   │   ├── companySheets.ts      # Structured sheets for top recruiting companies
│   │   └── csCoreQuestions.ts    # Revision questions database
│   ├── hooks/
│   │   └── useProgress.ts        # LocalStorage progress synchronization hook
│   ├── App.tsx                   # Main router & Layout manager
│   ├── index.css                 # Custom glassmorphism design tokens & styles
│   └── main.tsx
├── package.json
└── vite.config.ts
```

---

## ⚙️ Running Locally

Follow these steps to run the simulator on your local machine:

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/dsa-placement-app.git
cd dsa-placement-app
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Generate the Database
Re-generate the 1,800-question DSA database with complete multi-language templates and 15 test cases per problem:
```bash
node scripts/generateLargeDatabase.js
```

### 4. Run the Dev Server
Launch Vite's development server locally:
```bash
npm run dev
```
Open your browser and navigate to **`http://localhost:5173/`**.

### 5. Build for Production
To bundle the application for production hosting (e.g., GitHub Pages, Vercel, Netlify):
```bash
npm run build
```

---

## 💎 Engineering Optimizations

- **Dynamically Generated Templates:** Problem starter codes and exact solutions (JS, Python, Java, C++) are generated programmatically using a seed engine, ensuring signatures align exactly with expectations.
- **Client-Side Sandbox Execution:** Safe evaluation of JavaScript using clean JavaScript function compilers inside web-safe closures.
- **State Persistence:** Custom hooks synchronizing all problem completion counts, written notes, SQL challenges solved, and mock test score history using `localStorage` for zero-setup database requirements.
