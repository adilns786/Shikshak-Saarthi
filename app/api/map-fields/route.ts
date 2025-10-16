import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import form_llm  from "@/lib/form-llm";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    if (!message) {
      return NextResponse.json({ error: "Message is required." }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Prepare prompt for Gemini
    const prompt = `
You are an intelligent form-filling assistant.
You are given a list of form fields (with id, label, type, and sample example).
Based on the user message, identify which fields the message refers to.
Return only a valid JSON array of objects: [{"id": "...", "value": "..."}].

User Message:
"${message}"

Available Fields:
${JSON.stringify(form_llm, null, 2)}

Rules:
- Always output only valid JSON (no markdown, no text outside JSON).
- Use the sample values to determine expected format.
- If the user provides multiple details, include multiple {id, value} pairs.
- Ignore irrelevant details.
`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Try to safely parse JSON
    let jsonOutput;
    try {
      jsonOutput = JSON.parse(responseText);
    } catch {
      // fallback: try regex cleanup
      const match = responseText.match(/\[.*\]/s);
      jsonOutput = match ? JSON.parse(match[0]) : [];
    }

    return NextResponse.json({ mappings: jsonOutput });
  } catch (error: any) {
    console.error("Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
