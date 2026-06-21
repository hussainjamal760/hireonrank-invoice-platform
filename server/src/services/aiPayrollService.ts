import Groq from 'groq-sdk';

export interface AIParsedPayroll {
  employeeId: string;
  employeeName: string;
  payPeriod: string;
  baseSalary: number;
  allowances: { name: string; amount: number }[];
  bonus: number;
  grossSalary: number;
  taxDeduction: number;
  otherDeductions: number;
  totalDeductions: number;
  netSalary: number;
}

const SYSTEM_PROMPT = `You are an AI payroll generation assistant. Given:
1. Employee details.
2. Company details.
3. Employee's standard financial profile / payroll rules (base salary, standard allowances, and tax rates).
4. A natural language instruction describing payroll adjustments, bonuses, allowances, deductions, or periods.

Your task is to parse these inputs, apply adjustments to the base salary and standard rules, and generate a structured payroll JSON object.

RULES:
1. "employeeId" must match the provided employee ID exactly.
2. "employeeName" must match the provided employee Name exactly.
3. Extract the target "payPeriod" (e.g. "June 2026" or "2026-06"). Try to follow the format described in the instruction (e.g. "June 2026"). If not specified, default to the current month and year.
4. "baseSalary" must be a number. Use the base salary from the employee profile unless specifically instructed to change it.
5. "allowances" must be an array of objects, e.g. [{"name": "Transport", "amount": 15000}]. Include any standard allowances from the profile, and add/override any custom allowances described in the instruction.
6. "bonus" must be the sum of any bonuses or performance rewards mentioned in the instruction.
7. "taxDeduction" must be calculated using the tax rules from the profile (each tax rule rate is a percentage of the base salary, e.g. 10 for 10% of baseSalary), unless overridden by the instruction.
8. "otherDeductions" must capture any other deductions mentioned in the instruction (e.g., custom cuts, penalties).
9. Calculate totals as follows:
   - grossSalary = baseSalary + sum of allowance amounts + bonus
   - totalDeductions = taxDeduction + otherDeductions
   - netSalary = max(0, grossSalary - totalDeductions)
10. Return ONLY valid JSON, no markdown code fences, no explanations, no extra text.

OUTPUT FORMAT (strict JSON only):
{
  "employeeId": "string",
  "employeeName": "string",
  "payPeriod": "string",
  "baseSalary": 0,
  "allowances": [
    { "name": "Allowance Name", "amount": 0 }
  ],
  "bonus": 0,
  "grossSalary": 0,
  "taxDeduction": 0,
  "otherDeductions": 0,
  "totalDeductions": 0,
  "netSalary": 0
}
`;

/**
 * Calls Groq API to parse natural language and metadata into structured payroll data.
 * Retries once on invalid JSON, then throws.
 */
export async function parsePayrollText(
  text: string,
  employee: any,
  company: any,
  profile: any
): Promise<AIParsedPayroll> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('GROQ_API_KEY is not configured. Please add it to your .env file.');
  }

  const groq = new Groq({ apiKey });

  const inputContext = {
    employee: {
      id: employee._id.toString(),
      name: employee.name,
      email: employee.email,
      designation: employee.designation,
      department: employee.department
    },
    company: {
      name: company.name,
      address: company.address,
      country: company.country
    },
    profileRules: {
      baseSalary: profile.baseSalary,
      currency: profile.currency,
      allowances: profile.allowances || [],
      taxRules: profile.taxRules || []
    },
    instruction: text
  };

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const chatCompletion = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: JSON.stringify(inputContext) }
        ],
        model: 'llama-3.1-8b-instant',
        temperature: 0.2,
        max_tokens: 1024,
        response_format: { type: 'json_object' }
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

      // Validate calculations & schema
      const validated = validatePayrollSchema(parsed, employee._id.toString(), employee.name);
      return validated;
    } catch (err: any) {
      lastError = err;
      if (attempt === 0) {
        console.warn(`AI payroll parse attempt ${attempt + 1} failed: ${err.message}. Retrying...`);
        continue;
      }
    }
  }

  throw new Error(`Failed to generate payroll from AI after 2 attempts: ${lastError?.message || 'Unknown error'}`);
}

/**
 * Validates calculations and schema matching the required output format.
 */
function validatePayrollSchema(data: any, expectedId: string, expectedName: string): AIParsedPayroll {
  if (!data || typeof data !== 'object') {
    throw new Error('AI output is not a valid object');
  }

  const baseSalary = typeof data.baseSalary === 'number' ? data.baseSalary : parseFloat(data.baseSalary || 0);
  const bonus = typeof data.bonus === 'number' ? data.bonus : parseFloat(data.bonus || 0);

  // Validate allowances array
  const allowances: { name: string; amount: number }[] = [];
  if (Array.isArray(data.allowances)) {
    for (const item of data.allowances) {
      if (item && typeof item === 'object') {
        const name = typeof item.name === 'string' && item.name.trim() ? item.name.trim() : 'Allowance';
        const amount = typeof item.amount === 'number' ? item.amount : parseFloat(item.amount || 0);
        allowances.push({ name, amount: Math.max(0, amount) });
      }
    }
  }

  const totalAllowances = allowances.reduce((sum, a) => sum + a.amount, 0);

  const taxDeduction = typeof data.taxDeduction === 'number' ? data.taxDeduction : parseFloat(data.taxDeduction || 0);
  const otherDeductions = typeof data.otherDeductions === 'number' ? data.otherDeductions : parseFloat(data.otherDeductions || 0);

  // Re-calculate fields to enforce calculations validation (Step 7)
  const grossSalary = Math.round((baseSalary + totalAllowances + bonus) * 100) / 100;
  const totalDeductions = Math.round((taxDeduction + otherDeductions) * 100) / 100;
  const netSalary = Math.max(0, Math.round((grossSalary - totalDeductions) * 100) / 100);

  return {
    employeeId: expectedId, // Database Rule: Never create/change employee, always use selection
    employeeName: expectedName,
    payPeriod: typeof data.payPeriod === 'string' && data.payPeriod.trim() ? data.payPeriod.trim() : new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
    baseSalary: Math.round(baseSalary * 100) / 100,
    allowances,
    bonus: Math.round(bonus * 100) / 100,
    grossSalary,
    taxDeduction: Math.round(taxDeduction * 100) / 100,
    otherDeductions: Math.round(otherDeductions * 100) / 100,
    totalDeductions,
    netSalary
  };
}
