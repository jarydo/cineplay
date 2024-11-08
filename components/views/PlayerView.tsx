"use client";

import { useState, useEffect } from "react";
import { useSocket } from "../../lib/socket";
import AnswerGrid from "../game/AnswerGrid";
import Leaderboard from "../game/Leaderboard";
import { Question, Player } from "../../lib/types";

export default function PlayerView() {
  const { socket, isConnected } = useSocket();
  const [gameState, setGameState] = useState({
    username: "",
    currentQuestion: null as Question | null,
    hasAnswered: false,
    lastResult: null as { correct: boolean; points: number } | null,
    leaderboard: [] as Player[],
    questionNumber: 0,
  });

  useEffect(() => {
    if (!socket) return;

    // Auto-join on connection
    socket.emit("join-game");

    socket.on("joined-game", ({ username }) => {
      setGameState((prev) => ({ ...prev, username }));
    });

    socket.on("player-question", ({ answers, questionNumber }) => {
      setGameState((prev) => ({
        ...prev,
        currentQuestion: { text: "", answers, correct_answer_index: -1 },
        questionNumber,
        hasAnswered: false,
        lastResult: null,
      }));
    });

    socket.on("answer-result", (result) => {
      setGameState((prev) => ({
        ...prev,
        hasAnswered: true,
        lastResult: result,
      }));
    });

    socket.on("leaderboard-update", (leaderboard) => {
      setGameState((prev) => ({ ...prev, leaderboard }));
    });

    return () => {
      socket.off("joined-game");
      socket.off("player-question");
      socket.off("answer-result");
      socket.off("leaderboard-update");
    };
  }, [socket]);

  const handleAnswer = (index: number) => {
    if (!gameState.hasAnswered && socket) {
      socket.emit("submit-answer", index);
    }
  };

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="loading-spinner" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Player Info */}
      <div className="bg-white rounded-lg shadow p-4 text-center">
        <h2 className="text-xl font-bold">Playing as {gameState.username}</h2>
        {gameState.questionNumber > 0 && (
          <div className="text-gray-600">
            Question {gameState.questionNumber}
          </div>
        )}
      </div>

      {/* Question & Answers */}
      {gameState.currentQuestion && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <AnswerGrid
            answers={gameState.currentQuestion.answers}
            onAnswer={handleAnswer}
            disabled={gameState.hasAnswered}
          />
        </div>
      )}

      {/* Answer Result */}
      {gameState.lastResult && (
        <div
          className={`text-center p-4 rounded-lg ${
            gameState.lastResult.correct
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          <div className="font-bold">
            {gameState.lastResult.correct ? "Correct!" : "Wrong!"}
          </div>
          {gameState.lastResult.correct && (
            <div>+{gameState.lastResult.points} points</div>
          )}
        </div>
      )}

      {/* Leaderboard */}
      {gameState.leaderboard.length > 0 && (
        <Leaderboard players={gameState.leaderboard} />
      )}
    </div>
  );
}
