"use client";

/**
 * A friendly owl mascot holding a certificate — AutoCert's version
 * of Bannerbear's bear. Simple SVG illustration with a gentle wave.
 */
export function CertificateAnimation() {
  return (
    <svg
      viewBox="0 0 260 280"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-64 h-64 md:w-80 md:h-80"
      aria-label="Owl mascot holding a certificate"
    >
      {/* Ground line */}
      <line x1="60" y1="258" x2="200" y2="258" stroke="#3D2817" strokeWidth="2" strokeLinecap="round" />

      {/* ── OWL BODY ── */}
      {/* Body */}
      <ellipse cx="140" cy="210" rx="52" ry="50" fill="#D4A855" />
      {/* Belly */}
      <ellipse cx="140" cy="220" rx="34" ry="32" fill="#E8C96A" />

      {/* Feet */}
      <ellipse cx="120" cy="255" rx="14" ry="6" fill="#C49440" />
      <ellipse cx="160" cy="255" rx="14" ry="6" fill="#C49440" />

      {/* ── HEAD ── */}
      <circle cx="140" cy="140" r="45" fill="#D4A855" />

      {/* Ear tufts */}
      <path d="M105 105 L112 85 L120 108" fill="#C49440" />
      <path d="M160 108 L168 85 L175 105" fill="#C49440" />

      {/* Face disc */}
      <ellipse cx="140" cy="145" rx="32" ry="28" fill="#E8C96A" />

      {/* Eyes - big round owl eyes */}
      <circle cx="127" cy="138" r="12" fill="white" stroke="#3D2817" strokeWidth="2" />
      <circle cx="153" cy="138" r="12" fill="white" stroke="#3D2817" strokeWidth="2" />
      {/* Pupils */}
      <circle cx="129" cy="137" r="6" fill="#3D2817" />
      <circle cx="155" cy="137" r="6" fill="#3D2817" />
      {/* Eye shine */}
      <circle cx="131" cy="135" r="2" fill="white" />
      <circle cx="157" cy="135" r="2" fill="white" />

      {/* Beak */}
      <path d="M136 150 L140 158 L144 150" fill="#C49440" stroke="#3D2817" strokeWidth="1.5" strokeLinejoin="round" />

      {/* Little smile lines */}
      <path d="M130 155 Q140 160 150 155" stroke="#3D2817" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.3" />

      {/* ── WAVING ARM (right) ── */}
      <g className="owl-wave">
        <path
          d="M190 195 Q210 170 220 145 Q225 132 218 128"
          stroke="#D4A855"
          strokeWidth="22"
          strokeLinecap="round"
          fill="none"
        />
        {/* Wing tip / hand */}
        <circle cx="218" cy="128" r="10" fill="#C49440" />
      </g>

      {/* ── LEFT ARM HOLDING CERTIFICATE ── */}
      <path
        d="M92 200 Q70 185 55 170"
        stroke="#D4A855"
        strokeWidth="20"
        strokeLinecap="round"
        fill="none"
      />

      {/* Certificate in left hand */}
      <g transform="translate(20, 115) rotate(-12)">
        {/* Paper */}
        <rect x="0" y="0" width="55" height="42" rx="3" fill="white" stroke="#3D2817" strokeWidth="1.5" />
        {/* Header line */}
        <rect x="10" y="8" width="35" height="3" rx="1.5" fill="#D4A855" />
        {/* Text lines */}
        <rect x="8" y="16" width="39" height="2" rx="1" fill="#3D2817" opacity="0.2" />
        <rect x="12" y="22" width="31" height="2" rx="1" fill="#3D2817" opacity="0.2" />
        <rect x="15" y="28" width="25" height="2" rx="1" fill="#3D2817" opacity="0.2" />
        {/* Seal */}
        <circle cx="28" cy="37" r="5" fill="#D4A855" />
        <circle cx="28" cy="37" r="3" fill="white" />
      </g>

      {/* ── SPARKLE near waving hand ── */}
      <g className="sparkle">
        <path
          d="M205 110 L207 104 L209 110 L215 112 L209 114 L207 120 L205 114 L199 112 Z"
          fill="#D4A855"
          stroke="#3D2817"
          strokeWidth="0.5"
        />
      </g>

      {/* ── ANIMATIONS ── */}
      <style>{`
        .owl-wave {
          transform-origin: 190px 195px;
          animation: wave 2s ease-in-out infinite;
        }
        @keyframes wave {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-8deg); }
          75% { transform: rotate(5deg); }
        }
        .sparkle {
          animation: twinkle 1.5s ease-in-out infinite;
        }
        @keyframes twinkle {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(0.6); }
        }
      `}</style>
    </svg>
  );
}
