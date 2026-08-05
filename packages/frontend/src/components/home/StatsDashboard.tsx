'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Github, Music, Award, ExternalLink } from 'lucide-react';

interface StatsProps {
  stats?: {
    githubUsername?: string;
    leetcodeEasySolved?: number;
    leetcodeEasyTotal?: number;
    leetcodeMediumSolved?: number;
    leetcodeMediumTotal?: number;
    leetcodeHardSolved?: number;
    leetcodeHardTotal?: number;
    spotifyIsPlaying?: boolean;
    spotifyTrackTitle?: string;
    spotifyTrackArtist?: string;
  };
  showGithub?: boolean;
  showLeetcode?: boolean;
  showSpotify?: boolean;
}

export default function StatsDashboard({ stats, showGithub = true, showLeetcode = true, showSpotify = true }: StatsProps) {
  const [isPlaying, setIsPlaying] = useState(stats?.spotifyIsPlaying ?? false);
  const columns = 28;
  const rows = 7;
  const [githubCells, setGithubCells] = useState<string[]>([]);

  // Sync isPlaying state with prop initially
  useEffect(() => {
    if (stats?.spotifyIsPlaying !== undefined) {
      setIsPlaying(stats.spotifyIsPlaying);
    }
  }, [stats?.spotifyIsPlaying]);

  // Auto toggle Spotify now playing mockup to make the card feel interactive and alive
  useEffect(() => {
    const interval = setInterval(() => {
      setIsPlaying((prev) => !prev);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  // Generate mock Github grid of contribution cells (15 columns x 7 rows for layout clean sizing) on client mount
  useEffect(() => {
    const cells = Array.from({ length: columns * rows }).map(() => {
      const rand = Math.random();
      if (rand < 0.35) return 'bg-border/30'; // empty
      if (rand < 0.6) return 'bg-primary/20'; // light active
      if (rand < 0.8) return 'bg-primary/50'; // medium active
      return 'bg-secondary'; // high active
    });
    setGithubCells(cells);
  }, []);

  const easySolved = stats?.leetcodeEasySolved ?? 142;
  const easyTotal = stats?.leetcodeEasyTotal ?? 200;
  const mediumSolved = stats?.leetcodeMediumSolved ?? 210;
  const mediumTotal = stats?.leetcodeMediumTotal ?? 450;
  const hardSolved = stats?.leetcodeHardSolved ?? 38;
  const hardTotal = stats?.leetcodeHardTotal ?? 150;

  const easyPercent = Math.min(100, Math.round((easySolved / (easyTotal || 1)) * 100));
  const mediumPercent = Math.min(100, Math.round((mediumSolved / (mediumTotal || 1)) * 100));
  const hardPercent = Math.min(100, Math.round((hardSolved / (hardTotal || 1)) * 100));

  const githubUser = stats?.githubUsername ?? 'yjcodehub';
  const trackTitle = stats?.spotifyTrackTitle ?? 'Chill Vibes Loop';
  const trackArtist = stats?.spotifyTrackArtist ?? 'Yash Jais Studio Mix';

  if (!showGithub && !showLeetcode && !showSpotify) {
    return null;
  }

  return (
    <section className="py-24 px-6 max-w-6xl mx-auto w-full">
      <div className="text-center md:text-left mb-16">
        <h2 className="font-display text-3xl md:text-5xl font-extrabold tracking-tight mb-4 text-foreground">
          Developer Metrics
        </h2>
        <p className="font-sans text-base text-muted-foreground max-w-xl leading-relaxed">
          Operational statistics tracked dynamically from GitHub contributions, LeetCode practices, and active workspace widgets.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
        {/* GitHub Contribution widget card */}
        {showGithub && (
          <div className={`${
            showLeetcode ? 'lg:col-span-8' : 'lg:col-span-12'
          } rounded-xl border border-border bg-card/25 backdrop-blur-md p-6 text-left hover:border-primary/10 transition-all duration-300 hover-glow-trigger`}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-display font-bold text-lg flex items-center gap-2 text-foreground">
                <Github className="w-5 h-5 text-primary" />
                <span>GitHub Activity</span>
              </h3>
              <a
                href={`https://github.com/${githubUser}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 hover-glow-trigger"
              >
                <span>github.com/{githubUser}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Contribution Calendar Graph grid */}
            <div className="overflow-x-auto w-full pb-2">
              <div className="grid grid-flow-col gap-1 w-max">
                {Array.from({ length: columns }).map((_, colIdx) => (
                  <div key={colIdx} className="grid grid-rows-7 gap-1">
                    {Array.from({ length: rows }).map((_, rowIdx) => {
                      const idx = colIdx * rows + rowIdx;
                      return (
                        <div
                          key={rowIdx}
                          className={`w-[10px] h-[10px] rounded-sm transition-all duration-300 hover:scale-125 cursor-pointer ${githubCells[idx] || 'bg-border/30'}`}
                          title="Contribution activity cell"
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-between items-center text-[10px] text-muted-foreground mt-4 font-semibold">
              <span>Learn more about open contributions</span>
              <div className="flex items-center gap-1.5">
                <span>Less</span>
                <span className="w-2.5 h-2.5 rounded-sm bg-border/30" />
                <span className="w-2.5 h-2.5 rounded-sm bg-primary/20" />
                <span className="w-2.5 h-2.5 rounded-sm bg-primary/50" />
                <span className="w-2.5 h-2.5 rounded-sm bg-secondary" />
                <span>More</span>
              </div>
            </div>
          </div>
        )}

        {/* LeetCode stats card */}
        {showLeetcode && (
          <div className={`${
            showGithub ? 'lg:col-span-4' : 'lg:col-span-12'
          } rounded-xl border border-border bg-card/25 backdrop-blur-md p-6 text-left hover:border-primary/10 transition-all duration-300 hover-glow-trigger`}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-display font-bold text-lg flex items-center gap-2 text-foreground">
                <Award className="w-5 h-5 text-secondary" />
                <span>Algorithm Practice</span>
              </h3>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-secondary/15 text-secondary border border-secondary/10">
                LeetCode
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-muted-foreground">Easy Solved</span>
                  <span className="text-foreground font-bold">{easySolved} / {easyTotal}</span>
                </div>
                <div className="w-full h-1 bg-border/40 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${easyPercent}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-muted-foreground">Medium Solved</span>
                  <span className="text-foreground font-bold">{mediumSolved} / {mediumTotal}</span>
                </div>
                <div className="w-full h-1 bg-border/40 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: `${mediumPercent}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-muted-foreground">Hard Solved</span>
                  <span className="text-foreground font-bold">{hardSolved} / {hardTotal}</span>
                </div>
                <div className="w-full h-1 bg-border/40 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500 rounded-full" style={{ width: `${hardPercent}%` }} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Spotify Now Playing Widget */}
        {showSpotify && (
          <div className="lg:col-span-12 rounded-xl border border-border bg-card/25 backdrop-blur-md p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-left hover:border-primary/10 transition-all duration-300 hover-glow-trigger">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-full bg-green-500/10 border border-green-500/25 ${isPlaying ? 'animate-bounce' : ''}`}>
              <Music className={`w-5 h-5 text-emerald-500 ${isPlaying ? 'animate-spin' : ''} duration-[4s]`} />
            </div>
            <div>
              <div className="text-[10px] font-bold tracking-wider text-emerald-500 uppercase flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>{isPlaying ? 'Now Playing' : 'Last Played'}</span>
              </div>
              <h4 className="font-display font-bold text-sm text-foreground mt-0.5">
                {isPlaying ? (stats?.spotifyIsPlaying ? trackTitle : 'Synthesizing Frontend Architecture') : trackTitle}
              </h4>
              <p className="font-sans text-xs text-muted-foreground">{trackArtist}</p>
            </div>
          </div>

          {/* Animated waveform animation */}
          <div className="flex items-end gap-1 h-6">
            <span className={`w-0.5 bg-emerald-500 rounded-full transition-all duration-300 ${isPlaying ? 'animate-[wave_1s_infinite_ease-in-out]' : 'h-1.5'}`} style={{ animationDelay: '0.1s' }} />
            <span className={`w-0.5 bg-emerald-500 rounded-full transition-all duration-300 ${isPlaying ? 'animate-[wave_0.8s_infinite_ease-in-out]' : 'h-3'}`} style={{ animationDelay: '0.3s' }} />
            <span className={`w-0.5 bg-emerald-500 rounded-full transition-all duration-300 ${isPlaying ? 'animate-[wave_1.2s_infinite_ease-in-out]' : 'h-4'}`} style={{ animationDelay: '0.2s' }} />
            <span className={`w-0.5 bg-emerald-500 rounded-full transition-all duration-300 ${isPlaying ? 'animate-[wave_0.9s_infinite_ease-in-out]' : 'h-2'}`} style={{ animationDelay: '0.4s' }} />
          </div>
        </div>
      )}
      </div>
    </section>
  );
}
