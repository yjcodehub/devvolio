'use client';

import { useState, useEffect } from 'react';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { Github, Linkedin, FileDown, Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { downloadActiveResume } from '@/utils/resumeDownload';
import { getApiUrl } from '@/utils/api';
import DevvolioLogo from './DevvolioLogo';

const NAV_ITEMS = [
  { label: 'About', href: '#about' },
  { label: 'Experience', href: '#experience' },
  { label: 'Projects', href: '#projects' },
  { label: 'Skills', href: '#skills' },
  { label: 'Contact', href: '#contact' },
];

export default function Header() {
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [cvUrl, setCvUrl] = useState<string>('');
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchCvUrl = async () => {
      try {
        const apiUrl = getApiUrl();
        const res = await fetch(`${apiUrl}/settings`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data.cvFileUrl) {
            setCvUrl(json.data.cvFileUrl);
          }
        }
      } catch (err) {
        console.error('Failed to load settings cvFileUrl in navbar:', err);
      }
    };
    fetchCvUrl();
  }, []);

  // Monitor scroll progression to hide header on scroll down, reveal on scroll up
  useMotionValueEvent(scrollY, 'change', (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    if (latest > previous && latest > 120) {
      setHidden(true);
    } else {
      setHidden(false);
    }
  });

  return (
    <motion.header
      variants={{
        visible: { y: 0 },
        hidden: { y: '-100%' },
      }}
      animate={hidden ? 'hidden' : 'visible'}
      transition={{ duration: 0.35, ease: 'easeInOut' }}
      className="fixed top-0 left-0 right-0 z-40 bg-background/60 backdrop-blur-md border-b border-border/40 px-6 py-4 md:px-16"
    >
      <div className="max-w-6xl mx-auto flex justify-between items-center w-full">
        {/* Brand Logo */}
        <a href="#" className="hover-glow-trigger">
          <DevvolioLogo iconSize={30} />
          {/* <img src="/devvolio-logo.png" alt="portfolio logo" className='rounded-lg w-full max-w-96'/> */}
        </a>

        {/* Navigation items */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="hover:text-foreground transition-colors duration-200 hover-glow-trigger"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Social Shortcuts */}
        <div className="flex items-center gap-5 text-muted-foreground">
          {/* Theme Toggle Switch */}
          {!mounted ? (
            <div className="w-[34px] h-[34px]" />
          ) : (
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-1.5 rounded-lg hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-all duration-200 hover-glow-trigger hover:scale-105"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 transition-transform duration-300 hover:rotate-45" />
              ) : (
                <Moon className="w-5 h-5 transition-transform duration-300 hover:-rotate-12" />
              )}
            </button>
          )}

          {cvUrl && (
            <button
              onClick={() => downloadActiveResume(cvUrl)}
              className="flex md:hidden items-center gap-1.5 px-3 py-1.5 rounded-lg border border-primary/25 bg-primary/5 hover:bg-primary/10 text-primary font-bold text-xs transition-all hover:scale-105 hover-glow-trigger"
              aria-label="Download Resume"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Resume</span>
            </button>
          )}
          <a
            href="https://github.com/yjcodehub"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors duration-200 hover-glow-trigger"
            aria-label="GitHub"
          >
            <Github className="w-5 h-5" />
          </a>
          <a
            href="https://linkedin.com/in/yashjais97"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors duration-200 hover-glow-trigger"
            aria-label="LinkedIn"
          >
            <Linkedin className="w-5 h-5" />
          </a>
        </div>
      </div>
    </motion.header>
  );
}
