import { useState } from 'react';
import { FAQ } from '../data.js';
import { useInView } from '../hooks/useInView.js';

function Item({ q, a, i, open, onToggle }) {
  const [ref, inView] = useInView();
  return (
    <div ref={ref} data-rx="" data-reveal="" style={{ '--d': `${i * 0.04}s` }} className={`qa ${open ? 'open' : ''}${inView ? ' in' : ''}`}>
      <button type="button" aria-expanded={open} onClick={onToggle}>
        <span dangerouslySetInnerHTML={{ __html: q }} />
        <span className="pm"><i className="fa-solid fa-plus" /></span>
      </button>
      <div className="a"><div><p dangerouslySetInnerHTML={{ __html: a }} /></div></div>
    </div>
  );
}

export default function Faq() {
  const [openIdx, setOpenIdx] = useState(0);
  return (
    <div className="faq" id="faqList">
      {FAQ.map(([q, a], i) => (
        <Item key={i} q={q} a={a} i={i} open={openIdx === i} onToggle={() => setOpenIdx(openIdx === i ? -1 : i)} />
      ))}
    </div>
  );
}
