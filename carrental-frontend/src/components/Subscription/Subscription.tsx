import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCheck, FiX } from 'react-icons/fi';
import { useAuth } from '../../hooks';

const Subscription: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const plans = [
    {
      id: '1month',
      name: '1 Month',
      price: 15000,
      originalPrice: 18000,
      discount: '17% OFF',
      features: {
        unlimitedKm: false,
        freeService: false,
        prioritySupport: false,
        freeInsurance: false,
        airportPickup: false,
        flexibleReturn: false
      }
    },
    {
      id: '3months',
      name: '3 Months',
      price: 40000,
      originalPrice: 54000,
      discount: '26% OFF',
      popular: true,
      features: {
        unlimitedKm: true,
        freeService: false,
        prioritySupport: true,
        freeInsurance: false,
        airportPickup: false,
        flexibleReturn: true
      }
    },
    {
      id: '6months',
      name: '6 Months',
      price: 72000,
      originalPrice: 108000,
      discount: '33% OFF',
      features: {
        unlimitedKm: true,
        freeService: true,
        prioritySupport: true,
        freeInsurance: false,
        airportPickup: true,
        flexibleReturn: true
      }
    },
    {
      id: '12months',
      name: '12 Months',
      price: 120000,
      originalPrice: 216000,
      discount: '44% OFF',
      features: {
        unlimitedKm: true,
        freeService: true,
        prioritySupport: true,
        freeInsurance: true,
        airportPickup: true,
        flexibleReturn: true
      }
    },
    {
      id: '24months',
      name: '24 Months',
      price: 200000,
      originalPrice: 432000,
      discount: '54% OFF',
      features: {
        unlimitedKm: true,
        freeService: true,
        prioritySupport: true,
        freeInsurance: true,
        airportPickup: true,
        flexibleReturn: true
      }
    }
  ];

  const featureLabels = {
    unlimitedKm: 'Unlimited Kilometers',
    freeService: 'Free Service & Maintenance',
    prioritySupport: '24/7 Priority Support',
    freeInsurance: 'Comprehensive Insurance',
    airportPickup: 'Free Airport Pickup',
    flexibleReturn: 'Flexible Return Policy'
  };

  const handleSubscribe = (planId: string) => {
    setSelectedPlan(planId);
    // Check if user is logged in
    if (!user) {
      // Store subscription plan for after login
      localStorage.setItem('pendingSubscription', planId);
      // Redirect to login
      navigate('/login');
      return;
    }
    // User is logged in, navigate to cars page to select a car
    navigate('/cars', { state: { subscriptionPlan: planId } });
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f1629', padding: '40px 20px' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <h1 style={{ color: '#ffffff', fontSize: '42px', marginBottom: '16px' }}>
            Car <span style={{ color: '#d4a574' }}>Subscription</span> Plans
          </h1>
          <p style={{ color: '#b0b8c8', fontSize: '18px', maxWidth: '600px', margin: '0 auto' }}>
            Choose the perfect subscription plan for your needs. Save more with longer commitments!
          </p>
        </div>

        {/* Plans Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '25px',
          marginBottom: '60px'
        }}>
          {plans.map(plan => (
            <div 
              key={plan.id}
              style={{ 
                backgroundColor: plan.popular ? '#d4a574' : '#1a1f3a', 
                borderRadius: '16px',
                padding: '30px',
                border: plan.popular ? 'none' : '2px solid #d4a574',
                position: 'relative',
                transition: 'transform 0.3s ease'
              }}
            >
              {plan.popular && (
                <div style={{ 
                  position: 'absolute', 
                  top: '-12px', 
                  left: '50%', 
                  transform: 'translateX(-50%)',
                  backgroundColor: '#1a1f3a',
                  color: '#d4a574',
                  padding: '6px 20px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  MOST POPULAR
                </div>
              )}

              <h3 style={{ 
                color: plan.popular ? '#1a1f3a' : '#ffffff', 
                fontSize: '24px', 
                marginBottom: '8px',
                textAlign: 'center'
              }}>
                {plan.name}
              </h3>

              <div style={{ 
                backgroundColor: plan.popular ? '#1a1f3a' : '#d4a574',
                color: plan.popular ? '#d4a574' : '#1a1f3a',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 'bold',
                display: 'inline-block',
                marginBottom: '20px'
              }}>
                {plan.discount}
              </div>

              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <span style={{ 
                  color: plan.popular ? 'rgba(26,31,58,0.5)' : '#666', 
                  textDecoration: 'line-through',
                  fontSize: '16px'
                }}>
                  ₹{plan.originalPrice.toLocaleString()}
                </span>
                <div style={{ 
                  color: plan.popular ? '#1a1f3a' : '#d4a574', 
                  fontSize: '36px', 
                  fontWeight: 'bold' 
                }}>
                  ₹{plan.price.toLocaleString()}
                </div>
                <span style={{ color: plan.popular ? 'rgba(26,31,58,0.7)' : '#b0b8c8', fontSize: '14px' }}>
                  Total for {plan.name}
                </span>
              </div>

              <button
                onClick={() => handleSubscribe(plan.id)}
                style={{ 
                  width: '100%',
                  padding: '14px', 
                  backgroundColor: plan.popular ? '#1a1f3a' : '#d4a574', 
                  color: plan.popular ? '#d4a574' : '#1a1f3a', 
                  border: 'none', 
                  borderRadius: '8px', 
                  fontSize: '16px', 
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                Subscribe Now
              </button>
            </div>
          ))}
        </div>

        {/* Comparison Table */}
        <div style={{ 
          backgroundColor: '#1a1f3a', 
          borderRadius: '16px', 
          padding: '40px',
          border: '2px solid #d4a574'
        }}>
          <h2 style={{ color: '#d4a574', fontSize: '28px', marginBottom: '30px', textAlign: 'center' }}>
            Plan Comparison
          </h2>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
              <thead>
                <tr style={{ backgroundColor: '#d4a574' }}>
                  <th style={{ 
                    padding: '16px', 
                    textAlign: 'left', 
                    color: '#1a1f3a',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    borderBottom: '2px solid #d4a574'
                  }}>
                    Features
                  </th>
                  {plans.map(plan => (
                    <th key={plan.id} style={{ 
                      padding: '16px', 
                      textAlign: 'center', 
                      color: '#1a1f3a',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      borderBottom: '2px solid #d4a574'
                    }}>
                      {plan.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.entries(featureLabels).map(([key, label], idx) => (
                  <tr key={key} style={{ backgroundColor: idx % 2 === 0 ? '#0f1629' : '#1a1f3a' }}>
                    <td style={{ 
                      padding: '16px', 
                      color: '#ffffff',
                      fontSize: '15px',
                      borderBottom: '1px solid rgba(212,165,116,0.3)'
                    }}>
                      {label}
                    </td>
                    {plans.map(plan => (
                      <td key={plan.id} style={{ 
                        padding: '16px', 
                        textAlign: 'center',
                        borderBottom: '1px solid rgba(212,165,116,0.3)'
                      }}>
                        {plan.features[key as keyof typeof plan.features] ? (
                          <FiCheck size={24} color="#4ade80" />
                        ) : (
                          <FiX size={24} color="#ef4444" />
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
                <tr style={{ backgroundColor: '#d4a574' }}>
                  <td style={{ 
                    padding: '16px', 
                    color: '#1a1f3a',
                    fontSize: '16px',
                    fontWeight: 'bold'
                  }}>
                    Price
                  </td>
                  {plans.map(plan => (
                    <td key={plan.id} style={{ 
                      padding: '16px', 
                      textAlign: 'center',
                      color: '#1a1f3a',
                      fontSize: '18px',
                      fontWeight: 'bold'
                    }}>
                      ₹{plan.price.toLocaleString()}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Benefits Section */}
        <div style={{ marginTop: '60px', textAlign: 'center' }}>
          <h2 style={{ color: '#ffffff', fontSize: '32px', marginBottom: '40px' }}>
            Why <span style={{ color: '#d4a574' }}>Subscribe</span>?
          </h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '30px' 
          }}>
            {[
              { icon: '💰', title: 'Save Money', desc: 'Up to 54% savings compared to daily rentals' },
              { icon: '🔄', title: 'Flexibility', desc: 'Switch cars anytime during your subscription' },
              { icon: '🛠️', title: 'Zero Maintenance', desc: 'All service and repairs covered' },
              { icon: '🛡️', title: 'Full Insurance', desc: 'Comprehensive coverage included' }
            ].map((benefit, idx) => (
              <div key={idx} style={{ 
                backgroundColor: '#1a1f3a', 
                padding: '30px', 
                borderRadius: '12px',
                border: '1px solid rgba(212,165,116,0.3)'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>{benefit.icon}</div>
                <h3 style={{ color: '#d4a574', fontSize: '20px', marginBottom: '12px' }}>{benefit.title}</h3>
                <p style={{ color: '#b0b8c8', fontSize: '14px' }}>{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subscription;
