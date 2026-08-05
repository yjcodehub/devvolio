'use client';

import React, { useState, FormEvent } from 'react';
import { toast } from 'sonner';
import { Send, Loader2 } from 'lucide-react';
import { getApiUrl } from '@/utils/api';

interface ContactProps {
  config?: {
    title?: string;
    subtitle?: string;
    email?: string;
  };
}

export default function ContactForm({ config }: ContactProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // 1. Client-side validation checks
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast.error('Please fill in all contact form fields');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setLoading(true);
    const apiPromise = async () => {
      const apiUrl = getApiUrl();
      const res = await fetch(`${apiUrl}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'API error');
      return data;
    };

    toast.promise(apiPromise(), {
      loading: 'Transmitting message to server...',
      success: () => {
        setFormData({ name: '', email: '', subject: '', message: '' });
        setLoading(false);
        return 'Message sent successfully! Thank you.';
      },
      error: (err: any) => {
        setLoading(false);
        return `Failed to send: ${err.message || 'Server offline'}`;
      }
    });
  };

  const contactTitle = config?.title || "Let's Collaborate";
  const contactSubtitle = config?.subtitle || "Have an exciting project or role? Send me a message and let's start talking.";
  const placeholderEmail = config?.email || "lakshraj2121@gmail.com";

  return (
    <section id="contact" className="py-24 px-6 max-w-4xl mx-auto w-full">
      <div className="text-center mb-16">
        <h2 className="font-display text-3xl md:text-5xl font-extrabold tracking-tight mb-4 text-foreground">
          {contactTitle}
        </h2>
        <p className="font-sans text-base text-muted-foreground max-w-md mx-auto leading-relaxed">
          {contactSubtitle}
        </p>
      </div>

      {/* Premium form container */}
      <div className="rounded-xl border border-border bg-card/20 backdrop-blur-md p-8 shadow-2xl hover:border-primary/10 transition-colors">
        <form onSubmit={handleSubmit} className="space-y-6 text-left">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name Input */}
            <div className="flex flex-col gap-2">
              <label htmlFor="name" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={loading}
                placeholder="Yashkumar Jais"
                className="px-4 py-3 rounded-lg border border-border bg-card/50 text-foreground text-sm placeholder-muted-foreground focus:outline-none focus:border-primary/65 transition-colors hover-glow-trigger disabled:opacity-50"
              />
            </div>

            {/* Email Input */}
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
                placeholder={placeholderEmail}
                className="px-4 py-3 rounded-lg border border-border bg-card/50 text-foreground text-sm placeholder-muted-foreground focus:outline-none focus:border-primary/65 transition-colors hover-glow-trigger disabled:opacity-50"
              />
            </div>
          </div>

          {/* Subject Input */}
          <div className="flex flex-col gap-2">
            <label htmlFor="subject" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Subject
            </label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              disabled={loading}
              placeholder="Opportunity: Senior Frontend Developer"
              className="w-full px-4 py-3 rounded-lg border border-border bg-card/50 text-foreground text-sm placeholder-muted-foreground focus:outline-none focus:border-primary/65 transition-colors hover-glow-trigger disabled:opacity-50"
            />
          </div>

          {/* Message Textarea */}
          <div className="flex flex-col gap-2">
            <label htmlFor="message" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              disabled={loading}
              rows={5}
              placeholder="Hi Yash, I saw your portfolio and would love to discuss..."
              className="w-full px-4 py-3 rounded-lg border border-border bg-card/50 text-foreground text-sm placeholder-muted-foreground focus:outline-none focus:border-primary/65 transition-colors hover-glow-trigger disabled:opacity-50 resize-y"
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary hover:bg-primary/95 text-white font-medium text-sm transition-all hover:scale-[1.03] hover-glow-trigger shadow-lg shadow-primary/10 disabled:opacity-50 disabled:pointer-events-none"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending Message...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send Message
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
