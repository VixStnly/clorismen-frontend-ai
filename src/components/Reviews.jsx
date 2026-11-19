import { REVIEWS } from '../data.js';

function ReviewCard({ x, hidden, reveal, i }) {
  return (
    <article className="rv" aria-hidden={hidden ? 'true' : undefined}
      {...(reveal ? { 'data-reveal': '', style: { '--d': i * 0.1 + 's' } } : {})}>
      <div className="top">
        <div className="av">{x.n[0].toUpperCase()}</div>
        <div className="who">
          <div className="nm">
            <b>{x.n}</b>
            <span className="stars" aria-label={`${x.r} dari 5 bintang`}>
              {Array.from({ length: x.r }, (_, k) => <i key={'o' + k} className="fa-solid fa-star" />)}
              {Array.from({ length: 5 - x.r }, (_, k) => <i key={'f' + k} className="fa-solid fa-star off" />)}
            </span>
          </div>
          <small>{x.d} · {x.v}</small>
        </div>
      </div>
      <div className="tags">{x.tags.map((t) => <span key={t}>{t}</span>)}</div>
      <p>{x.t}</p>
      <div className="pics">{x.pics.map((p) => <img key={p} src={`/images/reviews/${p}`} alt="Foto dari pembeli" loading="lazy" />)}</div>
      <div className="ver"><i className="fa-solid fa-circle-check" /> Ulasan asli pembeli Clorismen</div>
    </article>
  );
}

const Row = ({ list, className, dur }) => (
  <div className={className} style={{ '--dur': dur }}>
    {[0, 1, 2, 3].map((k) => list.map((x) => <ReviewCard key={k + x.n} x={x} hidden={k > 0} />))}
  </div>
);

export function TestimonialMarquee() {
  return (
    <div className="tmq" id="tmq" data-reveal="">
      <Row className="tmq-row" dur="80s" list={[REVIEWS[4], REVIEWS[0], REVIEWS[2], REVIEWS[6]]} />
      <Row className="tmq-row rev" dur="95s" list={[REVIEWS[5], REVIEWS[1], REVIEWS[3]]} />
    </div>
  );
}

export function FeaturedReviews() {
  return (
    <div className="feat" id="feat">
      {[REVIEWS[4], REVIEWS[2], REVIEWS[5]].map((x, i) => <ReviewCard key={x.n} x={x} reveal i={i} />)}
    </div>
  );
}
