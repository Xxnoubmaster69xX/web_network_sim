import React, { memo } from 'react';
import { NodeProps, NodeResizer } from 'reactflow';
import { cn } from '@/lib/utils';
import { NodeData } from '@/types';

const WallNode = ({ data, selected }: NodeProps<NodeData>) => {
  return (
    <>
      <NodeResizer 
        color="#D71920" 
        isVisible={selected} 
        minWidth={10} 
        minHeight={10} 
        lineStyle={{ border: '1px solid #D71920' }}
        handleStyle={{ width: 8, height: 8, borderRadius: 0, border: '1px solid #D71920', background: '#0D0D0D' }}
      />
      <div
        className={cn(
          "h-full w-full bg-[#1A1A1A] transition-all duration-200",
          selected ? "border border-[#D71920]" : "border border-white/20"
        )}
        style={{
            backgroundImage: 'repeating-linear-gradient(45deg, #1A1A1A 25%, transparent 25%, transparent 50%, #1A1A1A 50%, #1A1A1A 75%, transparent 75%, transparent 100%)',
            backgroundSize: '10px 10px',
            backgroundColor: '#0D0D0D'
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 hover:opacity-100 transition-opacity">
            <span className="text-[10px] text-white/50 bg-black/80 px-1 font-mono tracking-widest">WALL</span>
        </div>
      </div>
    </>
  );
};

export default memo(WallNode);
