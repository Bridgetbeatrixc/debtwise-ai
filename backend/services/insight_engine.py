from datetime import date, timedelta

import psycopg2
from psycopg2.extras import RealDictCursor

from config import get_settings
from services.openai_service import generate_monthly_insight


def generate_insight_for_user(user_id: str) -> str:
    settings = get_settings()
    conn = psycopg2.connect(settings.database_url, cursor_factory=RealDictCursor)
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM debts WHERE user_id = %s", (user_id,))
            current_debts = cur.fetchall() or []

            total_debt = sum(float(d.get("balance", 0)) for d in current_debts)
            num_debts = len(current_debts)
            bnpl_debts = [d for d in current_debts if d.get("debt_type") == "bnpl"]
            bnpl_count = len(bnpl_debts)

            thirty_days_ago = date.today() - timedelta(days=30)
            cur.execute(
                "SELECT * FROM payments WHERE user_id = %s AND payment_date >= %s",
                (user_id, thirty_days_ago),
            )
            recent_payments = cur.fetchall() or []
            total_payments = sum(float(p.get("amount", 0)) for p in recent_payments)

        prev_total_debt = total_debt + total_payments
        debt_change = total_debt - prev_total_debt

        bnpl_total = sum(float(d.get("balance", 0)) for d in bnpl_debts)
        bnpl_change_pct = 0.0
        if prev_total_debt > 0:
            bnpl_change_pct = (bnpl_total / prev_total_debt) * 100

        debt_summary = {
            "total_debt": total_debt,
            "prev_total_debt": prev_total_debt,
            "debt_change": debt_change,
            "num_debts": num_debts,
            "bnpl_count": bnpl_count,
            "total_payments": total_payments,
            "bnpl_change_pct": bnpl_change_pct,
        }

        insight_text = generate_monthly_insight(debt_summary)

        with conn.cursor() as cur:
            cur.execute(
                "INSERT INTO monthly_insights (user_id, summary) VALUES (%s, %s)",
                (user_id, insight_text),
            )
            conn.commit()
    finally:
        conn.close()

    return insight_text
