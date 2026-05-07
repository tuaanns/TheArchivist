# GOM AI - Data Flow

## Tổng quan

GOM AI là stateless service. Không có database. Nhận request, xử lý, trả response.

## Data Flow

```
Client (gom-api)
    ↓ POST /predict (image bytes)
    ↓ POST /chat (question)
    ↓
GOM AI Service
    ├─ VisionAgent (GPT-4 Vision)
    ├─ GPT Agent
    ├─ Grok Agent  
    ├─ Gemini Agent
    └─ JudgeAgent (Llama 3.3-70b)
    ↓ JSON response
gom-api (lưu vào database)
```

## Temporary Storage

uploads/ - Ảnh debug, không tự động xóa
error_log.txt - Logs lỗi từ debate engine

## External APIs

OpenAI (GPT-4, GPT-4 Vision)
- Vision analysis, predictions, debate
- Rate limit theo plan

xAI Grok
- Independent predictions, debate
- Rate limit theo plan

Google Gemini 2.0 Flash
- Independent predictions, debate
- Rate limit theo plan

Groq (Llama 3.3-70b)
- Final judge, chat assistant
- Free tier có limit

Wikipedia API
- https://vi.wikipedia.org/w/api.php
- Tìm kiếm thông tin cho chat
- Public, không limit

## Data Models

### Visual Features (Phase 0)

```json
{
  "is_pottery": true,
  "description": "Bình gốm hình trụ với men màu xanh ngọc...",
  "key_features": ["men ngọc", "hoa văn rồng", "đáy tròn"],
  "color_palette": ["xanh ngọc", "trắng ngà"],
  "shape": "hình trụ",
  "decorative_elements": ["rồng", "mây"]
}
```

### Agent Prediction (Phase 1)

```json
{
  "agent_name": "GPT",
  "prediction": {
    "ceramic_line": "Gốm Celadon",
    "country": "Việt Nam",
    "era": "Thế kỷ 15-16",
    "style": "Men ngọc"
  },
  "confidence": 0.85,
  "evidence": "Dựa vào màu men xanh ngọc đặc trưng..."
}
```

### Debate Details (Phase 2)

```json
{
  "attacks": [
    {
      "target": "Grok",
      "critique": "Grok đánh giá niên đại quá sớm..."
    }
  ],
  "defenses": [
    {
      "against": "GPT",
      "rebuttal": "Tuy nhiên, hoa văn rồng..."
    }
  ],
  "confidence_adjustment": -0.05,
  "final_confidence": 0.80
}
```

### Final Report (Phase 3)

```json
{
  "final_prediction": "Gốm Celadon Việt Nam",
  "country": "Việt Nam",
  "era": "Thế kỷ 15-16",
  "style": "Men ngọc",
  "confidence": 0.88,
  "reasoning": "Dựa trên phân tích tổng hợp...",
  "consensus_level": "high",
  "key_evidence": [
    "Men màu xanh ngọc đặc trưng",
    "Hoa văn rồng phong cách Việt Nam",
    "Kỹ thuật nung đặc trưng thế kỷ 15-16"
  ]
}
```

### Chat Response

```json
{
  "answer": "Gốm Celadon là loại gốm có men màu xanh ngọc...",
  "sources": ["Kiến thức chuyên gia AI", "Wikipedia: Gốm Celadon"]
}
```

## Caching

Hiện tại: Không có caching
Lý do: Mỗi phân tích unique

Khuyến nghị:
- Cache Wikipedia results (TTL: 24h)
- Cache ceramic line descriptions (TTL: 7 days)
- Redis cho session

## Data Retention

- uploads/: Không tự động xóa
- error_log.txt: Append-only, cần manual cleanup
- API responses: Không lưu

## Privacy

- Không lưu thông tin user
- Không lưu ảnh lâu dài
- Chỉ xử lý và trả kết quả
- API keys trong .env, không commit
- Stateless processing

## Monitoring

Metrics cần track:
- Request count per endpoint
- Average response time
- Error rate by AI provider
- Token usage per provider

Logging:
```python
logger.info(f"POST /predict - Received {filename} ({size} bytes)")
logger.info(f"[DebateEngine] Starting Phase 1")
logger.error(f"[DebateEngine] Vision analysis failed: {error}")
```

## Backup

Không cần backup vì stateless service.
Configuration trong .env (backup manual).

## Scalability

Horizontal scaling:
- Stateless → dễ scale với load balancer
- Mỗi instance độc lập
- Không cần shared database

Bottlenecks:
1. AI API rate limits
2. Network latency (gọi 4-5 external APIs)
3. Memory (xử lý ảnh lớn)

Solutions:
- Request queue
- Redis cache
- Optimize image processing
- CDN cho static assets
