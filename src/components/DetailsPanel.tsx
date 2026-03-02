import React from 'react';
import { Node } from 'reactflow';
import { X, Activity, Cpu, HardDrive, Network, Signal } from 'lucide-react';
import { NodeData } from '@/types';
import { cn } from '@/lib/utils';

interface DetailsPanelProps {
  selectedNode: Node<NodeData> | null;
  onClose: () => void;
  onUpdate: (id: string, data: Partial<NodeData>) => void;
}

const DetailsPanel: React.FC<DetailsPanelProps> = ({ selectedNode, onClose, onUpdate }) => {
  if (!selectedNode) return null;

  const { data } = selectedNode;
  const isWireless = data.type === 'pc' || data.type === 'wap';

  return (
    <div className="absolute right-4 top-16 w-80 glass-panel bg-[#0D0D0D]/90 z-50 font-sans text-white backdrop-blur-xl border-white/10">
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <h3 className="font-dot text-lg tracking-widest uppercase flex items-center gap-2 text-white">
          <Activity size={18} className="text-[#D71920]" />
          Properties
        </h3>
        <button 
          onClick={onClose}
          className="p-1 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Label</label>
          <input
            type="text"
            value={data.label}
            onChange={(e) => onUpdate(selectedNode.id, { label: e.target.value })}
            className="w-full bg-[#1A1A1A] border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-[#D71920] transition-colors placeholder-white/20 font-dot tracking-wide uppercase"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-mono text-white/40 uppercase tracking-widest">IP Address</label>
          <div className="flex items-center bg-[#1A1A1A] border border-white/10 px-3 py-2">
            <Network size={14} className="text-white/40 mr-2" />
            <input
              type="text"
              value={data.ip}
              onChange={(e) => onUpdate(selectedNode.id, { ip: e.target.value })}
              className="w-full bg-transparent border-none p-0 text-sm text-white focus:ring-0 font-mono tracking-wider"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Status</label>
            <select
              value={data.status}
              onChange={(e) => onUpdate(selectedNode.id, { status: e.target.value as any })}
              className="w-full bg-[#1A1A1A] border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-[#D71920] font-dot uppercase tracking-wide appearance-none"
            >
              <option value="online">Online</option>
              <option value="offline">Offline</option>
              <option value="booting">Booting</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Type</label>
            <div className="px-3 py-2 bg-white/5 border border-white/10 text-sm text-white/60 uppercase cursor-not-allowed font-dot tracking-wide">
              {data.type}
            </div>
          </div>
        </div>

        {isWireless && typeof data.signalStrength === 'number' && (
             <div className="pt-6 border-t border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center text-white/60 text-xs font-mono uppercase tracking-wider">
                    <Signal size={14} className="mr-2" /> Signal
                    </div>
                    <div className="font-mono text-sm text-white">{data.signalStrength}%</div>
                </div>
                <div className="w-full bg-white/10 h-[2px] overflow-hidden">
                    <div 
                    className="h-full bg-[#D71920] transition-all duration-500"
                    style={{ width: `${data.signalStrength}%` }}
                    />
                </div>
             </div>
        )}

        <div className="pt-6 border-t border-white/10 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
                <div className="flex items-center text-white/60 text-xs font-mono uppercase tracking-wider">
                <Cpu size={14} className="mr-2" /> CPU Load
                </div>
                <div className="text-white font-mono text-sm">{data.cpu || 0}%</div>
            </div>
            <div className="w-full bg-white/10 h-[2px] overflow-hidden">
                <div 
                className="bg-white h-full transition-all duration-500" 
                style={{ width: `${data.cpu || 0}%` }}
                />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
                <div className="flex items-center text-white/60 text-xs font-mono uppercase tracking-wider">
                <HardDrive size={14} className="mr-2" /> Memory
                </div>
                <div className="text-white font-mono text-sm">{data.ram || 0}%</div>
            </div>
            <div className="w-full bg-white/10 h-[2px] overflow-hidden">
                <div 
                className="bg-white h-full transition-all duration-500" 
                style={{ width: `${data.ram || 0}%` }}
                />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailsPanel;
