# DebtWise AI

AI-powered debt calculator and management platform specializing in consumer debt and Buy Now Pay Later (BNPL) services.

---

## 🎥 Demo Video

Watch the demonstration of the application in the video below:

[![Watch the Demo](https://img.youtube.com/vi/fgl3zk9Di0I/0.jpg)](https://youtu.be/fgl3zk9Di0I)

---

## Main Features

### 1. Debt Dashboard
- Overview of total debt, number of accounts, average interest rate, and total minimum monthly payments
- Visual debt breakdown chart by provider (pie/donut chart)
- Upcoming payment due dates
- Debt reduction progress tracking

### 2. Debt Management (CRUD)
- Add, edit, and delete debt entries
- Supported debt types: **BNPL**, **Credit Card**, **Personal Loan**, **Digital Loan**
- Track provider name, balance, interest rate, minimum payment, and due date per debt

### 3. AI Financial Chatbot
- Conversational AI advisor powered by **Google Gemini 2.5 Flash**
- Streaming responses for real-time chat experience
- Context-aware: the AI sees your actual debt data and gives personalized advice
- Persistent chat history stored in the database

### 4. Payment Simulator
- Compare current repayment trajectory vs. accelerated payments
- Input any extra monthly payment amount to see projected impact
- Shows months saved, interest saved, and updated debt-free date

### 5. Repayment Plan Generator
- Three strategies: **Snowball** (smallest balance first), **Avalanche** (highest interest first), **Cashflow** (fastest payoff-to-payment ratio)
- AI-generated explanation of why the chosen strategy works
- Month-by-month repayment schedule (first 12 months)
- Shows total interest saved vs. minimum-only payments

### 6. Monthly Financial Insights
- AI-generated monthly reports analyzing debt changes, BNPL usage trends, and spending patterns
- Actionable recommendations based on your real financial data
- Historical insight archive (up to 12 months)

### 7. Authentication
- Email/password signup and login
- JWT-based session management (7-day token expiry)
- Protected routes — all data is scoped to the logged-in user
- Admin user role support

---

## Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| Next.js | 16.1.6 | React framework (App Router) |
| React | 19.2.3 | UI library |
| TailwindCSS | 4.x | Utility-first CSS |
| shadcn/ui | 4.x | Pre-built UI components |
| Recharts | 3.8.0 | Charts and data visualization |
| Lucide React | 0.577.0 | Icon library |
| Sonner | 2.x | Toast notifications |
| TypeScript | 5.x | Type safety |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| FastAPI | 0.115.6 | Python web framework |
| Uvicorn | 0.34.0 | ASGI server |
| Google Generative AI | 0.8.3 | Gemini 2.5 Flash integration |
| psycopg2-binary | 2.9.10 | PostgreSQL driver |
| Pydantic | 2.10.4 | Data validation and serialization |
| python-jose | 3.3.0 | JWT token creation and verification |
| passlib (bcrypt) | 1.7.4 | Password hashing |

### Database
| Technology | Purpose |
|---|---|
| PostgreSQL (Supabase) | Primary relational database |

### Deployment Targets
| Service | Component |
|---|---|
| Vercel | Frontend |
| Railway | Backend |
| Supabase | PostgreSQL database |

---

## Database Schema

```
┌─────────────────────────────────────────────────────────────┐
│                          users                              │
├──────────────┬──────────────┬───────────────────────────────┤
│ id           │ uuid (PK)    │ Auto-generated                │
│ email        │ text         │ Unique, not null              │
│ password_hash│ text         │ bcrypt hash, not null         │
│ is_admin     │ boolean      │ Default: false                │
│ created_at   │ timestamptz  │ Default: now()                │
└──────────────┴──────────────┴───────────────────────────────┘
        │
        │ user_id (FK, CASCADE)
        ▼
┌─────────────────────────────────────────────────────────────┐
│                          debts                              │
├──────────────┬──────────────┬───────────────────────────────┤
│ id           │ uuid (PK)    │ Auto-generated                │
│ user_id      │ uuid (FK)    │ → users.id                    │
│ provider     │ text         │ e.g. "Afterpay", "Klarna"     │
│ balance      │ numeric(12,2)│ Current balance               │
│ interest_rate│ numeric(5,2) │ Annual percentage rate         │
│ minimum_payment│ numeric(10,2)│ Monthly minimum             │
│ due_date     │ date         │ Next payment due (nullable)   │
│ debt_type    │ text         │ bnpl|credit_card|loan|digital_loan │
│ created_at   │ timestamptz  │ Default: now()                │
└──────────────┴──────────────┴───────────────────────────────┘
        │
        │ debt_id (FK, CASCADE)
        ▼
┌─────────────────────────────────────────────────────────────┐
│                        payments                             │
├──────────────┬──────────────┬───────────────────────────────┤
│ id           │ uuid (PK)    │ Auto-generated                │
│ user_id      │ uuid (FK)    │ → users.id                    │
│ debt_id      │ uuid (FK)    │ → debts.id                    │
│ amount       │ numeric(10,2)│ Payment amount                │
│ payment_date │ date         │ Default: current_date         │
│ created_at   │ timestamptz  │ Default: now()                │
└──────────────┴──────────────┴───────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      chat_history                           │
├──────────────┬──────────────┬───────────────────────────────┤
│ id           │ uuid (PK)    │ Auto-generated                │
│ user_id      │ uuid (FK)    │ → users.id                    │
│ message      │ text         │ Message content               │
│ role         │ text         │ 'user' or 'assistant'         │
│ created_at   │ timestamptz  │ Default: now()                │
└──────────────┴──────────────┴───────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    monthly_insights                         │
├──────────────┬──────────────┬───────────────────────────────┤
│ id           │ uuid (PK)    │ Auto-generated                │
│ user_id      │ uuid (FK)    │ → users.id                    │
│ summary      │ text         │ AI-generated insight report   │
│ created_at   │ timestamptz  │ Default: now()                │
└──────────────┴──────────────┴───────────────────────────────┘
```

### Indexes
- `idx_debts_user_id` on `debts(user_id)`
- `idx_payments_user_id` on `payments(user_id)`
- `idx_payments_debt_id` on `payments(debt_id)`
- `idx_chat_history_user_id` on `chat_history(user_id)`
- `idx_monthly_insights_user_id` on `monthly_insights(user_id)`

### Entity Relationships
- **users** 1 → N **debts** (a user can have many debts)
- **users** 1 → N **payments** (a user can make many payments)
- **debts** 1 → N **payments** (a debt can have many payments)
- **users** 1 → N **chat_history** (a user has one chat thread)
- **users** 1 → N **monthly_insights** (a user accumulates monthly reports)

All foreign keys use `ON DELETE CASCADE` — deleting a user removes all their associated data.

---

## How to Run

### Prerequisites
- **Python 3.11+** with pip
- **Node.js 18+** with npm
- A **PostgreSQL** database (Supabase free tier works)
- A **Google AI Studio** API key (for Gemini)

### 1. Clone the Repository

```bash
git clone https://github.com/Bridgetbeatrixc/debtwise-ai.git
cd debtwise-ai
```

### 2. Set Up the Backend

```bash
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Create environment file
cp .env.example .env
```

Edit `backend/.env` with your actual values:

```
GOOGLE_API_KEY=your-gemini-api-key
DATABASE_URL=your-postgres-connection-string
JWT_SECRET=any-long-random-string
```

Initialize the database (creates all tables and an admin user):

```bash
python init_db.py
```

This will output:

```
Creating tables...
Tables created.
Admin user created: admin@debtwise.ai (id: ...)
Done! You can now login with:
  Email:    admin@debtwise.ai
  Password: admin123
```

Start the backend server:

```bash
uvicorn main:app --reload --port 8000222
```

The API will be available at `http://localhost:8000`. You can view the interactive API docs at `http://localhost:8000/docs`.

### 3. Set Up the Frontend

Open a new terminal:

```bash
cd frontend

# Install Node.js dependencies
npm install

# Create environment file
cp .env.local.example .env.local
```

The default `frontend/.env.local` points to the local backend:

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Start the frontend dev server:

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

### 4. Login

Open `http://localhost:3000/login` in your browser and sign in with:

- **Email:** `admin@debtwise.ai`
- **Password:** `admin123`

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/` | No | API info |
| `GET` | `/health` | No | Health check |
| `POST` | `/auth/signup` | No | Create account |
| `POST` | `/auth/login` | No | Login and get JWT |
| `GET` | `/debts` | Yes | List user's debts |
| `POST` | `/debts` | Yes | Create a debt |
| `PUT` | `/debts/{id}` | Yes | Update a debt |
| `DELETE` | `/debts/{id}` | Yes | Delete a debt |
| `POST` | `/chat` | Yes | Chat with AI (streaming) |
| `GET` | `/chat/history` | Yes | Get chat history |
| `POST` | `/simulate` | Yes | Run payment simulation |
| `POST` | `/plan` | Yes | Generate repayment plan |
| `GET` | `/insights` | Yes | Get past insights |
| `POST` | `/insights/generate` | Yes | Generate new AI insight |

All authenticated endpoints require the header: `Authorization: Bearer <jwt_token>`

---

## Project Structure

```
debtwise-ai/
├── backend/
│   ├── main.py              # FastAPI app entry point
│   ├── config.py             # Environment settings (Pydantic)
│   ├── database.py           # PostgreSQL connection (psycopg2)
│   ├── middleware.py          # JWT authentication middleware
│   ├── schema.sql             # Database schema DDL
│   ├── init_db.py             # Table creation + admin seeding
│   ├── requirements.txt       # Python dependencies
│   ├── .env.example           # Environment template
│   ├── models/
│   │   ├── user.py            # User Pydantic models
│   │   └── debt.py            # Debt, Chat, Simulation models
│   ├── routes/
│   │   ├── auth.py            # Signup & login endpoints
│   │   ├── debts.py           # Debt CRUD endpoints
│   │   ├── chat.py            # AI chat (streaming)
│   │   ├── simulation.py      # Payment simulation endpoint
│   │   ├── plan.py            # Repayment plan endpoint
│   │   └── insights.py        # Monthly insights endpoints
│   └── services/
│       ├── gemini_service.py  # Gemini AI integration
│       ├── debt_planner.py    # Snowball/Avalanche/Cashflow logic
│       └── insight_engine.py  # Insight data aggregation
├── frontend/
│   ├── src/
│   │   ├── app/               # Next.js App Router pages
│   │   │   ├── login/         # Login page
│   │   │   ├── signup/        # Signup page
│   │   │   └── (app)/         # Authenticated layout group
│   │   │       ├── dashboard/ # Dashboard page
│   │   │       ├── debts/     # Debt management page
│   │   │       ├── chat/      # AI chatbot page
│   │   │       ├── simulator/ # Payment simulator page
│   │   │       ├── plan/      # Repayment plan page
│   │   │       └── insights/  # Monthly insights page
│   │   ├── components/        # Reusable UI components
│   │   └── lib/
│   │       ├── api.ts         # Backend API client
│   │       ├── auth-context.tsx # Auth state management
│   │       ├── types.ts       # TypeScript interfaces
│   │       └── utils.ts       # Utility functions
│   ├── .env.local.example     # Frontend env template
│   └── package.json           # Node.js dependencies
└── README.md                  # This file
```
