// AI Chat PII Filtering Tests
// Verifies that sensitive financial information is blocked from chat

import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assertEquals, assertExists } from "https://deno.land/std@0.224.0/assert/mod.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;

const AI_CHAT_URL = `${SUPABASE_URL}/functions/v1/ai-chat`;

async function makeRequest(body: unknown) {
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

Deno.test("ai-chat: rejects messages with Visa credit card numbers", async () => {
  const { status, data } = await makeRequest({
    message: "My card number is 4111111111111111 for payment",
    conversationHistory: [],
    sessionId: "test-pii-visa",
  });
  
  assertEquals(status, 400);
  assertExists(data.error);
  assertEquals(data.details?.some((d: string) => d.includes("sensitive financial")), true);
});

Deno.test("ai-chat: rejects messages with MasterCard numbers", async () => {
  const { status, data } = await makeRequest({
    message: "Please charge 5500000000000004 for my move",
    conversationHistory: [],
    sessionId: "test-pii-mc",
  });
  
  assertEquals(status, 400);
  assertExists(data.error);
});

Deno.test("ai-chat: rejects messages with formatted credit card numbers", async () => {
  const { status, data } = await makeRequest({
    message: "Card: 4111-1111-1111-1111 exp 12/26",
    conversationHistory: [],
    sessionId: "test-pii-formatted-cc",
  });
  
  assertEquals(status, 400);
  assertExists(data.error);
});

Deno.test("ai-chat: rejects messages with SSN", async () => {
  const { status, data } = await makeRequest({
    message: "My social security is 123-45-6789",
    conversationHistory: [],
    sessionId: "test-pii-ssn",
  });
  
  assertEquals(status, 400);
  assertExists(data.error);
});

Deno.test("ai-chat: rejects messages with SSN without dashes", async () => {
  const { status, data } = await makeRequest({
    message: "SSN 123 45 6789 for verification",
    conversationHistory: [],
    sessionId: "test-pii-ssn-spaces",
  });
  
  assertEquals(status, 400);
  assertExists(data.error);
});

Deno.test("ai-chat: allows normal messages without PII", async () => {
  const { status, data } = await makeRequest({
    message: "I need help moving a 2-bedroom apartment from Denver to Boulder on March 15th",
    conversationHistory: [],
    sessionId: "test-normal-message",
  });
  
  // Should succeed (200) or hit rate limit (429) - not validation error
  assertEquals(status === 200 || status === 429, true, `Expected 200 or 429, got ${status}`);
  if (status === 200) {
    assertExists(data.response);
  }
});

Deno.test("ai-chat: allows phone numbers (not PII)", async () => {
  const { status, data } = await makeRequest({
    message: "My phone number is 303-555-1234",
    conversationHistory: [],
    sessionId: "test-phone-ok",
  });
  
  // Phone numbers are allowed in chat
  assertEquals(status === 200 || status === 429, true);
});
