import { useState, useEffect, useRef } from 'react';
import './Game.css';

export function Game({ player, question, index, totalQuestions, answerStatus, roundComplete, timeLimit, timeUp, names, onSubmitAnswer, onQuit }) {
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(timeLimit ?? 20);
  const timerRef = useRef(null);

  useEffect(() => {
    setSelected(null);
    setRevealed(false);
    setSecondsLeft(timeLimit ?? 20);
    if (timerRef.current) clearInterval(timerRef.current);
  }, [question?.question, index, timeLimit]);

  useEffect(() => {
    if (revealed) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [revealed, index]);

  const shouldReveal = roundComplete || timeUp;
  useEffect(() => {
    if (shouldReveal) setRevealed(true);
  }, [shouldReveal]);

  const p1Name = names?.p1 || 'Player 1';
  const p2Name = names?.p2 || 'Player 2';
  const correctIndex = roundComplete?.correctIndex ?? question?.correctIndex ?? -1;
  const myResult = player === 'p1' ? roundComplete?.p1 : roundComplete?.p2;
  const myAnswer = myResult?.selected ?? selected;
  const myCorrect = myAnswer !== null && myAnswer !== undefined && myAnswer === correctIndex;
  const myWrong = myAnswer !== null && myAnswer !== undefined && myAnswer !== correctIndex;

  const handleOptionClick = (i) => {
    if (revealed) return;
    if (selected != null) return;
    setSelected(i);
    onSubmitAnswer(i);
  };

  return (
    <div className="screen game">
      <div className="game-header">
        <button type="button" className="btn-quit" onClick={onQuit} title="Quit game">
          Quit
        </button>
      <div className="game-progress">
        Question {index + 1} / {totalQuestions ?? 10}
        <span className="progress-dots">
          {Array.from({ length: totalQuestions ?? 10 }, (_, i) => (
              <span key={i} className={i <= index ? 'active' : ''} />
            ))}
          </span>
        </div>
        <div className="game-timer">{secondsLeft}s</div>
      </div>

      <div className="answer-status">
        <span className={answerStatus?.p1 ? 'answered' : ''}>{p1Name} {answerStatus?.p1 ? '✓' : '…'}</span>
        <span className={answerStatus?.p2 ? 'answered' : ''}>{p2Name} {answerStatus?.p2 ? '✓' : '…'}</span>
      </div>

      <h2 className="question-text">{question?.question}</h2>

      <div className="options">
        {(question?.options ?? []).map((opt, i) => {
          let stateClass = '';
          if (revealed) {
            if (i === correctIndex) stateClass = 'correct';
            else if (myWrong && i === myAnswer) stateClass = 'wrong';
          } else if (selected === i) stateClass = 'selected';

          return (
            <button
              key={i}
              type="button"
              className={`option ${stateClass}`}
              onClick={() => handleOptionClick(i)}
              disabled={revealed}
            >
              <span className="option-letter">{String.fromCharCode(65 + i)}</span>
              <span className="option-text">{opt}</span>
              {stateClass === 'correct' && <span className="option-mark">✓</span>}
              {stateClass === 'wrong' && <span className="option-mark">✕</span>}
            </button>
          );
        })}
      </div>

      {revealed && (
        <div className="feedback-section">
          <div className="feedback-results">
            <span className={roundComplete?.p1?.correct ? 'correct' : roundComplete?.p1?.selected != null ? 'wrong' : 'timeup'}>
              {p1Name}: {roundComplete?.p1?.correct ? '✓ Correct' : roundComplete?.p1?.selected != null ? '✕ Wrong' : "— Time's up"}
            </span>
            <span className={roundComplete?.p2?.correct ? 'correct' : roundComplete?.p2?.selected != null ? 'wrong' : 'timeup'}>
              {p2Name}: {roundComplete?.p2?.correct ? '✓ Correct' : roundComplete?.p2?.selected != null ? '✕ Wrong' : "— Time's up"}
            </span>
          </div>
          <p className="feedback-next">Next question in a moment…</p>
        </div>
      )}
    </div>
  );
}
