import { useState } from 'react';
import './Landing.css';

export function Landing({ onStart, onJoin, joinError: serverJoinError, onClearJoinError }) {
  const [mode, setMode] = useState(null);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');

  const handleStart = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onStart(name.trim());
  };

  const handleJoin = (e) => {
    e.preventDefault();
    onClearJoinError?.();
    if (!name.trim() || !code.trim()) return;
    onJoin(code.trim().toUpperCase(), name.trim());
  };

  if (mode === null) {
    return (
      <div className="screen landing">
        <h1 className="title">2 Player Quiz</h1>
        <p className="subtitle">Math · Science · GK</p>
        <div className="landing-buttons">
          <button type="button" className="btn btn-primary" onClick={() => setMode('start')}>
            Start a game
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => setMode('join')}>
            Join with code
          </button>
        </div>
      </div>
    );
  }

  if (mode === 'start') {
    return (
      <div className="screen landing">
        <h1 className="title">Start a game</h1>
        <form onSubmit={handleStart} className="landing-form">
          <label htmlFor="name-start">Your name</label>
          <input
            id="name-start"
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={20}
            autoFocus
          />
          <div className="form-buttons">
            <button type="button" className="btn btn-ghost" onClick={() => { setMode(null); setName(''); }}>
              Back
            </button>
            <button type="submit" className="btn btn-primary" disabled={!name.trim()}>
              Create game
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="screen landing">
      <h1 className="title">Join with code</h1>
      <form onSubmit={handleJoin} className="landing-form">
        <label htmlFor="name-join">Your name</label>
        <input
          id="name-join"
          type="text"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={20}
        />
        <label htmlFor="code">Room code</label>
        <input
          id="code"
          type="text"
          placeholder="e.g. ABC123"
          value={code}
          onChange={(e) => { setCode(e.target.value.toUpperCase()); onClearJoinError?.(); }}
          maxLength={6}
        />
        {serverJoinError && <p className="form-error">{serverJoinError}</p>}
        <div className="form-buttons">
          <button type="button" className="btn btn-ghost" onClick={() => { setMode(null); setName(''); setCode(''); onClearJoinError?.(); }}>
            Back
          </button>
          <button type="submit" className="btn btn-primary" disabled={!name.trim() || !code.trim()}>
            Join
          </button>
        </div>
      </form>
    </div>
  );
}
