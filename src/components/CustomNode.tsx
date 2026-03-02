import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Server, Router, Network, Monitor, ShieldCheck, Wifi, Signal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NodeData } from '@/types';

const iconMap = {
  server: Server,
  router: Router,
  switch: Network,
  pc: Monitor,
  firewall: ShieldCheck,
  wap: Wifi,
  wall: ShieldCheck,
};

const CustomNode = ({ data, selected }: NodeProps<NodeData>) => {
  const Icon = iconMap[data.type as keyof typeof iconMap] || Server;

  return (
    <div
      className={cn(
        "px-4 py-3 min-w-[180px] bg-[#1A1A1A] border transition-all duration-200 relative group",
        selected ? "border-[#D71920]" : "border-white/10 hover:border-white/30",
        data.status === 'offline' && "opacity-50 grayscale"
      )}
    >
      <div className="flex items-center gap-3">
        <div className={cn(
          "p-2 border border-transparent rounded-sm transition-colors",
          selected ? "text-[#D71920]" : "text-white/80"
        )}>
          <Icon size={20} strokeWidth={1.5} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="text-xs font-dot tracking-widest uppercase text-white truncate">{data.label}</div>
          <div className="text-[10px] font-mono text-white/40 tracking-wider truncate">{data.ip || 'NO_IP'}</div>
        </div>
        
        {/* Signal Strength Indicator for PCs */}
        {data.type === 'pc' && typeof data.signalStrength === 'number' && (
            <div className="flex flex-col items-end gap-1" title={`Signal: ${data.signalStrength}%`}>
                <div className="flex gap-[2px] items-end h-3">
                    <div className={cn("w-[2px] bg-current", data.signalStrength > 20 ? "h-1 text-white" : "h-1 text-white/20")} />
                    <div className={cn("w-[2px] bg-current", data.signalStrength > 40 ? "h-2 text-white" : "h-2 text-white/20")} />
                    <div className={cn("w-[2px] bg-current", data.signalStrength > 60 ? "h-3 text-white" : "h-3 text-white/20")} />
                    <div className={cn("w-[2px] bg-current", data.signalStrength > 80 ? "h-full text-white" : "h-full text-white/20")} />
                </div>
            </div>
        )}
      </div>

      {/* Status Dot */}
      <div className={cn(
          "absolute top-2 right-2 w-1.5 h-1.5 rounded-full",
          data.status === 'online' ? "bg-white" : 
          data.status === 'booting' ? "bg-white/50 animate-pulse" :
          "bg-[#D71920]"
      )} />

      <Handle
        type="target"
        position={Position.Top}
        className="!w-2 !h-2 !bg-[#1A1A1A] !border !border-white/50 !rounded-none"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-2 !h-2 !bg-[#1A1A1A] !border !border-white/50 !rounded-none"
      />
      
      {/* Corner Accents */}
      <div className={cn("absolute top-0 left-0 w-1 h-1 border-t border-l transition-colors", selected ? "border-[#D71920]" : "border-white/20")} />
      <div className={cn("absolute top-0 right-0 w-1 h-1 border-t border-r transition-colors", selected ? "border-[#D71920]" : "border-white/20")} />
      <div className={cn("absolute bottom-0 left-0 w-1 h-1 border-b border-l transition-colors", selected ? "border-[#D71920]" : "border-white/20")} />
      <div className={cn("absolute bottom-0 right-0 w-1 h-1 border-b border-r transition-colors", selected ? "border-[#D71920]" : "border-white/20")} />
    </div>
  );
};

export default memo(CustomNode);
