import React from "react";

export interface GlassIconsItem {
  icon: React.ReactElement;
  color: string;
  label: string;
  customClass?: string;
}

export interface GlassIconsProps {
  items: GlassIconsItem[];
  className?: string;
}

const gradientMapping: Record<string, string> = {
  blue: "linear-gradient(hsl(223, 90%, 50%), hsl(208, 90%, 50%))",
  purple: "linear-gradient(hsl(283, 90%, 50%), hsl(268, 90%, 50%))",
  red: "linear-gradient(hsl(3, 90%, 50%), hsl(348, 90%, 50%))",
  indigo: "linear-gradient(hsl(253, 90%, 50%), hsl(238, 90%, 50%))",
  orange: "linear-gradient(hsl(43, 90%, 50%), hsl(28, 90%, 50%))",
  green: "linear-gradient(hsl(123, 90%, 40%), hsl(108, 90%, 40%))",
};

const GlassIcons: React.FC<GlassIconsProps> = ({ items, className }) => {
  const getBackgroundStyle = (color: string): React.CSSProperties => {
    if (gradientMapping[color]) {
      return { background: gradientMapping[color] };
    }
    return { background: color };
  };

  return (
    <div
      className={`grid gap-[5em] grid-cols-2 md:grid-cols-3 mx-auto py-[3em] overflow-visible ${
        className || ""
      }`}
    >
      {items.map((item, index) => (
        <button
          key={index}
          type="button"
          aria-label={item.label}
          className={`relative bg-transparent outline-none w-[4.5em] h-[4.5em] [perspective:24em] [transform-style:preserve-3d] [-webkit-tap-highlight-color:transparent] group ${
            item.customClass || ""
          }`}
        >
          {/* Back layer */}
          <span
            className="absolute top-0 left-0 w-full h-full rounded-[1.25em] block transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.83,0,0.17,1)] origin-[100%_100%] rotate-[15deg] group-hover:[transform:rotate(25deg)_translate3d(-0.5em,-0.5em,0.5em)]"
            style={{
              ...getBackgroundStyle(item.color),
              boxShadow: "0.5em -0.5em 0.75em hsla(223, 10%, 10%, 0.15)",
            }}
          ></span>

          {/* Front layer */}
          <span
            className="absolute top-0 left-0 w-full h-full rounded-[1.25em] bg-[hsla(0,0%,100%,0.15)] transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.83,0,0.17,1)] origin-[80%_50%] flex backdrop-blur-[0.75em] [-webkit-backdrop-filter:blur(0.75em)] transform group-hover:[transform:translateZ(2em)]"
            style={{
              boxShadow: "0 0 0 0.1em hsla(0, 0%, 100%, 0.3) inset",
            }}
          >
            <span
              className="m-auto w-[1.5em] h-[1.5em] flex items-center justify-center"
              aria-hidden="true"
            >
              {item.icon}
            </span>
          </span>

          {/* Label */}
          <span className="absolute top-full left-0 right-0 text-center whitespace-nowrap leading-[2] text-base opacity-0 transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.83,0,0.17,1)] translate-y-0 group-hover:opacity-100 group-hover:[transform:translateY(20%)]">
            {item.label}
          </span>
        </button>
      ))}
    </div>
  );
};

// Glass-style SVG icons for file types
export const GlassImageIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 32 32" fill="none" {...props}>
    <rect x="4" y="6" width="24" height="20" rx="4" fill="url(#imgGradient)" />
    <circle cx="11" cy="13" r="2.5" fill="#fff" fillOpacity=".7" />
    <path d="M8 22l5-5 4 4 3-3 4 4v2H8v-2z" fill="#fff" fillOpacity=".4" />
    <defs>
      <linearGradient id="imgGradient" x1="4" y1="6" x2="28" y2="26" gradientUnits="userSpaceOnUse">
        <stop stopColor="#7dd3fc" />
        <stop offset="1" stopColor="#38bdf8" />
      </linearGradient>
    </defs>
  </svg>
);
export const GlassPdfIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 32 32" fill="none" {...props}>
    <rect x="5" y="6" width="22" height="20" rx="4" fill="url(#pdfGradient)" />
    <text x="16" y="22" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#fff" fillOpacity=".8">PDF</text>
    <defs>
      <linearGradient id="pdfGradient" x1="5" y1="6" x2="27" y2="26" gradientUnits="userSpaceOnUse">
        <stop stopColor="#f87171" />
        <stop offset="1" stopColor="#ef4444" />
      </linearGradient>
    </defs>
  </svg>
);
export const GlassDocIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 32 32" fill="none" {...props}>
    <rect x="5" y="6" width="22" height="20" rx="4" fill="url(#docGradient)" />
    <text x="16" y="22" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#fff" fillOpacity=".8">DOC</text>
    <defs>
      <linearGradient id="docGradient" x1="5" y1="6" x2="27" y2="26" gradientUnits="userSpaceOnUse">
        <stop stopColor="#818cf8" />
        <stop offset="1" stopColor="#6366f1" />
      </linearGradient>
    </defs>
  </svg>
);
export const GlassTextIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 32 32" fill="none" {...props}>
    <rect x="5" y="6" width="22" height="20" rx="4" fill="url(#txtGradient)" />
    <text x="16" y="22" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#fff" fillOpacity=".8">TXT</text>
    <defs>
      <linearGradient id="txtGradient" x1="5" y1="6" x2="27" y2="26" gradientUnits="userSpaceOnUse">
        <stop stopColor="#fbbf24" />
        <stop offset="1" stopColor="#f59e42" />
      </linearGradient>
    </defs>
  </svg>
);
export const GlassVideoIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 32 32" fill="none" {...props}>
    <rect x="5" y="6" width="22" height="20" rx="4" fill="url(#vidGradient)" />
    <polygon points="14,12 22,16 14,20" fill="#fff" fillOpacity=".7" />
    <defs>
      <linearGradient id="vidGradient" x1="5" y1="6" x2="27" y2="26" gradientUnits="userSpaceOnUse">
        <stop stopColor="#34d399" />
        <stop offset="1" stopColor="#10b981" />
      </linearGradient>
    </defs>
  </svg>
);
export const GlassAudioIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 32 32" fill="none" {...props}>
    <rect x="5" y="6" width="22" height="20" rx="4" fill="url(#audGradient)" />
    <rect x="12" y="14" width="3" height="6" rx="1" fill="#fff" fillOpacity=".7" />
    <rect x="18" y="12" width="2" height="10" rx="1" fill="#fff" fillOpacity=".4" />
    <defs>
      <linearGradient id="audGradient" x1="5" y1="6" x2="27" y2="26" gradientUnits="userSpaceOnUse">
        <stop stopColor="#f472b6" />
        <stop offset="1" stopColor="#ec4899" />
      </linearGradient>
    </defs>
  </svg>
);
export const GlassZipIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 32 32" fill="none" {...props}>
    <rect x="5" y="6" width="22" height="20" rx="4" fill="url(#zipGradient)" />
    <rect x="15" y="10" width="2" height="12" rx="1" fill="#fff" fillOpacity=".7" />
    <defs>
      <linearGradient id="zipGradient" x1="5" y1="6" x2="27" y2="26" gradientUnits="userSpaceOnUse">
        <stop stopColor="#facc15" />
        <stop offset="1" stopColor="#eab308" />
      </linearGradient>
    </defs>
  </svg>
);
export const GlassGenericIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 32 32" fill="none" {...props}>
    <rect x="5" y="6" width="22" height="20" rx="4" fill="url(#genGradient)" />
    <rect x="10" y="12" width="12" height="2" rx="1" fill="#fff" fillOpacity=".5" />
    <rect x="10" y="17" width="12" height="2" rx="1" fill="#fff" fillOpacity=".3" />
    <defs>
      <linearGradient id="genGradient" x1="5" y1="6" x2="27" y2="26" gradientUnits="userSpaceOnUse">
        <stop stopColor="#a3a3a3" />
        <stop offset="1" stopColor="#525252" />
      </linearGradient>
    </defs>
  </svg>
);
