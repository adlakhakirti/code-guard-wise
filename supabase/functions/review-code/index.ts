import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SEVERITY_GUIDANCE = `
Each finding MUST include a severity level, a context tag, and a confidence indicator. Use this 4-tier severity system:
- "critical": Direct data exposure, compliance violation, or active security vulnerability (SQL injection, hardcoded credentials, GDPR/HIPAA violation, no encryption).
- "high": Security vulnerability that creates significant risk but doesn't immediately expose data (violation of least privilege, no audit trail, zero-trust violation).
- "medium": Code quality or architectural issues that create risk over time (no error handling, connection not closed, missing documentation, generic SELECT *).
- "low": Best practice recommendations (missing type hints, no return type documentation).

Each finding must include a "context" field:
- "kiteworks" — security-company-specific concerns (SQL injection, hardcoded credentials, least privilege, audit trail, GDPR/HIPAA, encryption, zero-trust, data minimization)
- "general" — standard code quality or best practice issues (error handling, connection management, SELECT *, type hints, documentation)

Each finding must include a "confidence" field:
- "high" — The issue is definitively visible in the code shown. No ambiguity. Examples: f-string SQL injection, plaintext credentials, missing try/catch, no close() call, visible SELECT *, missing type hints.
- "needs_review" — The issue may depend on context outside the code snippet (middleware, infrastructure, gateway layers). Examples: audit logging might exist elsewhere, TLS might be at infra level, auth might be in a gateway, SELECT * might be intentional.

Return findings as: { "severity": "critical"|"high"|"medium"|"low", "context": "kiteworks"|"general", "confidence": "high"|"needs_review", "text": "description" }
The section-level "badge" should equal the HIGHEST severity found among that section's findings.`;

const GENERIC_SYSTEM = `You are a code review assistant. Review the provided code for quality, potential bugs, and general best practices.
${SEVERITY_GUIDANCE}
Return a JSON response with this structure:
{
  "quality": { "badge": "critical"|"high"|"medium"|"low", "findings": [{"severity":"medium","context":"general","confidence":"high","text":"finding"}] },
  "security": { "badge": "critical"|"high"|"medium"|"low", "findings": [{"severity":"high","context":"kiteworks","confidence":"needs_review","text":"finding"}] },
  "compliance": { "badge": "critical"|"high"|"medium"|"low", "findings": [{"severity":"low","context":"general","confidence":"high","text":"finding"}] }
}
Keep findings concise — one sentence each, maximum 4 per section. Do not return anything outside this JSON.`;

const SECURITY_SYSTEM = `You are a security-aware code review assistant for Kiteworks — an enterprise data security company with FedRAMP authorization serving banks, law firms, and government agencies. Every function that touches data must meet the following standards:
- Zero-trust: no implicit trust, every access must be explicitly authorized and logged
- Data encryption: sensitive data encrypted at rest and in transit using AES-256
- Audit trail: every data access must generate an immutable log entry
- Least privilege: functions must request only the minimum data access required
- No hardcoded credentials: all secrets via vault
- SQL injection prevention: parameterized queries only
- GDPR/HIPAA awareness: flag any PII or PHI handling that lacks proper controls

Review the provided code against these standards.
${SEVERITY_GUIDANCE}
Return a JSON response with this structure:
{
  "quality": { "badge": "critical"|"high"|"medium"|"low", "findings": [{"severity":"medium","context":"general","confidence":"high","text":"finding"}] },
  "security": { "badge": "critical"|"high"|"medium"|"low", "findings": [{"severity":"critical","context":"kiteworks","confidence":"high","text":"finding"}] },
  "compliance": { "badge": "critical"|"high"|"medium"|"low", "findings": [{"severity":"high","context":"kiteworks","confidence":"needs_review","text":"finding"}] }
}
In the security and compliance sections, be specific about which Kiteworks standard is violated and what the remediation should be. Maximum 4 findings per section. Do not return anything outside this JSON.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { code, securityAware } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = securityAware ? SECURITY_SYSTEM : GENERIC_SYSTEM;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Review this code:\n\n${code}` },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited — please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Credits exhausted — please add funds." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiData = await response.json();
    let content = aiData.choices?.[0]?.message?.content || "";
    content = content.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      const retry = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `Review this code. Return ONLY valid JSON, no markdown fences:\n\n${code}` },
          ],
        }),
      });
      const retryData = await retry.json();
      let retryContent = retryData.choices?.[0]?.message?.content || "";
      retryContent = retryContent.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
      parsed = JSON.parse(retryContent);
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("review-code error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
