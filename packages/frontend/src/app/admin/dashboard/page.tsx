'use client';

import React, { useEffect, useState } from 'react';
import { FolderKanban, CalendarRange, Wrench, MessageSquareDot, ShieldAlert, FileText } from 'lucide-react';
import Link from 'next/link';
import { getApiUrl, getAuthHeaders } from '@/utils/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    projects: 0,
    experience: 0,
    skills: 0,
    messages: 0,
    unreadMessages: 0,
    resumes: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const apiUrl = getApiUrl();
        const authHeaders = getAuthHeaders();
        
        // Fetch all APIs in parallel to load summaries
        const [projRes, expRes, skillRes, msgRes, resumeRes] = await Promise.all([
          fetch(`${apiUrl}/projects`, { headers: authHeaders, credentials: 'include' }),
          fetch(`${apiUrl}/experiences`, { headers: authHeaders, credentials: 'include' }),
          fetch(`${apiUrl}/skills`, { headers: authHeaders, credentials: 'include' }),
          fetch(`${apiUrl}/messages`, { headers: authHeaders, credentials: 'include' }),
          fetch(`${apiUrl}/resumes`, { headers: authHeaders, credentials: 'include' })
        ]);

        const [projData, expData, skillData, msgData, resumeData] = await Promise.all([
          projRes.ok ? projRes.json() : { data: [] },
          expRes.ok ? expRes.json() : { data: [] },
          skillRes.ok ? skillRes.json() : { data: [] },
          msgRes.ok ? msgRes.json() : { data: [] },
          resumeRes.ok ? resumeRes.json() : { data: [] }
        ]);

        const unreadMsgCount = (msgData.data || []).filter((m: any) => !m.isRead).length;

        setStats({
          projects: (projData.data || []).length,
          experience: (expData.data || []).length,
          skills: (skillData.data || []).length,
          messages: (msgData.data || []).length,
          unreadMessages: unreadMsgCount,
          resumes: (resumeData.data || []).length
        });
      } catch (err) {
        console.error('Error fetching dashboard statistics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      label: 'Projects',
      value: stats.projects,
      desc: 'Case studies & works',
      icon: <FolderKanban className="w-5 h-5 text-primary" />,
      link: '/admin/projects'
    },
    {
      label: 'Timeline Journey',
      value: stats.experience,
      desc: 'Jobs & degrees',
      icon: <CalendarRange className="w-5 h-5 text-secondary" />,
      link: '/admin/experience'
    },
    {
      label: 'Skill Tags',
      value: stats.skills,
      desc: 'Arsenal metrics',
      icon: <Wrench className="w-5 h-5 text-emerald-500" />,
      link: '/admin/skills'
    },
    {
      label: 'Contact Inbox',
      value: stats.unreadMessages,
      desc: `${stats.messages} total enquiries`,
      icon: <MessageSquareDot className="w-5 h-5 text-amber-500" />,
      link: '/admin/messages',
      badge: stats.unreadMessages > 0 ? `${stats.unreadMessages} new` : undefined
    },
    {
      label: 'Resumes',
      value: stats.resumes,
      desc: `${stats.resumes} CV files archived`,
      icon: <FileText className="w-5 h-5 text-indigo-500" />,
      link: '/admin/resumes'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Title Header */}
      <div className="text-left">
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-foreground">Overview Dashboard</h1>
        <p className="font-sans text-sm text-muted-foreground mt-1">Manage your developer portfolio profiles dynamically.</p>
      </div>

      {/* Grid of stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {statCards.map((card, idx) => (
          <Link
            key={idx}
            href={card.link}
            className="p-6 rounded-xl border border-border bg-card/30 hover:border-primary/20 hover:bg-card/50 transition-all duration-300 relative text-left hover-glow-trigger block"
          >
            {card.badge && (
              <span className="absolute top-4 right-4 px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/25 text-[10px] font-bold text-amber-500">
                {card.badge}
              </span>
            )}
            <div className="p-2.5 rounded-lg bg-muted/65 w-fit mb-4">
              {card.icon}
            </div>
            <h2 className="text-2xl font-black text-foreground tracking-tight">{loading ? '...' : card.value}</h2>
            <p className="text-sm font-bold text-foreground mt-1.5">{card.label}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{card.desc}</p>
          </Link>
        ))}
      </div>

      {/* Welcome info widget */}
      <div className="rounded-xl border border-border bg-card/20 p-6 flex items-start gap-4 text-left">
        <div className="p-3 rounded-full bg-primary/5 border border-primary/10">
          <ShieldAlert className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h3 className="font-display font-bold text-base text-foreground">Dynamic Portfolio Manager</h3>
          <p className="text-sm text-muted-foreground leading-relaxed mt-1">
            Any modification made here in the CRUD portals will instantly update the public landing page data. You do not need to rewrite, redeploy, or recompile frontend static files.
          </p>
        </div>
      </div>
    </div>
  );
}
