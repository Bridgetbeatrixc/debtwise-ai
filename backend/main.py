from decimal import Decimal
from datetime import date, datetime
from typing import Any
import json

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from routes import auth, debts, chat, simulation, plan, insights


class CustomJSONResponse(JSONResponse):
    def render(self, content: Any) -> bytes:
        return json.dumps(
            content,
            default=self._default_serializer,
            ensure_ascii=False,
        ).encode("utf-8")

    @staticmethod
    def _default_serializer(obj: Any) -> Any:
        if isinstance(obj, Decimal):
            return float(obj)
        if isinstance(obj, (datetime, date)):
            return obj.isoformat()
        raise TypeError(f"Object of type {type(obj)} is not JSON serializable")


app = FastAPI(
    title="DebtWise AI",
    description="AI-powered debt management API",
    version="1.0.0",
    default_response_class=CustomJSONResponse,
)

# CORS: allow_credentials=True cannot be used with allow_origins=["*"].
# We use JWT in Authorization header (no cookies), so credentials=False is fine.
# This allows any origin (including all Vercel preview URLs) without CORS errors.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
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
