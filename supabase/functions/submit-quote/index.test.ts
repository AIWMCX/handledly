// Submit Quote Edge Function Validation Tests
// Tests that malformed requests are properly rejected with helpful error messages

import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assertEquals, assertExists } from "https://deno.land/std@0.224.0/assert/mod.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;

const SUBMIT_QUOTE_URL = `${SUPABASE_URL}/functions/v1/submit-quote`;

async function makeRequest(body: unknown) {
  const response = await fetch(SUBMIT_QUOTE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
      "apikey": SUPABASE_ANON_KEY,
    },
    body: JSON.stringify(body),
  });
  
  const text = await response.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = { raw: text };
  }
  return { status: response.status, data };
}

Deno.test("submit-quote: rejects empty body", async () => {
  const response = await fetch(SUBMIT_QUOTE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
      "apikey": SUPABASE_ANON_KEY,
    },
    body: "",
  });
  
  await response.text(); // Consume body
  // Empty body should return 400 or 500 (not 200/201)
  assertEquals(response.status >= 400, true);
});

Deno.test("submit-quote: rejects missing required fields", async () => {
  const { status, data } = await makeRequest({
    fullName: "Test User",
    // Missing email, phone, serviceType
  });
  
  assertEquals(status, 400);
  assertExists(data.error);
});

Deno.test("submit-quote: rejects invalid email format", async () => {
  const { status, data } = await makeRequest({
    fullName: "Test User",
    email: "not-an-email",
    phone: "3035551234",
    serviceType: "local-moving",
  });
  
  assertEquals(status, 400);
  assertExists(data.error);
});

Deno.test("submit-quote: rejects invalid phone format", async () => {
  const { status, data } = await makeRequest({
    fullName: "Test User",
    email: "test@example.com",
    phone: "12345", // Too short
    serviceType: "local-moving",
  });
  
  assertEquals(status, 400);
  assertExists(data.error);
});

Deno.test("submit-quote: rejects XSS in name field", async () => {
  const { status, data } = await makeRequest({
    fullName: "<script>alert('xss')</script>",
    email: "test@example.com",
    phone: "3035551234",
    serviceType: "local-moving",
  });
  
  assertEquals(status, 400);
  assertExists(data.error);
});

Deno.test("submit-quote: rejects name that is too long", async () => {
  const longName = "a".repeat(201); // Over 200 char limit
  
  const { status, data } = await makeRequest({
    fullName: longName,
    email: "test@example.com",
    phone: "3035551234",
    serviceType: "local-moving",
  });
  
  assertEquals(status, 400);
  assertExists(data.error);
});

Deno.test("submit-quote: rejects invalid bedrooms value", async () => {
  const { status, data } = await makeRequest({
    fullName: "Test User",
    email: "test@example.com",
    phone: "3035551234",
    serviceType: "local-moving",
    bedrooms: 100, // Over max limit (20)
  });
  
  assertEquals(status, 400);
  assertExists(data.error);
});

Deno.test("submit-quote: accepts valid request", async () => {
  const { status, data } = await makeRequest({
    fullName: "Test Valid User",
    email: `test-${Date.now()}@example.com`,
    phone: "3035551234",
    serviceType: "local-moving",
    moveFromAddress: "Denver, CO",
    moveToAddress: "Boulder, CO",
    bedrooms: 2,
  });
  
  // Should succeed (200/201) or hit rate limit (429) - not validation error (400)
  if (status === 400) {
    console.log("Validation failed:", data);
  }
  assertEquals(status === 200 || status === 201 || status === 429, true, 
    `Expected success or rate limit, got ${status}`);
});
