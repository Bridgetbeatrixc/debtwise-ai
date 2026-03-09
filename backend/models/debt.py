from pydantic import BaseModel, Field
from datetime import date, datetime
from typing import Optional
from enum import Enum


class DebtType(str, Enum):
    BNPL = "bnpl"
    CREDIT_CARD = "credit_card"
    LOAN = "loan"
    DIGITAL_LOAN = "digital_loan"


class DebtCreate(BaseModel):
    provider: str
    balance: float = Field(ge=0)
    interest_rate: float = Field(ge=0, le=100)
    minimum_payment: float = Field(ge=0)
    due_date: Optional[date] = None
    debt_type: DebtType


class DebtUpdate(BaseModel):
    provider: Optional[str] = None
    balance: Optional[float] = Field(default=None, ge=0)
    interest_rate: Optional[float] = Field(default=None, ge=0, le=100)
    minimum_payment: Optional[float] = Field(default=None, ge=0)
    due_date: Optional[date] = None
    debt_type: Optional[DebtType] = None


class DebtResponse(BaseModel):
    id: str
    user_id: str
    provider: str
    balance: float
    interest_rate: float
    minimum_payment: float
    due_date: Optional[date] = None
    debt_type: str
    created_at: Optional[datetime] = None


class ChatMessage(BaseModel):
    message: str


class ChatResponse(BaseModel):
    id: str
    user_id: str
    message: str
    role: str
    created_at: Optional[datetime] = None


class SimulationRequest(BaseModel):
    extra_monthly_payment: float = Field(ge=0)


class PlanRequest(BaseModel):
    strategy: str = Field(pattern="^(snowball|avalanche|cashflow)$")


class InsightResponse(BaseModel):
    id: str
    user_id: str
    summary: str
    created_at: Optional[datetime] = None
