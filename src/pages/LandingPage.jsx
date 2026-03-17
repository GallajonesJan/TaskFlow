import { useNavigate } from 'react-router-dom';
import './LandingPage.scss';

const CheckIcon  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>;
const ArrowIcon  = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;

const FEATURES = [
  { emoji: '✅', title: 'Task Management',    desc: 'Create, edit, and delete tasks with priority levels and due dates.' },
  { emoji: '📂', title: 'Categories',         desc: 'Organize tasks into custom categories with color coding.' },
  { emoji: '📅', title: 'Calendar View',      desc: 'Visualize your schedule with a full monthly calendar.' },
  { emoji: '📊', title: 'Dashboard Stats',    desc: 'Track completion rates and weekly activity at a glance.' },
  { emoji: '🔍', title: 'Search & Filter',    desc: 'Instantly find tasks by title, priority, or category.' },
  { emoji: '🌙', title: 'Dark Mode',          desc: 'Easy on the eyes — switch between light, dark, or system theme.' },
];

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="landing">

      {/* Nav */}
      <nav className="landing__nav">
        <div className="landing__nav-logo">
          <div className="landing__nav-icon">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round">
              <circle cx="12" cy="12" r="10" stroke="#fff"/>
              <polyline points="12 6 12 12 16 14" stroke="#fff"/>
            </svg>
          </div>
          <span>TaskFlow</span>
        </div>
        <div className="landing__nav-actions">
          <button className="landing__btn-ghost" onClick={() => navigate('/login')}>Log in</button>
          <button className="landing__btn-primary" onClick={() => navigate('/signup')}>Get Started</button>
        </div>
      </nav>

      {/* Hero */}
      <section className="landing__hero">
        <div className="landing__hero-badge">✨ Your productivity, simplified</div>
        <h1 className="landing__hero-title">
          Manage tasks.<br />
          <span className="landing__hero-gradient">Stay focused.</span>
        </h1>
        <p className="landing__hero-subtitle">
          TaskFlow helps you organize your work and personal life in one beautiful app.
          Track priorities, deadlines, and progress — all in real time.
        </p>
        <div className="landing__hero-actions">
          <button className="landing__btn-primary landing__btn-lg" onClick={() => navigate('/signup')}>
            Start for free <ArrowIcon />
          </button>
          <button className="landing__btn-ghost landing__btn-lg" onClick={() => navigate('/login')}>
            I already have an account
          </button>
        </div>
        <ul className="landing__hero-perks">
          {['No credit card required', 'Free forever', 'Set up in 2 minutes'].map(p => (
            <li key={p}><CheckIcon />{p}</li>
          ))}
        </ul>
      </section>

      {/* Features */}
      <section className="landing__features">
        <h2 className="landing__section-title">Everything you need</h2>
        <p className="landing__section-sub">Powerful features to keep you on track every day.</p>
        <div className="landing__features-grid">
          {FEATURES.map(f => (
            <div className="landing__feature-card" key={f.title}>
              <div className="landing__feature-emoji">{f.emoji}</div>
              <h3 className="landing__feature-title">{f.title}</h3>
              <p className="landing__feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="landing__cta">
        <h2 className="landing__cta-title">Ready to get things done?</h2>
        <p className="landing__cta-sub">Join thousands of people who use TaskFlow to stay organized.</p>
        <button className="landing__btn-primary landing__btn-lg" onClick={() => navigate('/signup')}>
          Create your free account <ArrowIcon />
        </button>
      </section>

      {/* Footer */}
      <footer className="landing__footer">
        <div className="landing__nav-logo">
          <div className="landing__nav-icon">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round">
              <circle cx="12" cy="12" r="10" stroke="#fff"/>
              <polyline points="12 6 12 12 16 14" stroke="#fff"/>
            </svg>
          </div>
          <span>TaskFlow</span>
        </div>
        <p>© 2026 TaskFlow. Built with ❤️</p>
      </footer>

    </div>
  );
};

export default LandingPage;