from openai import AsyncOpenAI
from config import get_settings
from typing import AsyncGenerator

SYSTEM_PROMPT = """You are DebtWise AI, an expert financial advisor specializing in consumer debt management, 
particularly Buy Now Pay Later (BNPL), credit cards, personal loans, and digital loans.

You help users understand their debt situation, create repayment strategies, and make informed financial decisions.
Be empathetic, clear, and actionable in your advice. Use specific numbers from the user's debt data when available.
Never recommend taking on more debt. Always encourage responsible financial behavior.

When the user asks about their debts, use the provided debt context to give specific, personalized advice."""


async def get_openai_client() -> AsyncOpenAI:
    settings = get_settings()
    return AsyncOpenAI(api_key=settings.openai_api_key)


def build_debt_context(debts: list) -> str:
    if not debts:
        return "The user has no debts recorded yet."

    total_balance = sum(d.get("balance", 0) for d in debts)
    total_minimum = sum(d.get("minimum_payment", 0) for d in debts)

    lines = [
        f"User's Debt Summary:",
        f"Total debt: ${total_balance:,.2f}",
        f"Total minimum monthly payments: ${total_minimum:,.2f}",
        f"Number of debts: {len(debts)}",
        "",
        "Individual debts:",
    ]

    for d in debts:
        lines.append(
            f"- {d['provider']} ({d['debt_type']}): "
            f"${d['balance']:,.2f} balance, "
            f"{d['interest_rate']}% APR, "
            f"${d['minimum_payment']:,.2f}/mo minimum"
            f"{', due ' + d['due_date'] if d.get('due_date') else ''}"
        )

    return "\n".join(lines)


async def generate_chat_response(
    messages: list[dict],
    debt_context: str,
) -> AsyncGenerator[str, None]:
    client = await get_openai_client()

    system_message = f"{SYSTEM_PROMPT}\n\nCurrent debt context:\n{debt_context}"

    api_messages = [{"role": "system", "content": system_message}]
    for msg in messages:
        api_messages.append({"role": msg["role"], "content": msg["message"]})

    stream = await client.chat.completions.create(
        model="gpt-4o",
        messages=api_messages,
        stream=True,
        temperature=0.7,
        max_tokens=1000,
    )

    async for chunk in stream:
        if chunk.choices[0].delta.content:
            yield chunk.choices[0].delta.content


async def generate_monthly_insight(debt_summary: dict) -> str:
    client = await get_openai_client()

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

    response = await client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": "You are DebtWise AI, a financial insights engine. Be concise and data-driven."},
            {"role": "user", "content": prompt},
        ],
        temperature=0.7,
        max_tokens=500,
    )

    return response.choices[0].message.content


async def explain_repayment_plan(plan_data: dict) -> str:
    client = await get_openai_client()

    prompt = f"""Explain this debt repayment plan in a friendly, encouraging way:

Strategy: {plan_data.get('strategy', 'N/A')}
Repayment order: {', '.join(plan_data.get('repayment_order', []))}
Estimated debt-free date: {plan_data.get('debt_free_date', 'N/A')}
Total interest saved vs minimum payments: ${plan_data.get('interest_saved', 0):,.2f}
Monthly payment: ${plan_data.get('monthly_payment', 0):,.2f}

Explain why this strategy works and motivate the user. Keep it to 3-4 sentences."""

    response = await client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": "You are DebtWise AI. Explain financial plans clearly and encouragingly."},
            {"role": "user", "content": prompt},
        ],
        temperature=0.7,
        max_tokens=300,
    )

    return response.choices[0].message.content
