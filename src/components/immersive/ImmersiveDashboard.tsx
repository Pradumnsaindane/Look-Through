import React, { Suspense, lazy, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Menu, Moon, Plus, Search, Sparkles, Sun, X, LogOut } from 'lucide-react';
import './immersive.css';
import { authClient } from '../../auth/neonAuthClient';
import { useBusiness } from '../../context/BusinessContext';
import { useDashboardData } from '../../dashboard/dashboardApi';
import type { NavigationTab } from '../../types';
import { LookThroughMark } from '../brand/LookThroughMark';
import { AuthScreen } from '../auth/AuthScreen';
import { RequireAuthentication } from '../auth/RequireAuthentication';
import { PlanetBackground } from './PlanetBackground';
import { scrollToSection, useRevealScan, useScrollProgressVar, useSectionSpy, useSessionUser } from './hooks';
import { StateBox } from './ui';
import type { SectionCtx } from './types';
import { HeroSection } from './sections/HeroSection';
import { TodaySection } from './sections/TodaySection';
import { OperationsSection } from './sections/OperationsSection';
import { WorkspaceSection } from './sections/WorkspaceSection';
import { AISection } from './sections/AISection';
import { InsightsSection } from './sections/InsightsSection';
import { ConnectedSection } from './sections/ConnectedSection';
import { FooterSection } from './sections/FooterSection';

const CustomersView = lazy(() => import('../customers/CustomersView').then(m => ({ default: m.CustomersView })));
const FinanceView = lazy(() => import('../finance/FinanceView').then(m => ({ default: m.FinanceView })));
const WorkView = lazy(() => import('../work/WorkView').then(m => ({ default: m.WorkView })));
const AnalyticsView = lazy(() => import('../analytics/AnalyticsView').then(m => ({ default: m.AnalyticsView })));
const AIIntelligenceView = lazy(() => import('../ai/AIIntelligenceView').then(m => ({ default: m.AIIntelligenceView })));
const AlertsView = lazy(() => import('../alerts/AlertsView').then(m => ({ default: m.AlertsView })));
const IntegrationsView = lazy(() => import('../integrations/IntegrationsView').then(m => ({ default: m.IntegrationsView })));
const SettingsView = lazy(() => import('../settings/SettingsView').then(m => ({ default: m.SettingsView })));
const TodayView = lazy(() => import('../today/TodayView').then(m => ({ default: m.TodayView })));

const SECTIONS = [
  { id: 'today', label: 'Today' }, { id: 'operations', label: 'Operations' }, { id: 'workspace', label: 'Workspace' },
  { id: 'ai', label: 'AI' }, { id: 'insights', label: 'Insights' }, { id: 'connected', label: 'Connected' },
];
const SECTION_IDS = ['hero', ...SECTIONS.map(s => s.id)];
const MODULE_TITLE: Record<NavigationTab, string> = {
  overview: 'Workspace', today: 'Today', customers: 'Customers', finance: 'Finance', work: 'Work',
  analytics: 'Analytics', ai: 'AI intelligence', alerts: 'Alerts', integrations: 'Integrations', settings: 'Settings',
};
const MODULE_TABS = new Set<NavigationTab>(['today', 'customers', 'finance', 'work', 'analytics', 'ai', 'alerts', 'integrations', 'settings']);
const tabFromHash = (): NavigationTab => { const h = window.location.hash.replace(/^#\/?/, '') as NavigationTab; return MODULE_TABS.has(h) ? h : 'overview'; };
const THEME_KEY = 'look-through.theme';

function renderModule(tab: NavigationTab): React.ReactNode {
  const guarded = (node: React.ReactNode, capability: 'personal' | 'organization' | 'permission' = 'organization') => <RequireAuthentication capability={capability}>{node}</RequireAuthentication>;
  switch (tab) {
    case 'today': return <TodayView />;
    case 'customers': return guarded(<CustomersView />);
    case 'finance': return guarded(<FinanceView />);
    case 'work': return guarded(<WorkView />);
    case 'analytics': return guarded(<AnalyticsView />);
    case 'ai': return guarded(<AIIntelligenceView />, 'permission');
    case 'alerts': return guarded(<AlertsView />);
    case 'integrations': return guarded(<IntegrationsView />, 'permission');
    case 'settings': return guarded(<SettingsView />, 'personal');
    default: return null;
  }
}

/**
 * The continuous scrolling workspace that replaces the sidebar dashboard.
 * One WebGL planet sits behind everything; module pages (customers, finance, …) open in a glass
 * layer over it, keep browser history through `#<tab>`, and keep their existing auth guards.
 */
export const ImmersiveDashboard: React.FC = () => {
  const { activeTab, setActiveTab, setIsCommandMenuOpen, setIsCreateModalOpen } = useBusiness();
  const { state: sessionState, user } = useSessionUser();
  const dash = useDashboardData();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const savedScroll = useRef(0);
  const [dark, setDark] = useState(() => { try { return window.localStorage.getItem(THEME_KEY) !== 'light'; } catch { return true; } });
  const [drawer, setDrawer] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const inModule = activeTab !== 'overview';

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
    try { window.localStorage.setItem(THEME_KEY, dark ? 'dark' : 'light'); } catch { /* storage unavailable */ }
  }, [dark]);

  // direct route access + browser history: /dashboard#customers
  useEffect(() => { const t = tabFromHash(); if (t !== 'overview') setActiveTab(t); }, [setActiveTab]);
  useEffect(() => {
    const onPop = () => setActiveTab(tabFromHash());
    window.addEventListener('popstate', onPop);
    window.addEventListener('hashchange', onPop);
    return () => { window.removeEventListener('popstate', onPop); window.removeEventListener('hashchange', onPop); };
  }, [setActiveTab]);
  useEffect(() => {
    const want = activeTab === 'overview' ? '' : `#${activeTab}`;
    if (window.location.hash !== want) window.history.pushState({ tab: activeTab }, '', `${window.location.pathname}${want}`);
  }, [activeTab]);

  const openModule = useCallback((tab: NavigationTab) => {
    if (tab === 'overview') { setActiveTab('overview'); return; }
    if (activeTab === 'overview') savedScroll.current = window.scrollY;
    setDrawer(false); setActiveTab(tab);
  }, [activeTab, setActiveTab]);

  useLayoutEffect(() => {
    if (inModule) window.scrollTo(0, 0);
    else window.scrollTo(0, savedScroll.current);
  }, [inModule, activeTab]);

  const goSection = useCallback((id: string) => {
    setDrawer(false);
    if (activeTab !== 'overview') { setActiveTab('overview'); window.setTimeout(() => scrollToSection(id), 80); } else scrollToSection(id);
  }, [activeTab, setActiveTab]);

  useEffect(() => {
    if (!drawer && !authOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { setDrawer(false); setAuthOpen(false); } };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [drawer, authOpen]);
  useEffect(() => { if (sessionState === 'authenticated') setAuthOpen(false); }, [sessionState]);

  useScrollProgressVar(rootRef, !inModule);
  const active = useSectionSpy(SECTION_IDS, !inModule);
  useRevealScan(rootRef, `${inModule}:${sessionState}:${dash.isLoading}:${Boolean(dash.data)}:${Boolean(dash.error)}`);

  const ctx: SectionCtx = useMemo(() => ({
    sessionState, user, data: dash.data, error: dash.error, isLoading: dash.isLoading || sessionState === 'initializing',
    mutate: dash.mutate, openModule, goSection, openAuth: () => setAuthOpen(true),
  }), [sessionState, user, dash.data, dash.error, dash.isLoading, dash.mutate, openModule, goSection]);

  const toggleTheme = () => setDark(v => !v);
  const themeBtn = <button className="lt-icon-btn" onClick={toggleTheme} aria-label={`Switch to ${dark ? 'light' : 'dark'} theme`}>{dark ? <Sun /> : <Moon />}</button>;

  return (
    <div ref={rootRef} className="lt-immersive" data-theme={dark ? 'dark' : 'light'}>
      <a href="#lt-main" className="lt-skip">Skip to content</a>
      <PlanetBackground paused={inModule || authOpen} light={!dark} />

      <nav className="lt-nav" aria-label="Workspace">
        <button className="lt-brand" onClick={() => inModule ? openModule('overview') : window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Look Through — back to top"><LookThroughMark />LOOK THROUGH</button>
        {inModule
          ? <button className="lt-btn lt-btn-ghost lt-btn-sm" style={{ marginLeft: 10 }} onClick={() => openModule('overview')}><ArrowLeft />Workspace</button>
          : <ul className="lt-nav-links">{SECTIONS.map(s => <li key={s.id}><button onClick={() => goSection(s.id)} aria-current={active === s.id ? 'true' : undefined}>{s.label}</button></li>)}</ul>}
        <div className="lt-nav-actions">
          <button className="lt-search" onClick={() => setIsCommandMenuOpen(true)} aria-label="Search and command palette"><Search /><span>Search</span><kbd>⌘K</kbd></button>
          <button className="lt-icon-btn lt-hide-sm" onClick={() => openModule('ai')} aria-label="Open AI assistant"><Sparkles /></button>
          <button className="lt-icon-btn lt-hide-sm" onClick={() => setIsCreateModalOpen(true)} aria-label="Quick create"><Plus /></button>
          <span className="lt-hide-sm" style={{ display: 'contents' }}>{themeBtn}</span>
          {sessionState === 'authenticated'
            ? <button className="lt-icon-btn lt-hide-sm" onClick={() => authClient?.signOut()} aria-label="Sign out"><LogOut /></button>
            : sessionState === 'guest' && <button className="lt-btn lt-btn-primary lt-btn-sm lt-hide-sm" onClick={() => setAuthOpen(true)}>Sign in</button>}
          <button className="lt-icon-btn lt-menu-btn" onClick={() => setDrawer(true)} aria-label="Open navigation" aria-expanded={drawer}><Menu /></button>
        </div>
      </nav>

      {drawer && (
        <div className="lt-drawer" onClick={() => setDrawer(false)}>
          <div className="lt-drawer-panel lt-glass lt-glass-strong" role="dialog" aria-modal="true" aria-label="Navigation" onClick={e => e.stopPropagation()}>
            <button className="lt-icon-btn" style={{ alignSelf: 'flex-end' }} onClick={() => setDrawer(false)} aria-label="Close navigation"><X /></button>
            {SECTIONS.map(s => <button key={s.id} className="lt-drawer-link" onClick={() => goSection(s.id)} aria-current={!inModule && active === s.id ? 'true' : undefined}>{s.label}</button>)}
            <hr style={{ border: 0, borderTop: '1px solid var(--line)', margin: '8px 0' }} />
            <button className="lt-drawer-link" onClick={() => { setDrawer(false); openModule('ai'); }}><Sparkles />AI assistant</button>
            <button className="lt-drawer-link" onClick={() => { setDrawer(false); setIsCreateModalOpen(true); }}><Plus />Quick create</button>
            <button className="lt-drawer-link" onClick={toggleTheme}>{dark ? <Sun /> : <Moon />}{dark ? 'Light theme' : 'Dark theme'}</button>
            {sessionState === 'authenticated'
              ? <button className="lt-drawer-link" onClick={() => authClient?.signOut()}><LogOut />Sign out</button>
              : sessionState === 'guest' && <button className="lt-drawer-link" onClick={() => { setDrawer(false); setAuthOpen(true); }}>Sign in</button>}
            <hr style={{ border: 0, borderTop: '1px solid var(--line)', margin: '8px 0' }} />
            {(['customers', 'finance', 'work', 'analytics', 'settings'] as NavigationTab[]).map(t => <button key={t} className="lt-drawer-link" onClick={() => openModule(t)}>{MODULE_TITLE[t]}</button>)}
          </div>
        </div>
      )}

      {authOpen && (
        <div className="lt-auth-overlay" role="dialog" aria-modal="true" aria-label="Sign in">
          <button className="lt-icon-btn lt-auth-close" onClick={() => setAuthOpen(false)} aria-label="Close sign in"><X /></button>
          <AuthScreen />
        </div>
      )}

      {inModule ? (
        <main id="lt-main" className="lt-module-wrap">
          <div className="lt-module-bar"><h1>{MODULE_TITLE[activeTab]}</h1></div>
          <div className="lt-module">
            <Suspense fallback={<StateBox kind="loading" />}>{renderModule(activeTab)}</Suspense>
          </div>
        </main>
      ) : (
        <main id="lt-main" className="lt-page">
          <HeroSection ctx={ctx} />
          <TodaySection ctx={ctx} />
          <OperationsSection ctx={ctx} />
          <WorkspaceSection ctx={ctx} />
          <AISection ctx={ctx} />
          <InsightsSection ctx={ctx} />
          <ConnectedSection ctx={ctx} dark={dark} onTheme={toggleTheme} />
          <FooterSection ctx={ctx} />
        </main>
      )}
    </div>
  );
};
export default ImmersiveDashboard;
