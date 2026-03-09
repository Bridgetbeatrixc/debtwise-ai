from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import auth, debts, chat, simulation, plan, insights

app = FastAPI(
    title="DebtWise AI",
    description="AI-powered debt management API",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://*.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(debts.router)
app.include_router(chat.router)
app.include_router(simulation.router)
app.include_router(plan.router)
app.include_router(insights.router)


@app.get("/")
async def root():
    return {"message": "DebtWise AI API", "version": "1.0.0"}


@app.get("/health")
async def health():
    return {"status": "healthy"}
