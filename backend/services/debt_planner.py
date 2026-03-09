from datetime import date, timedelta
from typing import Optional
import copy


def _monthly_interest_rate(annual_rate: float) -> float:
    return annual_rate / 100.0 / 12.0


def _simulate_payoff(
    debts: list[dict],
    extra_monthly: float = 0,
    order_key: Optional[callable] = None,
) -> dict:
    """Core simulation engine: pay debts in the given order with optional extra payments."""
    working_debts = []
    for d in debts:
        working_debts.append({
            "id": d.get("id", ""),
            "provider": d["provider"],
            "balance": float(d["balance"]),
            "interest_rate": float(d["interest_rate"]),
            "minimum_payment": float(d["minimum_payment"]),
            "debt_type": d.get("debt_type", ""),
        })

    if order_key:
        working_debts.sort(key=order_key)

    total_interest_paid = 0.0
    month = 0
    max_months = 600  # 50-year safety cap
    schedule = []

    while any(d["balance"] > 0.01 for d in working_debts) and month < max_months:
        month += 1
        month_detail = {"month": month, "debts": []}
        remaining_extra = extra_monthly

        for d in working_debts:
            if d["balance"] <= 0:
                continue

            interest = d["balance"] * _monthly_interest_rate(d["interest_rate"])
            total_interest_paid += interest
            d["balance"] += interest

            payment = min(d["minimum_payment"], d["balance"])
            d["balance"] -= payment

            month_detail["debts"].append({
                "provider": d["provider"],
                "payment": round(payment, 2),
                "interest": round(interest, 2),
                "remaining": round(d["balance"], 2),
            })

        for d in working_debts:
            if d["balance"] <= 0 or remaining_extra <= 0:
                continue
            extra = min(remaining_extra, d["balance"])
            d["balance"] -= extra
            remaining_extra -= extra

            for md in month_detail["debts"]:
                if md["provider"] == d["provider"]:
                    md["payment"] = round(md["payment"] + extra, 2)
                    md["remaining"] = round(d["balance"], 2)

        schedule.append(month_detail)

    debt_free_date = date.today() + timedelta(days=month * 30)

    return {
        "months_to_payoff": month,
        "debt_free_date": debt_free_date.isoformat(),
        "total_interest_paid": round(total_interest_paid, 2),
        "schedule": schedule,
    }


def _baseline_interest(debts: list[dict]) -> float:
    """Calculate total interest if only minimum payments are made."""
    result = _simulate_payoff(debts, extra_monthly=0)
    return result["total_interest_paid"]


def calculate_snowball_plan(debts: list[dict], extra_monthly: float = 0) -> dict:
    """Snowball: pay smallest balance first."""
    result = _simulate_payoff(
        debts,
        extra_monthly=extra_monthly,
        order_key=lambda d: float(d["balance"]),
    )
    baseline = _baseline_interest(debts)
    repayment_order = sorted(debts, key=lambda d: float(d["balance"]))

    return {
        "strategy": "snowball",
        "repayment_order": [d["provider"] for d in repayment_order],
        "months_to_payoff": result["months_to_payoff"],
        "debt_free_date": result["debt_free_date"],
        "total_interest_paid": result["total_interest_paid"],
        "interest_saved": round(baseline - result["total_interest_paid"], 2),
        "monthly_payment": round(
            sum(float(d["minimum_payment"]) for d in debts) + extra_monthly, 2
        ),
        "schedule": result["schedule"][:12],
    }


def calculate_avalanche_plan(debts: list[dict], extra_monthly: float = 0) -> dict:
    """Avalanche: pay highest interest rate first."""
    result = _simulate_payoff(
        debts,
        extra_monthly=extra_monthly,
        order_key=lambda d: -float(d["interest_rate"]),
    )
    baseline = _baseline_interest(debts)
    repayment_order = sorted(debts, key=lambda d: -float(d["interest_rate"]))

    return {
        "strategy": "avalanche",
        "repayment_order": [d["provider"] for d in repayment_order],
        "months_to_payoff": result["months_to_payoff"],
        "debt_free_date": result["debt_free_date"],
        "total_interest_paid": result["total_interest_paid"],
        "interest_saved": round(baseline - result["total_interest_paid"], 2),
        "monthly_payment": round(
            sum(float(d["minimum_payment"]) for d in debts) + extra_monthly, 2
        ),
        "schedule": result["schedule"][:12],
    }


def calculate_cashflow_plan(debts: list[dict], extra_monthly: float = 0) -> dict:
    """Cashflow: pay off debts that free up the most monthly cashflow first."""
    result = _simulate_payoff(
        debts,
        extra_monthly=extra_monthly,
        order_key=lambda d: float(d["balance"]) / max(float(d["minimum_payment"]), 1),
    )
    baseline = _baseline_interest(debts)
    repayment_order = sorted(
        debts,
        key=lambda d: float(d["balance"]) / max(float(d["minimum_payment"]), 1),
    )

    return {
        "strategy": "cashflow",
        "repayment_order": [d["provider"] for d in repayment_order],
        "months_to_payoff": result["months_to_payoff"],
        "debt_free_date": result["debt_free_date"],
        "total_interest_paid": result["total_interest_paid"],
        "interest_saved": round(baseline - result["total_interest_paid"], 2),
        "monthly_payment": round(
            sum(float(d["minimum_payment"]) for d in debts) + extra_monthly, 2
        ),
        "schedule": result["schedule"][:12],
    }


def simulate_payment(debts: list[dict], extra_monthly: float) -> dict:
    """Compare current trajectory vs accelerated payments."""
    baseline = _simulate_payoff(debts, extra_monthly=0)
    accelerated = _simulate_payoff(debts, extra_monthly=extra_monthly)

    return {
        "current": {
            "months_to_payoff": baseline["months_to_payoff"],
            "debt_free_date": baseline["debt_free_date"],
            "total_interest": baseline["total_interest_paid"],
        },
        "accelerated": {
            "months_to_payoff": accelerated["months_to_payoff"],
            "debt_free_date": accelerated["debt_free_date"],
            "total_interest": accelerated["total_interest_paid"],
        },
        "months_saved": baseline["months_to_payoff"] - accelerated["months_to_payoff"],
        "interest_saved": round(
            baseline["total_interest_paid"] - accelerated["total_interest_paid"], 2
        ),
        "extra_monthly_payment": extra_monthly,
        "schedule": accelerated["schedule"][:12],
    }
