import React, { useEffect, useState } from 'react';
import { ChevronRight, SkipForward, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TutorialStep {
  id: string;
  title: string;
  instruction: string;
  target?: string; // Element ID to point to
  actionDescription: string;
}

interface TutorialOverlayProps {
  currentStep: TutorialStep;
  stepIndex: number;
  totalSteps: number;
  onSkip: () => void;
  onNext?: () => void;
}

const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ 
  currentStep, 
  stepIndex, 
  totalSteps, 
  onSkip,
  onNext
}) => {
  const [position, setPosition] = useState<{ top?: number; left?: number; bottom?: number; right?: number }>({ bottom: 32, left: 50 });
  const [isCentered, setIsCentered] = useState(true);

  useEffect(() => {
    if (currentStep.target) {
      const element = document.getElementById(currentStep.target);
      if (element) {
        const rect = element.getBoundingClientRect();
        // Position to the right of the element
        setPosition({
          top: rect.top,
          left: rect.right + 20
        });
        setIsCentered(false);
        
        // Add highlight class
        element.classList.add('tutorial-highlight');
        return () => {
          element.classList.remove('tutorial-highlight');
        };
      }
    }
    
    // Default centered position
    setPosition({ bottom: 32, left: 50 });
    setIsCentered(true);
  }, [currentStep.target]);

  return (
    <div 
      className={cn(
        "fixed z-[150] w-full max-w-sm animate-in fade-in zoom-in duration-500",
        isCentered ? "left-1/2 -translate-x-1/2" : ""
      )}
      style={isCentered ? { bottom: '32px' } : { top: `${position.top}px`, left: `${position.left}px` }}
    >
      <div className="bg-white text-black rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden font-sans border border-zinc-200">
        {/* Header */}
        <div className="bg-zinc-50 border-b border-zinc-100 px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-zinc-400 text-[10px] font-bold tracking-[0.2em] uppercase">
            <Info size={12} className="text-red-600" />
            Objective {stepIndex + 1}/{totalSteps}
          </div>
          <button 
            onClick={onSkip}
            className="text-[10px] text-zinc-400 hover:text-black flex items-center gap-1 transition-colors uppercase font-bold"
          >
            <SkipForward size={10} /> Skip
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <h3 className="text-black font-bold text-xl leading-tight tracking-tight">
            {currentStep.title}
          </h3>
          <p className="text-zinc-500 text-sm leading-relaxed">
            {currentStep.instruction}
          </p>
          
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2 text-red-600 text-[10px] font-bold uppercase tracking-widest">
              <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse"></span>
              {currentStep.actionDescription}
            </div>
            {onNext && (
                <button 
                    onClick={onNext}
                    className="flex items-center gap-1 bg-black text-white px-4 py-2 rounded-full text-xs font-bold hover:bg-zinc-800 transition-all"
                >
                    Next <ChevronRight size={14} />
                </button>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-1 bg-zinc-100 w-full">
          <div 
            className="h-full bg-red-600 transition-all duration-700" 
            style={{ width: `${((stepIndex + 1) / totalSteps) * 100}%` }}
          />
        </div>
      </div>
      
      {/* Pointer Arrow */}
      {!isCentered && (
          <div className="absolute top-6 -left-2 w-4 h-4 bg-white border-l border-t border-zinc-200 rotate-[-45deg]"></div>
      )}
    </div>
  );
};

export default TutorialOverlay;
