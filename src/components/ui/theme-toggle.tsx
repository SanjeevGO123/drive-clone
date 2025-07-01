import React, { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

interface ThemeToggleProps {
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '' }) => {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    const html = document.documentElement;
    if (isDark) {
      html.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      html.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Simplified Liquid Glass Toggle Container */}
      <button
        onClick={toggleTheme}
        aria-label="Toggle dark mode"
        className="relative w-16 h-8 rounded-full transition-all duration-500 ease-out focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:ring-offset-2"
        style={{
          background: isDark
            ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(51, 65, 85, 0.7) 100%)'
            : 'linear-gradient(135deg, rgba(219, 234, 254, 0.9) 0%, rgba(147, 197, 253, 0.7) 100%)',
          backdropFilter: 'blur(10px) saturate(150%)',
          WebkitBackdropFilter: 'blur(10px) saturate(150%)',
          border: isDark
            ? '1px solid rgba(99, 102, 241, 0.4)'
            : '1px solid rgba(59, 130, 246, 0.5)',
          boxShadow: isDark
            ? '0 4px 20px rgba(99, 102, 241, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
            : '0 4px 20px rgba(59, 130, 246, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.4)',
        }}
      >
        {/* Simple Toggle Knob */}
        <div
          className="absolute top-1 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-500 ease-out"
          style={{
            left: isDark ? 'calc(100% - 28px)' : '4px',
            background: isDark
              ? 'linear-gradient(135deg, rgba(99, 102, 241, 1) 0%, rgba(139, 92, 246, 0.9) 100%)'
              : 'linear-gradient(135deg, rgba(255, 255, 255, 1) 0%, rgba(248, 250, 252, 0.9) 100%)',
            border: isDark
              ? '1px solid rgba(139, 92, 246, 0.6)'
              : '1px solid rgba(203, 213, 225, 0.8)',
            boxShadow: isDark
              ? '0 2px 8px rgba(99, 102, 241, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
              : '0 2px 8px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
          }}
        >
          {/* Icon */}
          <Sun
            className={`w-4 h-4 transition-all duration-300 absolute ${
              isDark
                ? 'opacity-0 rotate-180 scale-0'
                : 'opacity-100 rotate-0 scale-100'
            }`}
            style={{ color: '#f59e0b' }}
          />
          <Moon
            className={`w-4 h-4 transition-all duration-300 absolute ${
              isDark
                ? 'opacity-100 rotate-0 scale-100'
                : 'opacity-0 -rotate-180 scale-0'
            }`}
            style={{ color: '#e0e7ff' }}
          />
        </div>
      </button>
    </div>
  );
};

export default ThemeToggle;
