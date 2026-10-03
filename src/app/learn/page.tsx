'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { SOMMELIER_PRESET_LESSONS, PresetQuestion, PresetLesson } from '@/lib/sommelier-preset';
import { getInitialSources, getSourceById, StoredSource } from '@/lib/storage';
import { Brain, CheckCircle, XCircle, ArrowRight, RotateCcw, Trophy } from 'lucide-react';
import Link from 'next/link';

function LearnContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sourceId = searchParams.get('sourceId');

  const [activeSource, setActiveSource] = useState<StoredSource | null>(null);
  const [allSources, setAllSources] = useState<StoredSource[]>([]);
  const [activeLessonIndex, setActiveLessonIndex] = useState(0);
  const [sessionState, setSessionState] = useState<'idle' | 'teach' | 'testing' | 'summary'>('idle');

  // Teach phase state
  const [teachConceptIndex, setTeachConceptIndex] = useState(0);

  // Testing phase state
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [userResponse, setUserResponse] = useState('');
  const [selectedMCQ, setSelectedMCQ] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; explanation: string } | null>(null);
  const [score, setScore] = useState(0);
  const [sessionResults, setSessionResults] = useState<{ qPrompt: string; isCorrect: boolean }[]>([]);

  // User XP state
  const [, setXp] = useState(120);

  useEffect(() => {
    const sources = getInitialSources();
    setAllSources(sources);

    if (sourceId) {
      const found = getSourceById(sourceId);
      if (found) {
        setActiveSource(found);
        setActiveLessonIndex(0);
        return;
      }
    }
    // Default to first source
    if (sources.length > 0) {
      setActiveSource(sources[0]);
    }
  }, [sourceId]);

  const activeLessons: PresetLesson[] = activeSource?.lessons && activeSource.lessons.length > 0
    ? activeSource.lessons
    : SOMMELIER_PRESET_LESSONS;

  const currentLesson: PresetLesson = activeLessons[activeLessonIndex] || activeLessons[0] || SOMMELIER_PRESET_LESSONS[0];
  const currentQuestion: PresetQuestion | undefined = currentLesson?.questions[currentQIndex];

  const getQuestionOptions = (q: PresetQuestion): string[] => {
    if (q.options && q.options.length > 0) {
      return q.options;
    }
    if (q.type === 'true_false') {
      return ['True', 'False'];
    }
    const distractors = (q.distractors || []).map((d) => d.text);
    const all = [...distractors, q.expectedAnswer];
    return Array.from(new Set(all)).sort();
  };

  const handleStartSession = () => {
    setSessionState('teach');
    setTeachConceptIndex(0);
    setCurrentQIndex(0);
    setScore(0);
    setSessionResults([]);
    setFeedback(null);
  };

  const handleNextTeach = () => {
    if (teachConceptIndex + 1 < (currentLesson?.nodes?.length || 0)) {
      setTeachConceptIndex((prev) => prev + 1);
    } else {
      setSessionState('testing');
    }
  };

  const handleSubmitAnswer = () => {
    if (!currentQuestion || feedback !== null) return;

    let isCorrect = false;
    let explanation = '';

    if (currentQuestion.type === 'multiple_choice' || currentQuestion.type === 'true_false') {
      if (!selectedMCQ) return;
      isCorrect = selectedMCQ.trim().toLowerCase() === currentQuestion.expectedAnswer.trim().toLowerCase();
      explanation = isCorrect
        ? `Correct! "${currentQuestion.expectedAnswer}" matches the source.`
        : `Expected: "${currentQuestion.expectedAnswer}". Source: ${currentQuestion.groundingChunk}`;
    } else {
      // Typed / fill-blank
      if (!userResponse.trim()) return;
      const cleanUser = userResponse.trim().toLowerCase();
      const cleanExpected = currentQuestion.expectedAnswer.trim().toLowerCase();
      const variants = (currentQuestion.acceptableVariants || []).map((v) => v.toLowerCase());

      isCorrect = cleanUser === cleanExpected || variants.includes(cleanUser);
      explanation = isCorrect
        ? `Correct! "${currentQuestion.expectedAnswer}" is verifiable from source.`
        : `Incorrect. Expected: "${currentQuestion.expectedAnswer}". Source: ${currentQuestion.groundingChunk}`;
    }

    if (isCorrect) {
      setScore((prev) => prev + 1);
      setXp((prev) => prev + 10);
    }

    setSessionResults((prev) => [...prev, { qPrompt: currentQuestion.prompt, isCorrect }]);
    setFeedback({ isCorrect, explanation });
  };

  const handleNextQuestion = () => {
    setFeedback(null);
    setUserResponse('');
    setSelectedMCQ(null);

    const questionsList = currentLesson?.questions || [];
    if (currentQIndex + 1 < 10 && currentQIndex + 1 < questionsList.length) {
      setCurrentQIndex((prev) => prev + 1);
    } else {
      const finalScore = score;
      if (finalScore >= 8) {
        setXp((prev) => prev + 50);
      }
      setSessionState('summary');
    }
  };

  const handleSourceChange = (newSourceId: string) => {
    router.push(`/learn?sourceId=${newSourceId}`);
  };

  // 1. IDLE SCREEN (One primary choice: "Continue")
  if (sessionState === 'idle') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-12 animate-in fade-in duration-300">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto shadow-xl shadow-indigo-500/10">
            <Brain className="w-8 h-8" />
          </div>

          <div className="space-y-3">
            {/* Active Source Selector */}
            <div className="flex items-center justify-center gap-2">
              <select
                value={activeSource?.id || ''}
                onChange={(e) => handleSourceChange(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-slate-200 text-xs font-semibold px-3 py-1.5 rounded-xl focus:outline-none focus:border-indigo-500"
              >
                {allSources.map((s) => (
                  <option key={s.id} value={s.id}>
                    📚 {s.name} ({s.lessonsCount} lessons)
                  </option>
                ))}
              </select>
            </div>

            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              {currentLesson?.title || 'Lesson 1'}
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              10-question active recall assessment · 80% mastery target
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-left space-y-2 text-xs text-slate-300">
            <div className="flex justify-between text-slate-400">
              <span>Active Source:</span>
              <span className="font-semibold text-indigo-300">{activeSource?.name || 'Sommelier Fundamentals'}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Concepts to teach:</span>
              <span className="font-semibold text-white">{currentLesson?.nodes?.length || 0} concepts</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Mastery requirement:</span>
              <span className="font-semibold text-emerald-400">≥8 / 10 correct</span>
            </div>
          </div>

          <button
            onClick={handleStartSession}
            className="w-full py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-base tracking-wide shadow-lg shadow-indigo-600/25 transition-all transform active:scale-98 flex items-center justify-center gap-2"
          >
            Continue Session <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  // 2. TEACH PHASE (Minimum viable exposure)
  if (sessionState === 'teach') {
    const concept = currentLesson?.nodes?.[teachConceptIndex];
    if (!concept) {
      setSessionState('testing');
      return null;
    }

    return (
      <div className="flex-1 flex flex-col justify-between max-w-xl mx-auto w-full py-6 animate-in fade-in duration-200">
        <div className="space-y-6">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono border-b border-slate-800 pb-3">
            <span>TEACH PHASE · CONCEPT {teachConceptIndex + 1} OF {currentLesson.nodes.length}</span>
            <span className="text-indigo-400 truncate max-w-[180px]">{activeSource?.name}</span>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400 px-2.5 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/20">
              {concept.category}
            </span>
            <h2 className="text-xl font-bold text-white leading-relaxed">
              {concept.content}
            </h2>
            {concept.detail && (
              <p className="text-slate-300 text-sm leading-normal border-l-2 border-indigo-500 pl-3.5 py-1">
                {concept.detail}
              </p>
            )}
          </div>
        </div>

        <button
          onClick={handleNextTeach}
          className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 mt-8"
        >
          {teachConceptIndex + 1 < currentLesson.nodes.length ? 'Next Concept' : 'Begin Assessment (10 Questions)'} <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // 3. TESTING PHASE (10 Scored Interactions)
  if (sessionState === 'testing' && currentQuestion) {
    const options = getQuestionOptions(currentQuestion);

    return (
      <div className="flex-1 flex flex-col justify-between max-w-xl mx-auto w-full py-4 animate-in fade-in duration-200">
        {/* Top Progress Indicator */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>QUESTION {currentQIndex + 1} / 10</span>
            <span className="text-emerald-400 font-bold">CURRENT SCORE: {score}</span>
          </div>
          <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
            <div
              className="bg-indigo-500 h-full transition-all duration-300"
              style={{ width: `${((currentQIndex + 1) / 10) * 100}%` }}
            />
          </div>
        </div>

        {/* Question Container Card */}
        <div className="my-auto space-y-6 py-4">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
            <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400 font-bold px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">
              {currentQuestion.type.replace('_', ' ')}
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-slate-100 leading-snug">
              {currentQuestion.prompt}
            </h2>
          </div>

          {/* Response Options */}
          {(currentQuestion.type === 'multiple_choice' || currentQuestion.type === 'true_false') && (
            <div className="space-y-2.5">
              {options.map((optionText, idx) => (
                <button
                  key={idx}
                  disabled={feedback !== null}
                  onClick={() => setSelectedMCQ(optionText)}
                  className={`w-full p-4 rounded-xl border text-left text-sm font-medium transition-all flex items-center justify-between ${
                    selectedMCQ === optionText
                      ? 'border-indigo-500 bg-indigo-950/40 text-indigo-200 shadow-md'
                      : 'border-slate-800 bg-slate-900 hover:border-slate-700 text-slate-200'
                  }`}
                >
                  <span>{optionText}</span>
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      selectedMCQ === optionText ? 'border-indigo-400 bg-indigo-500' : 'border-slate-700'
                    }`}
                  >
                    {selectedMCQ === optionText && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                  </div>
                </button>
              ))}
            </div>
          )}

          {(currentQuestion.type === 'typed_recall' || currentQuestion.type === 'fill_blank') && (
            <div>
              <input
                type="text"
                disabled={feedback !== null}
                placeholder="Type your answer here..."
                value={userResponse}
                onChange={(e) => setUserResponse(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmitAnswer()}
                className="w-full bg-slate-900 border border-slate-700 focus:border-indigo-500 rounded-xl p-4 text-base text-white placeholder-slate-500 focus:outline-none transition-colors"
                autoFocus
              />
            </div>
          )}

          {/* Feedback Display */}
          {feedback && (
            <div
              className={`p-4 rounded-xl border animate-in slide-in-from-bottom-2 duration-200 space-y-1 ${
                feedback.isCorrect
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                  : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-sm">
                {feedback.isCorrect ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-emerald-400" /> Correct (+10 XP)
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 text-rose-400" /> Incorrect
                  </>
                )}
              </div>
              <p className="text-xs leading-relaxed opacity-90">{feedback.explanation}</p>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div>
          {!feedback ? (
            <button
              onClick={handleSubmitAnswer}
              disabled={
                (currentQuestion.type === 'multiple_choice' || currentQuestion.type === 'true_false')
                  ? !selectedMCQ
                  : !userResponse.trim()
              }
              className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm transition-all"
            >
              Submit Answer
            </button>
          ) : (
            <button
              onClick={handleNextQuestion}
              className="w-full py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    );
  }

  // 4. SESSION SUMMARY SCREEN (80% Mastery Check)
  if (sessionState === 'summary') {
    const passed = score >= 8;
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-8 animate-in fade-in duration-300">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-8 rounded-2xl text-center space-y-6 shadow-2xl">
          <div
            className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto border-2 ${
              passed
                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400 shadow-lg shadow-emerald-500/20'
                : 'bg-rose-500/10 border-rose-500/40 text-rose-400'
            }`}
          >
            {passed ? <Trophy className="w-10 h-10" /> : <RotateCcw className="w-10 h-10" />}
          </div>

          <div>
            <span
              className={`inline-block px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase mb-2 ${
                passed ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300'
              }`}
            >
              {passed ? '✓ LESSON MASTERED' : 'REMEDIATION REQUIRED'}
            </span>
            <h2 className="text-3xl font-extrabold text-white">Score: {score} / 10</h2>
            <p className="text-slate-400 text-xs mt-1">
              {passed ? 'Great job! Mastery threshold (≥80%) achieved.' : 'Mastery threshold is 8/10. Reviewing weak concepts is required.'}
            </p>
          </div>

          {/* Results Summary */}
          <div className="space-y-1.5 text-left text-xs max-h-48 overflow-y-auto pr-1">
            {sessionResults.map((r, i) => (
              <div
                key={i}
                className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between gap-2"
              >
                <span className="truncate text-slate-300">{r.qPrompt}</span>
                {r.isCorrect ? (
                  <span className="text-emerald-400 font-bold shrink-0">✓ Correct</span>
                ) : (
                  <span className="text-rose-400 font-bold shrink-0">✗ Missed</span>
                )}
              </div>
            ))}
          </div>

          {/* Action */}
          {passed ? (
            <div className="space-y-2">
              {activeLessonIndex + 1 < activeLessons.length ? (
                <button
                  onClick={() => {
                    setActiveLessonIndex((prev) => prev + 1);
                    setSessionState('idle');
                  }}
                  className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/20"
                >
                  Next Lesson →
                </button>
              ) : (
                <Link
                  href="/progress"
                  className="block w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/20"
                >
                  View Overall Progress
                </Link>
              )}
            </div>
          ) : (
            <button
              onClick={handleStartSession}
              className="w-full py-3.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-lg shadow-rose-600/20"
            >
              Remediate & Repeat Lesson (New Questions)
            </button>
          )}
        </div>
      </div>
    );
  }

  return null;
}

export default function LearnPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex items-center justify-center p-12 text-slate-400 text-sm">
        Loading Learn Session...
      </div>
    }>
      <LearnContent />
    </Suspense>
  );
}
