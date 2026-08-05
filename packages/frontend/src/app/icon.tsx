import { ImageResponse } from 'next/og';

// Image metadata
export const size = {
  width: 32,
  height: 32,
};
export const contentType = 'image/png';

// Generate dynamic favicon matching the brand logo
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#0b0b0f', // Dark charcoal background matching brand theme
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '8px',
          padding: '2px',
        }}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Blue-to-purple gradient for the 'D' loop */}
            <linearGradient id="logoDGradFav" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0072FF" />
              <stop offset="60%" stopColor="#4364F7" />
              <stop offset="100%" stopColor="#9D50BB" />
            </linearGradient>

            {/* Left checkmark leg gradient (purple to magenta) */}
            <linearGradient id="checkLeftGradFav" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#9D50BB" />
              <stop offset="100%" stopColor="#D10074" />
            </linearGradient>

            {/* Right checkmark leg gradient (magenta to orange-yellow) */}
            <linearGradient id="checkRightGradFav" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#D10074" />
              <stop offset="50%" stopColor="#FF4B2B" />
              <stop offset="100%" stopColor="#FF8B00" />
            </linearGradient>

            {/* Crease shadow gradient for the 3D fold */}
            <linearGradient id="creaseShadowFav" x1="100%" y1="50%" x2="0%" y2="50%">
              <stop offset="0%" stopColor="rgba(0, 0, 0, 0.4)" />
              <stop offset="100%" stopColor="rgba(0, 0, 0, 0)" />
            </linearGradient>

            {/* Spine and dots vertical gradient */}
            <linearGradient id="spineGradFav" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0072FF" />
              <stop offset="25%" stopColor="#00C6FF" />
              <stop offset="50%" stopColor="#4364F7" />
              <stop offset="75%" stopColor="#9D50BB" />
              <stop offset="100%" stopColor="#D10074" />
            </linearGradient>
          </defs>

          {/* 1. Tech Dots and Stems */}
          <g stroke="url(#spineGradFav)" strokeWidth="4" strokeLinecap="round">
            <line x1="60" y1="62" x2="42" y2="62" />
            <line x1="60" y1="77" x2="30" y2="77" />
            <line x1="60" y1="92" x2="18" y2="92" />
            <line x1="60" y1="107" x2="30" y2="107" />
            <line x1="60" y1="122" x2="42" y2="122" />
          </g>
          <g fill="url(#spineGradFav)">
            <circle cx="42" cy="62" r="5" />
            <circle cx="30" cy="77" r="5" />
            <circle cx="18" cy="92" r="5" />
            <circle cx="30" cy="107" r="5" />
            <circle cx="42" cy="122" r="5" />
          </g>

          {/* 2. D Shape */}
          <path
            fillRule="evenodd"
            d="M 60 45 H 110 C 128 45, 140 58, 140 75 V 120 C 140 137, 128 150, 110 150 H 60 Z M 78 68 H 100 C 110 68, 118 78, 118 97 C 118 116, 110 127, 100 127 H 78 Z"
            fill="url(#logoDGradFav)"
          />

          {/* 3. V Checkmark */}
          {/* Left Leg of V */}
          <path
            d="M 78 100 L 104 130 L 104 148 L 78 118 Z"
            fill="url(#checkLeftGradFav)"
          />

          {/* 3D Crease Shadow */}
          <path
            d="M 104 130 L 104 148 L 94 139 Z"
            fill="url(#creaseShadowFav)"
          />

          {/* Right Leg of V */}
          <path
            d="M 104 148 L 152 60 L 139 54 L 104 130 Z"
            fill="url(#checkRightGradFav)"
          />

          {/* 4. Code brackets </> inside the D cutout (styled white for dark favicon background) */}
          <g stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none">
            {/* Left chevron < */}
            <path d="M 90 77 L 84 84 L 90 91" />
            {/* Slash / */}
            <path d="M 96 73 L 92 95" />
            {/* Right chevron > */}
            <path d="M 98 77 L 104 84 L 98 91" />
          </g>
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}
