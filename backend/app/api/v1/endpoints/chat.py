from fastapi import APIRouter, HTTPException
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.llm_service import generate_reply

router = APIRouter(prefix="/chat", tags=["chat"])

@router.post("", response_model=ChatResponse)
def chat(req: ChatRequest):
    try:
        messages = [{"role": m.role, "content": m.content} for m in req.messages]
        reply = generate_reply(messages)
        return ChatResponse(reply=reply)

    except Exception as e:
        msg = str(e)

        # Friendly OpenAI quota/billing message
        if "insufficient_quota" in msg or "You exceeded your current quota" in msg:
            raise HTTPException(
                status_code=402,
                detail="OpenAI API quota/billing is not available for this key/project. Enable billing or add credits, then try again."
            )

        raise HTTPException(status_code=500, detail=msg)
