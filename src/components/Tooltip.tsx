import React from 'react';

interface TooltipProps {
  content: string;
  description?: string;
  x: number;
  y: number;
  visible: boolean;
}

const Tooltip: React.FC<TooltipProps> = ({ content, description, x, y, visible }) => {
  if (!visible) return null;

  return (
    <div 
      className="fixed z-[9999] pointer-events-none bg-[#0D0D0D]/90 border border-white/10 p-3 shadow-xl backdrop-blur-md min-w-[120px]"
      style={{ 
        left: x + 15, 
        top: y + 15,
      }}
    >
      <div className="text-white font-dot tracking-widest uppercase text-xs mb-1">{content}</div>
      {description && <div className="text-white/50 text-[10px] font-mono uppercase tracking-wider">{description}</div>}
    </div>
  );
};

export default Tooltip;
