import { NextRequest, NextResponse } from "next/server";
import { getGroqClient } from "@/lib/groq";
import { GROQ_MODEL, GROQ_TEMPERATURE } from "@/lib/constants";
import { verifyAuth, isAuthError } from "@/lib/auth";
import type { MapColumnsRequest, MapColumnsResponse, MappingResult } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuth();
    if (isAuthError(auth)) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body: MapColumnsRequest = await request.json();
    const { headers, sampleRows } = body;

    if (!headers?.length) {
      return NextResponse.json({ error: "No headers provided" }, { status: 400 });
    }

    const groq = getGroqClient();

    const systemPrompt = `You are a data column mapping assistant. Given column headers and sample rows from a spreadsheet of event attendees, map them to these fields:
- firstName: The column containing first names
- lastName: The column containing last names
- email: The column containing email addresses
- fullName: If there's a single column with full names (instead of separate first/last), use this

Return a JSON object with these exact keys. Each value should be the original column header name that maps to it, or null if not found. Also include a "confidence" field (0-1) indicating how confident you are in the mapping.

Example output:
{"firstName": "First Name", "lastName": "Last Name", "email": "Email Address", "fullName": null, "confidence": 0.95}`;

    const userPrompt = `Headers: ${JSON.stringify(headers)}
Sample rows (first 3):
${sampleRows.slice(0, 3).map((row) => JSON.stringify(row)).join("\n")}`;

    const completion = await groq.chat.completions.create({
      model: GROQ_MODEL,
      temperature: GROQ_TEMPERATURE,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json({ error: "No response from LLM" }, { status: 500 });
    }

    const parsed = JSON.parse(content);

    const mapping: MappingResult = {
      firstName: parsed.firstName ?? null,
      lastName: parsed.lastName ?? null,
      email: parsed.email ?? null,
      fullName: parsed.fullName ?? null,
    };

    const response: MapColumnsResponse = {
      mapping,
      confidence: parsed.confidence ?? 0.5,
    };

    return NextResponse.json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
