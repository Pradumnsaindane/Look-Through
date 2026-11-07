import React from 'react';
import { ArrowRight } from 'lucide-react';
import { LookThroughMark } from '../../brand/LookThroughMark';
import { goTo } from '../../landing/navigation';
import { Reveal } from '../ui';
import type { SectionCtx } from '../types';

export const FooterSection: React.FC<{ ctx: SectionCtx }> = ({ ctx }) => (
  <footer id="footer" className="lt-section" style={{ paddingBottom: 56 }}>
    <Reveal className="lt-glass lt-glass-strong lt-cta">
      <span className="lt-eyebrow">Ready when you are</span>
      <h2 className="lt-h2">Put your whole business in view</h2>
      <p style={{ margin: '16px auto 0', maxWidth: 520, color: 'var(--muted)', fontSize: 17, lineHeight: 1.6 }}>One workspace for the work, the numbers and the next decision.</p>
      <div className="lt-actions"><button className="lt-btn lt-btn-primary" onClick={() => ctx.goSection('today')}>Back to Today <ArrowRight /></button></div>
    </Reveal>
    <div className="lt-footer">
      <div><span className="lt-brand"><LookThroughMark />LOOK THROUGH</span><p>The business operating system for teams that want fewer tools and clearer decisions.</p></div>
      <nav className="lt-footer-cols" aria-label="Footer">
        <div><h4>Product</h4>
          <button onClick={() => ctx.goSection('today')}>Today</button><button onClick={() => ctx.goSection('operations')}>Operations</button><button onClick={() => ctx.goSection('ai')}>AI intelligence</button><button onClick={() => goTo('/intro')}>Product story</button></div>
        <div><h4>Workspace</h4>
          <button onClick={() => ctx.openModule('customers')}>Customers</button><button onClick={() => ctx.openModule('finance')}>Finance</button><button onClick={() => ctx.openModule('work')}>Work</button><button onClick={() => ctx.openModule('analytics')}>Analytics</button></div>
        <div><h4>Settings</h4>
          <button onClick={() => ctx.openModule('settings')}>Settings</button><button onClick={() => ctx.openModule('integrations')}>Integrations</button><button onClick={() => ctx.openModule('alerts')}>Alerts</button></div>
      </nav>
    </div>
    <p className="lt-copy">© {new Date().getFullYear()} Look Through</p>
  </footer>
);
