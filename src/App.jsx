import { useEffect } from 'react';
import { initPixel } from './lib/pixel.js';
import { OrderProvider } from './state/OrderContext.jsx';
import { useGlobalEffects } from './hooks/useGlobalEffects.js';
import Topbar from './sections/Topbar.jsx';
import Nav from './sections/Nav.jsx';
import Hero from './sections/Hero.jsx';
import SocialProof from './sections/SocialProof.jsx';
import Collab from './sections/Collab.jsx';
import Pain from './sections/Pain.jsx';
import Agit from './sections/Agit.jsx';
import Solution from './sections/Solution.jsx';
import HowTo from './sections/HowTo.jsx';
import Results from './sections/Results.jsx';
import Who from './sections/Who.jsx';
import Testimonials from './sections/Testimonials.jsx';
import Compare from './sections/Compare.jsx';
import Ebook from './sections/Ebook.jsx';
import Offer from './sections/Offer.jsx';
import Packages from './sections/Packages.jsx';
import Urgency from './sections/Urgency.jsx';
import Guarantee from './sections/Guarantee.jsx';
import FaqSection from './sections/FaqSection.jsx';
import Order from './sections/Order.jsx';
import Closing from './sections/Closing.jsx';
import Footer from './sections/Footer.jsx';

export default function App() {
  useGlobalEffects();
  useEffect(() => { initPixel(); }, []); // Meta: PageView
  return (
    <OrderProvider>
      <Topbar />
      <Nav />
      <Hero />
      <SocialProof />
      <Collab />
      <Pain />
      <Agit />
      <Solution />
      <HowTo />
      <Results />
      <Who />
      <Testimonials />
      <Compare />
      <Ebook />
      <Offer />
      <Packages />
      <Urgency />
      <Guarantee />
      <FaqSection />
      <Order />
      <Closing />
      <Footer />
    </OrderProvider>
  );
}
