from typing import Generator

import google.generativeai as genai

from config import get_settings

SYSTEM_PROMPT = """
You are DebtWise AI, an expert financial advisor specializing in consumer debt management,
particularly Buy Now Pay Later (BNPL), credit cards, personal loans, and digital loans.

Your goal is to help users understand their debt situation, create repayment strategies,
and make informed financial decisions.

COMMUNICATION STYLE
- Be empathetic, supportive, and non-judgmental.
- Be clear, practical, and actionable.
- Use specific numbers from the user's debt data when available.
- Encourage responsible financial behavior.
- Never recommend taking on more debt.

ANSWERING PRINCIPLES
1. Answer ONLY what the user asks.
2. Do NOT provide extra explanations unless the user requests them.
3. Keep responses concise and relevant.
4. Use the user's debt context to personalize answers when applicable.

DETAIL LEVEL RULES
- If the user asks a general question (e.g., "What debts do I have?"):
  Provide a short summary of their debts.

- If the user asks for details (e.g., "Explain my debts in detail"):
  Provide a structured overview that highlights the key points only:
  • debt type
  • total amount
  • remaining balance
  • due date or payment status
  Avoid listing unnecessary metadata or internal fields.

- If the user asks about a specific debt:
  Provide information only about that debt.

- If the user asks for advice or strategy:
  Give concise, actionable recommendations based on their situation.

RESPONSE STRUCTURE
Prefer structured responses when possible:
- Short summary first
- Bullet points for key information
- Advice only when explicitly requested

IMPORTANT CONSTRAINT
Do not overwhelm the user with full datasets, raw tables, or excessive detail.
Always summarize information unless the user explicitly asks for a full breakdown.

When the user asks about their debts, use the provided debt context to give
specific, personalized answers that match the exact scope of the question.
"""


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
        + "\n\nRespond as DebtWise AI to the user's latest message. Follow the system rules and keep the response concise."
    )

    response = model.generate_content(full_prompt, stream=True)
    for chunk in response:
        text = getattr(chunk, "text", None)
        if text:
            yield text


def generate_monthly_insight(debt_summary: dict) -> str:
    model = _get_gemini_model()

    prompt = f"""Generate a concise monthly financial insight based strictly on the user's debt summary below.

Debt Summary:
- Total debt: ${debt_summary.get('total_debt', 0):,.2f}
- Previous month total: ${debt_summary.get('prev_total_debt', 0):,.2f}
- Debt change: ${debt_summary.get('debt_change', 0):,.2f}
- Number of debts: {debt_summary.get('num_debts', 0)}
- BNPL debts: {debt_summary.get('bnpl_count', 0)}
- Total payments this month: ${debt_summary.get('total_payments', 0):,.2f}
- BNPL spending change: {debt_summary.get('bnpl_change_pct', 0):.1f}%

Instructions:
Write a short monthly insight that helps the user understand their financial progress.

The response should include:
1. **Debt change summary** — one sentence explaining whether total debt increased or decreased.
2. **BNPL usage observation** — one sentence explaining how Buy Now Pay Later usage is changing.
3. **Spending pattern note** — one sentence identifying a pattern based on the numbers.
4. **One actionable recommendation** — a short practical suggestion the user can follow next month.

Formatting rules:
- Use **bold formatting for important numbers**.
- Use **bullet points for each insight**.
- Keep the report short and easy to scan.
- Reference the provided numbers when explaining the insights.
- Do not invent additional data.

Tone:
Supportive, practical, and neutral — like a financial advisor giving a quick monthly check-in.

Keep it concise, friendly, and specific to the numbers provided."""

    response = model.generate_content(prompt)
    return response.text or ""


def explain_repayment_plan(plan_data: dict) -> str:
    model = _get_gemini_model()

    prompt = f"""Explain the following debt repayment plan clearly and concisely for the user.

Repayment Plan Data:
Strategy: {plan_data.get('strategy', 'N/A')}
Repayment order: {', '.join(plan_data.get('repayment_order', []))}
Estimated debt-free date: {plan_data.get('debt_free_date', 'N/A')}
Total interest saved vs minimum payments: ${plan_data.get('interest_saved', 0):,.2f}
Monthly payment: ${plan_data.get('monthly_payment', 0):,.2f}

Instructions:
- Briefly explain how the strategy works.
- Mention the repayment order so the user understands what will be paid first.
- Highlight the estimated debt-free date and interest savings.
- Keep the tone supportive and practical.

Formatting:
- Start with a **short summary sentence**.
- Use **bullet points** for the key plan details.
- Bold important numbers such as money amounts and dates.
- Keep the explanation concise (about 3–4 sentences total).

Do not add unrelated financial advice. Focus only on explaining this repayment plan.
"""

    response = model.generate_content(prompt)
    return response.text or ""


def generate_purchase_verdict(
    product_name: str,
    price: float,
    total_cost: float,
    monthly_installment: float,
    installment_months: int,
    provider: str,
    current_total_debt: float,
    extra_months: int,
    extra_interest: float,
) -> str:
    model = _get_gemini_model()

    prompt = f"""You are DebtWise AI. A user is considering a new purchase on installments.
Analyze whether they should proceed given their current debt situation.

Purchase Details:
- Product: {product_name}
- Price: Rp {price:,.0f}
- Provider: {provider}
- Installment: {installment_months} months at Rp {monthly_installment:,.0f}/mo
- Total cost with interest: Rp {total_cost:,.0f} (markup: Rp {total_cost - price:,.0f})

User's Current Situation:
- Existing total debt: Rp {current_total_debt:,.0f}
- This purchase pushes their debt-free date back by {extra_months} month(s)
- Additional interest cost: Rp {extra_interest:,.0f}

Instructions:
1. Give a clear verdict: PROCEED WITH CAUTION, NOT RECOMMENDED, or OK TO PROCEED
2. Explain the real cost in simple terms
3. Mention the impact on their debt-free timeline
4. Ask them to consider: "Do you really need this right now?"
5. If the markup is high or debt is already heavy, be direct about it

Keep it to 3-4 sentences. Be empathetic but honest."""

    response = model.generate_content(prompt)
    return response.text or "Unable to generate analysis."
