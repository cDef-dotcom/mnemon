import { generateObject } from 'ai';
import { z } from 'zod';
import { getGradingModel } from './client';

export interface EvaluationRequest {
  prompt: string;
  expectedAnswer: string;
  acceptableVariants?: string[];
  userAnswer: string;
  groundingChunk: string;
}

export interface EvaluationResult {
  isCorrect: boolean;
  explanation: string;
  errorType?: string | null;
}

const EvaluationSchema = z.object({
  isCorrect: z.boolean().describe('True if user answer demonstrates understanding of the concept'),
  errorType: z.enum(['forgotten_fact', 'confused_terminology', 'misunderstood_concept', 'minor_typo', 'careless', 'none']).nullable(),
  explanation: z.string().describe('One concise sentence explaining why it is correct or what was wrong'),
});

export async function evaluateTypedAnswer(req: EvaluationRequest): Promise<EvaluationResult> {
  const cleanUser = req.userAnswer.trim().toLowerCase();
  const cleanExpected = req.expectedAnswer.trim().toLowerCase();
  const variants = (req.acceptableVariants || []).map((v) => v.toLowerCase());

  // 1. Deterministic check (Exact match or variant match)
  if (cleanUser === cleanExpected || variants.includes(cleanUser)) {
    return {
      isCorrect: true,
      explanation: `Correct! "${req.expectedAnswer}" matches the expected source knowledge.`,
    };
  }

  // 2. Levenshtein / Typo check for short single-word answers
  if (cleanExpected.length <= 8 && computeLevenshteinDistance(cleanUser, cleanExpected) <= 2) {
    return {
      isCorrect: true,
      explanation: `Correct! (Accepted typo match for "${req.expectedAnswer}").`,
    };
  }

  // 3. Fast LLM semantic evaluation (gpt-4o-mini)
  const model = getGradingModel();
  if (!model) {
    // Fallback if no API key
    return {
      isCorrect: false,
      explanation: `Expected: "${req.expectedAnswer}". Source: ${req.groundingChunk}`,
    };
  }

  try {
    const { object } = await generateObject({
      model,
      schema: EvaluationSchema,
      prompt: `You are an expert tutor evaluating a learner's free-recall response. Be generous: if the user's response demonstrates they know the core concept, mark it correct even if phrasing differs.

Question Prompt: "${req.prompt}"
Expected Answer: "${req.expectedAnswer}"
Source Context: "${req.groundingChunk}"
Learner's Typed Answer: "${req.userAnswer}"

Evaluate if the response is semantically correct. Be generous with terse answers: a single keyword or short fragment that identifies the core mechanism counts as correct. For example, if the question is "Why is red wine typically red?" and the learner answers "skins", that is CORRECT because it identifies grape skins as the cause of the color. Only mark wrong when the answer misses the concept, contradicts the source, or is too vague to show any understanding (e.g. answering "wine" or "grapes" to the question above).`,
    });

    return object;
  } catch (error) {
    console.error('[Mnemon AI] Evaluation error, falling back:', error);
    return {
      isCorrect: false,
      explanation: `Expected: "${req.expectedAnswer}". Source: ${req.groundingChunk}`,
    };
  }
}

function computeLevenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          Math.min(
            matrix[i][j - 1] + 1, // insertion
            matrix[i - 1][j] + 1 // deletion
          )
        );
      }
    }
  }

  return matrix[b.length][a.length];
}
