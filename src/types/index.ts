export type KnowledgeNodeType = 
  | 'concept'
  | 'fact'
  | 'definition'
  | 'procedure'
  | 'rule'
  | 'exception'
  | 'relationship'
  | 'sequence'
  | 'terminology'
  | 'cause_effect'
  | 'distinction';

export type KnowledgeNodeCategory = 
  | 'memorize'
  | 'understand'
  | 'supporting'
  | 'example'
  | 'low_value';

export type QuestionType = 
  | 'multiple_choice'
  | 'fill_blank'
  | 'typed_recall'
  | 'matching'
  | 'ordering'
  | 'true_false'
  | 'image_identification'
  | 'labeling'
  | 'scenario';

export interface DistractorOption {
  text: string;
  misconceptionReason?: string;
}

export interface QuestionData {
  id: string;
  lessonId: string;
  knowledgeNodeId: string;
  type: QuestionType;
  prompt: string;
  expectedAnswer: string;
  acceptableVariants?: string[];
  distractors?: DistractorOption[];
  options?: string[];
  mediaUrl?: string;
  difficulty: number;
  groundingChunk: string;
}

export interface AssessmentResult {
  score: number; // 0 to 10
  passed: boolean;
  attemptId: string;
  missedNodeIds: string[];
}
