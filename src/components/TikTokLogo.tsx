import React from 'react';

const TikTokLogo = ({ size = 20, className = "" }: { size?: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.765v13.67a2.896 2.896 0 0 1-2.9 2.9 2.9 2.9 0 1 1 2.9-2.9c0-.25-.033-.49-.09-.722v-3.9a6.7 6.7 0 0 0-2.81-.616 6.67 6.67 0 1 0 6.67 6.67V9.98a8.5 8.5 0 0 0 4.97 1.59V7.8a4.8 4.8 0 0 1-1.205-.114Z" />
  </svg>
);

export default TikTokLogo;
