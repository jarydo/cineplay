"use client";

import { useState, useEffect } from "react";
import { useSocket } from "../../lib/socket";
import QuestionCard from "../game/QuestionCard";
import Leaderboard from "../game/Leaderboard";
import PlayerCounter from "../game/PlayerCounter";
import { Question, Player } from "../../lib/types";

export default function HostView() {
  const { socket, isConnected } = useSocket();
  const [gameState, setGameState] = useState({
    isHost: false,
    playerCount: 0,
    currentQuestion: null as Question | null,
    leaderboard: [] as Player[],
    questionNumber: 0,
  });

  useEffect(() => {
    if (!socket) return;

    socket.emit("host-game");

    socket.on("host-confirmed", () => {
      setGameState((prev) => ({ ...prev, isHost: true }));
    });

    socket.on("player-count", (count: number) => {
      setGameState((prev) => ({ ...prev, playerCount: count }));
    });

    socket.on(
      "host-question",
      ({
        text,
        answers,
        questionNumber,
      }: Question & { questionNumber: number }) => {
        setGameState((prev) => ({
          ...prev,
          currentQuestion: { text, answers, correct_answer_index: -1 },
          questionNumber,
        }));
      }
    );

    socket.on("leaderboard-update", (leaderboard: Player[]) => {
      setGameState((prev) => ({ ...prev, leaderboard }));
    });

    return () => {
      socket.off("host-confirmed");
      socket.off("player-count");
      socket.off("host-question");
      socket.off("leaderboard-update");
    };
  }, [socket]);

  const startGame = () => {
    socket?.emit("start-game");
  };

  if (!isConnected) {
    return <div className="text-center p-8">Connecting to game server...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 min-h-screen">
      {/* Header Section */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Trivia Game Host</h1>
        <PlayerCounter count={gameState.playerCount} />

        {gameState.isHost && !gameState.currentQuestion && (
          <button
            onClick={startGame}
            className="mt-4 px-6 py-3 bg-blue-500 text-white rounded-lg 
                     hover:bg-blue-600 transition-colors"
            disabled={gameState.playerCount === 0}
          >
            Start Game
          </button>
        )}
      </div>

      {/* Question Display */}
      {gameState.currentQuestion && (
        <QuestionCard
          question={gameState.currentQuestion}
          questionNumber={gameState.questionNumber}
        />
      )}

      {/* Leaderboard */}
      {gameState.leaderboard.length > 0 && (
        <Leaderboard players={gameState.leaderboard} />
      )}
    </div>
  );
}
