import React from 'react';
import Image from 'next/image';

interface LogoProps {
  className?: string;
  iconSize?: number;
  showText?: boolean;
}

export default function DevvolioLogo({ className = '', iconSize = 32, showText = true }: LogoProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Devvolio PNG Icon */}
      {/* <Image
        src="/logo.png"
        alt="Devvolio Logo"
        width={iconSize}
        height={iconSize}
        className="shrink-0 object-contain"
        priority
      /> */}

      {/* Devvolio Brand Text */}
      {showText && (
        <span className="font-display font-black text-xl tracking-tight select-none flex items-center">
          <span className="text-slate-900 dark:text-white transition-colors duration-200">
            Dev
          </span>
          <span
            className="bg-clip-text text-transparent bg-gradient-to-r from-[#9D50BB] via-[#D10074] via-[#FF4B2B] to-[#FF8B00] drop-shadow-[0_2px_8px_rgba(236,0,140,0.15)]"
          >
            volio
          </span>
        </span>
      )}
    </div>
  );
}
