import { NextResponse } from 'next/server';
import { extractKnowledgeFromText } from '@/lib/ai/extractor';
import { generateQuestionsForLesson } from '@/lib/ai/question-generator';
import { scrapeUrl } from '@/lib/scraper';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, content, type } = body;

    if (!title && !content) {
      return NextResponse.json({ error: 'Title or content/URL is required' }, { status: 400 });
    }

    let resolvedContent = content || '';
    let resolvedTitle = title || '';

    // If source is a URL, fetch and extract the actual article text
    if (type === 'url' || /^https?:\/\//i.test(resolvedContent.trim())) {
      const targetUrl = (type === 'url' ? resolvedContent : resolvedContent.trim()) || resolvedTitle;
      console.log(`[Mnemon Ingest] Scraping URL content from: ${targetUrl}`);
      const scraped = await scrapeUrl(targetUrl);
      resolvedContent = scraped.content;
      if (!resolvedTitle || resolvedTitle.trim().length === 0 || resolvedTitle.startsWith('http')) {
        resolvedTitle = scraped.title || 'Web Learning Source';
      }
    }

    if (!resolvedContent || resolvedContent.trim().length < 20) {
      return NextResponse.json(
        { error: 'No readable content could be found in the provided source.' },
        { status: 400 }
      );
    }

    console.log(`[Mnemon Ingest] Starting knowledge extraction for "${resolvedTitle}" (${resolvedContent.length} chars)`);

    // 1. Extract High-Yield Knowledge Graph & Curriculum
    const curriculum = await extractKnowledgeFromText(resolvedContent, resolvedTitle);

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
        name: resolvedTitle,
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
