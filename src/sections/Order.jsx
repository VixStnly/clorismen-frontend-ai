import { OrderForm, OrderSummary } from '../components/OrderForm.jsx';

export default function Order() {
  return (
    <>
      <section className="sp" id="order">
        <div className="orb" style={{width: "520px", height: "520px", background: "#c8f250", left: "-260px", top: "160px", opacity: ".12"}}></div>
        <div className="wrap">
          <div className="sec-head center">
            <div className="eyebrow" data-reveal="">Form Order</div>
            <h2 className="h2" data-reveal="" style={{'--d': ".08s"}}>Isi Form Ini untuk Ambil <span className="grad-text">Clean Skin Series + Ebook Gratis</span> 👇</h2>
          </div>
          <div className="order-grid">
            <OrderForm />
            <OrderSummary />
          </div>
        </div>
      </section>
    </>
  );
}
