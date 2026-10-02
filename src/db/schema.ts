import { pgTable, text, integer, real, boolean, timestamp, jsonb, primaryKey, date } from 'drizzle-orm/pg-core';

// Sources of learning material
export const source = pgTable('source', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  type: text('type').notNull(), // 'text' | 'pdf' | 'url' | 'image' | 'sommelier_preset'
  rawContent: text('raw_content'),
  normalized: text('normalized'),
  status: text('status').default('processing').notNull(), // processing | ready | error
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Extracted visual assets
export const extractedMedia = pgTable('extracted_media', {
  id: text('id').primaryKey(),
  sourceId: text('source_id').references(() => source.id, { onDelete: 'cascade' }),
  type: text('type'), // 'image' | 'diagram' | 'chart'
  storagePath: text('storage_path').notNull(),
  description: text('description'),
  labels: jsonb('labels'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Atomic units of learnable information
export const knowledgeNode = pgTable('knowledge_node', {
  id: text('id').primaryKey(),
  sourceId: text('source_id').references(() => source.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  content: text('content').notNull(),
  detail: text('detail'),
  importance: integer('importance').notNull(), // 1 to 5
  category: text('category').notNull(), // memorize | understand | supporting | example | low_value
  sourceChunks: jsonb('source_chunks').notNull(),
  sourcePages: jsonb('source_pages'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Relationships between knowledge nodes
export const knowledgeEdge = pgTable('knowledge_edge', {
  id: text('id').primaryKey(),
  fromNodeId: text('from_node_id').references(() => knowledgeNode.id, { onDelete: 'cascade' }),
  toNodeId: text('to_node_id').references(() => knowledgeNode.id, { onDelete: 'cascade' }),
  type: text('type').notNull(), // prerequisite | related | contrasts_with | part_of | causes | sequence_next | example_of
});

// Media ↔ Node associations
export const nodeMedia = pgTable('node_media', {
  knowledgeNodeId: text('knowledge_node_id').references(() => knowledgeNode.id, { onDelete: 'cascade' }),
  mediaId: text('media_id').references(() => extractedMedia.id, { onDelete: 'cascade' }),
}, (t) => [
  primaryKey({ columns: [t.knowledgeNodeId, t.mediaId] })
]);

// Grouped sets of knowledge nodes for teaching
export const lesson = pgTable('lesson', {
  id: text('id').primaryKey(),
  sourceId: text('source_id').references(() => source.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  sortOrder: integer('sort_order'),
  status: text('status').default('locked').notNull(), // locked | available | mastered
});

export const lessonNode = pgTable('lesson_node', {
  lessonId: text('lesson_id').references(() => lesson.id, { onDelete: 'cascade' }),
  knowledgeNodeId: text('knowledge_node_id').references(() => knowledgeNode.id, { onDelete: 'cascade' }),
}, (t) => [
  primaryKey({ columns: [t.lessonId, t.knowledgeNodeId] })
]);

// Pre-generated and on-demand questions
export const question = pgTable('question', {
  id: text('id').primaryKey(),
  lessonId: text('lesson_id').references(() => lesson.id, { onDelete: 'cascade' }),
  knowledgeNodeId: text('knowledge_node_id').references(() => knowledgeNode.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  prompt: text('prompt').notNull(),
  expectedAnswer: text('expected_answer').notNull(),
  acceptableVariants: jsonb('acceptable_variants'),
  distractors: jsonb('distractors'),
  options: jsonb('options'),
  mediaId: text('media_id').references(() => extractedMedia.id),
  difficulty: integer('difficulty').default(1).notNull(),
  groundingChunk: text('grounding_chunk').notNull(),
  timesAsked: integer('times_asked').default(0).notNull(),
  timesCorrect: integer('times_correct').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Each attempt at a lesson assessment
export const lessonAttempt = pgTable('lesson_attempt', {
  id: text('id').primaryKey(),
  lessonId: text('lesson_id').references(() => lesson.id, { onDelete: 'cascade' }),
  startedAt: timestamp('started_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
  score: integer('score'), // 0-10
  passed: boolean('passed'),
  isDiagnostic: boolean('is_diagnostic').default(false).notNull(),
});

// Individual question responses
export const questionResult = pgTable('question_result', {
  id: text('id').primaryKey(),
  attemptId: text('attempt_id').references(() => lessonAttempt.id, { onDelete: 'cascade' }),
  questionId: text('question_id').references(() => question.id),
  userAnswer: text('user_answer'),
  correct: boolean('correct').notNull(),
  errorType: text('error_type'),
  feedback: text('feedback'),
  responseMs: integer('response_ms'),
  answeredAt: timestamp('answered_at').defaultNow().notNull(),
});

// Per-concept mastery tracking
export const conceptMastery = pgTable('concept_mastery', {
  id: text('id').primaryKey(),
  knowledgeNodeId: text('knowledge_node_id').unique().references(() => knowledgeNode.id, { onDelete: 'cascade' }),
  mastery: real('mastery').default(0.0).notNull(), // 0.0 – 1.0
  correctCount: integer('correct_count').default(0).notNull(),
  incorrectCount: integer('incorrect_count').default(0).notNull(),
  lastCorrectAt: timestamp('last_correct_at'),
  lastIncorrectAt: timestamp('last_incorrect_at'),
  nextReviewAt: timestamp('next_review_at'),
  reviewInterval: integer('review_interval').default(1).notNull(), // Days
  easeFactor: real('ease_factor').default(2.5).notNull(),
  consecutiveCorrect: integer('consecutive_correct').default(0).notNull(),
});

// Lightweight user profile
export const userProfile = pgTable('user_profile', {
  id: text('id').primaryKey(), // 'default'
  totalXp: integer('total_xp').default(0).notNull(),
  currentStreak: integer('current_streak').default(0).notNull(),
  longestStreak: integer('longest_streak').default(0).notNull(),
  level: integer('level').default(1).notNull(),
  lastSessionAt: timestamp('last_session_at'),
});

// Daily activity log
export const dailyActivity = pgTable('daily_activity', {
  date: date('date').primaryKey(),
  lessonsCompleted: integer('lessons_completed').default(0).notNull(),
  reviewsCompleted: integer('reviews_completed').default(0).notNull(),
  xpEarned: integer('xp_earned').default(0).notNull(),
  correctCount: integer('correct_count').default(0).notNull(),
  incorrectCount: integer('incorrect_count').default(0).notNull(),
});
