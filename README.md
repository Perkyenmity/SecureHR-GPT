# SecureHR-GPT

SecureHR-GPT is an AI-powered HR assistant that allows employees, managers, HR personnel, and administrators to access employee information through a simple chat interface.

Instead of searching through employee records manually, users can ask questions in natural language, such as:

- Show me my employee profile.
- How many leave days do I have left?
- What is my performance rating?
- Show me the leave balance of an employee.

The system uses AI to understand these questions and retrieve the relevant information from a PostgreSQL database. Access to that information is controlled by the user's role and permissions.

## What Does This Project Do?

The main purpose of SecureHR-GPT is to make employee information easier to access while keeping sensitive company data protected.

The application supports four roles:

| Role | Access |
|---|---|
| Employee | Can access their own employee information. |
| Manager | Can access their own information and permitted information about employees in their reporting hierarchy. |
| HR | Can access employee information, including salary details. |
| Admin | Can access their own employee information. |

Access is controlled by the backend. The AI does not decide what information a user is allowed to see.

## How Does It Work?

The application follows a simple process:

1. A user logs in with their username and password.
2. The backend verifies the credentials and generates an authentication token.
3. The user asks a question through the chat interface.
4. The backend sends the question to the Groq API, which uses an LLM to understand the request and select the appropriate employee-data tool.
5. The selected Python tool checks the user's permissions and retrieves the allowed information from PostgreSQL.
6. The AI converts the retrieved information into a natural-language response.
7. The application displays the response to the user.

Every employee-data access decision is handled by the backend, and access attempts are recorded in the audit log.

## Technologies Used

| Technology | Purpose |
|---|---|
| Python | Backend programming language |
| FastAPI | Builds the backend APIs |
| PostgreSQL | Stores employee records and audit logs |
| SQLAlchemy | Connects the application to the database and manages database operations |
| JWT | Handles user authentication |
| bcrypt | Hashes and verifies passwords |
| Groq API | Provides access to the language model |
| LLM Function Calling | Helps select the appropriate employee-data tool |
| React | Builds the frontend interface |
| Vite | Runs and builds the React frontend |
| JavaScript | Frontend programming language |
| YAML | Defines role-based field permissions |
| Docker | Runs PostgreSQL locally |

## Project Architecture

The project has two main parts: a React frontend and a FastAPI backend.

```text
                 USER
                   |
                   v
           REACT FRONTEND
                   |
                   v
             FASTAPI BACKEND
                   |
          +--------+--------+
          |                 |
          v                 v
    AUTHENTICATION      GROQ API
      (JWT)           (LLM Function Calling)
                            |
                            v
                    PYTHON EMPLOYEE TOOLS
                            |
                            v
                    RBAC PERMISSION CHECK
                            |
                            v
                       POSTGRESQL
                            |
                            v
                    RESPONSE TO USER
```

### Backend

The backend handles authentication, employee-data retrieval, permission checks, and communication with the Groq API.

It also contains predefined Python tools for retrieving employee profiles, leave balances, salaries, performance ratings, reporting hierarchies, and employee records.

### Frontend

The frontend provides the login screen, role-specific navigation, and chat interface.

Users can sign in with their accounts and ask questions through the chat interface.

### Database

PostgreSQL stores employee information, user accounts, and audit logs.

SQLAlchemy is used to interact with the database.

## Security and Access Control

Security is an important part of this project.

SecureHR-GPT uses:

- **JWT Authentication:** Verifies users before allowing access to protected APIs.
- **Role-Based Access Control (RBAC):** Defines what each role can access.
- **Reporting Hierarchy:** Restricts managers to permitted employees within their reporting hierarchy.
- **Field-Level Permissions:** Controls which employee fields can be accessed. For example, managers cannot access subordinate salary information.
- **Backend Authorization:** Checks permissions in Python before returning employee data. The LLM cannot bypass these checks.
- **Audit Logging:** Records employee-data access decisions and related request information.

Role-based field permissions are maintained in a YAML configuration file.

## Project Structure

```text
SecureHR-GPT/
│
├── backend/
│   └── app/
│       ├── api/             # API endpoints
│       ├── core/            # Authentication and security
│       ├── db/              # Database connection
│       ├── llm/             # Groq API integration
│       ├── models/          # Database models
│       ├── schemas/         # Request and response schemas
│       ├── tools/           # Employee data retrieval tools
│       ├── config.py        # Application configuration
│       └── main.py          # FastAPI application entry point
│
├── frontend/
│   ├── src/                 # React components and application code
│   ├── index.html
│   └── package.json
│
├── field_rules.yaml         # Role-based field permissions
├── .env.example             # Example environment configuration
├── .gitignore
└── README.md
```

## Getting Started

Follow these steps to run the project locally.

### 1. Prerequisites

Make sure you have the following installed:

- Python
- Node.js and npm
- PostgreSQL 16
- Docker Desktop
- Git

You will also need a Groq API key.

### 2. Clone the Repository

```bash
git clone https://github.com/Perkyenmity/SecureHR-GPT
cd SecureHR-GPT
```

Replace `YOUR_GITHUB_REPOSITORY_URL` with the repository's actual GitHub URL.

### 3. Configure Environment Variables

Create your `.env` file using the provided example:

```bash
copy .env.example .env
```

Open `.env` and provide the required configuration values, including:

- PostgreSQL database connection details
- JWT secret key
- Groq API key
- Groq model name

Use `.env.example` as the reference for the exact variable names.

**Important:** Never upload your actual `.env` file or API keys to GitHub.

### 4. Start PostgreSQL

Make sure Docker Desktop is running and your PostgreSQL 16 container is available.

The application expects a PostgreSQL database named `securehr`. Configure the database connection in `.env` according to your local setup.

The database schema and required application records must be initialized before running the application.

### 5. Start the Backend

Open a terminal in the project root.

Create and activate a Python virtual environment if you have not already done so:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

Install the backend dependencies:

```powershell
pip install -r requirements.txt
```

Start the FastAPI server:

```powershell
uvicorn app.main:app --reload
```

The backend will be available at:

```text
http://127.0.0.1:8000
```

API documentation is available at:

```text
http://127.0.0.1:8000/docs
```

### 6. Start the Frontend

Open another terminal:

```powershell
cd frontend
npm install
npm run dev
```

The frontend will be available at the local URL displayed by Vite, usually:

```text
http://localhost:5173
```

Open this URL in your browser to use SecureHR-GPT.

## Demo Accounts

The project includes demo accounts for testing the different roles.

All demo accounts use the following password:

```text
Passw0rd!
```

| Username | Role |
|---|---|
| alice_emp | Employee |
| frank_emp | Employee |
| grace_emp | Employee |
| henry_emp | Employee |
| bob_mgr | Manager |
| erin_mgr | Manager |
| carol_hr | HR |
| dave_admin | Admin |

These are development/demo credentials and should not be used in a production environment.

## Important Notes

- Employee information is retrieved from PostgreSQL, not from uploaded HR documents.
- Groq is used to understand questions and select the appropriate employee-data tools.
- The backend is responsible for enforcing all access permissions.
- The application requires a valid Groq API key for AI-powered chat functionality.
- The `.env` file contains private configuration and must not be committed to GitHub.

## Future Scope

Some possible improvements for future versions include:

- Adding more HR-related operations.
- Improving the AI assistant's ability to handle complex employee queries.
- Adding more detailed audit-log reporting.
- Deploying the application for secure access over the internet.

---

**SecureHR-GPT** — Making employee information easier to access while keeping it secure.