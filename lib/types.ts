export interface Player {
  id: string;
  username: string;
  score: number;
  answered?: boolean;
}

export interface Question {
  text: string;
  answers: string[];
  correct_answer_index: number;
}

export interface GameState {
  players: Map<string, Player>;
  currentQuestion: Question | null;
  isActive: boolean;
  hostId: string | null;
  scores: Map<string, number>;
  questionNumber: number;
}
