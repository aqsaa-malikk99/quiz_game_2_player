import { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';

function getServerUrl() {
  if (import.meta.env.VITE_SERVER) return import.meta.env.VITE_SERVER;
  if (typeof window !== 'undefined') {
    const { origin, port } = window.location;
    if (port === '3001') return origin;
    return `${window.location.protocol}//${window.location.hostname}:3001`;
  }
  return 'http://localhost:3001';
}

const SERVER = getServerUrl();

export function useSocket() {
  const [connected, setConnected] = useState(false);
  const [player, setPlayer] = useState(null);
  const [roomCode, setRoomCode] = useState(null);
  const [names, setNames] = useState({ p1: '', p2: '' });
  const [gameState, setGameState] = useState('lobby');
  const [lobby, setLobby] = useState({ p1: false, p2: false, names: {} });
  const [startReady, setStartReady] = useState({ p1: false, p2: false });
  const [error, setError] = useState(null);
  const [connectionError, setConnectionError] = useState(null);
  const [joinError, setJoinError] = useState(null);
  const [categoryChoice, setCategoryChoice] = useState({ p1: null, p2: null });
  const [generating, setGenerating] = useState(false);
  const [question, setQuestion] = useState(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(10);
  const [answerFeedback, setAnswerFeedback] = useState(null);
  const [answerStatus, setAnswerStatus] = useState({ p1: false, p2: false });
  const [roundComplete, setRoundComplete] = useState(null);
  const [timeLimit, setTimeLimit] = useState(null);
  const [timeUp, setTimeUp] = useState(false);
  const [results, setResults] = useState(null);
  const [opponentLeft, setOpponentLeft] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    setConnectionError(null);
    const socket = io(SERVER, {
      transports: ['polling', 'websocket'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      timeout: 10000,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      setConnectionError(null);
    });
    socket.on('disconnect', (reason) => {
      setConnected(false);
      if (reason === 'io server disconnect') setConnectionError('Server closed the connection.');
    });
    socket.io.on('connect_error', (err) => {
      setConnected(false);
      setConnectionError(
        err.message || 'Cannot reach the quiz server. Start it first: cd server && npm run dev'
      );
    });

    socket.on('roomCreated', (data) => {
      setPlayer(data.player);
      setRoomCode(data.code);
      setNames(data.names || { p1: data.name || '', p2: '' });
      setGameState('lobby');
      setLobby({ p1: true, p2: false, names: data.names || { p1: data.name || '', p2: '' } });
      setError(null);
      setJoinError(null);
    });

    socket.on('roomJoined', (data) => {
      setPlayer(data.player);
      setRoomCode(data.code || null);
      setNames(data.names || { p1: '', p2: data.name || '' });
      setGameState('lobby');
      setLobby({ p1: true, p2: true, names: data.names || {} });
      setError(null);
      setJoinError(null);
    });

    socket.on('joinError', (data) => {
      setJoinError(data.message || 'Could not join');
    });

    socket.on('lobby', (data) => {
      setLobby(data);
      if (data.names) setNames(data.names);
      setError(null);
    });

    socket.on('startReady', (data) => {
      setStartReady(data || { p1: false, p2: false });
    });

    socket.on('gameState', (data) => {
      setGameState(data.gameState);
      if (data.gameState === 'generating') setGenerating(true);
      if (data.gameState === 'playing') {
        setGenerating(false);
        setAnswerFeedback(null);
        setAnswerStatus({ p1: false, p2: false });
      }
      if (data.gameState === 'results') setAnswerFeedback(null);
      if (data.gameState === 'category') setCategoryChoice({ p1: null, p2: null });
      if (data.gameState === 'lobby') {
        setOpponentLeft(false);
        setStartReady({ p1: false, p2: false });
      }
    });

    socket.on('categorySelected', (data) => {
      setCategoryChoice((prev) => ({ ...prev, [data.player]: data.choice }));
    });

    socket.on('question', (data) => {
      setQuestion(data.question);
      setQuestionIndex(data.index);
      setTotalQuestions(data.total ?? 10);
      setAnswerFeedback(null);
      setAnswerStatus({ p1: false, p2: false });
      setRoundComplete(null);
      setTimeLimit(data.timeLimit ?? 20);
      setTimeUp(false);
    });

    socket.on('answerStatus', (data) => {
      setAnswerStatus(data);
    });

    socket.on('roundComplete', (data) => {
      setRoundComplete(data);
    });

    socket.on('timeUp', (data) => {
      setTimeUp(true);
      if (data.answerStatus) setAnswerStatus(data.answerStatus);
      if (data.correctIndex !== undefined) setRoundComplete(data);
    });

    socket.on('opponentLeft', () => {
      setOpponentLeft(true);
    });
    socket.on('results', setResults);
    socket.on('error', (data) => setError(data.message || 'Something went wrong'));

    return () => socket.close();
  }, []);

  const startGame = (name) => socketRef.current?.emit('startGame', name);
  const joinGame = (code, name) => socketRef.current?.emit('joinGame', code, name);
  const start = () => socketRef.current?.emit('start');
  const selectCategory = (choice) => socketRef.current?.emit('category', choice);
  const submitAnswer = (index) => socketRef.current?.emit('answer', index);
  const playAgain = () => socketRef.current?.emit('playAgain');
  const quit = () => {
    socketRef.current?.emit('quit');
    setPlayer(null);
    setRoomCode(null);
    setGameState('lobby');
  };

  return {
    connected,
    player,
    roomCode,
    names,
    gameState,
    lobby,
    startReady,
    error,
    connectionError,
    joinError,
    serverUrl: SERVER,
    categoryChoice,
    generating,
    question,
    questionIndex,
    totalQuestions,
    answerFeedback,
    answerStatus,
    roundComplete,
    timeLimit,
    timeUp,
    results,
    opponentLeft,
    startGame,
    joinGame,
    start,
    selectCategory,
    submitAnswer,
    playAgain,
    quit,
    setError,
    setJoinError,
    setOpponentLeft,
  };
}
