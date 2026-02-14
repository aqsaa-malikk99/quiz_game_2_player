import './CategorySelect.css';

const CATEGORIES = [
  { id: 'math', label: 'Math', emoji: '🔢' },
  { id: 'science', label: 'Science', emoji: '🔬' },
  { id: 'gk', label: 'General Knowledge', emoji: '🌍' },
  { id: 'mixed', label: 'Mixed', emoji: '🎲' },
];

export function CategorySelect({ player, categoryChoice, names, onSelect }) {
  const myChoice = categoryChoice[player];
  const p1Done = categoryChoice.p1 != null;
  const p2Done = categoryChoice.p2 != null;
  const p1Name = names?.p1 || 'Player 1';
  const p2Name = names?.p2 || 'Player 2';

  return (
    <div className="screen category-screen">
      <h1 className="title">Pick a category</h1>
      <p className="subtitle">Same or mixed — both players choose</p>

      <div className="category-grid">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            className={`category-card ${myChoice === cat.id ? 'selected' : ''}`}
            onClick={() => onSelect(cat.id)}
          >
            <span className="category-emoji">{cat.emoji}</span>
            <span className="category-label">{cat.label}</span>
          </button>
        ))}
      </div>

      <div className="category-status">
        <span className={p1Done ? 'done' : ''}>{p1Name} {p1Done ? '✓' : '…'}</span>
        <span className={p2Done ? 'done' : ''}>{p2Name} {p2Done ? '✓' : '…'}</span>
      </div>

      {myChoice != null && (
        <p className="your-choice">You chose: <strong>{CATEGORIES.find((c) => c.id === myChoice)?.label}</strong></p>
      )}
    </div>
  );
}
