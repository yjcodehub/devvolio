'use client';

import React, { MouseEvent } from 'react';
import { Layers, Database, Monitor, Globe } from 'lucide-react';

interface AboutProps {
  data?: {
    bio: string;
    expertises?: Array<{ icon: string; title: string; desc: string }>;
  };
  showDescription?: boolean;
  showExpertise?: boolean;
}

const defaultExpertises = [
  {
    icon: 'monitor',
    title: 'Frontend Engineering',
    desc: 'Designing responsive, accessible, and high-performance user interfaces with React, Next.js, and modern CSS design systems.',
  },
  {
    icon: 'database',
    title: 'Backend Systems & APIs',
    desc: 'Architecting scalable microservices, robust RESTful APIs, and database solutions using Node.js, Express, and MongoDB.',
  },
  {
    icon: 'layers',
    title: 'Full Stack Solutions',
    desc: 'Building end-to-end web applications with secure multi-tenant architectures, state management, and modern cloud deployments.',
  },
  {
    icon: 'globe',
    title: 'Web Performance & DevOps',
    desc: 'Optimizing web performance, CI/CD deployment pipelines, SEO metrics, and cloud infrastructure for high availability.',
  },
];

const getIconComponent = (iconName: string) => {
  switch (iconName?.toLowerCase()) {
    case 'monitor':
      return <Monitor className="w-8 h-8 text-primary" />;
    case 'layers':
      return <Layers className="w-8 h-8 text-primary" />;
    case 'database':
      return <Database className="w-8 h-8 text-primary" />;
    case 'globe':
      return <Globe className="w-8 h-8 text-primary" />;
    default:
      return <Globe className="w-8 h-8 text-primary" />;
  }
};

export default function About({ data, showDescription = true, showExpertise = true }: AboutProps) {
  const expertises = data?.expertises && data.expertises.length > 0
    ? data.expertises
    : defaultExpertises;

  // Mouse hover listener to update CSS coordinates for premium card spotlight shine
  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    card.style.setProperty('--mouse-x', `${x}px`);
    card.style.setProperty('--mouse-y', `${y}px`);
  };

  if (!showDescription && !showExpertise) {
    return null;
  }

  return (
    <section id="about" className="py-24 px-6 max-w-6xl mx-auto w-full">
      <div className="text-center md:text-left mb-16">
        <h2 className="font-display text-3xl md:text-5xl font-extrabold tracking-tight mb-4 text-foreground">
          Core Expertise
        </h2>
        {showDescription && (
          <p className="font-sans text-base text-muted-foreground leading-relaxed">
            {data?.bio || '6+ years of engineering operational software. I construct stable product modules and optimize API speeds.'}
          </p>
        )}
      </div>

      {/* Grid of spotlight hover cards */}
      {showExpertise && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          {expertises.map((exp, idx) => (
            <div
              key={idx}
              onMouseMove={handleMouseMove}
              className="group relative rounded-xl border border-border bg-card/40 backdrop-blur-md p-8 overflow-hidden transition-all duration-300 hover:border-primary/20 hover-glow-trigger"
              style={{
                transformStyle: 'preserve-3d',
              }}
            >
              {/* Radial spotlight effect */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{
                  background: `radial-gradient(400px circle at var(--mouse-x, 0px) var(--mouse-y, 0px), rgba(120, 99, 245, 0.08), transparent 80%)`,
                }}
              />

              <div className="relative z-10 flex gap-6 items-start flex-col sm:flex-row">
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/10 group-hover:border-primary/30 transition-colors">
                  {getIconComponent(exp.icon)}
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-display text-xl font-bold tracking-tight mb-2 text-foreground group-hover:text-primary transition-colors">
                    {exp.title}
                  </h3>
                  <p className="font-sans text-sm text-muted-foreground leading-relaxed">
                    {exp.desc}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
