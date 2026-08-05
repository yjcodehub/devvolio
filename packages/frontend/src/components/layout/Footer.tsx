'use client';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-border/40 bg-card/10 py-12 px-6 md:px-16 mt-20">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-muted-foreground">
        <div className='mx-auto'>
          <span className="font-display font-semibold text-foreground">© {currentYear} Devvolio.</span> All rights reserved.
        </div>
      </div>
    </footer>
  );
}
