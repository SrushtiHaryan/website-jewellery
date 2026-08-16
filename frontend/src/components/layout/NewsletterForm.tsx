'use client';

import { useState } from 'react';
import { toast } from 'sonner';

export function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Please enter a valid email address.');
      return;
    }
    setSubmitting(true);
    // Newsletter capture is a front-of-house feature; wire to a provider later.
    await new Promise((r) => setTimeout(r, 500));
    setSubmitting(false);
    setEmail('');
    toast.success('Thank you — you are on the list.');
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        className="input flex-1"
        aria-label="Email address"
      />
      <button type="submit" className="btn-gold whitespace-nowrap" disabled={submitting}>
        {submitting ? 'Subscribing…' : 'Subscribe'}
      </button>
    </form>
  );
}
