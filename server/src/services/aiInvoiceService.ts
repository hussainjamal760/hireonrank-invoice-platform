import Groq from 'groq-sdk';

export interface AIParsedInvoice {
  client: string;
  items: { name: string; price: number }[];
  total: number;
}

const SYSTEM_PROMPT = `You are an invoice data extractor. Given a natural language description, extract structured invoice data.

RULES:
1. Extract the client/company name. If none mentioned, use "General Client".
2. Extract each item/service with its price.
3. Calculate the total as the sum of all item prices.
4. Return ONLY valid JSON, no markdown, no explanation, no extra text.

OUTPUT FORMAT (strict JSON only):
{
  "client": "Client Name",
  "items": [
    { "name": "Service description", "price": 500 },
    { "name": "Another service", "price": 50 }
  ],
  "total": 550
}

IMPORTANT:
- Prices must be numbers (not strings).
- Total must equal the exact sum of all item prices.
- Do NOT wrap in markdown code blocks.
- Output ONLY the JSON object, nothing else.`;

/**
 * Calls Groq API to parse natural language into structured invoice data.
 * Retries once on invalid JSON, then throws.
 */
export async function parseInvoiceText(text: string): Promise<AIParsedInvoice> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('GROQ_API_KEY is not configured. Please add it to your .env file.');
  }

  const groq = new Groq({ apiKey });

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const chatCompletion = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: text }
        ],
        model: 'llama-3.1-8b-instant',
        temperature: 0.2,
        max_tokens: 1024,
      });

      const rawOutput = chatCompletion.choices[0]?.message?.content?.trim();
      if (!rawOutput) {
        throw new Error('AI returned empty response');
      }

      // Strip markdown code fences if the model wraps output
      const cleanOutput = rawOutput
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim();

      const parsed = JSON.parse(cleanOutput);

      // Validate schema
      const validated = validateInvoiceSchema(parsed);
      return validated;
    } catch (err: any) {
      lastError = err;
      // On first attempt, retry
      if (attempt === 0) {
        console.warn(`AI invoice parse attempt ${attempt + 1} failed: ${err.message}. Retrying...`);
        continue;
      }
    }
  }

  throw new Error(`Failed to parse invoice from AI after 2 attempts: ${lastError?.message || 'Unknown error'}`);
}

/**
 * Validates the AI output matches the expected schema.
 * Ensures total = sum(items.price) and sanitizes all fields.
 */
function validateInvoiceSchema(data: any): AIParsedInvoice {
  if (!data || typeof data !== 'object') {
    throw new Error('AI output is not a valid object');
  }

  // Validate client
  const client = typeof data.client === 'string' && data.client.trim()
    ? data.client.trim()
    : 'General Client';

  // Validate items
  if (!Array.isArray(data.items) || data.items.length === 0) {
    throw new Error('AI output has no items');
  }

  const items = data.items.map((item: any, index: number) => {
    const name = typeof item.name === 'string' && item.name.trim()
      ? item.name.trim()
      : `Item ${index + 1}`;

    const price = typeof item.price === 'number' ? item.price : parseFloat(item.price);
    if (isNaN(price) || price < 0) {
      throw new Error(`Item "${name}" has invalid price`);
    }

    return { name, price: Math.round(price * 100) / 100 };
  });

  // Validate total = sum of items
  const calculatedTotal = items.reduce((sum: number, item: { price: number }) => sum + item.price, 0);
  const roundedTotal = Math.round(calculatedTotal * 100) / 100;

  return {
    client,
    items,
    total: roundedTotal
  };
}
