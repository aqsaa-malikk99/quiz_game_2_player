import { useSocket } from './useSocket';
import { Landing } from './Landing';
import { Lobby } from './Lobby';
import { CategorySelect } from './CategorySelect';
import { Game } from './Game';
import { Results } from './Results';
import './App.css';

export default function App() {
  const {
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
    serverUrl,
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
  } = useSocket();

  if (!connected) {
    return (
      <div className="screen connecting">
        {connectionError ? (
          <>
            <div className="connecting-error" />
            <h1>Can’t connect to server</h1>
            <p className="connection-message">{connectionError}</p>
            <p className="connection-url">Trying: <code>{serverUrl}</code></p>
            <p className="connection-tip">Start the server: <code>cd server && npm run dev</code></p>
          </>
        ) : (
          <>
            <div className="pulse" />
            <h1>Connecting to quiz server…</h1>
            <p>Trying <code>{serverUrl}</code></p>
          </>
        )}
      </div>
    );
  }

  if (opponentLeft) {
    return (
      <div className="screen opponent-left">
        <h1>Opponent left</h1>
        <p>Your opponent has left the game.</p>
        <button type="button" className="btn btn-primary" onClick={() => { quit(); setOpponentLeft(false); }}>
          Back to menu
        </button>
      </div>
    );
  }

  if (!player) {
    return (
      <Landing
        onStart={startGame}
        onJoin={joinGame}
        joinError={joinError}
        onClearJoinError={() => setJoinError(null)}
      />
    );
  }

  if (error && gameState === 'lobby') {
    return (
      <div className="screen">
        <div className="error-banner" role="alert">
          {error}
          <button type="button" onClick={() => setError(null)} aria-label="Dismiss">×</button>
        </div>
        <Lobby player={player} lobby={lobby} roomCode={roomCode} startReady={startReady} onStart={start} />
      </div>
    );
  }

  if (gameState === 'lobby') {
    return <Lobby player={player} lobby={lobby} roomCode={roomCode} startReady={startReady} onStart={start} />;
  }

  if (gameState === 'category') {
    return (
      <CategorySelect
        player={player}
        categoryChoice={categoryChoice}
        names={names}
        onSelect={selectCategory}
      />
    );
  }

  if (gameState === 'generating' || generating) {
    return (
      <div className="screen generating">
        <div className="loader" />
        <h2>Generating questions…</h2>
        <p>Mixed difficulty, same or mixed categories</p>
      </div>
    );
  }

  if (gameState === 'playing' && question) {
    return (
      <Game
        player={player}
        question={question}
        index={questionIndex}
        totalQuestions={totalQuestions}
        answerFeedback={answerFeedback}
        answerStatus={answerStatus}
        roundComplete={roundComplete}
        timeLimit={timeLimit}
        timeUp={timeUp}
        names={names}
        onSubmitAnswer={submitAnswer}
        onQuit={quit}
      />
    );
  }

  if (gameState === 'results' && results) {
    return (
      <Results
        player={player}
        scores={results.scores}
        names={results.names || names}
        totalQuestions={results.questions}
        onPlayAgain={playAgain}
      />
    );
  }

  return (
    <div className="screen">
      <p>Waiting for game…</p>
    </div>
  );
}
