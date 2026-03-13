import psycopg2
from psycopg2.extras import RealDictCursor
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse

from config import get_settings
from database import get_db
from middleware import get_current_user
from models.debt import ChatMessage
from services.gemini_service import build_debt_context, generate_chat_response

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("")
def chat(body: ChatMessage, user: dict = Depends(get_current_user), db=Depends(get_db)):
    conn = db
    with conn.cursor() as cur:
        cur.execute(
            "INSERT INTO chat_history (user_id, message, role) VALUES (%s, %s, 'user')",
            (user["id"], body.message),
        )
        conn.commit()

        cur.execute("SELECT * FROM debts WHERE user_id = %s", (user["id"],))
        debts = cur.fetchall() or []

        cur.execute(
            "SELECT message, role FROM chat_history WHERE user_id = %s ORDER BY created_at ASC LIMIT 20",
            (user["id"],),
        )
        history = cur.fetchall() or []

    debt_context = build_debt_context(debts)
    user_id = user["id"]

    def stream_response():
        full_response: list[str] = []
        try:
            for token in generate_chat_response(history, debt_context):
                full_response.append(token)
                yield token
        except Exception as e:
            error_msg = f"\n\n[AI temporarily unavailable: {type(e).__name__}. Please try again in a moment.]"
            full_response.append(error_msg)
            yield error_msg

        settings = get_settings()
        save_conn = psycopg2.connect(settings.database_url, cursor_factory=RealDictCursor)
        try:
            with save_conn.cursor() as cur:
                cur.execute(
                    "INSERT INTO chat_history (user_id, message, role) VALUES (%s, %s, 'assistant')",
                    (user_id, "".join(full_response)),
                )
                save_conn.commit()
        finally:
            save_conn.close()

    return StreamingResponse(stream_response(), media_type="text/plain")


@router.get("/history")
def get_chat_history(user: dict = Depends(get_current_user), db=Depends(get_db)):
    conn = db
    with conn.cursor() as cur:
        cur.execute(
            "SELECT * FROM chat_history WHERE user_id = %s ORDER BY created_at ASC LIMIT 200",
            (user["id"],),
        )
        rows = cur.fetchall()
    return rows


@router.post("/clear")
def clear_chat_history(user: dict = Depends(get_current_user), db=Depends(get_db)):
    conn = db
    with conn.cursor() as cur:
        cur.execute("DELETE FROM chat_history WHERE user_id = %s", (user["id"],))
        conn.commit()
    return {"ok": True}
