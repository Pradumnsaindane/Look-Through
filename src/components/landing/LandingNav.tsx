import React, { useEffect, useState } from 'react';
import { Menu, Moon, Sun, X } from 'lucide-react';
import { LookThroughMark } from '../brand/LookThroughMark';
import { goTo, jumpTo } from './navigation';

type NavItem = { id: string; label: string };

const navItems: NavItem[] = [
  { id: 'features', label: 'Features' },
  { id: 'how-it-works', label: 'How it works' },
  { id: 'walkthrough', label: 'Walkthrough' },
  { id: 'customers', label: 'Customers' },
  { id: 'pricing', label: 'Pricing' },
  { id: 'faq', label: 'FAQ' },
];

type LandingNavProps = { dark?: boolean; onThemeToggle?: () => void };

export const LandingNav: React.FC<LandingNavProps> = ({ dark = false, onThemeToggle }) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open]);

  const navigate = (id: string) => {
    setOpen(false);
    jumpTo(id);
  };

  const goHome = (event: React.MouseEvent) => {
    const path = window.location.pathname;
    if (path === '/' || path === '/intro') {
      event.preventDefault();
      setOpen(false);
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  };

  return (
    <>
      <header className="lp-nav">
        <a className="lp-nav-brand" href="/intro" onClick={goHome} aria-label="Look Through home">
          <LookThroughMark showWordmark />
        </a>

        <nav className="lp-nav-links" aria-label="Primary navigation">
          {navItems.map((item) => (
            <button key={item.id} type="button" onClick={() => navigate(item.id)}>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="lp-nav-actions">
          <button
            type="button"
            className="lp-icon-btn"
            onClick={onThemeToggle}
            aria-label={`Switch to ${dark ? 'light' : 'dark'} mode`}
            aria-pressed={dark}
          >
            {dark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button type="button" className="lp-pill-btn" onClick={() => goTo('/dashboard')}>
            Open workspace
          </button>
          <button
            type="button"
            className="lp-icon-btn lp-burger"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="lp-mobile-menu"
            aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </header>

      {open && (
        <div id="lp-mobile-menu" className="lp-mobile-panel">
          {navItems.map((item) => (
            <button key={item.id} type="button" onClick={() => navigate(item.id)}>
              {item.label}
              <span aria-hidden="true">→</span>
            </button>
          ))}
          <button type="button" onClick={() => { setOpen(false); jumpTo('contact'); }}>
            Contact
            <span aria-hidden="true">→</span>
          </button>
          <button type="button" className="lp-mobile-cta" onClick={() => goTo('/dashboard')}>
            Open workspace
          </button>
        </div>
      )}
    </>
  );
};

export default LandingNav;
