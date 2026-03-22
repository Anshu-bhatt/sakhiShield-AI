# SakhiShield AI

SakhiShield AI is a safety-focused assistant for rural and semi-urban women.
It combines:
- VittSakhi chat guidance in simple Gujarati
- Document safety scan workflow (detect risk before sharing)
- Practical warnings for OTP, fraud links, and sensitive document sharing

---

## 1. Current Tech Stack

- Frontend: React + Vite
- Backend: Node.js + Express
- AI Provider: Groq API (via backend proxy)
- Key routes:
  - `POST /api/grok`
  - `GET /` (health check)

---

## 2. Product Workflow (User Journey)

1. User opens app and starts chat with VittSakhi.
2. User asks a safety question (UPI, loan, OTP, document sharing).
3. Chatbot responds in simple Gujarati with safe guidance.
4. If user intent includes document sharing, app prompts upload flow.
5. System scans for sensitive fields (Aadhaar/PAN/address/face) and computes risk.
6. App shows result: `LOW / MEDIUM / HIGH / CRITICAL`.
7. User can apply redaction and download safe version.
8. App stores scan action in audit/history log.

---

## 3. Task-by-Task Execution Plan

Use this as your project management board.

### Phase A: Foundation and Environment

- [x] A1. Initialize React + Vite frontend
- [x] A2. Add Express backend server (`server.js`)
- [x] A3. Configure `.env.local` loading for backend
- [x] A4. Add backend health endpoint (`GET /`)
- [ ] A5. Add `.env.local.example` with required keys
- [ ] A6. Add startup script that runs frontend + backend reliably on Windows

### Phase B: Chat Core (VittSakhi)

- [x] B1. Build chat screen UI
- [x] B2. Build message bubble / typing indicator components
- [x] B3. Connect frontend to `POST /api/grok`
- [x] B4. Add Gujarati system prompt for tone and safety behavior
- [x] B5. Handle backend/API errors gracefully in UI
- [ ] B6. Add retry button for failed AI response
- [ ] B7. Add message persistence (local storage)

### Phase C: Safety Guidance Features

- [x] C1. Define trigger rules for document sharing and OTP warnings
- [ ] C2. Add topic cards on home/chat start (`UPI`, `Loan`, `Scam`, `Document Safe?`)
- [ ] C3. Add suspicious link checker flow
- [ ] C4. Add contextual warning templates per scam type
- [ ] C5. Add quick education stories after high-risk detections

### Phase D: PrivacyShield Scanner (Core)

- [ ] D1. Add single image upload UI
- [ ] D2. Build backend upload endpoint
- [ ] D3. Add OCR extraction pipeline
- [ ] D4. Add PII detection rules (Aadhaar, PAN, phone, address, account)
- [ ] D5. Add face detection
- [ ] D6. Create risk scoring function
- [ ] D7. Return structured scan report JSON

### Phase E: Redaction and Safe Sharing

- [ ] E1. Draw highlighted bounding boxes for sensitive regions
- [ ] E2. Add one-click blur/redact action
- [ ] E3. Add before/after preview
- [ ] E4. Add download safe image
- [ ] E5. Add watermark: `VittSakhi Verified - Safe to Share`

### Phase F: Bridge Between Chat and Scanner

- [ ] F1. Trigger scanner suggestion from chat intent (`document`, `Aadhaar`, `send`)
- [ ] F2. After scan, auto-generate Gujarati explanation in chat
- [ ] F3. Add scan result summary card inside chat
- [ ] F4. Add follow-up CTA: `Blur karo` / `Share nahi karvanu`

### Phase G: Audit, History, and Trust

- [ ] G1. Save scan metadata (timestamp, risk level, fields found)
- [ ] G2. Build history screen
- [ ] G3. Add filters: date, risk, document type
- [ ] G4. Add export/delete history actions

### Phase H: Quality and Release

- [ ] H1. Add lint-clean baseline (`npm run lint`)
- [ ] H2. Add API contract docs for frontend-backend integration
- [ ] H3. Add error monitoring logs for backend failures
- [ ] H4. Add responsive polish for mobile-first UX
- [ ] H5. Prepare demo script and screenshots for judges

---

## 4. Recommended Sprint Order

1. Sprint 1: A + B (stable chatbot baseline)
2. Sprint 2: C + F (strong safety guidance + chat intelligence)
3. Sprint 3: D (scanner MVP)
4. Sprint 4: E + G (redaction + history)
5. Sprint 5: H (quality, polish, launch/demo)

---

## 5. Weekly Management Template

Copy this every week.

### This Week
- Goal:
- Tasks:
  - [ ]
  - [ ]
  - [ ]
- Risks/Blockers:
- Owner:
- Deadline:

### End of Week Review
- Completed:
- Not Completed:
- Why blocked:
- Carry forward:

---

## 6. Local Run Commands

```bash
# frontend
npm run dev:frontend

# backend
npm run dev:backend

# lint
npm run lint
```

Backend expected startup logs:
- `Loaded X env vars from .env.local`
- `Backend server running at http://localhost:5000`
- `Using Groq API with key: Loaded`

---

## 7. Next 3 Priority Tasks

- [ ] Add `.env.local.example`
- [ ] Add chat topic cards with guided flows
- [ ] Build scanner MVP endpoint + UI upload