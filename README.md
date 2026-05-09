# CodeGuard AI

An LLM-powered code review prototype built as an interview artifact for 
Kiteworks (Senior PM, AI Platforms). The goal: demonstrate how I'd approach 
the product surface for an enterprise-grade AI code reviewer in a regulated, 
security-first environment.

## What it does

Paste code → get a structured review across three dimensions:

- **Quality** — bugs, missing error handling, code smells
- **Security** — injection risks, hardcoded credentials, encryption gaps
- **Compliance** — audit trail, least privilege, GDPR/HIPAA awareness

A toggle switches between a generic system prompt and a Kiteworks-aware 
system prompt that grades code against Kiteworks' specific standards 
(zero-trust, AES-256 at rest and in transit, immutable audit logs, 
parameterized queries, no hardcoded credentials, PII/PHI flagging).

## The PM decisions worth pointing at

Three design choices that came out of thinking about what makes an AI 
code reviewer trustworthy in a regulated environment:

**1. Four-tier severity, not binary pass/fail.**  
Critical / high / medium / low. The section-level badge rolls up to the 
highest severity found. This forces the reviewer (human or AI) to 
prioritize, and it gives engineers a defensible signal for what to fix 
now vs later.

**2. Context tags on every finding.**  
Each finding is tagged `kiteworks` (security-company-specific concern) or 
`general` (standard best practice). This separates "this violates *our* 
standards" from "this is a code smell" — a distinction that matters when 
the same finding might be acceptable at one customer and a blocker at 
another.

**3. Confidence indicators with a `needs_review` tier.**  
Some findings are definitive ("this f-string is SQL injection"). Others 
depend on context outside the code snippet — auth might be in a gateway, 
TLS might be at the infra layer, audit logging might exist in middleware. 
The model is instructed to flag these as `needs_review` rather than assert 
them as findings. This is the autonomous-vs-handback pattern: the AI 
makes the call when it's confident, defers to a human when it isn't. It's 
the same pattern I shipped at RBC for LLM-augmented quality scoring with 
confidence-thresholded human-in-the-loop escalation.

## Stack

- **Frontend:** Vite + React + TypeScript + Tailwind + shadcn/ui
- **Backend:** Supabase Edge Functions (Deno)
- **LLM:** Gemini via Lovable's AI gateway
- **Built with:** Lovable, Cursor

## Architecture
