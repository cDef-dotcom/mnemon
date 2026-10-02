import { createOpenAI } from '@ai-sdk/openai';

export function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey === 'sk-proj-your-api-key-here') {
    return null;
  }
  return createOpenAI({ apiKey });
}

// Strong model for extraction, curriculum reasoning, and question generation
export function getExtractionModel() {
  const openai = getOpenAIClient();
  if (!openai) return null;
  return openai('gpt-4o');
}

// Fast model for quick answer grading and feedback
export function getGradingModel() {
  const openai = getOpenAIClient();
  if (!openai) return null;
  return openai('gpt-4o-mini');
}
