// Trigger Confirmation Call Edge Function Validation Tests
// Tests that malformed requests are properly rejected with helpful error messages

import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assertEquals, assertExists } from "https://deno.land/std@0.224.0/assert/mod.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;

const CALL_URL = `${SUPABASE_URL}/functions/v1/trigger-confirmation-call`;

async function makeRequest(body: unknown) {
  const response = await fetch(CALL_URL, {
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

Deno.test("trigger-call: rejects empty body", async () => {
  const response = await fetch(CALL_URL, {
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

Deno.test("trigger-call: rejects missing required fields", async () => {
  const { status, data } = await makeRequest({
    leadId: "test-lead-123",
    // Missing customerName, phone, email, etc.
  });
  
  assertEquals(status, 400);
  assertExists(data.error);
  assertExists(data.details);
});

Deno.test("trigger-call: rejects invalid email format", async () => {
  const { status, data } = await makeRequest({
    leadId: "test-lead-123",
    customerName: "Test User",
    phone: "3035551234",
    email: "not-an-email",
    serviceType: "local-moving",
    totalQuote: 500,
    crewSize: 2,
    estimatedHours: 3,
  });
  
  assertEquals(status, 400);
  assertExists(data.error);
  assertExists(data.details);
  assertEquals(data.details.some((d: string) => d.includes("email")), true);
});

Deno.test("trigger-call: rejects invalid phone format", async () => {
  const { status, data } = await makeRequest({
    leadId: "test-lead-123",
    customerName: "Test User",
    phone: "12345", // Too short
    email: "test@example.com",
    serviceType: "local-moving",
    totalQuote: 500,
    crewSize: 2,
    estimatedHours: 3,
  });
  
  assertEquals(status, 400);
  assertExists(data.error);
});

Deno.test("trigger-call: rejects non-US phone numbers", async () => {
  const { status, data } = await makeRequest({
    leadId: "test-lead-123",
    customerName: "Test User",
    phone: "+447700900000", // UK number
    email: "test@example.com",
    serviceType: "local-moving",
    totalQuote: 500,
    crewSize: 2,
    estimatedHours: 3,
  });
  
  assertEquals(status, 400);
  assertExists(data.error);
  assertExists(data.details);
});

Deno.test("trigger-call: rejects XSS in customer name", async () => {
  const { status, data } = await makeRequest({
    leadId: "test-lead-123",
    customerName: "<script>alert('xss')</script>",
    phone: "3035551234",
    email: "test@example.com",
    serviceType: "local-moving",
    totalQuote: 500,
    crewSize: 2,
    estimatedHours: 3,
  });
  
  assertEquals(status, 400);
  assertExists(data.error);
});

Deno.test("trigger-call: rejects invalid totalQuote (negative)", async () => {
  const { status, data } = await makeRequest({
    leadId: "test-lead-123",
    customerName: "Test User",
    phone: "3035551234",
    email: "test@example.com",
    serviceType: "local-moving",
    totalQuote: -100, // Negative value
    crewSize: 2,
    estimatedHours: 3,
  });
  
  assertEquals(status, 400);
  assertExists(data.error);
});

Deno.test("trigger-call: rejects invalid crewSize", async () => {
  const { status, data } = await makeRequest({
    leadId: "test-lead-123",
    customerName: "Test User",
    phone: "3035551234",
    email: "test@example.com",
    serviceType: "local-moving",
    totalQuote: 500,
    crewSize: 100, // Unrealistic crew size
    estimatedHours: 3,
  });
  
  assertEquals(status, 400);
  assertExists(data.error);
});

Deno.test("trigger-call: rejects invalid estimatedHours", async () => {
  const { status, data } = await makeRequest({
    leadId: "test-lead-123",
    customerName: "Test User",
    phone: "3035551234",
    email: "test@example.com",
    serviceType: "local-moving",
    totalQuote: 500,
    crewSize: 2,
    estimatedHours: 0, // Zero hours
  });
  
  assertEquals(status, 400);
  assertExists(data.error);
});

Deno.test("trigger-call: rejects name that is too long", async () => {
  const longName = "a".repeat(201);
  
  const { status, data } = await makeRequest({
    leadId: "test-lead-123",
    customerName: longName,
    phone: "3035551234",
    email: "test@example.com",
    serviceType: "local-moving",
    totalQuote: 500,
    crewSize: 2,
    estimatedHours: 3,
  });
  
  assertEquals(status, 400);
  assertExists(data.error);
});
