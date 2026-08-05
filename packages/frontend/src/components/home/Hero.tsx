'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Terminal, Code, Cpu, Download } from 'lucide-react';
import { downloadActiveResume } from '@/utils/resumeDownload';

interface HeroProps {
  data?: {
    title: string;
    subtitle: string;
    tagline: string;
    terminalSequence?: Array<{ type: 'input' | 'output'; text: string }>;
  };
  cvFileUrl?: string;
  showTerminal?: boolean;
}

const defaultSequence = [
  { type: 'input', text: 'yash --role --skills' },
  { type: 'output', text: '> Software Engineer (Frontend) | 6+ Years' },
  { type: 'output', text: '> Core: React, Next.js, Angular, Javascript ES6, Typescript' },
  { type: 'input', text: 'yash --status' },
  { type: 'output', text: '> Immediate Joiner' },
  { type: 'output', text: '> Open to Pune, Hyderabad, Mumbai, Bengaluru, Nagpur' }
];

export default function Hero({ data, cvFileUrl, showTerminal = true }: HeroProps) {
  const [terminalLines, setTerminalLines] = useState<string[]>([]);
  const [terminalInput, setTerminalInput] = useState('');

  useEffect(() => {
    if (!showTerminal) return; // Skip sequence setup if terminal is hidden

    const sequence = data?.terminalSequence && data.terminalSequence.length > 0 
      ? data.terminalSequence 
      : defaultSequence;

    // Reset terminal state
    setTerminalLines([]);
    setTerminalInput('');

    let currentSeqIndex = 0;
    let charIndex = 0;
    let timeoutId: NodeJS.Timeout;

    const runSequence = () => {
      if (currentSeqIndex >= sequence.length) return;

      const current = sequence[currentSeqIndex];

      if (current.type === 'input') {
        if (charIndex < current.text.length) {
          setTerminalInput((prev) => prev + current.text[charIndex]);
          charIndex++;
          timeoutId = setTimeout(runSequence, 60);
        } else {
          // Finished typing input, push to lines
          setTerminalLines((prev) => [...prev, `$ ${current.text}`]);
          setTerminalInput('');
          charIndex = 0;
          currentSeqIndex++;
          timeoutId = setTimeout(runSequence, 500); // delay before output
        }
      } else {
        // Output pushes instantly
        setTerminalLines((prev) => [...prev, current.text]);
        currentSeqIndex++;
        timeoutId = setTimeout(runSequence, 600); // delay before next prompt
      }
    };

    timeoutId = setTimeout(runSequence, 1000); // start after 1s

    return () => clearTimeout(timeoutId);
  }, [data?.terminalSequence, showTerminal]);

  return (
    <section className="relative min-h-[85vh] flex flex-col justify-center items-center px-6 py-20 max-w-6xl mx-auto overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-1/4 left-1/4 -z-10 w-[300px] h-[300px] md:w-[500px] md:h-[500px] rounded-full bg-primary/10 blur-[100px] animate-pulse duration-[8s]" />
      <div className="absolute bottom-1/4 right-1/4 -z-10 w-[250px] h-[250px] md:w-[400px] md:h-[400px] rounded-full bg-secondary/5 blur-[120px] animate-pulse duration-[6s]" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center w-full">
        {/* Intro copy details */}
        <div className={`flex flex-col justify-center ${
          showTerminal 
            ? 'lg:col-span-7 items-start text-left' 
            : 'lg:col-span-12 items-center text-center max-w-3xl mx-auto'
        }`}>
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/25 bg-primary/5 text-xs text-primary font-semibold mb-6"
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>{data?.subtitle || 'Frontend & POS Software Architect'}</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
            className="font-display text-4xl md:text-7xl font-extrabold tracking-tight leading-none mb-6 text-foreground"
          >
            {data?.title ? (
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-primary/80 leading-tight block">
                {data.title}
              </span>
            ) : (
              <>
                Engineering <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-primary/80">
                  Premium Digital
                </span> <br />
                Experiences.
              </>
            )}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
            className={`font-sans text-base md:text-lg text-muted-foreground mb-8 leading-relaxed ${
              showTerminal ? 'max-w-lg text-left' : 'max-w-2xl text-center'
            }`}
          >
            {data?.tagline || 'I build high-performance POS platforms, salon SaaS dashboards, and state-of-the-art interactive frontends styled with Stripe-level precision.'}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
            className={`flex flex-wrap gap-4 ${showTerminal ? 'justify-start' : 'justify-center'}`}
          >
            <a
              href="#projects"
              className="px-6 py-3 rounded-lg bg-primary hover:bg-primary/90 text-white font-medium text-sm transition-all hover:scale-105 hover-glow-trigger shadow-lg shadow-primary/20"
            >
              Explore Projects
            </a>
            {cvFileUrl && (
              <button
                onClick={() => downloadActiveResume(cvFileUrl)}
                className="hidden md:flex px-6 py-3 rounded-lg border border-primary/45 bg-primary/5 hover:bg-primary/10 text-primary font-medium text-sm transition-all hover:scale-105 hover-glow-trigger items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download CV
              </button>
            )}
            <a
              href="#contact"
              className="px-6 py-3 rounded-lg border border-border bg-card/60 backdrop-blur-md text-foreground font-medium text-sm transition-all hover:border-foreground/30 hover-glow-trigger"
            >
              Get In Touch
            </a>
          </motion.div>
        </div>

        {/* Interactive Terminal Widget */}
        {showTerminal && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
            className="lg:col-span-5 w-full flex justify-center"
          >
            <div className="w-full max-w-md rounded-xl border border-border bg-card/75 backdrop-blur-xl shadow-2xl overflow-hidden font-mono text-xs text-foreground/90">
              {/* Header controls */}
              <div className="flex justify-between items-center bg-muted/65 px-4 py-3 border-b border-border/50">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-yellow-500/80 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-green-500/80 inline-block" />
                </div>
                <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Terminal className="w-3.5 h-3.5" />
                  <span>bash</span>
                </div>
              </div>

              {/* Terminal Viewport */}
              <div className="p-5 min-h-[220px] flex flex-col justify-start text-left space-y-2 select-none overflow-y-auto max-h-[300px]">
                {terminalLines.map((line, idx) => (
                  <div key={idx} className={line.startsWith('$') ? 'text-primary' : 'text-muted-foreground'}>
                    {line}
                  </div>
                ))}

                {/* Active input simulation */}
                <div className="flex items-center gap-1 text-primary">
                  <span>$</span>
                  <span>{terminalInput}</span>
                  <span className="w-1.5 h-4 bg-secondary animate-pulse inline-block" />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
