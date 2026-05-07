# GOM AI - API Documentation

## Base URL

```
Dev: http://localhost:8001
Prod: https://ai.gom.vn
```

## Authentication

Không yêu cầu auth. Public API cho internal services.

CORS: Chỉ cho phép requests từ domains trong .env

## Endpoints

### GET /

Health check.

Response:
```json
{
  "status": "online",
  "system": "Multi-Agent AI Debate"
}
```

### POST /predict

Phân tích ảnh gốm sứ.

Request: multipart/form-data
- file: Image file (JPG, PNG, WEBP, max 10MB)

Response:
```json
{
  "visual_features": {
    "is_pottery": true,
    "description": "Bình gốm hình trụ với men màu xanh ngọc...",
    "key_features": ["men ngọc", "hoa văn rồng"]
  },
  "agent_predictions": [
    {
      "agent_name": "GPT",
      "prediction": {
        "ceramic_line": "Gốm Celadon",
        "country": "Việt Nam",
        "era": "Thế kỷ 15-16"
      },
      "confidence": 0.85,
      "evidence": "Dựa vào màu men xanh ngọc...",
      "debate_details": {
        "attacks": [...],
        "defenses": [...],
        "confidence_adjustment": -0.05
      }
    }
  ],
  "final_report": {
    "final_prediction": "Gốm Celadon Việt Nam",
    "country": "Việt Nam",
    "era": "Thế kỷ 15-16",
    "confidence": 0.88,
    "reasoning": "Dựa trên phân tích tổng hợp...",
    "key_evidence": [...]
  }
}
```

Error (không phải gốm):
```json
{
  "error": "Rất tiếc, hệ thống không nhận diện được gốm sứ trong bức ảnh này."
}
```

Error (hết quota):
```json
{
  "error": "API đã hết quota. Vui lòng thử lại sau vài phút."
}
```

Status codes:
- 200: Success
- 500: Lỗi AI engine hoặc không phải gốm
- 502: Lỗi kết nối AI providers

Example:
```bash
curl -X POST http://localhost:8001/predict -F "file=@pottery.jpg"
```

### POST /chat

Chat với AI assistant.

Request:
```json
{
  "question": "Gốm Celadon có đặc điểm gì?"
}
```

Response:
```json
{
  "answer": "Gốm Celadon là loại gốm có men màu xanh ngọc...",
  "sources": ["Kiến thức chuyên gia AI", "Wikipedia: Gốm Celadon"]
}
```

Example:
```bash
curl -X POST http://localhost:8001/chat \
  -H "Content-Type: application/json" \
  -d '{"question":"Gốm Celadon là gì?"}'
```

### POST /api/login/social

Verify Google ID token.

Request:
```json
{
  "provider": "google",
  "credential": "eyJhbGciOiJSUzI1NiIs...",
  "clientId": "xxxxx.apps.googleusercontent.com"
}
```

Response:
```json
{
  "success": true,
  "provider": "google",
  "user": {
    "id": "123456789",
    "email": "user@example.com",
    "name": "Nguyễn Văn A",
    "picture": "https://lh3.googleusercontent.com/...",
    "email_verified": true
  },
  "claims": {
    "aud": "xxxxx.apps.googleusercontent.com",
    "exp": 1714234567,
    "iss": "https://accounts.google.com",
    "sub": "123456789"
  }
}
```

Error:
```json
{
  "detail": "Invalid Google credential"
}
```

Status codes:
- 200: Token hợp lệ
- 400: Provider không hợp lệ
- 401: Token không hợp lệ hoặc hết hạn
- 422: Thiếu credential

## Rate Limiting

Không có rate limiting ở GOM AI.
Giới hạn phụ thuộc AI providers:
- OpenAI: Theo plan
- xAI Grok: Theo plan
- Google Gemini: 15 RPM (free tier)
- Groq: 30 RPM (free tier)

## Error Handling

Error format:
```json
{
  "error": "Error message in Vietnamese"
}
```

hoặc:
```json
{
  "detail": "Error message in English"
}
```

Common errors:

| Error | Cause | Solution |
|-------|-------|----------|
| API đã hết quota | AI provider rate limit | Đợi hoặc upgrade plan |
| Không nhận diện được gốm sứ | Ảnh không phải gốm | Upload ảnh khác |
| Connection timeout | Network issue | Retry |
| Invalid Google credential | Token hết hạn | Lấy token mới |

## Best Practices

Image upload:
- Resize về 512x512px trước khi upload
- Compress để giảm thời gian upload
- Dùng WebP hoặc JPG

Error handling:
```javascript
try {
  const response = await fetch('/predict', {
    method: 'POST',
    body: formData
  });
  
  const result = await response.json();
  
  if (result.error) {
    console.error(result.error);
  } else {
    console.log(result.final_report);
  }
} catch (error) {
  console.error('Network error:', error);
}
```

Timeout (recommend 60s):
```javascript
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 60000);

fetch('/predict', {
  method: 'POST',
  body: formData,
  signal: controller.signal
});
```

## Testing

```bash
curl http://localhost:8001/

curl -X POST http://localhost:8001/predict -F "file=@test.jpg"

curl -X POST http://localhost:8001/chat \
  -H "Content-Type: application/json" \
  -d '{"question":"Gốm Celadon là gì?"}'
```
