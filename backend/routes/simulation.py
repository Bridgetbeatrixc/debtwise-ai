import re
from urllib.parse import urlparse

import httpx
from fastapi import APIRouter, Depends, HTTPException

from database import get_db
from middleware import get_current_user
from models.debt import PurchaseImpactRequest, PurchaseInfoRequest, SimulationRequest
from services.debt_planner import simulate_payment, _simulate_payoff
from services.gemini_service import generate_purchase_verdict

router = APIRouter(tags=["simulation"])


@router.post("/simulate")
def simulate(body: SimulationRequest, user: dict = Depends(get_current_user), db=Depends(get_db)):
    conn = db
    with conn.cursor() as cur:
        cur.execute("SELECT * FROM debts WHERE user_id = %s", (user["id"],))
        debts = cur.fetchall() or []

    if not debts:
        raise HTTPException(status_code=400, detail="No debts found to simulate")

    result = simulate_payment(debts, body.extra_monthly_payment)
    return result


# ---------------------------------------------------------------------------
# Purchase link scraper
# ---------------------------------------------------------------------------

def _extract_meta(html: str, property_name: str) -> str | None:
    pattern = rf'<meta[^>]+(?:property|name)=["\']?{re.escape(property_name)}["\']?[^>]+content=["\']([^"\']+)["\']'
    m = re.search(pattern, html, re.IGNORECASE)
    if m:
        return m.group(1).strip()
    pattern2 = rf'<meta[^>]+content=["\']([^"\']+)["\'][^>]+(?:property|name)=["\']?{re.escape(property_name)}["\']?'
    m2 = re.search(pattern2, html, re.IGNORECASE)
    return m2.group(1).strip() if m2 else None


def _extract_price(html: str) -> float | None:
    price_meta = _extract_meta(html, "product:price:amount")
    if price_meta:
        try:
            return float(price_meta.replace(",", "").replace(".", "").strip())
        except ValueError:
            pass
    patterns = [
        r'["\']price["\']\s*:\s*["\']?([\d.,]+)',
        r'Rp\s?([\d.,]+)',
    ]
    for p in patterns:
        m = re.search(p, html)
        if m:
            raw = m.group(1).replace(".", "").replace(",", "")
            try:
                return float(raw)
            except ValueError:
                continue
    return None


@router.post("/simulate/purchase-info")
def purchase_info(body: PurchaseInfoRequest, user: dict = Depends(get_current_user)):
    parsed = urlparse(body.url)
    if not parsed.scheme or not parsed.netloc:
        raise HTTPException(status_code=400, detail="Invalid URL")

    try:
        resp = httpx.get(
            body.url,
            follow_redirects=True,
            timeout=15,
            headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"},
        )
        html = resp.text
    except Exception:
        return {
            "product_name": None,
            "price": None,
            "image_url": None,
            "source": parsed.netloc,
            "error": "Could not fetch the page. Enter details manually.",
        }

    title = _extract_meta(html, "og:title")
    if not title:
        m = re.search(r"<title[^>]*>([^<]+)</title>", html, re.IGNORECASE)
        title = m.group(1).strip() if m else None

    image = _extract_meta(html, "og:image")
    price = _extract_price(html)

    return {
        "product_name": title,
        "price": price,
        "image_url": image,
        "source": parsed.netloc,
        "error": None if title else "Could not parse product details. Enter manually.",
    }


# ---------------------------------------------------------------------------
# Purchase impact calculator
# ---------------------------------------------------------------------------

@router.post("/simulate/purchase-impact")
def purchase_impact(body: PurchaseImpactRequest, user: dict = Depends(get_current_user), db=Depends(get_db)):
    monthly_rate = body.interest_rate / 100.0
    monthly_installment = round(body.price * (1 + monthly_rate) / body.installment_months, 2)
    total_cost = round(monthly_installment * body.installment_months, 2)
    interest_markup = round(total_cost - body.price, 2)
    interest_markup_pct = round((interest_markup / body.price) * 100, 2) if body.price > 0 else 0

    conn = db
    with conn.cursor() as cur:
        cur.execute("SELECT * FROM debts WHERE user_id = %s", (user["id"],))
        debts = cur.fetchall() or []

    baseline = _simulate_payoff(debts) if debts else {
        "months_to_payoff": 0,
        "debt_free_date": "N/A",
        "total_interest_paid": 0,
    }

    annual_rate = body.interest_rate * 12
    new_debt = {
        "id": "simulated-purchase",
        "provider": body.provider,
        "balance": body.price,
        "interest_rate": annual_rate,
        "minimum_payment": monthly_installment,
        "debt_type": "bnpl",
    }
    debts_with_purchase = list(debts) + [new_debt]
    with_purchase = _simulate_payoff(debts_with_purchase)

    extra_months = with_purchase["months_to_payoff"] - baseline["months_to_payoff"]
    extra_interest = round(with_purchase["total_interest_paid"] - baseline["total_interest_paid"], 2)

    total_debt = sum(float(d.get("balance", 0)) for d in debts)

    try:
        ai_verdict = generate_purchase_verdict(
            product_name=body.product_name or "Unknown item",
            price=body.price,
            total_cost=total_cost,
            monthly_installment=monthly_installment,
            installment_months=body.installment_months,
            provider=body.provider,
            current_total_debt=total_debt,
            extra_months=extra_months,
            extra_interest=extra_interest,
        )
    except Exception:
        ai_verdict = "AI analysis temporarily unavailable."

    return {
        "product_name": body.product_name,
        "price": body.price,
        "monthly_installment": monthly_installment,
        "total_cost": total_cost,
        "interest_markup": interest_markup,
        "interest_markup_pct": interest_markup_pct,
        "current_debt_free_date": baseline.get("debt_free_date", "N/A"),
        "new_debt_free_date": with_purchase["debt_free_date"],
        "extra_months": extra_months,
        "extra_interest": extra_interest,
        "ai_verdict": ai_verdict,
    }
