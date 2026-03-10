from typing import Generator

import google.generativeai as genai

from config import get_settings

SYSTEM_PROMPT = """You are DebtWise AI, an expert financial advisor specializing in consumer debt management,
particularly Buy Now Pay Later (BNPL), credit cards, personal loans, and digital loans.

You help users understand their debt situation, create repayment strategies, and make informed financial decisions.
Be empathetic, clear, and actionable in your advice. Use specific numbers from the user's debt data when available.
Never recommend taking on more debt. Always encourage responsible financial behavior.

When the user asks about their debts, use the provided debt context to give specific, personalized advice."""


def _get_gemini_model():
    settings = get_settings()
    genai.configure(api_key=settings.google_api_key)
    return genai.GenerativeModel("gemini-2.5-flash")


def build_debt_context(debts: list) -> str:
    if not debts:
        return "The user has no debts recorded yet."

    total_balance = sum(float(d.get("balance", 0)) for d in debts)
    total_minimum = sum(float(d.get("minimum_payment", 0)) for d in debts)

    lines = [
        f"User's Debt Summary:",
        f"Total debt: ${total_balance:,.2f}",
        f"Total minimum monthly payments: ${total_minimum:,.2f}",
        f"Number of debts: {len(debts)}",
        "",
        "Individual debts:",
    ]

    for d in debts:
        due = d.get("due_date")
        due_str = str(due) if due else ""
        lines.append(
            f"- {d['provider']} ({d['debt_type']}): "
            f"${float(d['balance']):,.2f} balance, "
            f"{float(d['interest_rate'])}% APR, "
            f"${float(d['minimum_payment']):,.2f}/mo minimum"
            f"{', due ' + due_str if due_str else ''}"
        )

    return "\n".join(lines)


def generate_chat_response(
    messages: list[dict],
    debt_context: str,
) -> Generator[str, None, None]:
    model = _get_gemini_model()

    history_lines: list[str] = []
    for msg in messages:
        role = msg.get("role", "user")
        prefix = "User" if role == "user" else "Assistant"
        history_lines.append(f"{prefix}: {msg.get('message', '')}")

    full_prompt = (
        f"{SYSTEM_PROMPT}\n\n"
        f"Current debt context:\n{debt_context}\n\n"
        "Conversation so far:\n"
        + "\n".join(history_lines)
        + "\n\nRespond as DebtWise AI to the user's latest message."
    )

    response = model.generate_content(full_prompt, stream=True)
    for chunk in response:
        text = getattr(chunk, "text", None)
        if text:
            yield text


def generate_monthly_insight(debt_summary: dict) -> str:
    model = _get_gemini_model()

    prompt = f"""Based on this user's financial data, generate a concise monthly insight report.

Debt Summary:
- Total debt: ${debt_summary.get('total_debt', 0):,.2f}
- Previous month total: ${debt_summary.get('prev_total_debt', 0):,.2f}
- Debt change: ${debt_summary.get('debt_change', 0):,.2f}
- Number of debts: {debt_summary.get('num_debts', 0)}
- BNPL debts: {debt_summary.get('bnpl_count', 0)}
- Total payments this month: ${debt_summary.get('total_payments', 0):,.2f}
- BNPL spending change: {debt_summary.get('bnpl_change_pct', 0):.1f}%

Generate a report with:
1. Debt change summary (one sentence)
2. BNPL usage observation (one sentence)
3. Spending pattern note (one sentence)
4. One actionable recommendation

Keep it concise, friendly, and specific to the numbers provided."""

    response = model.generate_content(prompt)
    return response.text or ""


def explain_repayment_plan(plan_data: dict) -> str:
    model = _get_gemini_model()

    prompt = f"""Explain this debt repayment plan in a friendly, encouraging way:

Strategy: {plan_data.get('strategy', 'N/A')}
Repayment order: {', '.join(plan_data.get('repayment_order', []))}
Estimated debt-free date: {plan_data.get('debt_free_date', 'N/A')}
Total interest saved vs minimum payments: ${plan_data.get('interest_saved', 0):,.2f}
Monthly payment: ${plan_data.get('monthly_payment', 0):,.2f}

Explain why this strategy works and motivate the user. Keep it to 3-4 sentences."""

    response = model.generate_content(prompt)
    return response.text or ""
