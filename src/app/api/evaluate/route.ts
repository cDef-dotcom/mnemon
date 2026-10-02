import { NextResponse } from 'next/server';
import { evaluateTypedAnswer } from '@/lib/ai/evaluator';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt, expectedAnswer, acceptableVariants, userAnswer, groundingChunk } = body;

    if (!userAnswer || !expectedAnswer) {
      return NextResponse.json({ error: 'userAnswer and expectedAnswer are required' }, { status: 400 });
    }

    const evaluation = await evaluateTypedAnswer({
      prompt: prompt || '',
      expectedAnswer,
      acceptableVariants: acceptableVariants || [],
      userAnswer,
      groundingChunk: groundingChunk || '',
    });

    return NextResponse.json(evaluation);
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Evaluation failed';
    console.error('[Mnemon Evaluate Error]', err);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
