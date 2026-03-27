import React, { useState } from 'react';
import { FiClock, FiPercent, FiCopy, FiCheck, FiArrowRight } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useOffers } from '../../hooks';
import '../../styles/Offers.css';

interface Offer {
  id: number;
  title: string;
  description: string;
  discount: string;
  code: string;
  validTill: string;
  image: string;
  category: string;
  terms: string[];
}

const Offers: React.FC = () => {
  const navigate = useNavigate();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('all');

  const { data: dynamicOffers = [] } = useOffers();


  // Map dynamic offers from backend to Offer interface
  const mappedDynamicOffers: Offer[] = dynamicOffers.map((o: any) => ({
    id: o.id,
    title: o.code + ' Special',
    description: o.description || `Get ${o.discountPercentage}% off on your booking!`,
    discount: `${o.discountPercentage}% OFF`,
    code: o.code,
    validTill: o.validUntil ? o.validUntil.split('T')[0] : '2026-12-31',
    image: o.imageUrl || 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=400',
    category: o.category || 'all',
    terms: [`Maximum discount: ₹${o.maxDiscountAmount}`, 'Applicable on all bookings']
  }));

  const allOffers: Offer[] = mappedDynamicOffers;

  const categories = [
    { id: 'all', label: 'All Offers' },
    { id: 'new-user', label: 'New User' },
    { id: 'weekend', label: 'Weekend' },
    { id: 'subscription', label: 'Subscription' },
    { id: 'luxury', label: 'Luxury' },
    { id: 'electric', label: 'Electric' },
  ];

  const filteredOffers = activeCategory === 'all' 
    ? allOffers 
    : allOffers.filter(offer => offer.category === activeCategory);

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="offers-page">
      {/* Hero Section */}
      <section className="offers-hero">
        <div className="hero-content">
          <h1>Offers & Discounts</h1>
          <p>
            Book a Self-Drive Car and get hassle-free premium car rental services, 
            24x7 support and roadside assistance anywhere you are. MotoGlide offers 
            affordable rental car services in Chennai and all major cities.
          </p>
        </div>
      </section>

      {/* Category Filter */}
      <section className="category-filter">
        <div className="filter-container">
          {categories.map(cat => (
            <button
              key={cat.id}
              className={`filter-btn ${activeCategory === cat.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </section>

      {/* Offers Grid */}
      <section className="offers-grid-section">
        <div className="offers-container">
          {filteredOffers.map(offer => (
            <div key={offer.id} className="offer-card">
              <div className="offer-image">
                <img src={offer.image} alt={offer.title} />
                <div className="discount-tag">
                  <FiPercent />
                  <span>{offer.discount}</span>
                </div>
              </div>
              <div className="offer-content">
                <h3>{offer.title}</h3>
                <p>{offer.description}</p>
                
                <div className="offer-code-section">
                  <div className="code-box">
                    <span className="code">{offer.code}</span>
                    <button 
                      className="copy-btn"
                      onClick={() => copyCode(offer.code)}
                    >
                      {copiedCode === offer.code ? (
                        <><FiCheck /> Copied!</>
                      ) : (
                        <><FiCopy /> Copy</>  
                      )}
                    </button>
                  </div>
                </div>

                <div className="offer-validity">
                  <FiClock />
                  <span>Valid till {formatDate(offer.validTill)}</span>
                </div>

                <div className="offer-terms">
                  <h4>Terms & Conditions:</h4>
                  <ul>
                    {offer.terms.map((term: string, idx: number) => (
                      <li key={idx}>{term}</li>
                    ))}
                  </ul>
                </div>

                <button 
                  className="book-now-btn"
                  onClick={() => navigate('/cars')}
                >
                  Book Now <FiArrowRight />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Promo Banner */}
      <section className="promo-banner">
        <div className="banner-content">
          <div className="banner-text">
            <h2>Subscribe & Save More!</h2>
            <p>Get exclusive discounts on monthly car subscriptions. No down payment, no EMIs!</p>
          </div>
          <button 
            className="banner-btn"
            onClick={() => navigate('/subscription')}
          >
            Explore Subscriptions
          </button>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="offers-faq">
        <div className="faq-container">
          <h2>Frequently Asked Questions</h2>
          <div className="faq-grid">
            <div className="faq-item">
              <h4>How do I apply a coupon code?</h4>
              <p>Enter the coupon code at checkout before making payment. The discount will be automatically applied to your booking.</p>
            </div>
            <div className="faq-item">
              <h4>Can I use multiple coupons?</h4>
              <p>No, only one coupon code can be applied per booking. Choose the one that gives you the best discount.</p>
            </div>
            <div className="faq-item">
              <h4>What if my coupon doesn't work?</h4>
              <p>Check the terms and conditions of the offer. If the issue persists, contact our support team for assistance.</p>
            </div>
            <div className="faq-item">
              <h4>Are offers applicable on all vehicles?</h4>
              <p>Some offers are category-specific. Please check the terms of each offer for applicable vehicle categories.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Offers;
