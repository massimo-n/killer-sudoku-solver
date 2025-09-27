import React from 'react';

// FIX: Explicitly type `commonProps` to ensure type compatibility with SVG attributes.
const commonProps: React.SVGProps<SVGSVGElement> = {
  xmlns: "http://www.w3.org/2000/svg",
  width: "24",
  height: "24",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

export const MagicWandIcon = ({ className = '' }: { className?: string }) => (
  <svg {...commonProps} className={`lucide lucide-wand-2 ${className}`}>
    <path d="m3 21 8.8-8.8a3 3 0 0 1 4.2 0l0 0a3 3 0 0 1 0 4.2L7.2 21.8a3 3 0 0 1-4.2 0l0 0a3 3 0 0 1 0-4.2Z" />
    <path d="m14 6 3.4-3.4a1 1 0 0 1 1.4 0l0 0a1 1 0 0 1 0 1.4L15 7" />
    <path d="m3 3 3 3" />
    <path d="m18 21 3-3" />
  </svg>
);

export const TrashIcon = ({ className = '' }: { className?: string }) => (
  <svg {...commonProps} className={`lucide lucide-trash-2 ${className}`}>
    <path d="M3 6h18" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" x2="10" y1="11" y2="17" />
    <line x1="14" x2="14" y1="11" y2="17" />
  </svg>
);

export const StepForwardIcon = ({ className = '' }: { className?: string }) => (
  <svg {...commonProps} className={`lucide lucide-step-forward ${className}`}>
    <line x1="6" x2="6" y1="4" y2="20" />
    <polygon points="10,4 20,12 10,20" />
  </svg>
);

export const EyeIcon = ({ className = '' }: { className?: string }) => (
  <svg {...commonProps} className={`lucide lucide-eye ${className}`}>
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export const PencilIcon = ({ className = '' }: { className?: string }) => (
    <svg {...commonProps} className={`lucide lucide-pencil ${className}`}>
        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
        <path d="m15 5 4 4"/>
    </svg>
);