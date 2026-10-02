import { NextResponse } from 'next/server';
import { extractKnowledgeFromText } from '@/lib/ai/extractor';
import { generateQuestionsForLesson } from '@/lib/ai/question-generator';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, content, type } = body;

    if (!title || (!content && type !== 'url')) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    console.log(`[Mnemon Ingest] Starting ingestion for source: "${title}"`);

    // 1. Extract Knowledge Graph & Curriculum
    const curriculum = await extractKnowledgeFromText(content || title, title);

    // 2. Generate Grounded Questions per Lesson
    const processedLessons = await Promise.all(
      curriculum.lessons.map(async (l) => {
        const questions = await generateQuestionsForLesson(l.title, l.nodes);
        return {
          ...l,
          questions,
        };
      })
    );

    return NextResponse.json({
      success: true,
      source: {
        id: `source-${Date.now()}`,
        name: title,
        type: type || 'text',
        lessonsCount: processedLessons.length,
      },
      lessons: processedLessons,
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to process source';
    console.error('[Mnemon Ingest Error]', err);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
