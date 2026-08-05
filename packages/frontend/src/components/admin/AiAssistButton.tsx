'use client';

import React, { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { getApiUrl } from '@/utils/api';

interface AiAssistButtonProps {
  endpoint: string;
  payload: Record<string, any>;
  onGenerated: (text: string) => void;
  label?: string;
  className?: string;
}

export default function AiAssistButton({
  endpoint,
  payload,
  onGenerated,
  label = 'Enhance with AI',
  className = ''
}: AiAssistButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const apiUrl = getApiUrl();
      const res = await fetch(`${apiUrl}/ai/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include'
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'AI Generation failed');

      if (json.data?.text) {
        onGenerated(json.data.text);
        toast.success('AI content generated!');
      }
    } catch (err: any) {
      toast.error(err.message || 'AI Generation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleGenerate}
      disabled={loading}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-primary/30 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold transition-all disabled:opacity-50 ${className}`}
    >
      {loading ? (
        <>
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          {label}
        </>
      )}
    </button>
  );
}
