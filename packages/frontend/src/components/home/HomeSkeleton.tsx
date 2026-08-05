import React from 'react';

export default function HomeSkeleton() {
  return (
    <div className="relative w-full flex flex-col items-center select-none pt-8">
      {/* 1. Hero Skeleton */}
      <section className="relative min-h-[85vh] flex flex-col justify-center items-center px-6 py-20 max-w-6xl mx-auto w-full overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center w-full">
          {/* Left Intro Copy */}
          <div className="lg:col-span-7 flex flex-col justify-center items-start text-left space-y-6">
            {/* Badge */}
            <div className="h-6 w-48 rounded-full bg-muted/40 animate-pulse border border-border/20" />
            
            {/* Title */}
            <div className="space-y-3 w-full">
              <div className="h-12 md:h-16 w-3/4 rounded-lg bg-muted/40 animate-pulse" />
              <div className="h-12 md:h-16 w-1/2 rounded-lg bg-muted/40 animate-pulse" />
            </div>

            {/* Tagline */}
            <div className="space-y-2.5 w-full">
              <div className="h-4 w-5/6 rounded bg-muted/30 animate-pulse" />
              <div className="h-4 w-4/5 rounded bg-muted/30 animate-pulse" />
              <div className="h-4 w-2/3 rounded bg-muted/30 animate-pulse" />
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-4 pt-4">
              <div className="h-11 w-32 rounded-lg bg-muted/45 animate-pulse" />
              <div className="h-11 w-32 rounded-lg bg-muted/45 animate-pulse" />
            </div>
          </div>

          {/* Right Terminal Widget */}
          <div className="lg:col-span-5 w-full flex justify-center">
            <div className="w-full max-w-md rounded-xl border border-border bg-card/45 backdrop-blur-xl shadow-xl overflow-hidden min-h-[280px]">
              {/* Header */}
              <div className="flex justify-between items-center bg-muted/50 px-4 py-3 border-b border-border/50">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-muted/40 animate-pulse" />
                  <div className="w-3 h-3 rounded-full bg-muted/40 animate-pulse" />
                  <div className="w-3 h-3 rounded-full bg-muted/40 animate-pulse" />
                </div>
                <div className="h-3 w-12 rounded bg-muted/40 animate-pulse" />
              </div>
              {/* Terminal Viewport */}
              <div className="p-5 space-y-4">
                <div className="h-3 w-1/3 rounded bg-primary/20 animate-pulse" />
                <div className="h-3 w-3/4 rounded bg-muted/30 animate-pulse" />
                <div className="h-3 w-2/3 rounded bg-muted/30 animate-pulse" />
                <div className="h-3 w-1/2 rounded bg-primary/10 animate-pulse" />
                <div className="h-3 w-1/3 rounded bg-muted/30 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. About / Core Expertise Skeleton */}
      <section className="py-24 px-6 max-w-6xl mx-auto w-full border-t border-border/20">
        <div className="text-center md:text-left mb-16 space-y-4">
          <div className="h-10 w-48 rounded bg-muted/40 animate-pulse mx-auto md:mx-0" />
          <div className="h-4 w-3/4 rounded bg-muted/30 animate-pulse mx-auto md:mx-0" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="rounded-xl border border-border/60 bg-card/25 p-8 flex gap-6 items-start flex-col sm:flex-row animate-pulse">
              <div className="p-3 w-14 h-14 rounded-lg bg-muted/40 shrink-0" />
              <div className="flex-1 space-y-3 w-full">
                <div className="h-5 w-1/3 rounded bg-muted/40" />
                <div className="space-y-1.5">
                  <div className="h-3 w-full rounded bg-muted/30" />
                  <div className="h-3 w-5/6 rounded bg-muted/30" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Experience Timeline Skeleton */}
      <section className="py-24 px-6 max-w-5xl mx-auto w-full relative border-t border-border/20">
        <div className="text-center mb-20 space-y-4">
          <div className="h-10 w-64 rounded bg-muted/40 animate-pulse mx-auto" />
          <div className="h-4 w-96 rounded bg-muted/30 animate-pulse mx-auto" />
        </div>

        <div className="relative mt-12 pl-8 md:pl-0 space-y-16">
          {/* Vertical Progress Line */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-[2px] bg-border/30 -translate-x-[1px]" />

          {Array.from({ length: 3 }).map((_, idx) => {
            const isEven = idx % 2 === 0;
            return (
              <div key={idx} className="relative flex flex-col md:flex-row items-start md:items-center w-full animate-pulse">
                {/* Dot */}
                <div className="absolute left-8 md:left-1/2 top-0 md:top-1/2 w-8 h-8 rounded-full border border-border bg-background -translate-x-1/2 md:-translate-y-1/2 flex items-center justify-center z-10">
                  <div className="w-3.5 h-3.5 rounded-full bg-muted/40" />
                </div>

                {/* Left side desktop info */}
                <div className={`hidden md:block w-1/2 pr-12 text-right ${isEven ? 'opacity-100' : 'opacity-0'}`}>
                  {isEven && (
                    <div className="space-y-2 flex flex-col items-end">
                      <div className="h-3 w-24 rounded bg-muted/40" />
                      <div className="h-5 w-48 rounded bg-muted/40" />
                      <div className="h-4 w-32 rounded bg-muted/30" />
                    </div>
                  )}
                </div>

                {/* Right side desktop info */}
                <div className={`hidden md:block w-1/2 pl-12 text-left ${!isEven ? 'opacity-100' : 'opacity-0'}`}>
                  {!isEven && (
                    <div className="space-y-2">
                      <div className="h-3 w-24 rounded bg-muted/40" />
                      <div className="h-5 w-48 rounded bg-muted/40" />
                      <div className="h-4 w-32 rounded bg-muted/30" />
                    </div>
                  )}
                </div>

                {/* Card description details */}
                <div className={`w-full md:w-[42%] md:absolute ${isEven ? 'md:left-[54%]' : 'md:right-[54%]'} pl-8 md:pl-0 mt-4 md:mt-0`}>
                  <div className="p-6 rounded-xl border border-border bg-card/15 space-y-4">
                    <div className="md:hidden space-y-2">
                      <div className="h-3.5 w-24 rounded bg-muted/40" />
                      <div className="h-5 w-48 rounded bg-muted/40" />
                      <div className="h-4.5 w-32 rounded bg-muted/30" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-3.5 w-full rounded bg-muted/30" />
                      <div className="h-3.5 w-5/6 rounded bg-muted/30" />
                    </div>
                    <div className="flex flex-wrap gap-2 pt-2">
                      <div className="h-5 w-14 rounded bg-muted/40" />
                      <div className="h-5 w-16 rounded bg-muted/40" />
                      <div className="h-5 w-12 rounded bg-muted/40" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Projects Grid Skeleton */}
      <section className="py-24 px-6 max-w-6xl mx-auto w-full border-t border-border/20">
        <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 mb-16 animate-pulse">
          <div className="space-y-4 text-left">
            <div className="h-10 w-48 rounded bg-muted/40" />
            <div className="h-4 w-72 rounded bg-muted/30" />
          </div>
          {/* Search bar */}
          <div className="h-10 w-full md:w-80 rounded-lg bg-muted/40 border border-border/60" />
        </div>

        {/* Categories Tab list */}
        <div className="flex gap-2.5 mb-10 border-b border-border/20 pb-4 animate-pulse">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-8 w-20 rounded-lg bg-muted/35" />
          ))}
        </div>

        {/* Project Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="rounded-xl border border-border bg-card/25 overflow-hidden flex flex-col justify-between h-[420px] animate-pulse">
              {/* Thumbnail */}
              <div className="h-48 bg-muted/40 w-full" />
              {/* Body */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="h-6 w-2/3 rounded bg-muted/40" />
                  <div className="space-y-1.5">
                    <div className="h-3 w-full rounded bg-muted/30" />
                    <div className="h-3 w-full rounded bg-muted/30" />
                    <div className="h-3 w-4/5 rounded bg-muted/30" />
                  </div>
                </div>
                {/* Footer */}
                <div className="space-y-4 pt-4 border-t border-border/30">
                  <div className="flex gap-1.5">
                    <div className="h-4 w-12 rounded bg-muted/40" />
                    <div className="h-4 w-16 rounded bg-muted/40" />
                    <div className="h-4 w-10 rounded bg-muted/40" />
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="h-4 w-16 rounded bg-muted/45" />
                    <div className="h-4 w-20 rounded bg-muted/45" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Skills Marquee Skeleton */}
      <section className="py-24 w-full overflow-hidden bg-card/5 border-y border-border/20">
        <div className="max-w-6xl mx-auto px-6 mb-16 text-center md:text-left space-y-4 animate-pulse">
          <div className="h-10 w-52 rounded bg-muted/40 mx-auto md:mx-0" />
          <div className="h-4 w-80 rounded bg-muted/30 mx-auto md:mx-0" />
        </div>

        {/* Marquee band */}
        <div className="w-full py-6 border-y border-border/20 bg-muted/10 flex gap-12 overflow-hidden animate-pulse">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-4.5 h-4.5 rounded bg-muted/40" />
              <div className="h-3 w-20 rounded bg-muted/40" />
            </div>
          ))}
        </div>

        {/* Categories Grid */}
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 w-full">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="p-6 rounded-xl border border-border bg-card/25 space-y-6 animate-pulse">
              <div className="h-5 w-1/2 rounded bg-muted/40 border-b border-border/30 pb-2" />
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between">
                      <div className="h-3 w-24 rounded bg-muted/40" />
                      <div className="h-3 w-8 rounded bg-muted/40" />
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-muted/30" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Stats Dashboard Skeleton */}
      <section className="py-24 px-6 max-w-6xl mx-auto w-full">
        <div className="text-center md:text-left mb-16 space-y-4 animate-pulse">
          <div className="h-10 w-56 rounded bg-muted/40 mx-auto md:mx-0" />
          <div className="h-4 w-96 rounded bg-muted/30 mx-auto md:mx-0" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
          {/* Github Calendar */}
          <div className="lg:col-span-8 rounded-xl border border-border bg-card/15 p-6 space-y-6 animate-pulse">
            <div className="flex justify-between items-center">
              <div className="h-5 w-32 rounded bg-muted/40" />
              <div className="h-4 w-40 rounded bg-muted/30" />
            </div>
            {/* Grid representation */}
            <div className="flex gap-1 overflow-x-auto">
              {Array.from({ length: 24 }).map((_, col) => (
                <div key={col} className="grid grid-rows-7 gap-1">
                  {Array.from({ length: 7 }).map((_, row) => (
                    <div key={row} className="w-2.5 h-2.5 rounded bg-muted/30" />
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Leetcode */}
          <div className="lg:col-span-4 rounded-xl border border-border bg-card/15 p-6 space-y-6 animate-pulse">
            <div className="h-5 w-40 rounded bg-muted/40" />
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between">
                    <div className="h-3.5 w-20 rounded bg-muted/35" />
                    <div className="h-3.5 w-16 rounded bg-muted/35" />
                  </div>
                  <div className="h-1.5 w-full rounded bg-muted/30" />
                </div>
              ))}
            </div>
          </div>

          {/* Spotify */}
          <div className="lg:col-span-12 rounded-xl border border-border bg-card/15 p-5 flex flex-col sm:flex-row items-center justify-between gap-4 animate-pulse">
            <div className="flex items-center gap-4 w-full">
              <div className="w-12 h-12 rounded-full bg-muted/40 shrink-0" />
              <div className="space-y-2 flex-1">
                <div className="h-3 w-16 rounded bg-emerald-500/35" />
                <div className="h-4 w-1/3 rounded bg-muted/40" />
                <div className="h-3 w-1/4 rounded bg-muted/30" />
              </div>
            </div>
            <div className="h-6 w-16 rounded bg-muted/40" />
          </div>
        </div>
      </section>

      {/* 7. Contact Form Skeleton */}
      <section className="py-24 px-6 max-w-4xl mx-auto w-full border-t border-border/20">
        <div className="text-center mb-16 space-y-4 animate-pulse">
          <div className="h-10 w-52 rounded bg-muted/40 mx-auto" />
          <div className="h-4 w-80 rounded bg-muted/30 mx-auto" />
        </div>

        <div className="rounded-xl border border-border bg-card/15 p-8 space-y-6 animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="h-3 w-20 rounded bg-muted/40" />
              <div className="h-11 w-full rounded-lg bg-muted/30" />
            </div>
            <div className="space-y-2">
              <div className="h-3 w-20 rounded bg-muted/40" />
              <div className="h-11 w-full rounded-lg bg-muted/30" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-3 w-16 rounded bg-muted/40" />
            <div className="h-11 w-full rounded-lg bg-muted/30" />
          </div>
          <div className="space-y-2">
            <div className="h-3 w-16 rounded bg-muted/40" />
            <div className="h-32 w-full rounded-lg bg-muted/30 animate-pulse" />
          </div>
          <div className="flex justify-end pt-4">
            <div className="h-11 w-32 rounded-lg bg-muted/40" />
          </div>
        </div>
      </section>
    </div>
  );
}
