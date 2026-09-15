"use client";

import { useEffect, useId, useRef, useState } from "react";

import { getMessages } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";
import { legalPath } from "@/lib/i18n/routes";
import { SITE } from "@/lib/site";

/**
 * The contact form.
 *
 * Progressive in the ways that matter: it is a real `<form>` with real labels,
 * real `required` attributes and native validation, so it is usable by keyboard
 * and screen reader before any of this JavaScript runs. The script adds
 * inline errors, the pending state and the success message.
 *
 * Two anti-spam measures live here and are checked again on the server: a
 * honeypot field that is hidden from people, and the time the form spent on
 * screen. Neither inconveniences a reader, and neither is a CAPTCHA - which
 * would hand a third party a record of everyone who writes in.
 */

type Topic = "correction" | "editorial" | "press" | "collaboration" | "privacy" | "other";

const TOPICS: Topic[] = [
  "correction",
  "editorial",
  "press",
  "collaboration",
  "privacy",
  "other",
];

type State = "idle" | "sending" | "sent" | "error";

/** Splits `text [label](url) tail` into parts so the link can be rendered. */
function withLink(template: string, href: string) {
  const match = template.match(/^(.*)\[([^\]]+)\]\(\{privacy\}\)(.*)$/s);
  if (!match) return <>{template}</>;
  return (
    <>
      {match[1]}
      <a href={href}>{match[2]}</a>
      {match[3]}
    </>
  );
}

export function ContactForm({ locale }: { locale: Locale }) {
  const t = getMessages(locale).contactForm;
  const fieldId = useId();
  const formRef = useRef<HTMLFormElement>(null);
  // Reading the clock during render is impure; the timestamp is only needed
  // after mount, which is exactly where an effect belongs.
  const mountedAt = useRef(0);
  useEffect(() => {
    mountedAt.current = Date.now();
  }, []);

  const [state, setState] = useState<State>("idle");
  const [errorKind, setErrorKind] = useState<"generic" | "rate" | "validation">("generic");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state === "sending") return;

    const form = event.currentTarget;
    const data = new FormData(form);

    setState("sending");
    try {
      const response = await fetch("/api/contact/", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          locale,
          topic: String(data.get("topic") ?? "other"),
          name: String(data.get("name") ?? ""),
          email: String(data.get("email") ?? ""),
          aboutPath: String(data.get("aboutPath") ?? ""),
          message: String(data.get("message") ?? ""),
          consent: data.get("consent") === "on",
          company: String(data.get("company") ?? ""),
          elapsedMs: mountedAt.current ? Date.now() - mountedAt.current : undefined,
        }),
      });

      if (response.ok) {
        form.reset();
        setState("sent");
        return;
      }
      setErrorKind(
        response.status === 429 ? "rate" : response.status === 400 ? "validation" : "generic",
      );
      setState("error");
    } catch {
      setErrorKind("generic");
      setState("error");
    }
  }

  if (state === "sent") {
    return (
      <div
        role="status"
        aria-live="polite"
        className="ci-callout ci-callout-info ci-contact-done"
      >
        <p>{t.success}</p>
      </div>
    );
  }

  const errorText =
    errorKind === "rate"
      ? t.errorRate
      : errorKind === "validation"
        ? t.errorValidation
        : t.errorGeneric;

  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      noValidate={false}
      className="ci-contact-form"
    >
      <fieldset disabled={state === "sending"}>
        <legend className="ci-contact-legend">{t.legend}</legend>
        <p className="ci-contact-intro">{t.intro}</p>

        <div className="ci-contact-grid">
          <p className="ci-contact-row">
            <label htmlFor={`${fieldId}-name`}>
              {t.name} <span aria-hidden="true">*</span>
            </label>
            <input
              id={`${fieldId}-name`}
              name="name"
              type="text"
              className="ci-field"
              required
              minLength={2}
              maxLength={120}
              autoComplete="name"
            />
          </p>

          <p className="ci-contact-row">
            <label htmlFor={`${fieldId}-email`}>
              {t.email} <span aria-hidden="true">*</span>
            </label>
            <input
              id={`${fieldId}-email`}
              name="email"
              type="email"
              className="ci-field"
              required
              maxLength={254}
              autoComplete="email"
              aria-describedby={`${fieldId}-email-hint`}
            />
            <span id={`${fieldId}-email-hint`} className="ci-contact-hint">
              {t.emailHint}
            </span>
          </p>
        </div>

        <p className="ci-contact-row">
          <label htmlFor={`${fieldId}-topic`}>{t.topic}</label>
          <select id={`${fieldId}-topic`} name="topic" className="ci-field" defaultValue="other">
            {TOPICS.map((topic) => (
              <option key={topic} value={topic}>
                {t.topics[topic]}
              </option>
            ))}
          </select>
        </p>

        <p className="ci-contact-row">
          <label htmlFor={`${fieldId}-about`}>{t.aboutPath}</label>
          <input
            id={`${fieldId}-about`}
            name="aboutPath"
            type="text"
            className="ci-field"
            maxLength={600}
            aria-describedby={`${fieldId}-about-hint`}
          />
          <span id={`${fieldId}-about-hint`} className="ci-contact-hint">
            {t.aboutPathHint}
          </span>
        </p>

        <p className="ci-contact-row">
          <label htmlFor={`${fieldId}-message`}>
            {t.message} <span aria-hidden="true">*</span>
          </label>
          <textarea
            id={`${fieldId}-message`}
            name="message"
            className="ci-field"
            rows={8}
            required
            minLength={20}
            maxLength={5000}
          />
        </p>

        {/* Honeypot: off-screen, not `display:none`, so assistive technology
            skips it via aria-hidden while scripted fillers still see it. */}
        <div className="ci-hp" aria-hidden="true">
          <label htmlFor={`${fieldId}-company`}>Company</label>
          <input
            id={`${fieldId}-company`}
            name="company"
            type="text"
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        <p className="ci-contact-consent">
          <input id={`${fieldId}-consent`} name="consent" type="checkbox" required />
          <label htmlFor={`${fieldId}-consent`}>
            {withLink(t.consent, legalPath("privacy", locale))}
          </label>
        </p>

        <div className="ci-contact-actions">
          <button type="submit" className="ci-btn ci-btn-primary">
            {state === "sending" ? t.sending : t.submit}
          </button>
          <span className="ci-contact-hint">
            {t.fallback}{" "}
            <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a>
          </span>
        </div>

        {state === "error" ? (
          <p role="alert" className="ci-contact-error">
            {errorText}
          </p>
        ) : null}
      </fieldset>
    </form>
  );
}
