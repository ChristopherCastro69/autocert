import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "../route";
import { NextRequest } from "next/server";

const mockCreate = vi.fn();

vi.mock("@/lib/groq", () => ({
  getGroqClient: () => ({
    chat: {
      completions: {
        create: mockCreate,
      },
    },
  }),
}));

function makeRequest(body: object): NextRequest {
  return new NextRequest("http://localhost:3000/api/map-columns", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

describe("POST /api/map-columns", () => {
  beforeEach(() => {
    mockCreate.mockReset();
  });

  it("returns mapped columns on success", async () => {
    mockCreate.mockResolvedValue({
      choices: [
        {
          message: {
            content: JSON.stringify({
              firstName: "First Name",
              lastName: "Last Name",
              email: "Email",
              fullName: null,
              confidence: 0.95,
            }),
          },
        },
      ],
    });

    const req = makeRequest({
      headers: ["First Name", "Last Name", "Email"],
      sampleRows: [
        { "First Name": "Alice", "Last Name": "Smith", Email: "alice@test.com" },
      ],
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.mapping.firstName).toBe("First Name");
    expect(data.mapping.email).toBe("Email");
    expect(data.confidence).toBe(0.95);
  });

  it("returns 400 when headers are missing", async () => {
    const req = makeRequest({ headers: [], sampleRows: [] });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe("No headers provided");
  });

  it("returns 500 when Groq API throws", async () => {
    mockCreate.mockRejectedValue(new Error("API rate limit exceeded"));

    const req = makeRequest({
      headers: ["Name", "Email"],
      sampleRows: [{ Name: "Alice", Email: "alice@test.com" }],
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.error).toBe("API rate limit exceeded");
  });

  it("returns 500 when LLM returns no content", async () => {
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: null } }],
    });

    const req = makeRequest({
      headers: ["Name"],
      sampleRows: [{ Name: "Alice" }],
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.error).toBe("No response from LLM");
  });
});
