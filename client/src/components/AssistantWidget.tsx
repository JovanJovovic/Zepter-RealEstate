import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { createAssistantInquiry } from '../api/assistant';
import { getCopy } from '../data/localization';
import type { SupportedLanguage } from '../types/property';
import { publicImage } from '../utils/asset';

interface AssistantWidgetProps {
  currentPath: string;
  language: SupportedLanguage;
}

type AssistantStep = 'question' | 'contact' | 'success';

const isValidEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const isValidPhone = (phone: string) => {
  return /^\+?\d{6,20}$/.test(phone.replace(/[\s().-]/g, ''));
};

const getPropertyIdFromPath = (path: string) => {
  if (!path.startsWith('/properties/')) return '';
  return decodeURIComponent(path.replace('/properties/', ''));
};

const getVisiblePropertyName = () => {
  return document.querySelector('.property-details-intro h1')?.textContent?.trim() || '';
};

const AssistantWidget = ({ currentPath, language }: AssistantWidgetProps) => {
  const copy = getCopy(language).assistant;
  const [isVisible, setIsVisible] = useState(false);
  const [isBubbleVisible, setIsBubbleVisible] = useState(true);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [step, setStep] = useState<AssistantStep>('question');
  const [question, setQuestion] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const assistantImage = useMemo(() => publicImage('real_estate_agent.png'), []);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsVisible(true), 3500);
    return () => window.clearTimeout(timer);
  }, []);

  const openPanel = () => {
    setIsVisible(true);
    setIsBubbleVisible(false);
    setIsPanelOpen(true);
    setError('');
  };

  const resetFlow = () => {
    setQuestion('');
    setEmail('');
    setPhone('');
    setError('');
    setStep('question');
  };

  const continueToContact = (event: FormEvent) => {
    event.preventDefault();
    setError('');

    if (!question.trim()) {
      setError(copy.questionRequired);
      return;
    }

    setStep('contact');
  };

  const submitInquiry = async (event: FormEvent) => {
    event.preventDefault();
    setError('');

    const normalizedEmail = email.trim();
    const normalizedPhone = phone.trim();

    if (!normalizedEmail && !normalizedPhone) {
      setError(copy.contactRequired);
      return;
    }

    if (normalizedEmail && !isValidEmail(normalizedEmail)) {
      setError(copy.emailInvalid);
      return;
    }

    if (normalizedPhone && !isValidPhone(normalizedPhone)) {
      setError(copy.phoneInvalid);
      return;
    }

    setSaving(true);

    try {
      await createAssistantInquiry({
        question: question.trim(),
        email: normalizedEmail || undefined,
        phone: normalizedPhone || undefined,
        sourcePage: window.location.href,
        pageTitle: document.title,
        propertyId: getPropertyIdFromPath(currentPath) || undefined,
        propertyName: getVisiblePropertyName() || undefined,
      });
      setStep('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : copy.submitFailed);
    } finally {
      setSaving(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="assistant-widget" aria-live="polite">
      {isPanelOpen && (
        <section className="assistant-panel" aria-label={copy.title}>
          <header className="assistant-panel__header">
            <div>
              <span>ZRE</span>
              <strong>{copy.title}</strong>
            </div>
            <button type="button" onClick={() => setIsPanelOpen(false)} aria-label={copy.close}>
              ×
            </button>
          </header>

          <div className="assistant-panel__body">
            <div className="assistant-message assistant-message--agent">
              {copy.notAi}
            </div>

            {step === 'question' && (
              <form className="assistant-form" onSubmit={continueToContact}>
                <label>
                  {copy.questionLabel}
                  <textarea
                    value={question}
                    onChange={(event) => setQuestion(event.target.value)}
                    placeholder={copy.questionPlaceholder}
                    rows={5}
                  />
                </label>
                {error && <p className="assistant-error">{error}</p>}
                <button type="submit">{copy.questionNext}</button>
              </form>
            )}

            {step === 'contact' && (
              <form className="assistant-form" onSubmit={submitInquiry}>
                <div className="assistant-message assistant-message--agent">
                  {copy.contactRequest}
                </div>
                <label>
                  {copy.emailLabel}
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder={copy.emailPlaceholder}
                  />
                </label>
                <label>
                  {copy.phoneLabel}
                  <input
                    type="tel"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    placeholder={copy.phonePlaceholder}
                  />
                </label>
                {error && <p className="assistant-error">{error}</p>}
                <div className="assistant-form__actions">
                  <button type="button" onClick={() => setStep('question')}>
                    {copy.back}
                  </button>
                  <button type="submit" disabled={saving}>
                    {saving ? copy.sending : copy.submit}
                  </button>
                </div>
              </form>
            )}

            {step === 'success' && (
              <div className="assistant-success">
                <div className="assistant-message assistant-message--agent">
                  {copy.success}
                </div>
                <button type="button" onClick={resetFlow}>
                  {copy.startNew}
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      <div className="assistant-widget__entry">
        {isBubbleVisible && (
          <div className="assistant-bubble">
            <span>{copy.bubble}</span>
            <button type="button" onClick={() => setIsBubbleVisible(false)} aria-label={copy.closeBubble}>
              ×
            </button>
          </div>
        )}
        <button className="assistant-avatar-button" type="button" onClick={openPanel} aria-label={copy.open}>
          <img src={assistantImage} alt="" />
        </button>
      </div>
    </div>
  );
};

export default AssistantWidget;
