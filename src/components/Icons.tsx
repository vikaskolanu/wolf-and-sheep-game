import React from 'react';

export const SheepSilhouette: React.FC<{ className?: string }> = ({ className = "w-10 h-10" }) => (
  <svg
    viewBox="0 0 100 100"
    className={className}
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Stylized sheep / ram silhouette */}
    <path d="M78 38 C75 32 68 28 62 29 C59 25 53 23 46 24 C38 25 32 29 28 35 C24 35 20 38 18 43 C15 48 16 55 20 59 C18 63 19 68 23 71 C27 74 33 74 38 73 L37 84 C37 86 39 87 41 87 L45 87 C47 87 48 86 48 84 L49 73 C53 74 57 73 61 71 L61 84 C61 86 63 87 65 87 L69 87 C71 87 72 86 72 84 L73 70 C78 67 82 62 82 56 C82 50 79 46 76 43 C79 41 80 39 78 38 Z M32 37 C34 33 39 30 44 30 C49 30 53 32 55 35 C52 38 48 40 44 40 C39 40 35 39 32 37 Z" />
    <circle cx="28" cy="46" r="2.5" fill="#1e292d" />
  </svg>
);

export const WolfSilhouette: React.FC<{ className?: string }> = ({ className = "w-10 h-10" }) => (
  <svg
    viewBox="0 0 100 100"
    className={className}
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Sharp angular wolf head matching user reference image */}
    <path
      d="M33 21 L62 33 L77 34 L71 49 L52 55 L48 78 L41 71 L36 67 L36 62 L23 55 L29 51 L23 44 L32 40 Z"
      fillRule="evenodd"
    />
    {/* Angled wolf eye cut-out */}
    <path
      d="M55 34 C57 37 60 38 61 38 C59 36 57 35 55 34 Z"
      fill="#141c1f"
    />
  </svg>
);

export const GrassTileIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M3 20h18v1H3v-1zm2-2c1-3 3-7 5-9-1 4-1 7-1 9h-4zm7 0c0-4 1-9 4-13-1 5 0 9 0 13h-4zm6 0c1-3 2-6 5-8-2 3-3 6-3 8h-2z" />
  </svg>
);

export const StarvationIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Starvation indicator / skull shape */}
    <path d="M12 2C7.58 2 4 5.58 4 10c0 2.45 1.1 4.64 2.84 6.13L6.3 19.3c-.15.48.2 1 .7 1h10c.5 0 .85-.52.7-1l-.54-3.17C18.9 14.64 20 12.45 20 10c0-4.42-3.58-8-8-8zm-3 7c.83 0 1.5.67 1.5 1.5S9.83 12 9 12s-1.5-.67-1.5-1.5S8.17 9 9 9zm6 0c.83 0 1.5.67 1.5 1.5S15.83 12 15 12s-1.5-.67-1.5-1.5.67-1.5 1.5-1.5zm-5 7h4v2h-4v-2z" />
  </svg>
);

export const EatenMarker: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
