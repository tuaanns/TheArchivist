import io
import logging
import os
import re
import sys
import time
import traceback
import urllib.parse
from pathlib import Path
from typing import Any

import httpx
from dotenv import load_dotenv
from fastapi import Body, FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

try:
    from app.debate.debate_engine import DebateEngine
except ModuleNotFoundError:
    from debate.debate_engine import DebateEngine

# Logging — force UTF-8 output to avoid UnicodeEncodeError on Windows (gbk)
_utf8_stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace", line_buffering=True)
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
    handlers=[logging.StreamHandler(_utf8_stdout)],
)
logger = logging.getLogger("gom-ai")

# Environment
load_dotenv(dotenv_path=Path(__file__).resolve().parent.parent / ".env", override=True)


def _normalize_origin(origin: str) -> str:
    return origin.strip().rstrip("/")


def _split_env_values(*names: str) -> list[str]:
    values: list[str] = []
    for name in names:
        raw_value = os.getenv(name, "")
        if not raw_value:
            continue
        values.extend(part.strip() for part in raw_value.split(",") if part.strip())
    return values


DEFAULT_ALLOWED_ORIGINS = {
    "https://thearchivist.vercel.app",
    "https://thearchivistai.vercel.app",
    "https://the-archivist-ai.vercel.app",
    "https://thearchivist-edemdeeaf4ahamgs.southeastasia-01.azurewebsites.net",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
}

ALLOWED_ORIGINS = sorted(
    {
        _normalize_origin(origin)
        for origin in (
            DEFAULT_ALLOWED_ORIGINS
            | set(_split_env_values("CORS_ALLOW_ORIGINS", "ALLOWED_ORIGINS", "FRONTEND_URL"))
        )
        if origin.strip()
    }
)


def _pick_social_token(payload: dict[str, Any]) -> str | None:
    for field_name in ("credential", "idToken", "id_token", "token", "accessToken", "access_token"):
        value = payload.get(field_name)
        if isinstance(value, str) and value.strip():
            return value.strip()
    return None


def _google_client_ids(payload: dict[str, Any]) -> set[str]:
    client_ids = {
        value
        for value in _split_env_values(
            "GOOGLE_CLIENT_ID",
            "GOOGLE_OAUTH_CLIENT_ID",
            "GOOGLE_CLIENT_IDS",
        )
    }
    payload_client_id = payload.get("clientId") or payload.get("client_id")
    if isinstance(payload_client_id, str) and payload_client_id.strip():
        client_ids.add(payload_client_id.strip())
    return client_ids


async def _verify_google_id_token(id_token: str, allowed_audiences: set[str]) -> dict[str, Any]:
    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.get(
            "https://oauth2.googleapis.com/tokeninfo",
            params={"id_token": id_token},
        )

    if response.status_code != 200:
        logger.warning(
            "Google token verification failed with status %s: %s",
            response.status_code,
            response.text[:200],
        )
        raise HTTPException(status_code=401, detail="Invalid Google credential")

    claims = response.json()
    issuer = claims.get("iss")
    if issuer not in {"accounts.google.com", "https://accounts.google.com"}:
        raise HTTPException(status_code=401, detail="Invalid Google credential issuer")

    audience = claims.get("aud")
    if allowed_audiences and audience not in allowed_audiences:
        raise HTTPException(status_code=401, detail="Google credential audience mismatch")

    expires_at = claims.get("exp")
    try:
        if expires_at and int(expires_at) <= int(time.time()):
            raise HTTPException(status_code=401, detail="Google credential expired")
    except (TypeError, ValueError):
        raise HTTPException(status_code=401, detail="Invalid Google credential expiry")

    return claims

app = FastAPI(title="Gom AI Multi-Agent Debate Server")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

engine = DebateEngine()

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


@app.get("/")
def read_root():
    return {"status": "online", "system": "Multi-Agent AI Debate"}


@app.post("/api/login/social")
async def social_login(payload: dict[str, Any] | None = Body(default=None)):
    payload = payload or {}
    provider = str(payload.get("provider") or "google").strip().lower()
    if provider not in {"google", "google-one-tap"}:
        raise HTTPException(status_code=400, detail="Unsupported social provider")

    id_token = _pick_social_token(payload)
    if not id_token:
        raise HTTPException(status_code=422, detail="Missing Google credential")

    claims = await _verify_google_id_token(id_token, _google_client_ids(payload))
    return {
        "success": True,
        "provider": "google",
        "user": {
            "id": claims.get("sub"),
            "email": claims.get("email"),
            "name": claims.get("name"),
            "picture": claims.get("picture"),
            "email_verified": str(claims.get("email_verified", "")).lower() == "true",
        },
        "claims": {
            "aud": claims.get("aud"),
            "exp": claims.get("exp"),
            "iss": claims.get("iss"),
            "sub": claims.get("sub"),
        },
    }

class ChatQuery(BaseModel):
    question: str

@app.post("/chat")
async def process_chat(req: ChatQuery):
    sources = ["Kiến thức chuyên gia AI"]
    wiki_context = ""
    # 1. Tìm thông tin bên ngoài bằng Wikipedia API
    try:
        search_url = f"https://vi.wikipedia.org/w/api.php?action=query&list=search&srsearch={urllib.parse.quote(req.question)}&utf8=&format=json&srlimit=1"
        async with httpx.AsyncClient() as client:
            res = await client.get(search_url, timeout=5.0)
            data = res.json()

            if "query" in data and "search" in data["query"] and len(data["query"]["search"]) > 0:
                item = data["query"]["search"][0]
                title = item["title"]
                snippet = re.sub(r'<[^>]+>', '', item["snippet"])
                wiki_context = f"Thông tin từ Wikipedia (bài '{title}'): {snippet}"
                sources.append(f"Wikipedia: {title}")
    except Exception as e:
        logger.error(f"Error fetching Wikipedia: {e}")

    # 2. Sử dụng AI để tổng hợp câu trả lời
    prompt = (
        f"Bạn là Trợ lý AI GOM chuyên giám định gốm sứ toàn cầu.\n"
        f"Người dùng hỏi: {req.question}\n\n"
        f"Thông tin tham khảo bên ngoài: {wiki_context}\n\n"
        f"Hãy trả lời một cách tự nhiên, thân thiện và cung cấp thông tin hữu ích bằng tiếng Việt. Không trả về định dạng JSON, chỉ trả về văn bản thông thường."
    )

    try:
        answer = await engine.gpt._call_llm(prompt)
        # Strip JSON artifacts if the model tries to return structured output
        answer = re.sub(r'```json|```|\{\s*"agent_name".*\}', '', answer, flags=re.DOTALL).strip()

        if not answer:
            raise ValueError("Empty response from AI Provider")

    except Exception as e:
        answer = "Xin lỗi, hiện tại AI Engine đang gặp gián đoạn kết nối. Vui lòng thử lại sau vài giây."
        logger.error(f"Chat AI Error: {e}")

    return {
        "answer": answer,
        "sources": sources
    }

# Main endpoint: image -> Multi-Agent Debate -> Result
@app.post("/predict")
async def predict_debate(file: UploadFile = File(...)):
    image_bytes = await file.read()
    logger.info(f"POST /predict - Received {file.filename} ({len(image_bytes)} bytes)")

    # Save for debugging
    with open(os.path.join(UPLOAD_FOLDER, file.filename), "wb") as f:
        f.write(image_bytes)

    try:
        result = await engine.start_debate(image_bytes)

        if "error" in result:
            with open("error_log.txt", "a", encoding="utf-8") as f:
                f.write(f"Debate Error: {result['error']}\n")
            raise HTTPException(status_code=500, detail=result["error"])

        logger.info(f"Debate completed: Final Prediction = {result['final_report'].get('final_prediction')}")
        return result

    except HTTPException:
        raise
    except Exception as e:
        with open("error_log.txt", "a", encoding="utf-8") as f:
            f.write(f"UNEXPECTED ERROR: {e}\n{traceback.format_exc()}\n")
        logger.exception("Unexpected error in debate engine:")
        raise HTTPException(status_code=502, detail=f"AI Engine Error: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
