import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateQuestions } from './questions.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(cors());
app.use(express.json());

const publicDir = path.join(__dirname, 'public');
app.use(express.static(publicDir));
app.get('*', (req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: { origin: '*' },
});

const QUESTIONS_PER_GAME = 10;
const QUESTION_TIMEOUT_MS = 20000;
const CATEGORIES = ['math', 'science', 'gk'];

function makeCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

const rooms = {};

function getRoom(code) {
  return rooms[code];
}

function getRoomForSocket(socket) {
  const code = socket.data?.roomCode;
  return code ? rooms[code] : null;
}

function emitToRoom(code, event, data) {
  io.to(code).emit(event, data);
}

io.on('connection', (socket) => {
  socket.on('startGame', (name) => {
    let code = makeCode();
    while (rooms[code]) code = makeCode();
    rooms[code] = {
      players: {},
      names: { p1: '', p2: '' },
      readyToStart: { p1: false, p2: false },
      gameState: 'lobby',
      categories: { p1: null, p2: null },
      questions: [],
      currentQuestionIndex: 0,
      answers: {},
      scores: { p1: 0, p2: 0 },
    };
    const room = rooms[code];
    room.players[socket.id] = { slot: 'p1', name: (name || 'Player 1').trim() || 'Player 1' };
    room.names.p1 = room.players[socket.id].name;
    socket.join(code);
    socket.data.roomCode = code;

    socket.emit('roomCreated', {
      code,
      player: 'p1',
      name: room.names.p1,
      names: room.names,
    });
    emitToRoom(code, 'lobby', {
      p1: true,
      p2: false,
      names: room.names,
    });
    socket.emit('startReady', room.readyToStart);
  });

  socket.on('joinGame', (code, name) => {
    const upper = String(code || '').toUpperCase().trim();
    const room = rooms[upper];

    if (!room) {
      socket.emit('joinError', { message: 'Invalid or expired code' });
      return;
    }

    const slots = Object.values(room.players).map((p) => p.slot);
    if (slots.includes('p2')) {
      socket.emit('joinError', { message: 'Room is full' });
      return;
    }

    room.players[socket.id] = { slot: 'p2', name: (name || 'Player 2').trim() || 'Player 2' };
    room.names.p2 = room.players[socket.id].name;
    socket.join(upper);
    socket.data.roomCode = upper;

    socket.emit('roomJoined', {
      player: 'p2',
      name: room.names.p2,
      names: room.names,
      code: upper,
    });
    room.readyToStart = { p1: false, p2: false };
    emitToRoom(upper, 'lobby', {
      p1: true,
      p2: true,
      names: room.names,
    });
    emitToRoom(upper, 'startReady', room.readyToStart);
  });

  socket.on('start', () => {
    const room = getRoomForSocket(socket);
    if (!room || room.gameState !== 'lobby') return;
    const me = room.players[socket.id];
    if (!me || room.readyToStart[me.slot]) return;
    const count = Object.keys(room.players).length;
    if (count !== 2) {
      socket.emit('error', { message: 'Need 2 players to start' });
      return;
    }
    room.readyToStart[me.slot] = true;
    emitToRoom(socket.data.roomCode, 'startReady', room.readyToStart);

    if (room.readyToStart.p1 && room.readyToStart.p2) {
      room.gameState = 'category';
      room.readyToStart = { p1: false, p2: false };
      room.categories = { p1: null, p2: null };
      emitToRoom(socket.data.roomCode, 'gameState', { gameState: 'category' });
      emitToRoom(socket.data.roomCode, 'categoryChoice', { p1: null, p2: null });
    }
  });

  socket.on('category', (choice) => {
    const room = getRoomForSocket(socket);
    if (!room || room.gameState !== 'category') return;
    const me = room.players[socket.id];
    if (!me) return;

    room.categories[me.slot] = choice;
    emitToRoom(socket.data.roomCode, 'categorySelected', { player: me.slot, choice });

    const p1Done = room.categories.p1 != null;
    const p2Done = room.categories.p2 != null;

    if (p1Done && p2Done) {
      room.gameState = 'generating';
      emitToRoom(socket.data.roomCode, 'gameState', { gameState: 'generating' });

      const c1 = room.categories.p1 === 'mixed' ? CATEGORIES[Math.floor(Math.random() * 3)] : room.categories.p1;
      const c2 = room.categories.p2 === 'mixed' ? CATEGORIES[Math.floor(Math.random() * 3)] : room.categories.p2;
      const mixed = [...new Set([c1, c2])];

      generateQuestions(mixed, QUESTIONS_PER_GAME)
        .then((questions) => {
          const c = socket.data.roomCode;
          const shuffled = [...questions].sort(() => Math.random() - 0.5);
          room.questions = shuffled;
          room.currentQuestionIndex = 0;
          room.answers = {};
          room.scores = { p1: 0, p2: 0 };
          room.gameState = 'playing';
          emitToRoom(c, 'gameState', { gameState: 'playing' });
          emitToRoom(c, 'question', {
            index: 0,
            total: room.questions.length,
            question: room.questions[0],
            timeLimit: QUESTION_TIMEOUT_MS / 1000,
          });
          startQuestionTimer(c, room);
        })
        .catch((err) => {
          console.error(err);
          room.gameState = 'category';
          emitToRoom(socket.data.roomCode, 'error', { message: 'Failed to generate questions. Try again.' });
          emitToRoom(socket.data.roomCode, 'gameState', { gameState: 'category' });
        });
    }
  });

  socket.on('answer', (selectedIndex) => {
    const room = getRoomForSocket(socket);
    if (!room || room.gameState !== 'playing') return;
    const me = room.players[socket.id];
    if (!me || room.answers[me.slot] !== undefined) return;

    const q = room.questions[room.currentQuestionIndex];
    if (!q) return;

    room.answers[me.slot] = selectedIndex;
    const correct = q.correctIndex === selectedIndex;
    if (correct) room.scores[me.slot] = (room.scores[me.slot] || 0) + 1;

    const code = socket.data.roomCode;
    const p1Answered = room.answers.p1 !== undefined;
    const p2Answered = room.answers.p2 !== undefined;
    const answerStatus = { p1: p1Answered, p2: p2Answered };

    emitToRoom(code, 'answerStatus', answerStatus);

    const bothAnswered = p1Answered && p2Answered;
    if (bothAnswered) {
      if (room.questionTimer) {
        clearTimeout(room.questionTimer);
        room.questionTimer = null;
      }
      const p1Correct = room.answers.p1 === q.correctIndex;
      const p2Correct = room.answers.p2 === q.correctIndex;
      emitToRoom(code, 'roundComplete', {
        correctIndex: q.correctIndex,
        p1: { selected: room.answers.p1, correct: p1Correct },
        p2: { selected: room.answers.p2, correct: p2Correct },
      });
      advanceToNext(code, room);
    }
  });

  function advanceToNext(code, room) {
    room.currentQuestionIndex++;
    room.answers = {};

    const goNext = () => {
      if (room.currentQuestionIndex >= room.questions.length) {
        room.gameState = 'results';
        room.questionTimer = null;
        emitToRoom(code, 'gameState', { gameState: 'results' });
        emitToRoom(code, 'results', {
          scores: room.scores,
          names: room.names,
          questions: room.questions.length,
        });
      } else {
        const q = room.questions[room.currentQuestionIndex];
        emitToRoom(code, 'question', {
          index: room.currentQuestionIndex,
          total: room.questions.length,
          question: q,
          timeLimit: QUESTION_TIMEOUT_MS / 1000,
        });
        startQuestionTimer(code, room);
      }
    };

    setTimeout(goNext, 2000);
  }

  function startQuestionTimer(code, room) {
    if (room.questionTimer) clearTimeout(room.questionTimer);
    room.questionTimer = setTimeout(() => {
      room.questionTimer = null;
      if (room.gameState !== 'playing') return;
      const p1Answered = room.answers.p1 !== undefined;
      const p2Answered = room.answers.p2 !== undefined;
      const q = room.questions[room.currentQuestionIndex];
      const p1Correct = p1Answered && room.answers.p1 === q?.correctIndex;
      const p2Correct = p2Answered && room.answers.p2 === q?.correctIndex;
      emitToRoom(code, 'timeUp', {
        answerStatus: { p1: p1Answered, p2: p2Answered },
        correctIndex: q?.correctIndex ?? -1,
        p1: { selected: room.answers.p1, correct: p1Correct },
        p2: { selected: room.answers.p2, correct: p2Correct },
      });
      if (!p1Answered) room.scores.p1 = (room.scores.p1 || 0);
      if (!p2Answered) room.scores.p2 = (room.scores.p2 || 0);
      room.currentQuestionIndex++;
      room.answers = {};

      const goNext = () => {
        if (room.currentQuestionIndex >= room.questions.length) {
          room.gameState = 'results';
          emitToRoom(code, 'gameState', { gameState: 'results' });
          emitToRoom(code, 'results', {
            scores: room.scores,
            names: room.names,
            questions: room.questions.length,
          });
        } else {
          emitToRoom(code, 'question', {
            index: room.currentQuestionIndex,
            total: room.questions.length,
            question: room.questions[room.currentQuestionIndex],
            timeLimit: QUESTION_TIMEOUT_MS / 1000,
          });
          startQuestionTimer(code, room);
        }
      };
      setTimeout(goNext, 1500);
    }, QUESTION_TIMEOUT_MS);
  }

  socket.on('quit', () => {
    const code = socket.data?.roomCode;
    if (!code || !rooms[code]) return;
    const room = rooms[code];
    const me = room.players[socket.id];
    delete room.players[socket.id];
    if (room.questionTimer) {
      clearTimeout(room.questionTimer);
      room.questionTimer = null;
    }
    if (me?.slot === 'p1') room.names.p1 = '';
    if (me?.slot === 'p2') room.names.p2 = '';
    socket.leave(code);
    socket.data.roomCode = null;

    const remaining = Object.keys(room.players).length;
    if (remaining > 0) {
      emitToRoom(code, 'opponentLeft', {});
    }
    if (remaining === 0) {
      delete rooms[code];
    }
  });

  socket.on('playAgain', () => {
    const room = getRoomForSocket(socket);
    if (!room) return;

    room.gameState = 'lobby';
    room.readyToStart = { p1: false, p2: false };
    room.categories = { p1: null, p2: null };
    room.questions = [];
    room.currentQuestionIndex = 0;
    room.answers = {};
    room.scores = { p1: 0, p2: 0 };

    emitToRoom(socket.data.roomCode, 'gameState', { gameState: 'lobby' });
    emitToRoom(socket.data.roomCode, 'lobby', {
      p1: true,
      p2: true,
      names: room.names,
    });
    emitToRoom(socket.data.roomCode, 'startReady', room.readyToStart);
  });

  socket.on('disconnect', () => {
    const code = socket.data?.roomCode;
    if (!code || !rooms[code]) return;

    const room = rooms[code];
    const me = room.players[socket.id];
    delete room.players[socket.id];

    if (me?.slot === 'p1') {
      room.names.p1 = '';
    }
    if (me?.slot === 'p2') {
      room.names.p2 = '';
    }

    const slots = Object.values(room.players).map((p) => p.slot);
    const p1 = slots.includes('p1');
    const p2 = slots.includes('p2');

    if (Object.keys(room.players).length === 0) {
      delete rooms[code];
      return;
    }

    emitToRoom(code, 'lobby', { p1, p2, names: room.names });
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`Quiz server on http://0.0.0.0:${PORT} (join from same network via your IP)`);
});
