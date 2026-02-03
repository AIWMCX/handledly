// AI Chat Edge Function Validation Tests
// Tests that malformed requests are properly rejected with helpful error messages

import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assertEquals, assertExists } from "https://deno.land/std@0.224.0/assert/mod.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;

const AI_CHAT_URL = `${SUPABASE_URL}/functions/v1/ai-chat`;

async function makeRequest(body: unknown, expectSuccess = false) {
  const response = await fetch(AI_CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
      "apikey": SUPABASE_ANON_KEY,
    },
    body: JSON.stringify(body),
  });
  
  const data = await response.json();
  return { status: response.status, data };
}

Deno.test("ai-chat: rejects empty body", async () => {
  const response = await fetch(AI_CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
      "apikey": SUPABASE_ANON_KEY,
    },
    body: "",
  });
  
  const data = await response.json();
  assertEquals(response.status, 400);
  assertExists(data.error);
});

Deno.test("ai-chat: rejects missing message field", async () => {
  const { status, data } = await makeRequest({
    conversationHistory: [],
    sessionId: "test-session-123",
  });
  
  assertEquals(status, 400);
  assertExists(data.error);
  assertExists(data.details);
  assertEquals(data.details.some((d: string) => d.includes("message")), true);
});

Deno.test("ai-chat: rejects empty message", async () => {
  const { status, data } = await makeRequest({
    message: "",
    conversationHistory: [],
    sessionId: "test-session-123",
  });
  
  assertEquals(status, 400);
  assertExists(data.error);
  assertExists(data.details);
});

Deno.test("ai-chat: rejects message that is too long", async () => {
  const longMessage = "a".repeat(10001); // Over 10000 char limit
  
  const { status, data } = await makeRequest({
    message: longMessage,
    conversationHistory: [],
    sessionId: "test-session-123",
  });
  
  assertEquals(status, 400);
  assertExists(data.error);
});

Deno.test("ai-chat: rejects XSS patterns in message", async () => {
  const { status, data } = await makeRequest({
    message: "<script>alert('xss')</script>",
    conversationHistory: [],
    sessionId: "test-session-123",
  });
  
  assertEquals(status, 400);
  assertExists(data.error);
  assertExists(data.details);
});

Deno.test("ai-chat: rejects invalid conversationHistory format", async () => {
  const { status, data } = await makeRequest({
    message: "Hello",
    conversationHistory: "not-an-array",
    sessionId: "test-session-123",
  });
  
  assertEquals(status, 400);
  assertExists(data.error);
  assertExists(data.details);
});

Deno.test("ai-chat: rejects conversation with invalid role", async () => {
  const { status, data } = await makeRequest({
    message: "Hello",
    conversationHistory: [
      { role: "hacker", content: "invalid role" }
    ],
    sessionId: "test-session-123",
  });
  
  assertEquals(status, 400);
  assertExists(data.error);
});

Deno.test("ai-chat: rejects too many conversation messages", async () => {
  const tooManyMessages = Array(25).fill({ role: "user", content: "test" }); // Over 20 limit
  
  const { status, data } = await makeRequest({
    message: "Hello",
    conversationHistory: tooManyMessages,
    sessionId: "test-session-123",
  });
  
  assertEquals(status, 400);
  assertExists(data.error);
});

Deno.test("ai-chat: accepts valid request", async () => {
  const { status, data } = await makeRequest({
    message: "What are your hours?",
    conversationHistory: [
      { role: "assistant", content: "Hi! How can I help?" }
    ],
    sessionId: "test-session-valid",
  });
  
  // Should succeed (200) or hit rate limit (429)
  assertEquals(status === 200 || status === 429, true);
  if (status === 200) {
    assertExists(data.response);
    assertExists(data.sessionId);
  }
});
