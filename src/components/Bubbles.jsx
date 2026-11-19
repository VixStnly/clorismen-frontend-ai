import { useState } from 'react';

export default function Bubbles() {
  const [items] = useState(() => Array.from({ length: 16 }, () => {
    const s = 6 + Math.random() * 22;
    return {
      width: s + 'px', height: s + 'px', left: Math.random() * 100 + '%',
      animationDuration: 7 + Math.random() * 9 + 's', animationDelay: -Math.random() * 12 + 's',
    };
  }));
  return <div className="bubbles" id="bubbles">{items.map((st, i) => <i key={i} style={st} />)}</div>;
}
