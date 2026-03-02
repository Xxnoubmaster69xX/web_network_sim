import React, { useState, useRef, useEffect } from 'react';
import { X, Terminal as TerminalIcon, Cpu, Wifi, Gamepad2, Settings, Minus, Maximize2, Image as ImageIcon } from 'lucide-react';
import DoomGame from './DoomGame';
import { DesktopState, WindowState } from '../types';

interface ArchDesktopProps {
  nodeLabel: string;
  initialState?: DesktopState;
  onClose: () => void;
  onSaveState: (state: DesktopState) => void;
}

const WALLPAPERS = [
  { name: 'Default Dark', value: 'bg-[#0D0D0D]' },
  { name: 'Matrix Green', value: 'bg-green-950' },
  { name: 'Cyber Blue', value: 'bg-blue-950' },
  { name: 'Red Alert', value: 'bg-red-950' },
  { name: 'Void Purple', value: 'bg-purple-950' },
];

const ArchDesktop: React.FC<ArchDesktopProps> = ({ nodeLabel, initialState, onClose, onSaveState }) => {
  const [windows, setWindows] = useState<WindowState[]>(initialState?.windows || []);
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null);
  const [nextZIndex, setNextZIndex] = useState(10);
  const [wallpaper, setWallpaper] = useState<string>(initialState?.wallpaper || WALLPAPERS[0].value);
  const [wallpaperImage, setWallpaperImage] = useState<string | null>(initialState?.wallpaperImage || null);
  const desktopRef = useRef<HTMLDivElement>(null);

  const DESKTOP_ICONS = [
    { id: 'terminal', icon: TerminalIcon, label: 'Terminal' },
    { id: 'htop', icon: Cpu, label: 'System Monitor' },
    { id: 'network', icon: Wifi, label: 'Network' },
    { id: 'doom', icon: Gamepad2, label: 'DOOM' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  // Icon Dragging Logic
  const [iconPositions, setIconPositions] = useState<{ [key: string]: { x: number, y: number } }>(() => {
      if (initialState?.iconPositions) return initialState.iconPositions;
      const positions: any = {};
      DESKTOP_ICONS.forEach((icon, index) => {
          positions[icon.id] = { x: 16, y: 16 + (index * 110) };
      });
      return positions;
  });
  const [draggedIconId, setDraggedIconId] = useState<string | null>(null);
  const [iconDragOffset, setIconDragOffset] = useState({ x: 0, y: 0 });

  // Save state whenever relevant state changes
  const onSaveStateRef = useRef(onSaveState);
  
  useEffect(() => {
    onSaveStateRef.current = onSaveState;
  }, [onSaveState]);

  useEffect(() => {
    onSaveStateRef.current({
      windows,
      wallpaper,
      wallpaperImage,
      iconPositions
    });
  }, [windows, wallpaper, wallpaperImage, iconPositions]);

  // App Definitions
  const openApp = (appId: string) => {
    // Check if app is already open
    const existingWindow = windows.find(w => w.appId === appId);
    if (existingWindow) {
      focusWindow(existingWindow.id);
      if (existingWindow.isMinimized) {
        toggleMinimize(existingWindow.id);
      }
      return;
    }

    const newWindow: WindowState = {
      id: Date.now().toString(),
      appId,
      title: getAppTitle(appId),
      x: 50 + (windows.length * 20),
      y: 50 + (windows.length * 20),
      width: appId === 'doom' ? 660 : 600,
      height: appId === 'doom' ? 440 : 400,
      zIndex: nextZIndex,
      isMinimized: false,
      isMaximized: false,
    };

    setWindows([...windows, newWindow]);
    setActiveWindowId(newWindow.id);
    setNextZIndex(prev => prev + 1);
  };

  const handleWallpaperUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setWallpaperImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const closeWindow = (id: string) => {
    setWindows(windows.filter(w => w.id !== id));
    if (activeWindowId === id) {
      setActiveWindowId(null);
    }
  };

  const focusWindow = (id: string) => {
    setActiveWindowId(id);
    setWindows(windows.map(w => 
      w.id === id ? { ...w, zIndex: nextZIndex } : w
    ));
    setNextZIndex(prev => prev + 1);
  };

  const toggleMinimize = (id: string) => {
    setWindows(windows.map(w => 
      w.id === id ? { ...w, isMinimized: !w.isMinimized } : w
    ));
  };

  const toggleMaximize = (id: string) => {
    setWindows(windows.map(w => 
      w.id === id ? { ...w, isMaximized: !w.isMaximized } : w
    ));
  };

  const getAppTitle = (appId: string) => {
    switch (appId) {
      case 'terminal': return 'Terminal';
      case 'htop': return 'System Monitor';
      case 'doom': return 'DOOM.EXE';
      case 'settings': return 'Settings';
      case 'network': return 'Network Manager';
      default: return 'Application';
    }
  };

  // Dragging Logic
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [dragWindowId, setDragWindowId] = useState<string | null>(null);

  const handleMouseDown = (e: React.MouseEvent, windowId: string) => {
    if ((e.target as HTMLElement).closest('.window-controls')) return;
    
    const win = windows.find(w => w.id === windowId);
    if (!win || win.isMaximized) return;

    setIsDragging(true);
    setDragWindowId(windowId);
    focusWindow(windowId);
    
    // Calculate offset relative to the window's top-left corner
    // We need to account for the parent container's position if it's not the viewport
    // But since we are using fixed positioning for the desktop overlay, clientX/Y works well relative to the window rect
    // However, the window's x/y state is relative to the desktop container.
    // Let's keep it simple:
    setDragOffset({
      x: e.clientX - win.x,
      y: e.clientY - win.y
    });
  };

  const handleIconMouseDown = (e: React.MouseEvent, iconId: string) => {
      e.stopPropagation();
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      setIconDragOffset({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
      });
      setDraggedIconId(iconId);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && dragWindowId) {
      setWindows(windows.map(w => {
        if (w.id === dragWindowId) {
          return {
            ...w,
            x: e.clientX - dragOffset.x,
            y: e.clientY - dragOffset.y
          };
        }
        return w;
      }));
    }

    if (draggedIconId && desktopRef.current) {
        const desktopRect = desktopRef.current.getBoundingClientRect();
        // Adjust for top bar height (32px)
        const x = e.clientX - desktopRect.left - iconDragOffset.x;
        const y = e.clientY - desktopRect.top - 32 - iconDragOffset.y;
        
        setIconPositions(prev => ({
            ...prev,
            [draggedIconId]: { x, y }
        }));
    }
  };

  const handleMouseUp = () => {
    if (isDragging) {
        setIsDragging(false);
        setDragWindowId(null);
    }

    if (draggedIconId) {
        const currentPos = iconPositions[draggedIconId];
        const GRID_X = 100;
        const GRID_Y = 110;
        const MARGIN = 16;
        
        const snappedX = Math.max(MARGIN, Math.round((currentPos.x - MARGIN) / GRID_X) * GRID_X + MARGIN);
        const snappedY = Math.max(MARGIN, Math.round((currentPos.y - MARGIN) / GRID_Y) * GRID_Y + MARGIN);
        
        setIconPositions(prev => ({
            ...prev,
            [draggedIconId]: { x: snappedX, y: snappedY }
        }));
        setDraggedIconId(null);
    }
  };

  // Render App Content
  const renderAppContent = (appId: string) => {
    switch (appId) {
      case 'terminal':
        return (
          <div className="h-full bg-[#0D0D0D] p-4 font-mono text-sm text-white overflow-auto">
            <div className="mb-4">
              <span className="text-[#D71920]">user@{nodeLabel.toLowerCase().replace(/\s+/g, '-')}</span>:<span className="text-white">~</span>$ neofetch
            </div>
            <div className="flex gap-6 flex-wrap">
              <div className="text-[#D71920] font-bold text-xs sm:text-sm whitespace-pre leading-tight">
                {`
                   ...
                  .....
                 .......
                .........
               ...........
              .............
             ...............
            .................
           ...................
          .....................
         .......................
        .........................
                `}
              </div>
              <div className="text-white/70 space-y-1 text-xs">
                <div><span className="text-[#D71920]">OS</span>: {nodeLabel} OS 2.5</div>
                <div><span className="text-[#D71920]">Host</span>: {nodeLabel}</div>
                <div><span className="text-[#D71920]">Kernel</span>: 6.8.9-custom</div>
                <div><span className="text-[#D71920]">Uptime</span>: 42 mins</div>
                <div><span className="text-[#D71920]">Packages</span>: 1337 (apt)</div>
                <div><span className="text-[#D71920]">Shell</span>: zsh 5.9</div>
                <div><span className="text-[#D71920]">WM</span>: nothing-wm</div>
                <div><span className="text-[#D71920]">Terminal</span>: term-x</div>
                <div><span className="text-[#D71920]">CPU</span>: Snapdragon 8 Gen 2</div>
                <div><span className="text-[#D71920]">Memory</span>: 8GiB / 12GiB</div>
              </div>
            </div>
            <div className="mt-4">
              <span className="text-[#D71920]">user@{nodeLabel.toLowerCase().replace(/\s+/g, '-')}</span>:<span className="text-white">~</span>$ <span className="animate-pulse bg-[#D71920] text-black px-1">_</span>
            </div>
          </div>
        );
      case 'doom':
        return <DoomGame onClose={() => closeWindow(windows.find(w => w.appId === 'doom')?.id || '')} />;
      case 'htop':
        return (
            <div className="h-full bg-[#0D0D0D] p-4 font-mono text-xs text-white overflow-hidden select-none">
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="space-y-1">
                        <div>1  [<span className="text-[#D71920]">|||||||||||||||||||||||||</span> 85.0%]</div>
                        <div>2  [<span className="text-[#D71920]">|||||||||||||||</span>           45.0%]</div>
                        <div>3  [<span className="text-[#D71920]">||||||||||||||||||||</span>      60.0%]</div>
                        <div>4  [<span className="text-[#D71920]">||||||||</span>                  20.0%]</div>
                    </div>
                    <div className="space-y-1">
                        <div>Mem[<span className="text-[#D71920]">|||||||||||||||||||||||||</span> 12G/32G]</div>
                        <div>Swp[<span className="text-[#D71920]">|</span>                          0K/0K]</div>
                    </div>
                </div>
                <table className="w-full text-left border-collapse">
                    <thead className="bg-[#1A1A1A] text-white/50 border-b border-white/10">
                        <tr><th className="p-1">PID</th><th>USER</th><th>PRI</th><th>NI</th><th>VIRT</th><th>RES</th><th>SHR</th><th>S</th><th>CPU%</th><th>MEM%</th><th>TIME+</th><th>COMMAND</th></tr>
                    </thead>
                    <tbody className="text-white/80">
                        <tr><td className="p-1">1337</td><td>root</td><td>20</td><td>0</td><td>100M</td><td>20M</td><td>5M</td><td>S</td><td>0.0</td><td>0.1</td><td>0:00.05</td><td>/usr/bin/init</td></tr>
                        <tr><td className="p-1">1338</td><td>user</td><td>20</td><td>0</td><td>200M</td><td>50M</td><td>20M</td><td>S</td><td>5.0</td><td>0.5</td><td>0:10.22</td><td>nothing-wm</td></tr>
                        <tr><td className="p-1">1339</td><td>user</td><td>20</td><td>0</td><td>400M</td><td>100M</td><td>40M</td><td>S</td><td>12.0</td><td>1.2</td><td>0:45.30</td><td>browser</td></tr>
                        <tr className="bg-[#D71920]/20 text-white"><td className="p-1">1340</td><td>user</td><td>20</td><td>0</td><td>50M</td><td>10M</td><td>5M</td><td>R</td><td>85.0</td><td>0.2</td><td>0:05.10</td><td>htop</td></tr>
                    </tbody>
                </table>
            </div>
        );
      case 'settings':
        return (
          <div className="h-full bg-[#0D0D0D] p-6 text-white overflow-auto">
            <h2 className="text-xl font-dot uppercase tracking-widest mb-6 border-b border-white/10 pb-2">Settings</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-mono text-white/50 uppercase mb-3">Wallpaper</h3>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {WALLPAPERS.map((wp) => (
                    <button
                      key={wp.value}
                      onClick={() => { setWallpaper(wp.value); setWallpaperImage(null); }}
                      className={`
                        h-20 rounded-md border transition-all relative overflow-hidden group
                        ${wallpaper === wp.value && !wallpaperImage ? 'border-[#D71920]' : 'border-white/10 hover:border-white/30'}
                        ${wp.value}
                      `}
                    >
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/50 transition-opacity">
                        <span className="text-xs font-mono uppercase">{wp.name}</span>
                      </div>
                      {wallpaper === wp.value && !wallpaperImage && (
                        <div className="absolute top-1 right-1 w-2 h-2 bg-[#D71920] rounded-full" />
                      )}
                    </button>
                  ))}
                </div>
                
                <div className="relative">
                    <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleWallpaperUpload}
                        className="hidden" 
                        id="wallpaper-upload"
                    />
                    <label 
                        htmlFor="wallpaper-upload"
                        className={`
                            flex items-center justify-center gap-2 w-full p-3 rounded border border-dashed cursor-pointer transition-all
                            ${wallpaperImage ? 'border-[#D71920] bg-[#D71920]/10 text-white' : 'border-white/20 hover:border-white/40 text-white/60 hover:text-white'}
                        `}
                    >
                        <ImageIcon size={16} />
                        <span className="text-xs font-mono uppercase tracking-widest">
                            {wallpaperImage ? 'Change Custom Image' : 'Upload Image'}
                        </span>
                    </label>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-mono text-white/50 uppercase mb-3">System Info</h3>
                <div className="bg-[#1A1A1A] p-3 rounded border border-white/10 font-mono text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-white/50">Hostname</span>
                    <span>{nodeLabel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/50">OS Version</span>
                    <span>2.5.0 (Build 2405)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/50">Resolution</span>
                    <span>1920x1080 @ 60Hz</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-center h-full text-white/20">
            <p className="font-mono uppercase tracking-widest text-xs">App not found</p>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div 
        ref={desktopRef}
        className="w-[95vw] h-[90vh] bg-[#0D0D0D] border border-white/10 flex flex-col overflow-hidden shadow-2xl relative"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Top Bar */}
        <div className="h-8 bg-[#1A1A1A] border-b border-white/10 flex items-center justify-between px-4 z-50">
          <div className="flex items-center gap-6 text-[10px] font-mono text-white/40 uppercase tracking-widest">
            <span className="font-bold text-white">{nodeLabel} OS</span>
            <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <div className="flex items-center gap-6 text-[10px] font-mono text-white/40 uppercase tracking-widest">
            <span className="text-white flex items-center gap-2"><div className="w-1.5 h-1.5 bg-[#D71920] rounded-full animate-pulse"/> ONLINE</span>
            <button onClick={onClose} className="hover:text-white transition-colors"><X size={14} /></button>
          </div>
        </div>

        {/* Desktop Area */}
        <div 
            className={`flex-1 relative overflow-hidden ${!wallpaperImage ? wallpaper : ''} transition-colors duration-500`}
            style={wallpaperImage ? { backgroundImage: `url(${wallpaperImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
        >
            {/* Background Pattern */}
            {!wallpaperImage && (
                <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[radial-gradient(circle_at_center,_white_1px,_transparent_1px)] bg-[length:20px_20px]" />
            )}

            {/* Desktop Icons */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                {DESKTOP_ICONS.map((icon) => (
                    <button
                        key={icon.id}
                        onMouseDown={(e) => handleIconMouseDown(e, icon.id)}
                        onDoubleClick={() => openApp(icon.id)}
                        className={`
                            absolute flex flex-col items-center gap-1 p-2 rounded hover:bg-white/10 transition-colors group w-20 pointer-events-auto
                            ${draggedIconId === icon.id ? 'opacity-50 cursor-grabbing' : 'cursor-pointer'}
                        `}
                        style={{
                            left: iconPositions[icon.id]?.x ?? 16,
                            top: iconPositions[icon.id]?.y ?? 16,
                        }}
                    >
                        <div className="w-12 h-12 flex items-center justify-center bg-[#1A1A1A]/80 rounded-lg border border-white/10 group-hover:border-[#D71920] transition-colors shadow-lg backdrop-blur-sm select-none">
                            <icon.icon size={24} className="text-white/80 group-hover:text-white" />
                        </div>
                        <span className="text-[10px] font-mono text-white/80 text-center bg-black/50 px-1 rounded backdrop-blur-sm group-hover:text-white truncate w-full select-none">
                            {icon.label}
                        </span>
                    </button>
                ))}
            </div>

            {/* Windows */}
            {windows.map((win) => (
              <div
                key={win.id}
                className={`
                  absolute flex flex-col bg-[#0D0D0D] border shadow-2xl transition-shadow
                  ${activeWindowId === win.id ? 'border-white/20 shadow-black/50' : 'border-white/5 shadow-none opacity-90'}
                  ${win.isMinimized ? 'hidden' : ''}
                `}
                style={{
                  left: win.isMaximized ? 0 : win.x,
                  top: win.isMaximized ? 0 : win.y,
                  width: win.isMaximized ? '100%' : win.width,
                  height: win.isMaximized ? '100%' : win.height,
                  zIndex: win.zIndex,
                }}
                onMouseDown={() => focusWindow(win.id)}
              >
                {/* Window Title Bar */}
                <div 
                  className={`
                    h-8 flex items-center justify-between px-3 select-none cursor-default
                    ${activeWindowId === win.id ? 'bg-[#1A1A1A]' : 'bg-[#111]'}
                  `}
                  onMouseDown={(e) => handleMouseDown(e, win.id)}
                >
                  <span className="text-[10px] text-white/60 font-mono uppercase tracking-widest flex items-center gap-2">
                    {win.title}
                  </span>
                  <div className="flex items-center gap-2 window-controls">
                    <button onClick={(e) => { e.stopPropagation(); toggleMinimize(win.id); }} className="text-white/40 hover:text-white transition-colors"><Minus size={12} /></button>
                    <button onClick={(e) => { e.stopPropagation(); toggleMaximize(win.id); }} className="text-white/40 hover:text-white transition-colors"><Maximize2 size={12} /></button>
                    <button onClick={(e) => { e.stopPropagation(); closeWindow(win.id); }} className="text-white/40 hover:text-[#D71920] transition-colors"><X size={12} /></button>
                  </div>
                </div>

                {/* Window Content */}
                <div className="flex-1 overflow-hidden relative">
                  {renderAppContent(win.appId)}
                </div>
              </div>
            ))}
        </div>

        {/* Taskbar / Dock */}
        <div className="h-16 bg-[#1A1A1A] border-t border-white/10 flex items-center justify-between px-4 z-50">
            {/* Start / Launcher */}
            <div className="flex items-center gap-4">
               <button 
                  onClick={() => openApp('settings')}
                  className="p-2 rounded hover:bg-white/5 transition-colors group relative"
                  title="Settings"
                >
                  <Settings size={20} className="text-white/60 group-hover:text-white" />
               </button>
            </div>

            {/* Dock Icons */}
            <div className="flex items-center gap-2">
                {[
                  { id: 'terminal', icon: TerminalIcon, label: 'Terminal' },
                  { id: 'htop', icon: Cpu, label: 'System Monitor' },
                  { id: 'network', icon: Wifi, label: 'Network' },
                  { id: 'doom', icon: Gamepad2, label: 'DOOM' },
                ].map((app) => (
                  <button 
                      key={app.id}
                      onClick={() => openApp(app.id)}
                      className={`
                        p-3 rounded-lg transition-all group relative
                        ${windows.some(w => w.appId === app.id && !w.isMinimized) ? 'bg-white/10' : 'hover:bg-white/5'}
                      `}
                      title={app.label}
                  >
                      <app.icon size={20} className="text-white/80 group-hover:text-white" />
                      {windows.some(w => w.appId === app.id) && (
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#D71920] rounded-full" />
                      )}
                  </button>
                ))}
            </div>

            {/* System Tray */}
            <div className="flex items-center gap-4 text-white/40">
                <Wifi size={16} />
                <div className="text-[10px] font-mono">100%</div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ArchDesktop;
