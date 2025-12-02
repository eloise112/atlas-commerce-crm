import React, { useMemo } from 'react';

// Define props extending HTML attributes to allow onClick, id, style, etc.
interface HudCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  title?: string;
  noFloat?: boolean;
}

// A container with angled corners, glowing border, and floating animation
export const HudCard: React.FC<HudCardProps> = ({ children, className = '', title, noFloat = false, style, ...props }) => {
  // Generate a random delay between 0 and 5 seconds so cards don't float in sync, making it feel organic
  const animationDelay = useMemo(() => `${Math.random() * 5}s`, []);

  // Combine animation delay with any custom styles passed in
  const combinedStyle = !noFloat 
    ? { ...style, animationDelay } 
    : style;

  return (
    <div 
      className={`relative group ${className} ${!noFloat ? 'animate-hud-float' : ''}`}
      style={combinedStyle}
      {...props} // Spread remaining props like onClick here
    >
      {/* Atmospheric Glow Behind (Ambient occlusion feeling) */}
      <div className="absolute top-4 left-4 right-4 bottom-0 bg-cyan-900/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-0 pointer-events-none"></div>

      {/* Main Glass Background & Border */}
      <div 
        className="absolute inset-0 bg-slate-900/80 backdrop-blur-md border border-cyan-500/30 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.8)] transition-all duration-300 group-hover:border-cyan-400/60 group-hover:shadow-[0_0_25px_rgba(6,182,212,0.3),0_20px_40px_-10px_rgba(0,0,0,0.8)]"
        style={{ clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)' }}
      ></div>
      
      {/* Decorative corner markers (with slight glow) */}
      <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-cyan-400 drop-shadow-[0_0_3px_rgba(34,211,238,0.8)] z-20 pointer-events-none"></div>
      <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 border-cyan-400 drop-shadow-[0_0_3px_rgba(34,211,238,0.8)] z-20 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 border-cyan-400 drop-shadow-[0_0_3px_rgba(34,211,238,0.8)] z-20 pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-cyan-400 drop-shadow-[0_0_3px_rgba(34,211,238,0.8)] z-20 pointer-events-none"></div>

      {/* Content */}
      <div className="relative z-10 p-6 h-full flex flex-col">
        {title && (
          <h3 className="text-cyan-400 font-sci-fi uppercase tracking-widest text-sm mb-4 border-b border-cyan-500/20 pb-2 flex items-center gap-2">
            <span className="w-2 h-2 bg-cyan-400 animate-pulse shadow-[0_0_5px_#22d3ee]"></span>
            {title}
          </h3>
        )}
        {children}
      </div>
    </div>
  );
};

export const HudButton: React.FC<{ children?: React.ReactNode; onClick?: () => void; variant?: 'primary' | 'danger' | 'success'; className?: string }> = ({ children, onClick, variant = 'primary', className = '' }) => {
  const colors = {
    primary: 'border-cyan-500 text-cyan-400 hover:bg-cyan-500/20 shadow-cyan-500/50',
    danger: 'border-red-500 text-red-400 hover:bg-red-500/20 shadow-red-500/50',
    success: 'border-green-500 text-green-400 hover:bg-green-500/20 shadow-green-500/50',
  };

  return (
    <button 
      onClick={onClick}
      className={`relative px-6 py-2 font-sci-fi tracking-wider uppercase border transition-all duration-200 hover:shadow-[0_0_15px_rgba(0,0,0,0.5)] hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2 ${colors[variant]} ${className}`}
      style={{ clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)' }}
    >
      {children}
    </button>
  );
};

export const HudInput = ({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) => (
  <div className="flex flex-col gap-1 mb-4 group">
    <label className="text-xs uppercase tracking-widest text-slate-400 font-sci-fi group-focus-within:text-cyan-400 transition-colors">{label}</label>
    <input 
      {...props}
      className="bg-slate-900/50 border border-slate-700 text-cyan-100 px-4 py-2 focus:outline-none focus:border-cyan-500 focus:shadow-[0_0_15px_rgba(6,182,212,0.15)] transition-all font-mono placeholder:text-slate-700"
    />
  </div>
);

export const HudSelect = ({ label, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { label: string }) => (
  <div className="flex flex-col gap-1 mb-4 group">
    <label className="text-xs uppercase tracking-widest text-slate-400 font-sci-fi group-focus-within:text-cyan-400 transition-colors">{label}</label>
    <select 
      {...props}
      className="bg-slate-900/50 border border-slate-700 text-cyan-100 px-4 py-2 focus:outline-none focus:border-cyan-500 focus:shadow-[0_0_15px_rgba(6,182,212,0.15)] transition-all font-mono"
    >
      {children}
    </select>
  </div>
);