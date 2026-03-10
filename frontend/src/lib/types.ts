export interface User {
  id: string;
  email: string;
  created_at?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export type DebtType = "bnpl" | "credit_card" | "loan" | "digital_loan";

export interface Debt {
  id: string;
  user_id: string;
  provider: string;
  balance: number;
  interest_rate: number;
  minimum_payment: number;
  due_date: string | null;
  debt_type: DebtType;
  created_at?: string;
}

export interface DebtCreate {
  provider: string;
  balance: number;
  interest_rate: number;
  minimum_payment: number;
  due_date?: string;
  debt_type: DebtType;
}

export interface DebtUpdate {
  provider?: string;
  balance?: number;
  interest_rate?: number;
  minimum_payment?: number;
  due_date?: string;
  debt_type?: DebtType;
}

export interface ChatMessageType {
  id: string;
  user_id: string;
  message: string;
  role: "user" | "assistant";
  created_at?: string;
}

export interface SimulationResult {
  current: {
    months_to_payoff: number;
    debt_free_date: string;
    total_interest: number;
  };
  accelerated: {
    months_to_payoff: number;
    debt_free_date: string;
    total_interest: number;
  };
  months_saved: number;
  interest_saved: number;
  extra_monthly_payment: number;
  schedule: MonthDetail[];
}

export interface MonthDetail {
  month: number;
  debts: {
    provider: string;
    payment: number;
    interest: number;
    remaining: number;
  }[];
}

export interface RepaymentPlan {
  strategy: string;
  repayment_order: string[];
  months_to_payoff: number;
  debt_free_date: string;
  total_interest_paid: number;
  interest_saved: number;
  monthly_payment: number;
  explanation: string;
  schedule: MonthDetail[];
}

export interface Insight {
  id: string;
  user_id: string;
  summary: string;
  created_at?: string;
}
