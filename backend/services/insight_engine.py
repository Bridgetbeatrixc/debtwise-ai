from datetime import date, timedelta
from database import get_supabase
from services.openai_service import generate_monthly_insight


async def generate_insight_for_user(user_id: str) -> str:
    sb = get_supabase()

    debts = sb.table("debts").select("*").eq("user_id", user_id).execute()
    current_debts = debts.data or []

    total_debt = sum(float(d.get("balance", 0)) for d in current_debts)
    num_debts = len(current_debts)
    bnpl_debts = [d for d in current_debts if d.get("debt_type") == "bnpl"]
    bnpl_count = len(bnpl_debts)

    thirty_days_ago = (date.today() - timedelta(days=30)).isoformat()
    payments_resp = (
        sb.table("payments")
        .select("*")
        .eq("user_id", user_id)
        .gte("payment_date", thirty_days_ago)
        .execute()
    )
    recent_payments = payments_resp.data or []
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

    insight_text = await generate_monthly_insight(debt_summary)

    sb.table("monthly_insights").insert({
        "user_id": user_id,
        "summary": insight_text,
    }).execute()

    return insight_text
