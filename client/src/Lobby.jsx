import './Lobby.css';

export function Lobby({ player, lobby, roomCode, startReady, onStart }) {
  const ready = lobby.p1 && lobby.p2;
  const names = lobby.names || {};
  const p1Name = names.p1 || 'Player 1';
  const p2Name = names.p2 || 'Player 2';
  const playerLabel = player === 'p1' ? p1Name : p2Name;
  const iHaveClicked = startReady?.[player];
  const bothReady = startReady?.p1 && startReady?.p2;
  const p1Ready = startReady?.p1;
  const p2Ready = startReady?.p2;

  return (
    <div className="screen lobby">
      <h1 className="title">2 Player Quiz</h1>
      <p className="subtitle">Math · Science · GK</p>

      <div className="player-badge" data-player={player}>
        You are {playerLabel}
      </div>

      <div className="slots">
        <div className={`slot ${lobby.p1 ? 'filled' : ''}`}>
          <span className="slot-label">Player 1</span>
          {lobby.p1 ? (
            <span className="slot-name">{p1Name}{p1Ready ? ' ✓' : ''}</span>
          ) : (
            <span className="slot-empty">Waiting…</span>
          )}
        </div>
        <div className={`slot ${lobby.p2 ? 'filled' : ''}`}>
          <span className="slot-label">Player 2</span>
          {lobby.p2 ? (
            <span className="slot-name">{p2Name}{p2Ready ? ' ✓' : ''}</span>
          ) : (
            <span className="slot-empty">Waiting…</span>
          )}
        </div>
      </div>

      {!ready && roomCode && (
        <>
          <p className="hint">Share this code with your friend:</p>
          <code className="room-code">{roomCode}</code>
        </>
      )}

      {ready && !bothReady && (
        <p className="hint">
          {iHaveClicked ? 'Waiting for opponent to start…' : 'Both players ready. Click Start when ready!'}
        </p>
      )}

      {bothReady && <p className="hint">Starting game…</p>}

      <button
        type="button"
        className="btn btn-primary"
        onClick={onStart}
        disabled={!ready || iHaveClicked}
      >
        {iHaveClicked ? 'Ready ✓' : 'Start game'}
      </button>
    </div>
  );
}
