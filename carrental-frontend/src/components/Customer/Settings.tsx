import React, { useState } from 'react';
import { FiSettings, FiFileText, FiShield, FiChevronRight, FiCheck, FiBell, FiMoon, FiGlobe, FiChevronDown } from 'react-icons/fi';
import '../../styles/Settings.css';

const Settings: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'settings' | 'terms' | 'privacy' | 'help'>('settings');
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [notifications, setNotifications] = useState({
    email: true,
    sms: true,
    push: false,
    promotions: true
  });
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState('en');

  const renderSettings = () => (
    <div className="settings-content">
      <h2 className="settings-title">Settings</h2>
      
      {/* Notification Settings */}
      <div className="settings-card">
        <div className="settings-card-header">
          <FiBell className="settings-icon" />
          <h3>Notification Preferences</h3>
        </div>
        <div className="settings-options">
          <div className="settings-option">
            <div className="option-info">
              <span className="option-label">Email Notifications</span>
              <span className="option-desc">Receive booking updates via email</span>
            </div>
            <label className="toggle-switch">
              <input 
                type="checkbox" 
                checked={notifications.email}
                onChange={(e) => setNotifications({...notifications, email: e.target.checked})}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
          <div className="settings-option">
            <div className="option-info">
              <span className="option-label">SMS Notifications</span>
              <span className="option-desc">Get SMS alerts for important updates</span>
            </div>
            <label className="toggle-switch">
              <input 
                type="checkbox" 
                checked={notifications.sms}
                onChange={(e) => setNotifications({...notifications, sms: e.target.checked})}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
          <div className="settings-option">
            <div className="option-info">
              <span className="option-label">Push Notifications</span>
              <span className="option-desc">Browser push notifications</span>
            </div>
            <label className="toggle-switch">
              <input 
                type="checkbox" 
                checked={notifications.push}
                onChange={(e) => setNotifications({...notifications, push: e.target.checked})}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
          <div className="settings-option">
            <div className="option-info">
              <span className="option-label">Promotional Offers</span>
              <span className="option-desc">Receive special deals and discounts</span>
            </div>
            <label className="toggle-switch">
              <input 
                type="checkbox" 
                checked={notifications.promotions}
                onChange={(e) => setNotifications({...notifications, promotions: e.target.checked})}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>
      </div>

      {/* Appearance Settings */}
      <div className="settings-card">
        <div className="settings-card-header">
          <FiMoon className="settings-icon" />
          <h3>Appearance</h3>
        </div>
        <div className="settings-options">
          <div className="settings-option">
            <div className="option-info">
              <span className="option-label">Dark Mode</span>
              <span className="option-desc">Switch to dark theme</span>
            </div>
            <label className="toggle-switch">
              <input 
                type="checkbox" 
                checked={darkMode}
                onChange={(e) => setDarkMode(e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>
      </div>

      {/* Language Settings */}
      <div className="settings-card">
        <div className="settings-card-header">
          <FiGlobe className="settings-icon" />
          <h3>Language & Region</h3>
        </div>
        <div className="settings-options">
          <div className="settings-option">
            <div className="option-info">
              <span className="option-label">Language</span>
              <span className="option-desc">Select your preferred language</span>
            </div>
            <select 
              className="language-select"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="en">English</option>
              <option value="hi">Hindi</option>
              <option value="ta">Tamil</option>
              <option value="ml">Malayalam</option>
            </select>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="settings-card">
        <div className="settings-card-header">
          <FiFileText className="settings-icon" />
          <h3>Legal</h3>
        </div>
        <div className="settings-links">
          <button 
            className="settings-link-btn"
            onClick={() => setActiveSection('terms')}
          >
            <span>Terms & Conditions</span>
            <FiChevronRight />
          </button>
          <button 
            className="settings-link-btn"
            onClick={() => setActiveSection('privacy')}
          >
            <span>Privacy Policy</span>
            <FiChevronRight />
          </button>
        </div>
      </div>

      {/* Help & Support Link */}
      <div className="settings-card">
        <button 
          className="settings-link-btn"
          onClick={() => setActiveSection('help')}
        >
          <span>Help & Support</span>
          <FiChevronRight />
        </button>
      </div>

      <button className="save-settings-btn">
        <FiCheck /> Save Settings
      </button>
    </div>
  );

  const renderTerms = () => (
    <div className="legal-content">
      <button className="back-btn" onClick={() => setActiveSection('settings')}>
        ← Back to Settings
      </button>
      <h2 className="legal-title">Terms & Conditions</h2>
      <div className="legal-document">
        <p className="legal-updated">Last Updated: March 11, 2026</p>
        
        <section className="legal-section">
          <h3>1. Acceptance of Terms</h3>
          <p>By accessing and using MotoGlide Car Rental services, you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to abide by these terms, please do not use our services.</p>
        </section>

        <section className="legal-section">
          <h3>2. Eligibility Requirements</h3>
          <p>To rent a vehicle from MotoGlide, you must:</p>
          <ul>
            <li>Be at least 21 years of age</li>
            <li>Possess a valid driving license for at least 1 year</li>
            <li>Provide valid government-issued identification</li>
            <li>Have a valid credit/debit card for payment</li>
            <li>Meet our driver verification requirements</li>
          </ul>
        </section>

        <section className="legal-section">
          <h3>3. Booking & Reservations</h3>
          <p>All bookings are subject to vehicle availability. We reserve the right to substitute a vehicle of similar or higher category if the reserved vehicle is unavailable. Advance booking is recommended, especially during peak seasons.</p>
        </section>

        <section className="legal-section">
          <h3>4. Rental Period & Extensions</h3>
          <p>The rental period begins at the scheduled pickup time and ends at the scheduled return time. Late returns may incur additional charges. Extensions must be requested at least 4 hours before the scheduled return time and are subject to availability.</p>
        </section>

        <section className="legal-section">
          <h3>5. Payment Terms</h3>
          <p>Payment is required at the time of booking. We accept major credit cards, debit cards, and UPI payments. A security deposit may be required and will be refunded within 7 business days after vehicle return, subject to inspection.</p>
        </section>

        <section className="legal-section">
          <h3>6. Cancellation Policy</h3>
          <ul>
            <li>Free cancellation up to 24 hours before pickup</li>
            <li>50% refund for cancellations within 24 hours of pickup</li>
            <li>No refund for no-shows or cancellations after pickup time</li>
          </ul>
        </section>

        <section className="legal-section">
          <h3>7. Vehicle Usage</h3>
          <p>The rented vehicle must be used only for lawful purposes. The following are strictly prohibited:</p>
          <ul>
            <li>Driving under the influence of alcohol or drugs</li>
            <li>Sub-letting or allowing unauthorized drivers</li>
            <li>Using the vehicle for racing or off-road driving</li>
            <li>Transporting illegal goods or substances</li>
            <li>Crossing state/country borders without prior approval</li>
          </ul>
        </section>

        <section className="legal-section">
          <h3>8. Insurance & Liability</h3>
          <p>Basic insurance coverage is included in the rental price. The renter is responsible for any damage not covered by insurance, including but not limited to damage caused by negligence, violation of terms, or accidents involving unauthorized drivers.</p>
        </section>

        <section className="legal-section">
          <h3>9. Fuel Policy</h3>
          <p>Vehicles are provided with a full tank of fuel and must be returned with a full tank. Failure to refuel will result in refueling charges plus a service fee.</p>
        </section>

        <section className="legal-section">
          <h3>10. Contact Information</h3>
          <p>For any queries or concerns regarding these terms, please contact us at:</p>
          <p>Email: support@motoglide.com</p>
          <p>Phone: +91 1800-123-4567</p>
        </section>
      </div>
    </div>
  );

  const renderPrivacy = () => (
    <div className="legal-content">
      <button className="back-btn" onClick={() => setActiveSection('settings')}>
        ← Back to Settings
      </button>
      <h2 className="legal-title">Privacy Policy</h2>
      <div className="legal-document">
        <p className="legal-updated">Last Updated: March 11, 2026</p>
        
        <section className="legal-section">
          <h3>1. Information We Collect</h3>
          <p>We collect information you provide directly to us, including:</p>
          <ul>
            <li>Personal identification information (Name, email, phone number)</li>
            <li>Driver's license details and photographs</li>
            <li>Payment information</li>
            <li>Booking history and preferences</li>
            <li>Device and usage information</li>
          </ul>
        </section>

        <section className="legal-section">
          <h3>2. How We Use Your Information</h3>
          <p>We use the collected information to:</p>
          <ul>
            <li>Process and manage your bookings</li>
            <li>Verify your identity and driving credentials</li>
            <li>Communicate with you about your rentals</li>
            <li>Send promotional offers and updates (with your consent)</li>
            <li>Improve our services and user experience</li>
            <li>Comply with legal obligations</li>
          </ul>
        </section>

        <section className="legal-section">
          <h3>3. Information Sharing</h3>
          <p>We do not sell your personal information. We may share your information with:</p>
          <ul>
            <li>Service providers who assist in our operations</li>
            <li>Insurance companies for claim processing</li>
            <li>Law enforcement when required by law</li>
            <li>Business partners with your explicit consent</li>
          </ul>
        </section>

        <section className="legal-section">
          <h3>4. Data Security</h3>
          <p>We implement industry-standard security measures to protect your personal information, including encryption, secure servers, and regular security audits. However, no method of transmission over the Internet is 100% secure.</p>
        </section>

        <section className="legal-section">
          <h3>5. Your Rights</h3>
          <p>You have the right to:</p>
          <ul>
            <li>Access your personal information</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Opt-out of marketing communications</li>
            <li>Data portability</li>
          </ul>
        </section>

        <section className="legal-section">
          <h3>6. Cookies & Tracking</h3>
          <p>We use cookies and similar technologies to enhance your experience, analyze usage patterns, and deliver personalized content. You can manage cookie preferences through your browser settings.</p>
        </section>

        <section className="legal-section">
          <h3>7. Data Retention</h3>
          <p>We retain your personal information for as long as necessary to provide our services and comply with legal obligations. Booking records are retained for 7 years for legal and accounting purposes.</p>
        </section>

        <section className="legal-section">
          <h3>8. Children's Privacy</h3>
          <p>Our services are not intended for individuals under 18 years of age. We do not knowingly collect personal information from children.</p>
        </section>

        <section className="legal-section">
          <h3>9. Changes to This Policy</h3>
          <p>We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last Updated" date.</p>
        </section>

        <section className="legal-section">
          <h3>10. Contact Us</h3>
          <p>If you have questions about this Privacy Policy, please contact us at:</p>
          <p>Email: privacy@motoglide.com</p>
          <p>Phone: +91 1800-123-4567</p>
          <p>Address: MotoGlide Headquarters, Chennai, Tamil Nadu, India</p>
        </section>
      </div>
    </div>
  );

  const renderHelp = () => {
    const faqs = [
      {
        id: 1,
        question: 'How do I book a car?',
        answer: 'To book a car, navigate to the Featured Cars section, select your desired vehicle, choose your pickup and return dates, and proceed to payment. You will receive a confirmation email with your booking details.'
      },
      {
        id: 2,
        question: 'What documents do I need to rent a car?',
        answer: 'You need a valid driving license (at least 1 year old), government-issued ID, and a valid credit/debit card. You may also need to upload photos of your license front and back for verification.'
      },
      {
        id: 3,
        question: 'Can I cancel my booking?',
        answer: 'Yes, you can cancel your booking up to 24 hours before pickup for a full refund. Cancellations within 24 hours of pickup will receive a 50% refund. No refund is provided for no-shows.'
      },
      {
        id: 4,
        question: 'What is included in the rental price?',
        answer: 'The rental price includes basic insurance coverage, unlimited kilometers, and 24/7 roadside assistance. Additional services like GPS, child seat, or extra driver can be added for an additional fee.'
      },
      {
        id: 5,
        question: 'How do I apply a coupon code?',
        answer: 'During the booking process, you will see an option to apply a coupon code. Enter your valid coupon code and click Apply. The discount will be reflected in your total amount.'
      },
      {
        id: 6,
        question: 'What if I need to extend my rental?',
        answer: 'You can request an extension at least 4 hours before your scheduled return time. Extensions are subject to vehicle availability and will be charged at the daily rate.'
      },
      {
        id: 7,
        question: 'How do I view my payment history?',
        answer: 'Go to the Payment History section in your dashboard to view all your past transactions, invoices, and booking details.'
      },
      {
        id: 8,
        question: 'What should I do if I encounter an issue during my rental?',
        answer: 'Contact our 24/7 customer support team immediately. You can reach us via phone, email, or the in-app chat feature. We will assist you with any roadside issues or emergencies.'
      },
      {
        id: 9,
        question: 'How do I add a car to my favorites?',
        answer: 'Click the heart icon on any featured car to add it to your favorites. You can view all your favorite cars in the Favorites section of your dashboard.'
      },
      {
        id: 10,
        question: 'Is there a loyalty program?',
        answer: 'Yes! We offer loyalty rewards for frequent renters. Earn points on every booking and redeem them for discounts on future rentals.'
      }
    ];

    return (
      <div className="help-content">
        <button className="back-btn" onClick={() => setActiveSection('settings')}>
          ← Back to Settings
        </button>
        <h2 className="help-title">Help & Support</h2>
        <p className="help-subtitle">Find answers to common questions about our car rental service</p>
        
        <div className="faq-section">
          <h3 className="faq-heading">Frequently Asked Questions</h3>
          <div className="faq-list">
            {faqs.map((faq) => (
              <div key={faq.id} className="faq-item">
                <button
                  className="faq-question"
                  onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                >
                  <span>{faq.question}</span>
                  <FiChevronDown 
                    className={`faq-icon ${expandedFAQ === faq.id ? 'expanded' : ''}`}
                  />
                </button>
                {expandedFAQ === faq.id && (
                  <div className="faq-answer">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="help-contact">
          <h3>Still need help?</h3>
          <p>Contact our customer support team:</p>
          <div className="contact-info">
            <p><strong>Email:</strong> support@motoglide.com</p>
            <p><strong>Phone:</strong> +91 1800-123-4567</p>
            <p><strong>Hours:</strong> 24/7 Available</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="settings-page">
      <div className="settings-container">
        {activeSection === 'settings' && renderSettings()}
        {activeSection === 'terms' && renderTerms()}
        {activeSection === 'privacy' && renderPrivacy()}
        {activeSection === 'help' && renderHelp()}
      </div>
    </div>
  );
};

export default Settings;
