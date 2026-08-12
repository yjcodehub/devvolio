'use client';

import React, { useEffect, useState } from 'react';
import Hero from '@/components/home/Hero';
import About from '@/components/home/About';
import ExperienceTimeline from '@/components/home/ExperienceTimeline';
import ProjectsGrid from '@/components/home/ProjectsGrid';
import SkillsMarquee from '@/components/home/SkillsMarquee';
import StatsDashboard from '@/components/home/StatsDashboard';
import ContactForm from '@/components/home/ContactForm';
import HomeSkeleton from '@/components/home/HomeSkeleton';
import { getApiUrl } from '@/utils/api';
import { Globe, AlertCircle } from 'lucide-react';

interface PortfolioPageProps {
  params: Promise<{ portfolioSubdomain: string }>;
}

export default function TenantPortfolioPage({ params }: PortfolioPageProps) {
  const [subdomain, setSubdomain] = useState<string>('');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Unwrap params asynchronously for Next.js 15
  useEffect(() => {
    params.then((resolved) => {
      if (resolved?.portfolioSubdomain) {
        setSubdomain(resolved.portfolioSubdomain);
      }
    });
  }, [params]);

  useEffect(() => {
    if (!subdomain) return;

    const fetchTenantData = async () => {
      setLoading(true);
      setError(null);

      try {
        const apiUrl = getApiUrl();
        const res = await fetch(`${apiUrl}/portfolio/public/${subdomain}`, {
          cache: 'no-store'
        });

        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.message || `Portfolio "${subdomain}" not found or inactive`);
        }

        setData(json.data);
      } catch (err: any) {
        console.error('[TenantPortfolioPage] Fetch error:', err);
        setError(err.message || 'Failed to load portfolio');
      } finally {
        setLoading(false);
      }
    };

    fetchTenantData();
  }, [subdomain]);

  if (loading || !subdomain) {
    return <HomeSkeleton />;
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground px-6 text-center">
        <div className="p-4 rounded-full bg-destructive/10 text-destructive mb-4 border border-destructive/20">
          <AlertCircle className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-extrabold font-display mb-2">Portfolio Workspace Not Found</h1>
        <p className="text-sm text-muted-foreground max-w-md mb-6 leading-relaxed">
          The portfolio workspace for <code className="text-primary font-mono font-bold">{subdomain}</code> does not exist, has been suspended, or is currently unassigned.
        </p>
        <a
          href={typeof window !== 'undefined' && window.location.hostname.endsWith('devvolio.in') ? 'https://devvolio.in' : '/'}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold text-xs transition-all shadow-lg shadow-primary/20"
        >
          <Globe className="w-4 h-4" />
          Visit Devvolio SaaS Homepage
        </a>
      </div>
    );
  }

  const { portfolio, projects = [], experiences = [], skills = [] } = data;
  const heroData = portfolio?.hero || {};
  const aboutData = portfolio?.about || {};
  const statsData = portfolio?.stats || {};
  const contactData = portfolio?.contact || {};
  const sectionVis = portfolio?.sectionVisibility || {};

  const isVisible = (secKey: string) => {
    if (!sectionVis || typeof sectionVis !== 'object') return true;
    if (sectionVis[secKey] && typeof sectionVis[secKey] === 'object') {
      return sectionVis[secKey].visible !== false;
    }
    return true;
  };

  return (
    <div className="relative w-full flex flex-col items-center">
      {/* 1. Hero Welcome section */}
      <Hero 
        data={heroData} 
        cvFileUrl={portfolio?.cvFileUrl} 
        showTerminal={isVisible('motionTerminal')}
      />

      {/* 2. Core About Section */}
      {isVisible('core') && (
        <About 
          data={aboutData} 
          showDescription={isVisible('aboutDescription')}
          showExpertise={isVisible('coreExpertise')}
        />
      )}

      {/* 3. Experiences & Education Timeline */}
      {isVisible('experience') && (
        <ExperienceTimeline 
          experiences={experiences} 
          showWork={isVisible('workExperience')}
          showEducation={isVisible('education')}
        />
      )}

      {/* 4. Projects Grid */}
      {isVisible('projects') && (
        <ProjectsGrid projects={projects} />
      )}

      {/* 5. Skills Marquee */}
      {isVisible('skills') && (
        <SkillsMarquee skills={skills} />
      )}

      {/* 6. Stats Dashboard */}
      {isVisible('developerMatrix') && (
        <StatsDashboard 
          stats={statsData} 
          showGithub={isVisible('githubActivity')}
          showLeetcode={isVisible('leetcodeActivity')}
          showSpotify={isVisible('spotifyActivity')}
        />
      )}

      {/* 7. Contact Form */}
      {isVisible('contact') && (
        <ContactForm config={contactData} />
      )}
    </div>
  );
}
