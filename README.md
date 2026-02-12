# 🏛️ NYAYA-Setu 

**NYAYA-Setu** is an AI-powered legal aid kiosk designed to provide **accessible, safe, and preliminary legal guidance** to citizens through a secure, public-facing interface.  
It bridges the gap between complex legal systems and the common citizen by combining **multi-agent AI reasoning** with a **walk-up public kiosk**, without replacing professional lawyers.

---

## 🎯 Goal

To build a **safe, accessible, and responsible legal decision-support system** that helps citizens understand their legal rights and options, while deliberately avoiding unsafe, speculative, or overconfident guidance in high-risk situations.

NYAYA-Setu is built as a **public kiosk** to ensure access for users who lack smartphones, reliable internet connectivity, or affordable legal consultation.

---

## ❗ Problem Statement

Access to reliable legal guidance in India remains structurally broken. Legal advice is often expensive, fragmented, and delivered without accountability, pushing citizens toward informal intermediaries, exploitative practices, or overconfident digital tools.

In high-stakes domains such as matrimonial disputes, land conflicts, labour exploitation, cybercrime, sexual offenses, and caste-based laws, incorrect or aggressive advice frequently escalates disputes into retaliation, prolonged litigation, financial collapse, social harm, or even loss of life. This risk is further amplified by the transition from the Indian Penal Code (IPC) to the Bharatiya Nyaya Sanhita (BNS), where outdated or hallucinated advice can be particularly dangerous.

Existing AI systems worsen this crisis by treating every query as safe and every response as acceptable, lacking mechanisms for risk assessment, ethical review, uncertainty handling, or refusal. There is a clear need for a **public, deployable legal decision-support system that can reason carefully, detect danger, and withhold guidance when certainty is low**.

---

## 🚀 Key Features

### 🧠 Multi-Agent AI Core
NYAYA-Setu uses a structured multi-agent architecture where specialized agents independently evaluate different aspects of a legal query:
- **Legal Agent** — analyzes applicable laws and statutes
- **Risk Agent** — identifies real-world risks such as retaliation or escalation
- **Ethics Agent** — enforces safety and ethical boundaries (with veto authority)
- **Confidence Agent** — evaluates reliability and certainty of the response
- **Language Agent** — enables multilingual accessibility

This prevents single-model hallucination or overconfidence.

---

### 🖥️ Public Legal Kiosk
- Walk-up, touch-friendly interface
- Deployable in courts, panchayats, post offices, campuses, and service centers
- No dependency on personal devices or constant internet access

---

### 🔒 Offline-First & Privacy-Preserving
- Runs locally on kiosk hardware
- No cloud dependency during user interaction
- Automatic session reset and data wipe between users

---

### 🔍 Transparent Decision Flow
- Real-time visualization of system reasoning and safety checks
- Explains *why* guidance is cautious, limited, or withheld
- Builds trust through visible accountability

---

### 🧩 Google ADK Integration (Optional)
- Supports enhanced orchestration using **Google Agent Development Kit (ADK)**
- Enables structured workflows, tool usage, and multi-agent consensus

---

## 🧭 How NYAYA-Setu Works

NYAYA-Setu operates as an intelligent legal aid kiosk that translates complex legal processes into understandable guidance for everyday citizens.

The process begins when a user interacts with the kiosk frontend, by typing their legal query in their native language. This input is securely transmitted to the backend server, which acts as the central orchestrator.

A **Language Agent** first detects the user’s language and translates the query into English for standardized processing. The translated query is then evaluated in parallel by multiple agents:

- The **Legal Agent** identifies relevant laws and statutes  
- The **Risk Agent** assesses potential dangers, liabilities, or escalation risks  

These insights are reviewed by the **Ethics Agent**, which acts as a safety gatekeeper. If the request or advice is unsafe or unethical, execution is halted immediately. If the advice passes ethical checks, the **Confidence Agent** evaluates whether sufficient certainty exists to proceed.

Finally, the system synthesizes all validated inputs into a clear response, translates it back into the user’s original language, and displays it on the kiosk—ensuring safe, understandable legal guidance without exposing users to harm.

---

## 🛠️ Technical Stack

### 💻 Frontend

| Technology | Purpose |
|---------|--------|
| React 19 | UI framework |
| Vite 7 | Build tool & dev server |
| TypeScript | Static typing |
| TailwindCSS 4 | Styling |
| React Router DOM 7 | Client-side routing |
| Lucide React | Icons |
| Recharts | Charts & visualizations |

---

### ⚙️ Backend

| Technology | Purpose |
|---------|--------|
| Python 3.x | Core language |
| FastAPI | API framework |


---

### 🧠 AI & Agent System

| Technology | Purpose |
|---------|--------|
| Google ADK | Multi-agent orchestration |
| LiteLLM | LLM abstraction layer |
| Groq | High-performance LLM inference |
| LLaMA 3.3 | Language model |

---

### 📂 Data & Storage

| Technology | Purpose |
|---------|--------|
| CSV Files | Legal datasets (IPC, BNS, Judgments) |
| Scikit-learn | TF-IDF vectorization |
| Cosine Similarity | Search & retrieval |
| Pandas | Data processing |
| NumPy | Numerical operations |



## 📦 Installation

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/yourusername/epochon2.0.git
cd epochon2.0

cd backend
python -m venv venv
# Windows
venv\Scripts\activate

# Linux / macOS
source venv/bin/activate
pip install -r requirements.txt

#Create an env
GROQ_API_KEY=your_groq_api_key_here
USE_ENHANCED_ORCHESTRATION=false

# Frontend
cd ../frontend
npm install
npm run dev

#Backend
uvicorn app.main:app --reload
