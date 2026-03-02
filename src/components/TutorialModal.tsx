import React from 'react';
import { X, MousePointer2, Terminal, Network, Gamepad2 } from 'lucide-react';

const TutorialModal = ({ onClose }: { onClose: () => void }) => {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
      <div className="w-full max-w-2xl bg-[#0D0D0D] border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-[#1A1A1A]">
          <h2 className="text-xl font-dot tracking-widest text-white uppercase">Manual_v1.0</h2>
          <button onClick={onClose} className="text-white/50 hover:text-[#D71920] transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <div className="p-8 overflow-y-auto space-y-10 font-sans text-white/80">
          <section>
            <h3 className="text-lg font-dot text-white mb-4 flex items-center gap-3 uppercase tracking-wider">
              <MousePointer2 className="text-[#D71920]" size={20} /> 1. Basics
            </h3>
            <ul className="list-disc pl-6 space-y-3 text-sm font-mono text-white/60">
              <li><strong className="text-white">Drag & Drop</strong> components from the left sidebar to the canvas.</li>
              <li><strong className="text-white">Connect</strong> devices by dragging from one handle (dot) to another.</li>
              <li><strong className="text-white">Select</strong> a device to view and edit its properties in the right panel.</li>
              <li><strong className="text-white">Delete</strong> a device or connection by selecting it and pressing Backspace.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-dot text-white mb-4 flex items-center gap-3 uppercase tracking-wider">
              <Network className="text-[#D71920]" size={20} /> 2. Connections
            </h3>
            <p className="text-sm mb-3 font-mono text-white/60">Use the connection selector in the top toolbar to switch cable types:</p>
            <ul className="list-disc pl-6 space-y-3 text-sm font-mono text-white/60">
              <li><span className="text-white">Ethernet</span>: Standard wired connection. Reliable.</li>
              <li><span className="text-white">WiFi 5GHz</span>: Fast wireless, shorter range.</li>
              <li><span className="text-white">WiFi 2.4GHz</span>: Slower wireless, longer range.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-dot text-white mb-4 flex items-center gap-3 uppercase tracking-wider">
              <Terminal className="text-[#D71920]" size={20} /> 3. Terminal
            </h3>
            <p className="text-sm mb-3 font-mono text-white/60">Use the built-in terminal at the bottom to manage your lab:</p>
            <div className="bg-[#1A1A1A] p-4 border border-white/5 text-xs font-mono text-white/70">
              <div className="text-white/30 mb-2"># Example commands</div>
              <div className="mb-1"><span className="text-[#D71920]">ping</span> 192.168.1.1</div>
              <div className="mb-1"><span className="text-[#D71920]">ls</span></div>
              <div><span className="text-[#D71920]">connect</span> 192.168.1.10 192.168.1.1</div>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-dot text-white mb-4 flex items-center gap-3 uppercase tracking-wider">
              <Gamepad2 className="text-[#D71920]" size={20} /> 4. Interaction
            </h3>
            <ul className="list-disc pl-6 space-y-3 text-sm font-mono text-white/60">
              <li><strong className="text-white">Hover</strong> over any cable or device to see details.</li>
              <li><strong className="text-white">Double Click</strong> a PC to open the <span className="text-white underline decoration-[#D71920] underline-offset-4">Nothing OS Desktop</span>.</li>
              <li>Find the <span className="text-[#D71920]">Easter Egg</span> game in the PC's dock!</li>
            </ul>
          </section>
        </div>

        <div className="p-6 border-t border-white/10 bg-[#1A1A1A] flex justify-end">
          <button 
            onClick={onClose}
            className="px-8 py-3 bg-[#D71920] hover:bg-[#B01218] text-white font-dot uppercase tracking-widest transition-colors text-sm"
          >
            Close Manual
          </button>
        </div>
      </div>
    </div>
  );
};

export default TutorialModal;
