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
    console.warn('[Mnemon AI] OPENAI_API_KEY not configured. Falling back to heuristic parsing.');
    return generateFallbackCurriculum(text, title);
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
    console.error('[Mnemon AI] Extraction error, returning fallback:', error);
    return generateFallbackCurriculum(text, title);
  }
}

function generateFallbackCurriculum(text: string, title: string): ExtractedCurriculum {
  const paragraphs = text.split('\n\n').filter((p) => p.trim().length > 20);
  
  const nodes = paragraphs.slice(0, 6).map((p, idx) => ({
    id: `fallback-node-${idx + 1}`,
    type: 'concept' as const,
    content: p.slice(0, 150),
    detail: p.length > 150 ? p.slice(150, 300) : null,
    importance: 4,
    category: 'memorize' as const,
    sourceChunk: p.slice(0, 200),
  }));

  return {
    lessons: [
      {
        id: `fallback-lesson-1`,
        title: `${title} - Core Fundamentals`,
        nodes: nodes.slice(0, 3),
      },
      {
        id: `fallback-lesson-2`,
        title: `${title} - Key Principles`,
        nodes: nodes.slice(3, 6),
      },
    ],
  };
}
