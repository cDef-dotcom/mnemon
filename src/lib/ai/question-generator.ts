import { generateObject } from 'ai';
import { z } from 'zod';
import { getExtractionModel } from './client';
import { PresetQuestion } from '@/lib/sommelier-preset';

export const GeneratedQuestionSchema = z.object({
  id: z.string(),
  knowledgeNodeId: z.string(),
  type: z.enum(['multiple_choice', 'fill_blank', 'typed_recall', 'matching', 'ordering', 'true_false']),
  prompt: z.string().describe('Clear, unambiguous test question testing high-yield recall (e.g. recipe ingredients, ratios, methods)'),
  expectedAnswer: z.string().describe('The strictly correct answer derived from source'),
  acceptableVariants: z.array(z.string()).nullable().describe('Acceptable synonyms or variations'),
  distractors: z.array(z.object({ text: z.string() })).nullable(),
  difficulty: z.number().min(1).max(5),
  groundingChunk: z.string().describe('Source text excerpt supporting the expected answer'),
});

export const LessonQuestionsSchema = z.object({
  questions: z.array(GeneratedQuestionSchema),
});

export async function generateQuestionsForLesson(
  lessonTitle: string,
  nodes: Array<{ id: string; content: string; detail?: string | null; sourceChunk: string }>
): Promise<PresetQuestion[]> {
  const model = getExtractionModel();

  if (!model) {
    throw new Error(
      'OpenAI is not configured. Add your OPENAI_API_KEY to .env.local and restart the dev server.'
    );
  }

  try {
    const { object } = await generateObject({
      model,
      schema: LessonQuestionsSchema,
      prompt: `You are generating a 10-question active recall test for the lesson: "${lessonTitle}".

Target Knowledge Nodes:
${JSON.stringify(nodes, null, 2)}

Requirements for High-Yield Testing:
1. Generate exactly 10 questions total.
2. Focus questions on PRACTICAL, ACTIONABLE RECALL:
   - For recipes/drinks: Test base spirits, specific modifiers, measurements, ratios, methods (shaken vs stirred), and garnishes. (e.g. "What is the primary spirit in a Daiquiri?", "What liqueur gives an Aviation its violet hue?", "What are the equal parts in a Negroni?").
   - For procedures: Test step sequence, critical rules, and differences between similar items.
3. Mix formats: Multiple choice, fill-in-the-blank, typed recall, and true/false.
4. For multiple choice: Create realistic, plausible distractors (e.g. real substitute liquors or ingredients) that test genuine comprehension rather than obvious giveaways.
5. Every correct answer MUST be verifiable from the sourceChunk text.`,
    });

    return object.questions as PresetQuestion[];
  } catch (error) {
    console.error('[Mnemon AI] Question generation error:', error);
    const causeMsg = error instanceof Error ? error.message : '';
    if (/invalid_json_schema|invalid schema/i.test(causeMsg)) {
      throw new Error(
        'Question generation failed due to an app formatting issue, not your API key. Check the server terminal log for details.'
      );
    }
    throw new Error(
      'Could not reach OpenAI to generate questions. Check your API key and connection, then try again.'
    );
  }
}
