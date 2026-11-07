import React, { useState } from 'react';
import { ArrowRight, Eye, Lightbulb, ShieldCheck, Play, FilePen } from 'lucide-react';
import { safeFetchJson } from '../../../shared/http/safeFetch';
import { Reveal, SectionHead, StateBox } from '../ui';
import type { SectionCtx } from '../types';

const LADDER = [
  { n: '01', name: 'Read', body: 'Grounded in your own records.', icon: <Eye /> },
  { n: '02', name: 'Suggest', body: 'Recommends a next step.', icon: <Lightbulb /> },
  { n: '03', name: 'Prepare', body: 'Drafts it for your review.', icon: <FilePen /> },
  { n: '04', name: 'Approve', body: 'You confirm. Nothing runs without it.', icon: <ShieldCheck /> },
  { n: '05', name: 'Execute', body: 'Runs only after sign-off.', icon: <Play /> },
];
/** Approved READ tools exposed by /api/ai. Each question maps to exactly one tool; no canned answers. */
const QUESTIONS = [
  { tool: 'get_business_summary', label: 'Summarize my business' },
  { tool: 'get_overdue_invoices', label: 'What is overdue?' },
  { tool: 'get_sales_pipeline', label: 'How is the pipeline?' },
  { tool: 'get_recent_activity', label: 'What changed recently?' },
];

type Run = { tool: string; label: string; status: 'running' | 'ok' | 'error'; result?: unknown; message?: string; runId?: string };

/** Pull array lengths out of an arbitrary grounded result, one level deep, for a readable summary. */
function counts(result: unknown): Array<[string, number]> {
  const out: Array<[string, number]> = [];
  const walk = (o: unknown, depth: number) => {
    if (!o || typeof o !== 'object' || depth > 2) return;
    for (const [k, v] of Object.entries(o as Record<string, unknown>)) {
      if (Array.isArray(v)) out.push([k.replace(/_/g, ' '), v.length]); else if (v && typeof v === 'object') walk(v, depth + 1);
    }
  };
  walk(result, 0);
  return out.slice(0, 6);
}

export const AISection: React.FC<{ ctx: SectionCtx }> = ({ ctx }) => {
  const [run, setRun] = useState<Run | null>(null);
  const authed = ctx.sessionState === 'authenticated';

  const ask = async (q: (typeof QUESTIONS)[number]) => {
    setRun({ tool: q.tool, label: q.label, status: 'running' });
    const res = await safeFetchJson<{ runId: string; tool: string; result: unknown; grounded: boolean }>('/api/ai', {
      method: 'POST', credentials: 'include', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ prompt: q.label, tool: q.tool, mode: 'READ', input: {} }),
    });
    if (!res.ok || !res.data) setRun({ tool: q.tool, label: q.label, status: 'error', message: res.error?.message ?? `The AI service returned status ${res.status}.` });
    else setRun({ tool: q.tool, label: q.label, status: 'ok', result: res.data.result, runId: res.data.runId });
  };

  const raw = run?.status === 'ok' ? JSON.stringify(run.result, null, 2) : '';
  return (
    <section id="ai" className="lt-section" aria-labelledby="lt-ai-h">
      <SectionHead eyebrow="AI intelligence" title="An intelligent layer across the whole workspace" body="It reads your data, suggests, prepares, and waits for your approval. It never acts on its own." />
      <h3 id="lt-ai-h" className="lt-sr">AI assistant</h3>
      <ol className="lt-ladder" style={{ listStyle: 'none' }} aria-label="AI action hierarchy">
        {LADDER.map((s, i) => <Reveal as="li" key={s.n} delay={i * 80} className="lt-glass lt-step"><span>{s.n}</span><strong>{s.name}</strong><p>{s.body}</p></Reveal>)}
      </ol>
      <Reveal delay={120} className="lt-glass lt-glass-strong">
        <div style={{ padding: 'clamp(20px,3vw,32px)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <strong style={{ fontSize: 18 }}>Ask about your business</strong>
            <span className="lt-pill">Read-only · grounded</span>
          </div>
          <p style={{ color: 'var(--muted)', fontSize: 14.5, marginTop: 6 }}>Each question runs one approved read tool against your organization's data and shows exactly what came back.</p>
          {!authed
            ? <StateBox kind={ctx.sessionState === 'initializing' ? 'loading' : 'guest'} title="AI needs your workspace" body="Sign in with an authorized account to ask questions about your own data." action={ctx.sessionState === 'guest' ? <button className="lt-btn lt-btn-primary lt-btn-sm" onClick={ctx.openAuth}>Sign in</button> : undefined} />
            : <>
              <div className="lt-chips" role="group" aria-label="Business questions">
                {QUESTIONS.map(q => <button key={q.tool} className="lt-chip" aria-pressed={run?.tool === q.tool} disabled={run?.status === 'running'} onClick={() => ask(q)}>{q.label}</button>)}
              </div>
              <div className="lt-console" aria-live="polite">
                {!run && <span style={{ color: 'var(--muted-2)' }}>Choose a question to run it.</span>}
                {run?.status === 'running' && <StateBox kind="loading" />}
                {run?.status === 'error' && <StateBox kind="error" title="The AI request failed" body={run.message} onRetry={() => ask(QUESTIONS.find(q => q.tool === run.tool)!)} />}
                {run?.status === 'ok' && <>
                  <div className="lt-kv">{counts(run.result).map(([k, v]) => <div key={k}><small>{k}</small><b>{v}</b></div>)}</div>
                  <details><summary style={{ cursor: 'pointer', color: 'var(--muted)' }}>Raw result · run {run.runId?.slice(0, 8)}</summary><pre>{raw.length > 6000 ? raw.slice(0, 6000) + '\n… truncated' : raw}</pre></details>
                </>}
              </div>
            </>}
          <div className="lt-actions" style={{ justifyContent: 'flex-start', marginTop: 20 }}>
            <button className="lt-btn lt-btn-outline" onClick={() => ctx.openModule('ai')}>Open the AI workspace<ArrowRight /></button>
          </div>
        </div>
      </Reveal>
    </section>
  );
};
