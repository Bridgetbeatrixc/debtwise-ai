from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from models.debt import ChatMessage
from middleware import get_current_user
from database import get_supabase
from services.openai_service import generate_chat_response, build_debt_context

router = APIRouter(tags=["chat"])


@router.post("/chat")
async def chat(body: ChatMessage, user: dict = Depends(get_current_user)):
    sb = get_supabase()

    sb.table("chat_history").insert({
        "user_id": user["id"],
        "message": body.message,
        "role": "user",
    }).execute()

    debts_resp = sb.table("debts").select("*").eq("user_id", user["id"]).execute()
    debt_context = build_debt_context(debts_resp.data or [])

    history_resp = (
        sb.table("chat_history")
        .select("message, role")
        .eq("user_id", user["id"])
        .order("created_at", desc=False)
        .limit(20)
        .execute()
    )
    messages = history_resp.data or []

    async def stream_response():
        full_response = []
        async for token in generate_chat_response(messages, debt_context):
            full_response.append(token)
            yield token

        sb.table("chat_history").insert({
            "user_id": user["id"],
            "message": "".join(full_response),
            "role": "assistant",
        }).execute()

    return StreamingResponse(stream_response(), media_type="text/plain")


@router.get("/chat/history")
async def get_chat_history(user: dict = Depends(get_current_user)):
    sb = get_supabase()
    response = (
        sb.table("chat_history")
        .select("*")
        .eq("user_id", user["id"])
        .order("created_at", desc=False)
        .limit(50)
        .execute()
    )
    return response.data
