'use client';

import React, { useState } from 'react';
import { LayoutTemplate, Plus, Check, Sparkles, Paintbrush, Code2, Megaphone, Briefcase } from 'lucide-react';
import { toast } from 'sonner';

interface TemplateItem {
  id: string;
  name: string;
  category: 'developer' | 'designer' | 'uiux' | 'marketing' | 'pm';
  description: string;
  isActive: boolean;
}

export default function TemplateStudioPage() {
  const [templates] = useState<TemplateItem[]>([
    {
      id: 'tpl_dev_terminal',
      name: 'Cyberpunk Developer Terminal',
      category: 'developer',
      description: 'High-tech dark glassmorphism layout with interactive bash terminal widget and code snippets.',
      isActive: true
    },
    {
      id: 'tpl_designer_minimal',
      name: 'Studio Minimalist Canvas',
      category: 'designer',
      description: 'Elegant typography, large image carousels, and grid showcase for Visual & Graphic Designers.',
      isActive: true
    },
    {
      id: 'tpl_uiux_case_study',
      name: 'UX Case Study Showcase',
      category: 'uiux',
      description: 'Structured layout emphasizing user research, wireframes, prototype embeds, and metrics.',
      isActive: true
    },
    {
      id: 'tpl_marketing_growth',
      name: 'Growth Marketer & Strategist',
      category: 'marketing',
      description: 'Conversion-focused landing page with campaign ROI stats, testimonials, and video embeds.',
      isActive: true
    }
  ]);

  return (
    <div className="space-y-8 text-left max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-border/40 pb-5">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <LayoutTemplate className="w-7 h-7 text-cyan-400" />
            Template Creation Studio
          </h1>
          <p className="font-sans text-sm text-muted-foreground mt-1">
            Build and configure portfolio theme templates for Developers, UI/UX Designers, Marketers, and Product Managers.
          </p>
        </div>

        <button
          onClick={() => toast.info('Template creation wizard launching soon!')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold transition-all shadow-md shadow-primary/20"
        >
          <Plus className="w-4 h-4" />
          Create New Template
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {templates.map((tpl) => (
          <div key={tpl.id} className="p-6 rounded-2xl border border-border bg-card/30 space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-foreground text-base">{tpl.name}</span>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                  {tpl.category}
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{tpl.description}</p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border/50 text-xs">
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Published & Active
              </span>
              <button
                onClick={() => toast.success(`Previewing template: ${tpl.name}`)}
                className="px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-muted text-foreground font-bold transition-colors"
              >
                Preview Template
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
