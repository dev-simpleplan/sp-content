"use client";

import { useEffect, useRef, useState } from "react";
import "./CourseEnrollModal.css";

const COURSE_TITLE = "Brand Builder's Manual";
const FALLBACK_PRICE = "₹10,990";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^\+?[0-9][0-9\s-]{6,16}$/;

const EMPTY = { name: "", email: "", phone: "", website: "", coupon: "" };

const isValidUrl = (value) => {
  try {
    const url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
    return /\.[a-z]{2,}$/i.test(url.hostname);
  } catch {
    return false;
  }
};

const validate = (values) => {
  const errors = {};
  const name = values.name.trim();
  const email = values.email.trim();
  const phone = values.phone.trim();
  const website = values.website.trim();

  if (!name) errors.name = "Full name is required";
  else if (name.length < 2) errors.name = "Enter at least 2 characters";

  if (!email) errors.email = "Email is required";
  else if (!EMAIL_RE.test(email)) errors.email = "Enter a valid email address";

  if (!phone) errors.phone = "Phone number is required";
  else if (!PHONE_RE.test(phone) || phone.replace(/\D/g, "").length < 8) {
    errors.phone = "Enter a valid phone number";
  }

  if (website && !isValidUrl(website)) errors.website = "Enter a valid website URL";

  return errors;
};

// "Get the course" popup. Name, email and phone are required; website and
// coupon are optional. On a valid submit the buyer is sent to `paymentUrl`
// (the CMS CTA link), which is where the one-time payment happens.
function EnrollModalContent({ onClose, price, paymentUrl }) {
  const [values, setValues] = useState(EMPTY);
  const [touched, setTouched] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const firstFieldRef = useRef(null);
  const priceLabel = price || FALLBACK_PRICE;
  const errors = validate(values);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    firstFieldRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  const setField = (key) => (event) =>
    setValues((current) => ({ ...current, [key]: event.target.value }));
  const markTouched = (key) => () =>
    setTouched((current) => ({ ...current, [key]: true }));

  const handleSubmit = (event) => {
    event.preventDefault();
    if (submitting) return;
    setTouched({ name: true, email: true, phone: true, website: true });
    setSubmitError("");

    if (Object.keys(errors).length) return;

    if (!paymentUrl || paymentUrl === "#") {
      setSubmitError("Payment link isn't available right now. Please try again later.");
      return;
    }

    setSubmitting(true);
    const url = new URL(paymentUrl, window.location.origin);
    window.location.assign(url.toString());
  };

  const field = ({ key, label, required, type = "text", placeholder, autoComplete, inputMode }) => {
    const showError = touched[key] && errors[key];
    return (
      <div className="enroll-field">
        <label htmlFor={`enroll-${key}`} className="enroll-label">
          {label}
          {required && <span className="enroll-required"> *</span>}
        </label>
        <input
          id={`enroll-${key}`}
          ref={key === "name" ? firstFieldRef : undefined}
          type={type}
          className="enroll-input"
          placeholder={placeholder}
          autoComplete={autoComplete}
          inputMode={inputMode}
          value={values[key]}
          onChange={setField(key)}
          onBlur={markTouched(key)}
          required={required}
          aria-required={required || undefined}
          aria-invalid={showError ? "true" : undefined}
          aria-describedby={showError ? `enroll-${key}-error` : undefined}
        />
        {showError && (
          <p className="enroll-error" id={`enroll-${key}-error`} role="alert">
            {errors[key]}
          </p>
        )}
      </div>
    );
  };

  return (
    <div
      className="enroll-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="enroll-modal" role="dialog" aria-modal="true" aria-labelledby="enroll-title">
        <button type="button" className="enroll-close" onClick={onClose} aria-label="Close">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <path d="M1 1l16 16M17 1L1 17" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        </button>

        <p className="enroll-title" id="enroll-title">
          Get The Course — {COURSE_TITLE}
        </p>

        <form onSubmit={handleSubmit} noValidate>
          {field({ key: "name", label: "Full Name", required: true, placeholder: "Enter Full Name", autoComplete: "name" })}
          {field({ key: "email", label: "Email", required: true, type: "email", placeholder: "Enter your email address", autoComplete: "email" })}
          {field({ key: "phone", label: "Phone Number", required: true, type: "tel", placeholder: "Enter phone number", autoComplete: "tel", inputMode: "tel" })}
          {field({ key: "website", label: "Website URL", placeholder: "https://yourbrand.com", autoComplete: "url", inputMode: "url" })}
          {field({ key: "coupon", label: "Coupon Code", placeholder: "Enter coupon code", autoComplete: "off" })}

          <p className="enroll-note">
            You&apos;ll be redirected to make a <strong>one-time payment of {priceLabel}</strong>.
          </p>
          <p className="enroll-note">
            Your information is secure and only used to confirm your purchase and course access.
          </p>

          <button type="submit" className="enroll-submit" disabled={submitting}>
            {submitting ? "Redirecting..." : `Pay ${priceLabel} & Get Access`}
          </button>

          {submitError && (
            <p className="enroll-error enroll-error--form" role="alert">
              {submitError}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}

// Content only mounts while open, so the form starts clean every time.
export default function CourseEnrollModal({ open, ...props }) {
  return open ? <EnrollModalContent {...props} /> : null;
}
