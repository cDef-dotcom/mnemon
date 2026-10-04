import { generateObject } from 'ai';
import { z } from 'zod';
import { getExtractionModel } from './client';
import { PresetQuestion } from '@/lib/sommelier-preset';

export const GeneratedQuestionSchema = z.object({
  id: z.string(),
  knowledgeNodeId: z.string(),
  type: z.enum(['multiple_choice', 'fill_blank', 'typed_recall', 'matching', 'ordering', 'true_false']),
  prompt: z.string().describe('Clear, unambiguous test question'),
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
      prompt: `Generate 10 scored assessment questions for the lesson titled "${lessonTitle}".

Target Knowledge Nodes to test:
${JSON.stringify(nodes, null, 2)}

Requirements:
1. Generate exactly 10 questions total.
2. Mix multiple choice, fill-in-the-blank, typed recall, and true/false formats.
3. Every correct answer MUST be verifiable from the sourceChunk text.
4. For multiple choice, distractors must be plausible but definitively incorrect per the source text.`,
    });

    return object.questions as PresetQuestion[];
  } catch (error) {
    console.error('[Mnemon AI] Question generation error:', error);
    const causeMsg = error instanceof Error ? error.message : '';
    // Distinguish our own request-shape bugs from key/network problems
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
