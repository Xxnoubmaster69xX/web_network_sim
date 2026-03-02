import React, { useEffect, useState, useRef } from 'react';
import { X, ChevronRight, CheckCircle2, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

export type TutorialStep = {
  id: string;
  title: string;
  description: string;
  targetId?: string; // DOM ID to highlight
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: 'click' | 'drag' | 'connect' | 'type';
};

interface GuidedTutorialProps {
  steps: TutorialStep[];
  currentStepIndex: number;
  onComplete: () => void;
  onSkip: () => void;
  onNext: () => void;
}

const GuidedTutorial: React.FC<GuidedTutorialProps> = ({ 
  steps, 
  currentStepIndex, 
  onComplete, 
  onSkip,
  onNext 
}) => {
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const step = steps[currentStepIndex];
  const [typedText, setTypedText] = useState('');
  
  // Typewriter effect
  useEffect(() => {
    setTypedText('');
    let i = 0;
    const text = step.description;
    const interval = setInterval(() => {
      setTypedText(text.substring(0, i + 1));
      i++;
      if (i > text.length) clearInterval(interval);
    }, 30);
    return () => clearInterval(interval);
  }, [step]);

  // Update target position
  useEffect(() => {
    const updatePosition = () => {
      if (step.targetId) {
        const element = document.getElementById(step.targetId);
        if (element) {
          setTargetRect(element.getBoundingClientRect());
        } else {
            // Fallback if element not found immediately (e.g. dynamic nodes)
            // Retry briefly
            setTimeout(() => {
                const el = document.getElementById(step.targetId!);
                if (el) setTargetRect(el.getBoundingClientRect());
            }, 500);
        }
      } else {
        setTargetRect(null);
      }
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    return () => window.removeEventListener('resize', updatePosition);
  }, [step, currentStepIndex]);

  if (!step) return null;

  // Calculate spotlight style
  const spotlightStyle = targetRect ? {
    top: targetRect.top - 10,
    left: targetRect.left - 10,
    width: targetRect.width + 20,
    height: targetRect.height + 20,
  } : null;

  // Calculate tooltip position
  const getTooltipStyle = () => {
    if (!targetRect) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
    
    const gap = 20;
    switch (step.position) {
      case 'right':
        return { top: targetRect.top, left: targetRect.right + gap };
      case 'left':
        return { top: targetRect.top, right: window.innerWidth - targetRect.left + gap };
      case 'bottom':
        return { top: targetRect.bottom + gap, left: targetRect.left };
      case 'top':
        return { bottom: window.innerHeight - targetRect.top + gap, left: targetRect.left };
      default:
        return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none">
      {/* Dark Overlay with Hole */}
      <div className="absolute inset-0 bg-black/80 transition-all duration-500" 
           style={spotlightStyle ? {
             clipPath: `polygon(
               0% 0%, 
               0% 100%, 
               ${spotlightStyle.left}px 100%, 
               ${spotlightStyle.left}px ${spotlightStyle.top}px, 
               ${spotlightStyle.left + spotlightStyle.width}px ${spotlightStyle.top}px, 
               ${spotlightStyle.left + spotlightStyle.width}px ${spotlightStyle.top + spotlightStyle.height}px, 
               ${spotlightStyle.left}px ${spotlightStyle.top + spotlightStyle.height}px, 
               ${spotlightStyle.left}px 100%, 
               100% 100%, 
               100% 0%
             )`
           } : {}} 
      />

      {/* Spotlight Border */}
      {spotlightStyle && (
        <div 
          className="absolute border-2 border-[#D71920] shadow-[0_0_20px_rgba(215,25,32,0.5)] animate-pulse transition-all duration-300 rounded-lg"
          style={spotlightStyle}
        />
      )}

      {/* Tutorial Card */}
      <div 
        className="absolute pointer-events-auto max-w-md w-full"
        style={getTooltipStyle() as React.CSSProperties}
      >
        <div className="bg-[#0D0D0D] border border-[#D71920] shadow-2xl overflow-hidden relative group">
          {/* Header */}
          <div className="bg-[#1A1A1A] px-4 py-2 flex items-center justify-between border-b border-white/10">
            <div className="flex items-center gap-2">
                <Target className="text-[#D71920] animate-spin-slow" size={16} />
                <span className="text-xs font-dot uppercase tracking-widest text-white">
                    Mission {currentStepIndex + 1}/{steps.length}
                </span>
            </div>
            <button onClick={onSkip} className="text-white/30 hover:text-white transition-colors">
                <X size={14} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <h3 className="text-lg font-bold text-white mb-2 uppercase tracking-wide font-sans">
                {step.title}
            </h3>
            <p className="text-sm font-mono text-white/70 min-h-[3em] leading-relaxed">
                {typedText}
                <span className="animate-pulse text-[#D71920]">_</span>
            </p>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-white/5 border-t border-white/10 flex justify-between items-center">
            <div className="flex gap-1">
                {steps.map((_, idx) => (
                    <div 
                        key={idx} 
                        className={cn(
                            "w-2 h-2 rounded-full transition-colors",
                            idx === currentStepIndex ? "bg-[#D71920]" : 
                            idx < currentStepIndex ? "bg-white/50" : "bg-white/10"
                        )}
                    />
                ))}
            </div>
            
            {step.action === 'click' ? (
                <button 
                    onClick={onNext}
                    className="flex items-center gap-2 px-4 py-2 bg-[#D71920] hover:bg-[#B01218] text-white text-xs font-bold uppercase tracking-widest transition-colors"
                >
                    Next <ChevronRight size={14} />
                </button>
            ) : (
                <div className="flex items-center gap-2 text-[#D71920] text-xs font-bold uppercase tracking-widest animate-pulse">
                    <CheckCircle2 size={14} />
                    Waiting for action...
                </div>
            )}
          </div>
          
          {/* Corner Decorations */}
          <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-[#D71920]" />
          <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-[#D71920]" />
          <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-[#D71920]" />
          <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-[#D71920]" />
        </div>
      </div>
    </div>
  );
};

export default GuidedTutorial;
