import { GameState } from "../lib/types";

export const gameState: GameState = {
  players: new Map(),
  currentQuestion: null,
  isActive: false,
  hostId: null,
  scores: new Map(),
  questionNumber: 0,
};
