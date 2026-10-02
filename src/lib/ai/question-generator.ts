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
  acceptableVariants: z.array(z.string()).optional().describe('Acceptable synonyms or variations'),
  distractors: z.array(z.object({ text: z.string(), misconceptionReason: z.string().optional() })).optional(),
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
    console.warn('[Mnemon AI] OPENAI_API_KEY not configured. Generating fallback questions.');
    return generateFallbackQuestions(nodes);
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
    console.error('[Mnemon AI] Question generation error, using fallback:', error);
    return generateFallbackQuestions(nodes);
  }
}

function generateFallbackQuestions(
  nodes: Array<{ id: string; content: string; sourceChunk: string }>
): PresetQuestion[] {
  return nodes.slice(0, 5).flatMap((node, idx) => [
    {
      id: `fallback-q-${idx}-1`,
      knowledgeNodeId: node.id,
      type: 'multiple_choice' as const,
      prompt: `Regarding: ${node.content.slice(0, 80)}... which statement is true?`,
      expectedAnswer: node.content.slice(0, 100),
      distractors: [
        { text: 'The opposite of the stated facts' },
        { text: 'Unrelated technical assertion' },
        { text: 'Partially correct but inverted' },
      ],
      difficulty: 2,
      groundingChunk: node.sourceChunk,
    },
    {
      id: `fallback-q-${idx}-2`,
      knowledgeNodeId: node.id,
      type: 'typed_recall' as const,
      prompt: `Recall key detail for: ${node.content.slice(0, 60)}`,
      expectedAnswer: node.content.split(' ')[0] || 'correct',
      acceptableVariants: [node.content.split(' ')[0] || 'correct'],
      difficulty: 3,
      groundingChunk: node.sourceChunk,
    },
  ]).slice(0, 10);
}
