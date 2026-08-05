'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Briefcase, BookOpen, Calendar, MapPin } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface TimelineItem {
  _id?: string;
  role: string;
  company: string;
  location?: string;
  type: 'work' | 'education';
  startDate: string;
  endDate?: string;
  isCurrent?: boolean;
  description: string;
  skillsUsed?: string[];
}

interface ExperienceProps {
  experiences?: TimelineItem[];
  showWork?: boolean;
  showEducation?: boolean;
}

const defaultTimelineData: TimelineItem[] = [
  {
    role: 'Software Engineer (Frontend)',
    company: 'Relfor Labs Pvt Ltd',
    location: 'Pune',
    type: 'work',
    startDate: '2022-05-01',
    endDate: '2026-05-01',
    isCurrent: false,
    description: 'Led frontend configurations for SaaS spa management dashboards (Respark) and restaurant POS frameworks. Built and refined GoDirekt digital QR menus, Kitchen Displays, and order queues.',
    skillsUsed: ['React.js', 'AngularJS', 'TypeScript', 'REST APIs', 'Tailwind CSS']
  },
  {
    role: 'Trainer & Web Developer',
    company: 'Webgurukul',
    location: 'Nagpur',
    type: 'work',
    startDate: '2019-05-01',
    endDate: '2022-05-01',
    isCurrent: false,
    description: 'Instructed 350+ developers in responsive designs, vanilla Javascript DOM bindings, PHP server architectures, and MySQL databases. Designed administrative panels and authentication setups.',
    skillsUsed: ['JavaScript (ES6+)', 'PHP', 'MySQL', 'Bootstrap', 'RWD']
  },
  {
    role: 'B.Tech / B.E. in Computer Science',
    company: 'Priyadarshini JL College of Engineering',
    location: 'Nagpur',
    type: 'education',
    startDate: '2015-08-01',
    endDate: '2019-06-01',
    isCurrent: false,
    description: 'Completed B.Tech engineering studies in Computer Science. Graduated with a CGPA of 8.3/10.',
    skillsUsed: ['Data Structures', 'DBMS', 'Algorithms', 'Software Engineering']
  }
];

const formatTimelineDate = (startDateStr: string, endDateStr?: string, isCurrent?: boolean) => {
  try {
    const options: Intl.DateTimeFormatOptions = { month: 'short', year: 'numeric' };
    const start = new Date(startDateStr);
    const startFormatted = start.toLocaleDateString('en-US', options);

    if (isCurrent) {
      return `${startFormatted} — Present`;
    }

    if (endDateStr) {
      const end = new Date(endDateStr);
      const endFormatted = end.toLocaleDateString('en-US', options);
      return `${startFormatted} — ${endFormatted}`;
    }

    return startFormatted;
  } catch (e) {
    return startDateStr;
  }
};

export default function ExperienceTimeline({ experiences, showWork = true, showEducation = true }: ExperienceProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);

  const rawList = experiences && experiences.length > 0
    ? experiences
    : defaultTimelineData;

  const timelineList = rawList.filter((item) => {
    if (item.type === 'work' && !showWork) return false;
    if (item.type === 'education' && !showEducation) return false;
    return true;
  });

  useEffect(() => {
    const container = containerRef.current;
    const line = lineRef.current;
    if (!container || !line) return;

    const ctx = gsap.context(() => {
      // 1. Vertical line drawing animation linked to scroll scrubbing
      gsap.fromTo(
        line,
        { scaleY: 0 },
        {
          scaleY: 1,
          transformOrigin: 'top center',
          ease: 'none',
          scrollTrigger: {
            trigger: container,
            start: 'top 50%',
            end: 'bottom 75%',
            scrub: true,
          },
        }
      );

      // 2. Timeline nodes reveal animations
      const nodes = container.querySelectorAll('.timeline-node');
      nodes.forEach((node) => {
        gsap.fromTo(
          node,
          { opacity: 0, y: 35 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: node,
              start: 'top 82%',
              toggleActions: 'play none none none',
            },
          }
        );
      });
    }, container);

    return () => ctx.revert(); // Reverts ScrollTriggers on unmount
  }, [timelineList]); // Re-run effect if timeline content updates

  if (timelineList.length === 0) {
    return null;
  }

  return (
    <section id="experience" ref={containerRef} className="py-24 px-6 max-w-5xl mx-auto w-full relative">
      <div className="text-center mb-20">
        <h2 className="font-display text-3xl md:text-5xl font-extrabold tracking-tight mb-4 text-foreground">
          Professional Journey
        </h2>
        <p className="font-sans text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
          A history of engineering digital products and educating the next generation of engineers.
        </p>
      </div>

      <div className="relative mt-12 pl-8 md:pl-0">
        {/* Vertical Progress Line */}
        <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-[2px] bg-border/40 -translate-x-[1px]" />
        
        {/* Animated growing line on scroll */}
        <div
          ref={lineRef}
          className="absolute left-8 md:left-1/2 top-0 bottom-0 w-[2px] bg-gradient-to-b from-primary via-secondary to-primary/80 -translate-x-[1px]"
        />

        <div className="space-y-16">
          {timelineList.map((item, idx) => {
            const isEven = idx % 2 === 0;
            const dateText = formatTimelineDate(item.startDate, item.endDate, item.isCurrent);
            const skills = item.skillsUsed || [];

            return (
              <div
                key={item._id || idx}
                className="timeline-node relative flex flex-col md:flex-row items-start md:items-center w-full"
              >
                {/* Node Dot icon */}
                <div className="absolute left-8 md:left-1/2 top-0 md:top-1/2 w-8 h-8 rounded-full border border-border bg-background -translate-x-1/2 md:-translate-y-1/2 flex items-center justify-center z-10 shadow-lg shadow-background">
                  {item.type === 'work' ? (
                    <Briefcase className="w-4 h-4 text-primary" />
                  ) : (
                    <BookOpen className="w-4 h-4 text-secondary" />
                  )}
                </div>

                {/* Left block (Desktop only) */}
                <div className={`hidden md:block w-1/2 pr-12 text-right ${isEven ? 'opacity-100' : 'opacity-0'}`}>
                  {isEven && (
                    <div>
                      <div className="inline-flex items-center gap-1 text-xs text-primary font-bold tracking-tight mb-2">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{dateText}</span>
                      </div>
                      <h3 className="font-display text-xl font-bold text-foreground mb-1">{item.role}</h3>
                      <p className="font-sans text-sm text-muted-foreground font-semibold flex items-center gap-1.5 justify-end">
                        <span>{item.company}</span>
                        {item.location && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground/60">
                            <MapPin className="w-3.5 h-3.5" /> {item.location}
                          </span>
                        )}
                      </p>
                    </div>
                  )}
                </div>

                {/* Right block (Desktop only) */}
                <div className={`hidden md:block w-1/2 pl-12 text-left ${!isEven ? 'opacity-100' : 'opacity-0'}`}>
                  {!isEven && (
                    <div>
                      <div className="inline-flex items-center gap-1 text-xs text-secondary font-bold tracking-tight mb-2">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{dateText}</span>
                      </div>
                      <h3 className="font-display text-xl font-bold text-foreground mb-1">{item.role}</h3>
                      <p className="font-sans text-sm text-muted-foreground font-semibold flex items-center gap-1.5">
                        <span>{item.company}</span>
                        {item.location && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground/60">
                            <MapPin className="w-3.5 h-3.5" /> {item.location}
                          </span>
                        )}
                      </p>
                    </div>
                  )}
                </div>

                {/* Card description details */}
                <div className={`w-full md:w-[42%] md:absolute ${isEven ? 'md:left-[54%]' : 'md:right-[54%]'} pl-8 md:pl-0 mt-4 md:mt-0`}>
                  <div className="p-6 rounded-xl border border-border bg-card/20 backdrop-blur-sm text-left hover:border-primary/20 transition-all duration-300 hover-glow-trigger">
                    {/* Mobile detail tags */}
                    <div className="md:hidden mb-3">
                      <div className="inline-flex items-center gap-1 text-xs text-primary font-bold mb-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{dateText}</span>
                      </div>
                      <h3 className="font-display text-lg font-bold text-foreground">{item.role}</h3>
                      <p className="font-sans text-xs text-muted-foreground/80 font-medium">
                        {item.company} {item.location && `| ${item.location}`}
                      </p>
                    </div>

                    <p className="font-sans text-xs md:text-sm text-muted-foreground leading-relaxed mb-4">
                      {item.description}
                    </p>

                    {/* Skill Tags */}
                    {skills.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {skills.map((skill) => (
                          <span
                            key={skill}
                            className="px-2 py-0.5 rounded bg-muted/60 text-muted-foreground text-[10px] font-semibold"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
