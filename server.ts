// server.ts
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import next from "next";
import fetch from "node-fetch";
import { GameState } from "./lib/types";

const port = process.env.PORT || 3000;
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

// Single room state (we only need one room)
const gameState: GameState = {
  players: new Map(),
  currentQuestion: null,
  isActive: false,
  hostId: null,
  scores: new Map(),
  questionNumber: 0,
};

let uniqueId = 0;

app.prepare().then(() => {
  const expressApp = express();
  const server = createServer(expressApp);
  const io = new Server(server);

  io.on("connection", (socket) => {
    // Host room creation
    socket.on("host-game", () => {
      if (!gameState.hostId) {
        gameState.hostId = socket.id;
        socket.emit("host-confirmed");
      }
    });

    // Player joining
    socket.on("join-game", () => {
      if (gameState.hostId) {
        const playerNumber = gameState.players.size + 1;
        const username = `Player${playerNumber}`;

        gameState.players.set(socket.id, {
          id: uniqueId.toString(),
          username,
          score: 0,
        });
        gameState.scores.set(socket.id, 0);
        uniqueId++;

        socket.emit("joined-game", { username });
        io.emit("player-count", gameState.players.size);
      }
    });

    // Host starts game
    socket.on("start-game", async () => {
      if (socket.id === gameState.hostId) {
        gameState.isActive = true;
        gameState.questionNumber = 0;
        await fetchAndSendQuestion();
      }
    });

    // Player submits answer
    socket.on("submit-answer", (answerIndex) => {
      if (!gameState.isActive || !gameState.currentQuestion) return;

      const player = gameState.players.get(socket.id);
      if (!player || player.answered) return;

      player.answered = true;
      const correct =
        answerIndex === gameState.currentQuestion.correct_answer_index;

      if (correct) {
        const currentScore = gameState.scores.get(socket.id) || 0;
        gameState.scores.set(socket.id, currentScore + 100);
      }

      // Check if all players answered
      if (Array.from(gameState.players.values()).every((p) => p.answered)) {
        sendLeaderboard();
        setTimeout(fetchAndSendQuestion, 3000);
      }
    });

    socket.on("disconnect", () => {
      if (socket.id === gameState.hostId) {
        gameState.hostId = null;
        gameState.isActive = false;
      }
      gameState.players.delete(socket.id);
      gameState.scores.delete(socket.id);
      io.emit("player-count", gameState.players.size);
    });
  });

  async function fetchAndSendQuestion() {
    try {
      gameState.questionNumber++;
      const response = await fetch(
        "https://opentdb.com/api.php?amount=1&type=multiple"
      );
      const data = await response.json();
      const question = data.results[0];

      // Format question for game
      const answers = [
        ...question.incorrect_answers,
        question.correct_answer,
      ].sort(() => Math.random() - 0.5);

      gameState.currentQuestion = {
        text: question.question,
        answers,
        correct_answer_index: answers.indexOf(question.correct_answer),
      };

      // Reset player answered status
      for (const player of gameState.players.values()) {
        player.answered = false;
      }

      // Send question to host and players
      if (gameState.hostId) {
        io.to(gameState.hostId).emit("host-question", {
          text: question.question,
          answers,
          questionNumber: gameState.questionNumber,
        });
      }

      io.emit("player-question", {
        answers,
        questionNumber: gameState.questionNumber,
      });
    } catch (error) {
      console.error("Error fetching question:", error);
    }
  }

  function sendLeaderboard() {
    const leaderboard = Array.from(gameState.players.entries())
      .map(([id, player]) => ({
        username: player.username,
        score: gameState.scores.get(id) || 0,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    io.emit("leaderboard-update", leaderboard);
  }

  expressApp.all("*", (req, res) => handle(req, res));
  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});
