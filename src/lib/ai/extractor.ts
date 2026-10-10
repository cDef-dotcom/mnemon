import { generateObject } from 'ai';
import { z } from 'zod';
import { getExtractionModel } from './client';

export const KnowledgeNodeSchema = z.object({
  id: z.string(),
  type: z.enum([
    'concept',
    'fact',
    'definition',
    'procedure',
    'rule',
    'exception',
    'relationship',
    'sequence',
    'terminology',
    'cause_effect',
    'distinction',
  ]),
  content: z.string().describe('Concise statement of the high-yield actionable knowledge to memorize or understand'),
  detail: z.string().nullable().describe('Specific measurements, components, step sequence, or technical details'),
  importance: z.number().min(1).max(5).describe('1 = low detail, 5 = vital high-yield fact that must be memorized'),
  category: z.enum(['memorize', 'understand', 'supporting', 'example', 'low_value']),
  sourceChunk: z.string().describe('Exact sentence or excerpt from source text providing provenance'),
});

export const ExtractedCurriculumSchema = z.object({
  lessons: z.array(
    z.object({
      id: z.string(),
      title: z.string().describe('Descriptive, actionable lesson title'),
      nodes: z.array(KnowledgeNodeSchema),
    })
  ),
});

export type ExtractedCurriculum = z.infer<typeof ExtractedCurriculumSchema>;

export async function extractKnowledgeFromText(text: string, title: string): Promise<ExtractedCurriculum> {
  const model = getExtractionModel();

  if (!model) {
    throw new Error(
      'OpenAI is not configured. Add your OPENAI_API_KEY to .env.local and restart the dev server.'
    );
  }

  try {
    const { object } = await generateObject({
      model,
      schema: ExtractedCurriculumSchema,
      prompt: `You are an expert cognitive scientist and master tutor creating a high-yield active recall curriculum.

The user's goal is FAST, PRACTICAL MASTERY of what is actually needed to execute and remember this subject.

Target Subject / Source Title: "${title}"

Source Material:
"""
${text.slice(0, 16000)}
"""

CRITICAL INSTRUCTION ON KNOWLEDGE PRIORITIZATION:
Always extract the information a learner MOST URGENTLY NEEDS TO MEMORIZE to become proficient or operational in this subject:

1. TOP PRIORITY (High-Yield Actionable Knowledge):
   - If this involves RECIPES, DRINKS, or FORMULATIONS: Extract the exact ingredients, ratios, base spirits, modifiers, preparation method (shaken vs stirred), glassware, and garnishes. (e.g. for a drink: 2 oz Gin, 0.75 oz Lemon, 0.75 oz Simple Syrup, Champagne top, fluted glass, lemon twist).
   - If this involves PROCEDURES or PROCESSES: Extract the exact step sequence, parameters, temperatures, order of operations, and mandatory checkpoints.
   - If this involves TECHNICAL / SYSTEM KNOWLEDGE: Extract rules, classifications, key differences, terms, functions, and formulas.

2. AVOID LOW-VALUE FLUFF & BACKGROUND TRIVIA:
   - DO NOT waste nodes on background storytelling, dates/origins (e.g. "created in 1890 in Havana", "loved by famous author"), marketing prose, or introductory filler UNLESS the document is strictly a history text.
   - If the material describes cocktails, food, coding, or professional training, 90%+ of extracted nodes MUST be direct operational facts (ingredients, recipes, steps, methods, distinctions).

3. LESSON ORGANIZATION:
   - Organize knowledge into logical, bite-sized lessons (3 to 7 high-value nodes per lesson).
   - Give each lesson a clear thematic title.
   - Mark actionable facts as category: "memorize" and importance: 4 or 5.
   - Ground every node in the sourceChunk text.`,
    });

    return object;
  } catch (error) {
    console.error('[Mnemon AI] Extraction error:', error);
    const causeMsg = error instanceof Error ? error.message : '';
    if (/invalid_json_schema|invalid schema/i.test(causeMsg)) {
      throw new Error(
        'Lesson extraction failed due to an app formatting issue, not your API key. Check the server terminal log for details.'
      );
    }
    throw new Error(
      'Could not reach OpenAI to build lessons. Check your API key and connection, then try again.'
    );
  }
}
