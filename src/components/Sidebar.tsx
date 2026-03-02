import React from 'react';
import { Server, Router, Network, Monitor, ShieldCheck, Wifi, BrickWall } from 'lucide-react';

const Sidebar = () => {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside className="w-64 bg-[#0D0D0D] border-r border-white/10 flex flex-col h-full font-sans text-white">
      <div className="p-6 border-b border-white/10">
        <h2 className="text-xl font-dot tracking-widest uppercase mb-1">Components</h2>
        <p className="text-[10px] text-white/40 font-mono tracking-widest uppercase">:: Drag to Deploy ::</p>
      </div>
      
      <div className="p-4 space-y-2 overflow-y-auto flex-1">
        {[
          { type: 'server', icon: Server, label: 'Server', sub: 'Compute Node' },
          { type: 'router', icon: Router, label: 'Router', sub: 'L3 Gateway' },
          { type: 'switch', icon: Network, label: 'Switch', sub: 'L2 Device' },
          { type: 'pc', icon: Monitor, label: 'Terminal', sub: 'Workstation' },
          { type: 'wap', icon: Wifi, label: 'WAP', sub: 'Wireless AP' },
          { type: 'firewall', icon: ShieldCheck, label: 'Firewall', sub: 'Sec Appliance' },
          { type: 'wall', icon: BrickWall, label: 'Wall', sub: 'Obstacle' },
        ].map((item) => (
          <div 
            key={item.type}
            id={`sidebar-item-${item.type}`}
            className="flex items-center p-4 bg-[#1A1A1A] border border-transparent rounded-none cursor-grab hover:border-white/20 hover:bg-[#262626] transition-all group"
            onDragStart={(event) => onDragStart(event, item.type)}
            draggable
          >
            <item.icon className="mr-4 text-white/70 group-hover:text-[#D71920] transition-colors" size={20} strokeWidth={1.5} />
            <div>
              <div className="text-sm font-medium tracking-wide uppercase font-dot">{item.label}</div>
              <div className="text-[10px] text-white/30 font-mono uppercase tracking-wider">{item.sub}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-6 border-t border-white/10 text-xs text-white/30 font-mono">
        <div className="font-bold tracking-widest uppercase">HomeLab_Sim v1.0.0</div>
        <div className="mt-2 text-[10px] opacity-50 uppercase tracking-widest">by David Eduardo Lara</div>
      </div>
    </aside>
  );
};

export default Sidebar;
