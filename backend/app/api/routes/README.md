# FRIDAY — AI API Layer Documentation

This document describes the REST API endpoints provided by the FRIDAY AI Layer (`/api/analysis` and `/api/outcomes`). It covers endpoint specifications, request/response structures, authentication and authorization rules, idempotency behavior, and standard HTTP error codes for backend and frontend developers.

---

## 1. Architectural Overview

The AI API Layer acts as a thin controller layer over the AI Pipeline and Worker execution engine:
- **Zero Business Logic in Routes**: Routes do not call LLM providers or craft prompts directly; requests are delegated to the underlying repositories and background `AnalysisWorker`.
- **Decoupled Persistence**: Retrieval endpoints query dedicated AI repositories (`AnalysisRepository`, `OutcomeRepository`).
- **Asynchronous Processing**: Processing triggers respond with HTTP `202 Accepted` and dispatch pipeline stages in the background.
- **Idempotency & Concurrency Guards**: Multiple calls to trigger processing for the same call ID are guarded against duplicate executions.

---

## 2. Authentication & Authorization

All AI endpoints require an authenticated user context.

### Headers
```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

### Authorization Rules
- **Role-Based Access**:
  - `admin` and `manager` roles can view and trigger analysis across all organization calls.
  - `agent` roles can access calls assigned to them or within their authorized scope.
  - Unauthenticated requests return `401 Unauthorized`.
  - Unauthorized roles or cross-agent unauthorized call access return `403 Forbidden`.

---

## 3. Endpoints

### 3.1 AI Analysis (`/api/analysis`)

Manages Phase 3 AI Analysis (Intents, Sentiments, Objections, Keywords, and Summaries).

#### `GET /api/analysis/call/{call_id}`
Retrieves the completed AI analysis associated with a call.

- **URL Parameters**:
  - `call_id` (string, required): Unique identifier of the call.
- **Response**: `200 OK`
```json
{
  "id": "an-e58f0b7c-2b5d-4f76-80db-c2df11c47012",
  "call_id": "call-101",
  "transcript_id": "tr-101",
  "intent": {
    "label": "Pricing Inquiry",
    "confidence": 0.92,
    "evidence": "Customer asked about enterprise tiers."
  },
  "sentiment": {
    "label": "Positive",
    "confidence": 0.88,
    "evidence": "Sounded very enthusiastic."
  },
  "objections": [
    {
      "category": "Budget",
      "description": "Too expensive",
      "confidence": 0.85
    }
  ],
  "keywords": [
    {
      "keyword": "enterprise tier",
      "relevance": 0.95,
      "frequency": 2,
      "timestamps": [12.4, 45.2]
    }
  ],
  "summary": "Discussed enterprise pricing plan.",
  "key_points": ["Budget discussion", "Enterprise tier"],
  "customer_needs": ["Predictable cost"],
  "concerns": ["Deployment time"],
  "next_steps": ["Send proposal"],
  "model": "gpt-4o",
  "provider": "openai",
  "analyzed_at": "2026-09-19T02:00:00Z",
  "created_at": "2026-09-19T02:00:00Z",
  "updated_at": "2026-09-19T02:00:00Z"
}
```

#### `GET /api/analysis/transcript/{transcript_id}`
Retrieves analysis using the transcript ID.
- **URL Parameters**: `transcript_id` (string, required)
- **Response**: `200 OK` (schema matches `AnalysisResponse`).

#### `GET /api/analysis/{analysis_id}`
Retrieves a specific analysis by its primary key ID.
- **URL Parameters**: `analysis_id` (string, required)
- **Response**: `200 OK` (schema matches `AnalysisResponse`).

#### `POST /api/analysis/process/{call_id}`
Triggers background AI analysis for a call.

- **URL Parameters**: `call_id` (string, required)
- **Request Body** (optional):
```json
{
  "transcript_input": null,
  "transcript_id": "tr-101",
  "recording_id": "rec-101",
  "force": false
}
```
- **Response**: `202 Accepted`
```json
{
  "call_id": "call-101",
  "status": "processing",
  "message": "AI analysis processing started.",
  "transcript_id": "tr-101"
}
```

---

### 3.2 AI Outcomes (`/api/outcomes`)

Manages Phase 5 AI Outcome Classification and recommended next actions.

#### `GET /api/outcomes/call/{call_id}`
Retrieves the persisted outcome classification for a call.

- **URL Parameters**:
  - `call_id` (string, required): Unique identifier of the call.
- **Response**: `200 OK`
```json
{
  "id": "out-963d76e4-699e-4e42-b131-b8caea0ceec5",
  "call_id": "call-101",
  "transcript_id": "tr-101",
  "outcome": "Qualified",
  "confidence": 0.94,
  "evidence": "Customer confirmed available budget and decision-maker authority.",
  "next_action": "Schedule executive technical architecture review.",
  "model": "gpt-4o",
  "provider": "openai",
  "created_at": "2026-09-19T02:00:05Z",
  "updated_at": "2026-09-19T02:00:05Z"
}
```

#### `GET /api/outcomes/transcript/{transcript_id}`
Retrieves the outcome associated with a specific transcript.
- **URL Parameters**: `transcript_id` (string, required)
- **Response**: `200 OK` (schema matches `OutcomeResponse`).

#### `GET /api/outcomes/{outcome_id}`
Retrieves an outcome record by its primary key.
- **URL Parameters**: `outcome_id` (string, required)
- **Response**: `200 OK` (schema matches `OutcomeResponse`).

#### `POST /api/outcomes/process/{call_id}`
Triggers background outcome classification for a call.

> **Pre-requisite**: AI Analysis (Phase 3) must be completed prior to running outcome detection.

- **URL Parameters**: `call_id` (string, required)
- **Request Body** (optional):
```json
{
  "transcript_input": null,
  "transcript_id": "tr-101",
  "force": false
}
```
- **Response**: `202 Accepted`
```json
{
  "call_id": "call-101",
  "status": "processing",
  "message": "AI outcome processing started.",
  "transcript_id": "tr-101"
}
```

---

## 4. Standard Outcome Taxonomy

The `outcome` field strictly conforms to the following standardized values:
- `Interested`
- `Not Interested`
- `Follow-up Required`
- `Converted`
- `Qualified`
- `Unqualified`
- `Callback Requested`
- `No Answer`
- `Busy`
- `Wrong Number`
- `Disqualified`
- `Other`

---

## 5. HTTP Status & Error Codes

| Status Code | Description | Reason / Trigger |
| :--- | :--- | :--- |
| **`200 OK`** | Request Successful | Returned on successful GET requests with requested record. |
| **`202 Accepted`** | Processing Initiated | Returned on valid POST triggers dispatched asynchronously to worker. |
| **`400 Bad Request`** | Invalid Identifier | Path parameter is empty or contains illegal characters (`/`, `\`, `;`, `<`). |
| **`401 Unauthorized`** | Authentication Missing | Missing or invalid bearer authorization token. |
| **`403 Forbidden`** | Access Denied | User lacks permissions or the call is not assigned to the requesting agent. |
| **`404 Not Found`** | Resource Missing | No analysis or outcome found for the given ID, call ID, or transcript ID. |
| **`409 Conflict`** | Prerequisite / State Conflict | 1. Triggered analysis/outcome already completed (`force=false`).<br>2. Pipeline stage currently in-flight.<br>3. Outcome processing requested before Analysis has completed. |
| **`503 Service Unavailable`** | Worker / System Error | Background worker dispatcher temporarily unavailable. |

---

## 6. Registration Instructions for Member 2 (Core Backend)

To mount these routes into the main application, register them in `backend/app/api/router.py`:

```python
from app.api.routes.analysis import router as analysis_router
from app.api.routes.outcomes import router as outcomes_router

# Include in central APIRouter:
api_router.include_router(analysis_router)
api_router.include_router(outcomes_router)
```
