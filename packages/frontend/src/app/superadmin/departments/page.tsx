'use client';

import React from 'react';
import { Layers, Plus, Code2, Palette, Megaphone, Target, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function DepartmentsPage() {
  const departments = [
    {
      id: 'dept_dev',
      title: 'Software & Cloud Engineering',
      code: 'developer',
      presetSkills: ['React / Next.js', 'Node.js / Express', 'TypeScript', 'MongoDB', 'Docker', 'AWS / Vercel'],
      icon: Code2
    },
    {
      id: 'dept_uiux',
      title: 'UI/UX & Product Design',
      code: 'uiux',
      presetSkills: ['Figma', 'User Research', 'Design Systems', 'Prototyping', 'Wireframing', 'User Testing'],
      icon: Palette
    },
    {
      id: 'dept_marketing',
      title: 'Growth & Digital Marketing',
      code: 'marketing',
      presetSkills: ['SEO Optimization', 'Google Analytics 4', 'Content Strategy', 'PPC Ads', 'Copywriting'],
      icon: Megaphone
    },
    {
      id: 'dept_pm',
      title: 'Product & Project Management',
      code: 'pm',
      presetSkills: ['Agile / Scrum', 'Roadmap Strategy', 'Jira / Linear', 'Metrics & KPIs', 'Stakeholder Mgmt'],
      icon: Target
    }
  ];

  return (
    <div className="space-y-8 text-left max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-border/40 pb-5">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <Layers className="w-7 h-7 text-purple-400" />
            Departments & Role Category Switcher
          </h1>
          <p className="font-sans text-sm text-muted-foreground mt-1">
            Define department categories and preset skill taxonomies for multi-discipline user portfolios.
          </p>
        </div>

        <button
          onClick={() => toast.info('New department preset creator ready')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold transition-all shadow-md shadow-purple-600/20"
        >
          <Plus className="w-4 h-4" />
          Add Department Preset
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {departments.map((dept) => {
          const Icon = dept.icon;
          return (
            <div key={dept.id} className="p-6 rounded-2xl border border-border bg-card/30 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-sm">{dept.title}</h3>
                    <code className="text-[10px] text-muted-foreground font-mono">category_code: {dept.code}</code>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Active
                </span>
              </div>

              <div className="space-y-2 pt-2">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                  Preset Skill Taxonomies ({dept.presetSkills.length})
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {dept.presetSkills.map((sk, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-lg border border-border bg-card/60 text-xs font-medium text-foreground">
                      {sk}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
