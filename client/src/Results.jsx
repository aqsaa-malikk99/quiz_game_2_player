import './Results.css';

export function Results({ player, scores, names, totalQuestions, onPlayAgain }) {
  const p1Score = scores?.p1 ?? 0;
  const p2Score = scores?.p2 ?? 0;
  const isTie = p1Score === p2Score;
  const iWon = (player === 'p1' && p1Score > p2Score) || (player === 'p2' && p2Score > p1Score);
  const p1Name = names?.p1 || 'Player 1';
  const p2Name = names?.p2 || 'Player 2';

  return (
    <div className="screen results">
      <h1 className="title">Results</h1>
      <p className="subtitle">Out of {totalQuestions} questions</p>

      <div className="scoreboard">
        <div className={`score-row p1 ${player === 'p1' ? 'you' : ''}`}>
          <span>{p1Name}</span>
          <span className="score">{p1Score}</span>
        </div>
        <div className={`score-row p2 ${player === 'p2' ? 'you' : ''}`}>
          <span>{p2Name}</span>
          <span className="score">{p2Score}</span>
        </div>
      </div>

      <p className="result-message">
        {isTie ? "It's a tie!" : iWon ? 'You win! 🎉' : 'You lost. Better luck next time!'}
      </p>

      <button type="button" className="btn btn-primary" onClick={onPlayAgain}>
        Play again
      </button>
    </div>
  );
}
