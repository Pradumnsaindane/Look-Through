import React, { useState } from 'react';
import { AlertCircle, Loader2, Send } from 'lucide-react';
import { safeFetchJson } from '../../shared/http/safeFetch';
import { useReveal } from './useReveal';

type FieldName = 'name' | 'email' | 'company' | 'topic' | 'message' | 'website';
type Status = { kind: 'idle' } | { kind: 'submitting' } | { kind: 'success'; message: string } | { kind: 'error'; message: string };

const empty = { name: '', email: '', company: '', topic: '', message: '', website: '' };

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(values: typeof empty): Partial<Record<FieldName, string>> {
  const errors: Partial<Record<FieldName, string>> = {};
  if (values.name.trim().length < 2) errors.name = 'Please enter your name (at least 2 characters).';
  else if (values.name.trim().length > 120) errors.name = 'Please keep your name under 120 characters.';
  if (!values.email.trim()) errors.email = 'Please enter your email address.';
  else if (!emailPattern.test(values.email.trim())) errors.email = 'That email address does not look valid.';
  if (!values.topic) errors.topic = 'Choose what your message is about.';
  if (values.message.trim().length < 20) errors.message = 'Tell us a little more — at least 20 characters.';
  else if (values.message.trim().length > 3000) errors.message = 'Please keep the message under 3000 characters.';
  return errors;
}

export const ContactSection: React.FC = () => {
  const ref = useReveal<HTMLElement>();
  const [values, setValues] = useState(empty);
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({});
  const [status, setStatus] = useState<Status>({ kind: 'idle' });

  const update = (field: FieldName, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    if (errors[field]) setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length > 0 || values.website.trim()) {
      setStatus(
        values.website.trim()
          ? { kind: 'error', message: 'This submission was rejected as automated. Nothing was sent.' }
          : { kind: 'error', message: 'Some fields need attention before the message can be sent.' },
      );
      return;
    }

    setStatus({ kind: 'submitting' });
    try {
      const result = await safeFetchJson<{ reference?: string }>('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: values.name.trim(),
          email: values.email.trim(),
          company: values.company.trim(),
          topic: values.topic,
          message: values.message.trim(),
          website: values.website,
        }),
      });

      if (result.ok) {
        const reference = result.data?.reference;
        setStatus({
          kind: 'success',
          message: reference
            ? `Message received. Your reference is ${reference}. Keep it if you need to follow up.`
            : 'Message received. We will reply to the email address you provided.',
        });
        setValues(empty);
        return;
      }

      setStatus({ kind: 'error', message: result.error?.message || 'The message could not be sent. Nothing was delivered — please try again.' });
    } catch {
      setStatus({
        kind: 'error',
        message: 'The contact service could not be reached, so nothing was sent. Please try again shortly.',
      });
    }
  };

  const fieldClass = (field: FieldName) => `lp-field${errors[field] ? ' has-error' : ''}`;

  return (
    <section id="contact" ref={ref} className="story-section" aria-labelledby="lp-contact-title">
      <div className="lp-label">Contact</div>
      <div className="story-split-heading">
        <h2 id="lp-contact-title" className="lp-h2 lp-reveal">Tell us what you<br /><em>are trying to run.</em></h2>
        <p className="lp-reveal">
          Describe your team, your workflow, or the rollout you are planning. The form validates your input and
          reports exactly what the server did with it.
        </p>
      </div>

      <div className="lp-contact">
        <form className="lp-form" onSubmit={submit} noValidate>
          <div className="lp-field-row">
            <div className={fieldClass('name')}>
              <label htmlFor="lp-contact-name">Name</label>
              <input
                id="lp-contact-name"
                name="name"
                type="text"
                autoComplete="name"
                value={values.name}
                onChange={(event) => update('name', event.target.value)}
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? 'lp-contact-name-error' : undefined}
              />
              {errors.name && <span className="lp-error" id="lp-contact-name-error">{errors.name}</span>}
            </div>

            <div className={fieldClass('email')}>
              <label htmlFor="lp-contact-email">Work email</label>
              <input
                id="lp-contact-email"
                name="email"
                type="email"
                autoComplete="email"
                value={values.email}
                onChange={(event) => update('email', event.target.value)}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? 'lp-contact-email-error' : undefined}
              />
              {errors.email && <span className="lp-error" id="lp-contact-email-error">{errors.email}</span>}
            </div>
          </div>

          <div className="lp-field-row">
            <div className={fieldClass('company')}>
              <label htmlFor="lp-contact-company">Company or institution (optional)</label>
              <input
                id="lp-contact-company"
                name="company"
                type="text"
                autoComplete="organization"
                value={values.company}
                onChange={(event) => update('company', event.target.value)}
              />
            </div>

            <div className={fieldClass('topic')}>
              <label htmlFor="lp-contact-topic">Topic</label>
              <select
                id="lp-contact-topic"
                name="topic"
                value={values.topic}
                onChange={(event) => update('topic', event.target.value)}
                aria-invalid={Boolean(errors.topic)}
                aria-describedby={errors.topic ? 'lp-contact-topic-error' : undefined}
              >
                <option value="">Select a topic</option>
                <option value="sales">Evaluating Look Through for a team</option>
                <option value="learning">Learning and enablement programs</option>
                <option value="support">Existing workspace support</option>
                <option value="partnership">Partnership or integration</option>
              </select>
              {errors.topic && <span className="lp-error" id="lp-contact-topic-error">{errors.topic}</span>}
            </div>
          </div>

          <div className={fieldClass('message')}>
            <label htmlFor="lp-contact-message">Message</label>
            <textarea
              id="lp-contact-message"
              name="message"
              value={values.message}
              onChange={(event) => update('message', event.target.value)}
              aria-invalid={Boolean(errors.message)}
              aria-describedby={errors.message ? 'lp-contact-message-error' : undefined}
            />
            {errors.message && <span className="lp-error" id="lp-contact-message-error">{errors.message}</span>}
          </div>

          <div className="lp-honeypot" aria-hidden="true">
            <label htmlFor="lp-contact-website">Leave this field empty</label>
            <input id="lp-contact-website" name="website" type="text" tabIndex={-1} autoComplete="off" value={values.website} onChange={(event) => update('website', event.target.value)} />
          </div>

          <button className="lp-submit" type="submit" disabled={status.kind === 'submitting'}>
            {status.kind === 'submitting' ? <Loader2 size={16} className="lp-spin" aria-hidden="true" /> : <Send size={16} aria-hidden="true" />}
            {status.kind === 'submitting' ? 'Sending…' : 'Send message'}
          </button>

          {status.kind === 'success' && (
            <p className="lp-form-status is-ok" role="status">{status.message}</p>
          )}
          {status.kind === 'error' && (
            <p className="lp-form-status is-error" role="alert">
              <AlertCircle size={14} style={{ verticalAlign: -2 }} aria-hidden="true" /> {status.message}
            </p>
          )}
        </form>

        <aside className="lp-contact-aside">
          <div className="lp-contact-card">
            <h3>Direct email</h3>
            <p>ellipses303@gmail.com</p>
          </div>
          <div className="lp-contact-card">
            <h3>Response time</h3>
            <p>Within 1 - 2 business days</p>
          </div>
          <div className="lp-contact-card">
            <h3>Office locations</h3>
            <p>Pune, Maharashtra</p>
          </div>
          <div className="lp-contact-card">
            <h3>Prefer to explore first?</h3>
            <p>Open the workspace and walk through the product before talking to anyone.</p>
          </div>
        </aside>
      </div>
    </section>
  );
};

export default ContactSection;
