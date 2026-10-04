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
  content: z.string().describe('Concise statement of the knowledge to learn'),
  detail: z.string().nullable().describe('Extended explanation if helpful'),
  importance: z.number().min(1).max(5).describe('1 = minor detail, 5 = core essential fact'),
  category: z.enum(['memorize', 'understand', 'supporting', 'example', 'low_value']),
  sourceChunk: z.string().describe('Exact sentence or excerpt from source text'),
});

export const ExtractedCurriculumSchema = z.object({
  lessons: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
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
      prompt: `You are an expert cognitive scientist and master educator constructing a high-yield learning graph for a single learner.

Target Source Title: "${title}"

Source Material Excerpt:
"""
${text.slice(0, 12000)}
"""

Instructions:
1. Extract all high-yield knowledge worth learning. Categorize each item (memorize vs understand).
2. Rank importance 1-5.
3. Group related knowledge nodes into small, coherent lessons containing 3 to 7 nodes each.
4. Provide the exact source text chunk for provenance grounding.`,
    });

    return object;
  } catch (error) {
    console.error('[Mnemon AI] Extraction error:', error);
    throw new Error(
      'Could not reach OpenAI to build lessons. Check your API key and connection, then try again.'
    );
  }
}
