import { streamText, convertToModelMessages } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import type { UIMessage } from "ai";

const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT = `Eres el asistente de Startupven. Respondes en español, de forma clara y breve.
Startupven ofrece servicios de arquitectura digital en tres niveles: Launch (validar ideas y presencia digital), Build (editor visual, CMS, ecommerce) y Scale (sistemas a medida, SaaS).
Si preguntan por precios o plazos, indica que depende del proyecto y que pueden contactar para una propuesta concreta.`;

export async function POST(req: Request) {
  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey) {
    return Response.json(
      { error: "No está configurada la API key de OpenAI." },
      { status: 500 }
    );
  }

  let body: { messages?: UIMessage[] };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Cuerpo inválido" }, { status: 400 });
  }

  const messages = Array.isArray(body.messages) ? body.messages : [];
  const modelMessages = await convertToModelMessages(messages);

  const result = streamText({
    model: openai("gpt-4o-mini"),
    system: SYSTEM_PROMPT,
    messages: modelMessages,
  });

  return result.toUIMessageStreamResponse();
}
