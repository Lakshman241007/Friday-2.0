# FRIDAY — AI API Developer Reference

This document provides a developer reference for the FRIDAY AI REST API layer located under `/api/analysis` and `/api/outcomes`. It covers endpoint specifications, authentication mechanisms using existing Core dependencies, standard HTTP status codes, and instructions for triggering asynchronous background processing.

---

## 1. Authentication & Authorization

The AI API routes use FastAPI dependency injection (`Depends(get_current_user)`) designed to seamlessly bind to Member 2's Core authentication dependency.

### Headers
Every request must include the standard Bearer authorization header:
```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

### Access Control Rules
- **Authentication**: All endpoints verify the presence of valid credentials. Unauthenticated requests are rejected with `401 Unauthorized`.
- **Role Permissions**:
  - `admin` and `manager` roles can view and trigger processing for all calls across the organization.
  - `agent` roles can view and trigger processing only for calls assigned to their user ID or within their authorized scope.
- **Forbidden Access**: Requests with invalid roles or attempting cross-agent unauthorized call access will receive `403 Forbidden`.

---

## 2. Endpoints Summary

### 2.1 AI Analysis (`/api/analysis`)

Handles extraction and retrieval of call intelligence (Intent, Sentiment, Objections, Keywords, and Summary).

| Method | Endpoint | Description | Status Code |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/analysis/call/{call_id}` | Retrieve AI Analysis by Call ID | `200 OK` |
| `GET` | `/api/analysis/transcript/{transcript_id}` | Retrieve AI Analysis by Transcript ID | `200 OK` |
| `GET` | `/api/analysis/{analysis_id}` | Retrieve AI Analysis by primary key ID | `200 OK` |
| `POST` | `/api/analysis/process/{call_id}` | Trigger asynchronous AI analysis pipeline | `202 Accepted` |

#### Sample Analysis Response (`200 OK`)
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

---

### 2.2 AI Outcomes (`/api/outcomes`)

Handles call classification against the standardized FRIDAY outcome taxonomy, confidence scoring, evidence extraction, and recommended next actions.

| Method | Endpoint | Description | Status Code |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/outcomes/call/{call_id}` | Retrieve Outcome by Call ID | `200 OK` |
| `GET` | `/api/outcomes/transcript/{transcript_id}` | Retrieve Outcome by Transcript ID | `200 OK` |
| `GET` | `/api/outcomes/{outcome_id}` | Retrieve Outcome by primary key ID | `200 OK` |
| `POST` | `/api/outcomes/process/{call_id}` | Trigger asynchronous outcome detection | `202 Accepted` |

#### Standard Outcome Categories
Outcomes strictly conform to:
`Interested`, `Not Interested`, `Follow-up Required`, `Converted`, `Qualified`, `Unqualified`, `Callback Requested`, `No Answer`, `Busy`, `Wrong Number`, `Disqualified`, `Other`.

#### Sample Outcome Response (`200 OK`)
```json
{
  "id": "out-963d76e4-699e-4e42-b131-b8caea0ceec5",
  "call_id": "call-101",
  "transcript_id": "tr-101",
  "outcome": "Qualified",
  "confidence": 0.94,
  "evidence": "Customer confirmed available budget and decision authority.",
  "next_action": "Schedule executive technical architecture review.",
  "model": "gpt-4o",
  "provider": "openai",
  "created_at": "2026-09-19T02:00:05Z",
  "updated_at": "2026-09-19T02:00:05Z"
}
```

---

## 3. Triggering Asynchronous Processing

Both `/api/analysis/process/{call_id}` and `/api/outcomes/process/{call_id}` operate asynchronously. When triggered:
1. The route validates user authorization and input identifiers.
2. It verifies idempotency and pre-requisites:
   - Rejects with `409 Conflict` if processing is already completed (unless `force: true` is passed).
   - Rejects with `409 Conflict` if the pipeline is currently in-flight.
   - For outcomes, rejects with `409 Conflict` if AI Analysis has not completed yet.
3. It hands off execution to the `AnalysisWorker` using `dispatch_background(...)`.
4. It immediately responds with `202 Accepted`.

### 3.1 Trigger Analysis Example
```http
POST /api/analysis/process/call-101 HTTP/1.1
Host: api.friday.ai
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "transcript_id": "tr-101",
  "recording_id": "rec-101",
  "force": false
}
```

**Response (`202 Accepted`):**
```json
{
  "call_id": "call-101",
  "status": "processing",
  "message": "AI analysis processing started.",
  "transcript_id": "tr-101"
}
```

### 3.2 Trigger Outcome Example
```http
POST /api/outcomes/process/call-101 HTTP/1.1
Host: api.friday.ai
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "transcript_id": "tr-101",
  "force": false
}
```

**Response (`202 Accepted`):**
```json
{
  "call_id": "call-101",
  "status": "processing",
  "message": "AI outcome processing started.",
  "transcript_id": "tr-101"
}
```

---

## 4. Standard HTTP Status & Error Codes

| Status Code | Reason | Example Scenario |
| :--- | :--- | :--- |
| **`200 OK`** | Request Successful | Record successfully retrieved by ID, Call ID, or Transcript ID. |
| **`202 Accepted`** | Asynchronous Task Started | Background processing initiated for analysis or outcome. |
| **`400 Bad Request`** | Invalid Identifier | Path parameter contains illegal characters (`/`, `\`, `;`, `<`) or is empty. |
| **`401 Unauthorized`** | Authentication Missing | Missing, invalid, or expired Bearer token. |
| **`403 Forbidden`** | Authorization Failure | User lacks permission or the call is not assigned to the requesting agent. |
| **`404 Not Found`** | Resource Missing | No analysis or outcome found for the provided identifier. |
| **`409 Conflict`** | Pipeline Conflict / Missing Pre-requisite | 1. Processing already completed (`force=false`).<br>2. Pipeline stage currently running.<br>3. Outcome triggered before Analysis has completed. |
| **`503 Service Unavailable`** | Worker Unavailable | Background task dispatcher or internal worker temporarily unavailable. |

---

## 5. Router Registration in Core Backend (`router.py`)

Member 2 can mount these routers into the main application router:

```python
# In backend/app/api/router.py:
from app.api.routes.analysis import router as analysis_router
from app.api.routes.outcomes import router as outcomes_router

api_router.include_router(analysis_router)
api_router.include_router(outcomes_router)
```
