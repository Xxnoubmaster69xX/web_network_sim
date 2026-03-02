import React, { useState, useCallback, useRef, useEffect } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  Connection,
  Edge,
  Node,
  Panel,
  BackgroundVariant,
  useReactFlow,
  OnNodesDelete,
  OnEdgesDelete,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { v4 as uuidv4 } from 'uuid';
import { Terminal as TerminalIcon, Maximize2, Minimize2, Layout, Wifi, HelpCircle, Cable, Undo2, Redo2, Save, Download, Upload, Trash2 } from 'lucide-react';

import Sidebar from './components/Sidebar';
import CustomNode from './components/CustomNode';
import WallNode from './components/WallNode';
import Terminal from './components/Terminal';
import DetailsPanel from './components/DetailsPanel';
import ArchDesktop from './components/ArchDesktop';
import GuidedTutorial, { TutorialStep } from './components/GuidedTutorial';
import Tooltip from './components/Tooltip';
import { INITIAL_NODES, NodeData, NodeType, ConnectionType, DesktopState } from './types';

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'intro',
    title: 'Welcome, Admin',
    description: 'Welcome to your personal Network Lab. Your mission is to build a functional home network from scratch. Ready to begin?',
    position: 'center',
    action: 'click',
  },
  {
    id: 'drag-router',
    title: 'Deploy Gateway',
    description: 'Every network needs a gateway. Drag the ROUTER component from the sidebar into the workspace.',
    targetId: 'sidebar-item-router',
    position: 'right',
    action: 'drag',
  },
  {
    id: 'drag-pc',
    title: 'Deploy Workstation',
    description: 'Now we need a client device. Drag the TERMINAL (PC) component into the workspace.',
    targetId: 'sidebar-item-pc',
    position: 'right',
    action: 'drag',
  },
  {
    id: 'connect',
    title: 'Establish Connection',
    description: 'Connect the Router to the PC. Hover over a node handle (dot) and drag the line to the other node.',
    position: 'center',
    action: 'connect',
  },
  {
    id: 'open-desktop',
    title: 'Access System',
    description: 'The network is live. Double-click the PC node to boot into its operating system.',
    position: 'center',
    action: 'open', // Changed from 'click' to force interaction
  },
  {
    id: 'finish',
    title: 'Mission Accomplished',
    description: 'System access granted. You can now use the terminal, customize the desktop, or play Doom. Good luck.',
    position: 'center',
    action: 'click',
  }
];
import { cn } from './lib/utils';

const nodeTypes = {
  custom: CustomNode,
  wall: WallNode,
};

// Layout Presets
const LAYOUTS = [
  {
    name: 'Basic Home',
    nodes: [
      { id: '1', type: 'custom', position: { x: 400, y: 100 }, data: { label: 'ISP Modem', type: 'router', ip: '192.168.0.1', status: 'online' } },
      { id: '2', type: 'custom', position: { x: 400, y: 250 }, data: { label: 'WiFi Router', type: 'wap', ip: '192.168.1.1', status: 'online' } },
      { id: '3', type: 'custom', position: { x: 250, y: 400 }, data: { label: 'Gaming PC', type: 'pc', ip: '192.168.1.10', status: 'online', cpu: 45, ram: 60 } },
      { id: '4', type: 'custom', position: { x: 550, y: 400 }, data: { label: 'Laptop', type: 'pc', ip: '192.168.1.11', status: 'online', cpu: 12, ram: 30 } },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#00ff00' }, data: { type: 'ethernet' } },
      { id: 'e2-3', source: '2', target: '3', animated: true, style: { stroke: '#00ff00' }, data: { type: 'ethernet' } },
      { id: 'e2-4', source: '2', target: '4', animated: true, style: { stroke: '#a855f7', strokeDasharray: '5,5' }, data: { type: 'wifi5' } },
    ]
  },
  {
    name: 'Small Office',
    nodes: [
      { id: '1', type: 'custom', position: { x: 400, y: 50 }, data: { label: 'Gateway', type: 'router', ip: '10.0.0.1', status: 'online' } },
      { id: '2', type: 'custom', position: { x: 400, y: 150 }, data: { label: 'Core Switch', type: 'switch', ip: '10.0.0.2', status: 'online' } },
      { id: '3', type: 'custom', position: { x: 200, y: 300 }, data: { label: 'Admin PC', type: 'pc', ip: '10.0.0.10', status: 'online' } },
      { id: '4', type: 'custom', position: { x: 400, y: 300 }, data: { label: 'File Server', type: 'server', ip: '10.0.0.5', status: 'online' } },
      { id: '5', type: 'custom', position: { x: 600, y: 300 }, data: { label: 'Workstation 1', type: 'pc', ip: '10.0.0.11', status: 'online' } },
      { id: '6', type: 'custom', position: { x: 600, y: 400 }, data: { label: 'Workstation 2', type: 'pc', ip: '10.0.0.12', status: 'online' } },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#00ff00' }, data: { type: 'ethernet' } },
      { id: 'e2-3', source: '2', target: '3', animated: true, style: { stroke: '#00ff00' }, data: { type: 'ethernet' } },
      { id: 'e2-4', source: '2', target: '4', animated: true, style: { stroke: '#00ff00' }, data: { type: 'ethernet' } },
      { id: 'e2-5', source: '2', target: '5', animated: true, style: { stroke: '#00ff00' }, data: { type: 'ethernet' } },
      { id: 'e2-6', source: '2', target: '6', animated: true, style: { stroke: '#00ff00' }, data: { type: 'ethernet' } },
    ]
  },
  {
    name: 'DMZ Setup',
    nodes: [
      { id: '1', type: 'custom', position: { x: 400, y: 50 }, data: { label: 'Internet', type: 'router', ip: '8.8.8.8', status: 'online' } },
      { id: '2', type: 'custom', position: { x: 400, y: 150 }, data: { label: 'Firewall', type: 'firewall', ip: '192.168.1.1', status: 'online' } },
      { id: '3', type: 'custom', position: { x: 200, y: 250 }, data: { label: 'Web Server (DMZ)', type: 'server', ip: '192.168.2.10', status: 'online' } },
      { id: '4', type: 'custom', position: { x: 600, y: 250 }, data: { label: 'Internal Router', type: 'router', ip: '192.168.1.2', status: 'online' } },
      { id: '5', type: 'custom', position: { x: 600, y: 400 }, data: { label: 'Internal PC', type: 'pc', ip: '192.168.1.100', status: 'online' } },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#00ff00' }, data: { type: 'ethernet' } },
      { id: 'e2-3', source: '2', target: '3', animated: true, style: { stroke: '#ff0000' }, data: { type: 'ethernet' } }, // DMZ link
      { id: 'e2-4', source: '2', target: '4', animated: true, style: { stroke: '#00ff00' }, data: { type: 'ethernet' } },
      { id: 'e4-5', source: '4', target: '5', animated: true, style: { stroke: '#00ff00' }, data: { type: 'ethernet' } },
    ]
  },
  {
    name: 'Mesh Network',
    nodes: [
      { id: '1', type: 'custom', position: { x: 400, y: 100 }, data: { label: 'Main Node', type: 'wap', ip: '192.168.1.1', status: 'online' } },
      { id: '2', type: 'custom', position: { x: 200, y: 300 }, data: { label: 'Satellite 1', type: 'wap', ip: '192.168.1.2', status: 'online' } },
      { id: '3', type: 'custom', position: { x: 600, y: 300 }, data: { label: 'Satellite 2', type: 'wap', ip: '192.168.1.3', status: 'online' } },
      { id: '4', type: 'custom', position: { x: 400, y: 500 }, data: { label: 'Roaming PC', type: 'pc', ip: '192.168.1.10', status: 'online' } },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#a855f7', strokeDasharray: '5,5' }, data: { type: 'wifi5' } },
      { id: 'e1-3', source: '1', target: '3', animated: true, style: { stroke: '#a855f7', strokeDasharray: '5,5' }, data: { type: 'wifi5' } },
      { id: 'e2-3', source: '2', target: '3', animated: true, style: { stroke: '#a855f7', strokeDasharray: '5,5' }, data: { type: 'wifi5' } },
      { id: 'e3-4', source: '3', target: '4', animated: true, style: { stroke: '#a855f7', strokeDasharray: '5,5' }, data: { type: 'wifi5' } },
    ]
  },
  {
    name: 'Cyber Cafe',
    nodes: [
      { id: '1', type: 'custom', position: { x: 400, y: 50 }, data: { label: 'Gateway', type: 'router', ip: '10.10.0.1', status: 'online' } },
      { id: '2', type: 'custom', position: { x: 400, y: 150 }, data: { label: 'Big Switch', type: 'switch', ip: '10.10.0.2', status: 'online' } },
      { id: '3', type: 'custom', position: { x: 100, y: 300 }, data: { label: 'PC-01', type: 'pc', ip: '10.10.0.11', status: 'online' } },
      { id: '4', type: 'custom', position: { x: 250, y: 300 }, data: { label: 'PC-02', type: 'pc', ip: '10.10.0.12', status: 'online' } },
      { id: '5', type: 'custom', position: { x: 400, y: 300 }, data: { label: 'PC-03', type: 'pc', ip: '10.10.0.13', status: 'online' } },
      { id: '6', type: 'custom', position: { x: 550, y: 300 }, data: { label: 'PC-04', type: 'pc', ip: '10.10.0.14', status: 'online' } },
      { id: '7', type: 'custom', position: { x: 700, y: 300 }, data: { label: 'PC-05', type: 'pc', ip: '10.10.0.15', status: 'online' } },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#00ff00' }, data: { type: 'ethernet' } },
      { id: 'e2-3', source: '2', target: '3', animated: true, style: { stroke: '#00ff00' }, data: { type: 'ethernet' } },
      { id: 'e2-4', source: '2', target: '4', animated: true, style: { stroke: '#00ff00' }, data: { type: 'ethernet' } },
      { id: 'e2-5', source: '2', target: '5', animated: true, style: { stroke: '#00ff00' }, data: { type: 'ethernet' } },
      { id: 'e2-6', source: '2', target: '6', animated: true, style: { stroke: '#00ff00' }, data: { type: 'ethernet' } },
      { id: 'e2-7', source: '2', target: '7', animated: true, style: { stroke: '#00ff00' }, data: { type: 'ethernet' } },
    ]
  },
  {
    name: 'Walled Garden',
    nodes: [
      { id: '1', type: 'custom', position: { x: 100, y: 250 }, data: { label: 'WAP Outside', type: 'wap', ip: '192.168.1.1', status: 'online' } },
      { id: '2', type: 'wall', position: { x: 300, y: 100 }, style: { width: 20, height: 400 }, data: { label: 'Thick Wall', type: 'wall', status: 'online' } },
      { id: '3', type: 'custom', position: { x: 500, y: 250 }, data: { label: 'PC Inside', type: 'pc', ip: '192.168.1.10', status: 'online' } },
    ],
    edges: [
      { id: 'e1-3', source: '1', target: '3', animated: true, style: { stroke: '#a855f7', strokeDasharray: '5,5' }, data: { type: 'wifi5' } },
    ]
  }
];

interface HistoryState {
  nodes: Node[];
  edges: Edge[];
}

const AppContent = () => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(INITIAL_NODES);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<Node<NodeData> | null>(null);
  const [terminalOpen, setTerminalOpen] = useState(true);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const { fitView } = useReactFlow();
  
  // New States
  const [connectionType, setConnectionType] = useState<ConnectionType>('ethernet');
  const [tooltip, setTooltip] = useState<{ content: string; description?: string; x: number; y: number; visible: boolean }>({ content: '', x: 0, y: 0, visible: false });
  const [showArchDesktop, setShowArchDesktop] = useState<Node<NodeData> | null>(null);
  const [tutorialStep, setTutorialStep] = useState<number>(0);
  const [showTutorial, setShowTutorial] = useState(true);

  // Tutorial Logic
  useEffect(() => {
    if (!showTutorial) return;

    const currentStep = TUTORIAL_STEPS[tutorialStep];
    if (!currentStep) return;

    if (currentStep.id === 'drag-router') {
        const hasRouter = nodes.some(n => n.data.type === 'router');
        if (hasRouter) setTutorialStep(prev => prev + 1);
    }
    
    if (currentStep.id === 'drag-pc') {
        const hasPC = nodes.some(n => n.data.type === 'pc');
        if (hasPC) setTutorialStep(prev => prev + 1);
    }

    if (currentStep.id === 'connect') {
        const hasConnection = edges.length > 0;
        if (hasConnection) setTutorialStep(prev => prev + 1);
    }

    if (currentStep.id === 'open-desktop') {
        if (showArchDesktop) setTutorialStep(prev => prev + 1);
    }

  }, [nodes, edges, showArchDesktop, tutorialStep, showTutorial]);

  const handleTutorialNext = () => {
      if (tutorialStep < TUTORIAL_STEPS.length - 1) {
          setTutorialStep(prev => prev + 1);
      } else {
          setShowTutorial(false);
      }
  };

  const handleTutorialSkip = () => {
      setShowTutorial(false);
  };

  const restartTutorial = () => {
      setTutorialStep(0);
      setShowTutorial(true);
      // Optional: Clear workspace for fresh start
      if (window.confirm('Clear workspace for tutorial?')) {
          setNodes([]);
          setEdges([]);
      }
  };

  // Undo/Redo & Clipboard State
  const [past, setPast] = useState<HistoryState[]>([]);
  const [future, setFuture] = useState<HistoryState[]>([]);
  const [clipboard, setClipboard] = useState<Node<NodeData> | null>(null);

  const takeSnapshot = useCallback(() => {
    setPast((p) => {
      const newPast = [...p, { nodes, edges }];
      return newPast.slice(-20); // Keep last 20 states
    });
    setFuture([]);
  }, [nodes, edges]);

  const undo = useCallback(() => {
    if (past.length === 0) return;

    const previous = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);

    setFuture((f) => [{ nodes, edges }, ...f]);
    setNodes(previous.nodes);
    setEdges(previous.edges);
    setPast(newPast);
  }, [past, nodes, edges, setNodes, setEdges]);

  const redo = useCallback(() => {
    if (future.length === 0) return;

    const next = future[0];
    const newFuture = future.slice(1);

    setPast((p) => [...p, { nodes, edges }]);
    setNodes(next.nodes);
    setEdges(next.edges);
    setFuture(newFuture);
  }, [future, nodes, edges, setNodes, setEdges]);

  // Auto-save State
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isAutoSaving, setIsAutoSaving] = useState(false);

  // Save/Load Logic
  const saveToLocalStorage = useCallback((silent: boolean = false) => {
    try {
      const config = {
        nodes,
        edges,
        terminalLogs,
        version: 1,
        timestamp: Date.now()
      };
      localStorage.setItem('network_lab_config', JSON.stringify(config));
      if (!silent) {
          setTerminalLogs(prev => [...prev, `\x1b[32mConfiguration saved to local storage.\x1b[0m`]);
      }
      setLastSaved(new Date());
    } catch (e) {
      console.error('Save failed:', e);
      if (!silent) {
          setTerminalLogs(prev => [...prev, `\x1b[31mError: Save failed (Storage full?)\x1b[0m`]);
      }
    }
  }, [nodes, edges, terminalLogs]);

  // Auto-save Effect (Debounced)
  useEffect(() => {
      const timer = setTimeout(() => {
          setIsAutoSaving(true);
          saveToLocalStorage(true);
          setTimeout(() => setIsAutoSaving(false), 1000);
      }, 5000); // Auto-save after 5 seconds of inactivity

      return () => clearTimeout(timer);
  }, [nodes, edges, saveToLocalStorage]);

  const loadFromLocalStorage = useCallback(() => {
    try {
      const saved = localStorage.getItem('network_lab_config');
      if (saved) {
        const config = JSON.parse(saved);
        takeSnapshot();
        setNodes(config.nodes || []);
        setEdges(config.edges || []);
        if (config.terminalLogs) setTerminalLogs(config.terminalLogs);
        if (config.timestamp) setLastSaved(new Date(config.timestamp));
        setTerminalLogs(prev => [...prev, `\x1b[32mConfiguration loaded from local storage.\x1b[0m`]);
        
        setTimeout(() => {
            window.requestAnimationFrame(() => {
                fitView({ padding: 0.2, duration: 800 });
            });
        }, 200);
      } else {
        setTerminalLogs(prev => [...prev, `\x1b[33mNo saved configuration found.\x1b[0m`]);
      }
    } catch (e) {
      console.error('Load failed:', e);
      setTerminalLogs(prev => [...prev, `\x1b[31mError: Load failed (Corrupt data?)\x1b[0m`]);
    }
  }, [setNodes, setEdges, takeSnapshot, fitView]);

  const exportConfig = useCallback(() => {
    const config = {
      nodes,
      edges,
      terminalLogs,
      version: 1,
      timestamp: Date.now()
    };
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `network-lab-config-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setTerminalLogs(prev => [...prev, `\x1b[32mConfiguration exported to file.\x1b[0m`]);
  }, [nodes, edges, terminalLogs]);

  const importConfig = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const config = JSON.parse(content);
        
        takeSnapshot();
        if (config.nodes) setNodes(config.nodes);
        if (config.edges) setEdges(config.edges);
        if (config.terminalLogs) setTerminalLogs(config.terminalLogs);
        
        setTerminalLogs(prev => [...prev, `\x1b[32mConfiguration imported successfully.\x1b[0m`]);
        
        setTimeout(() => {
            window.requestAnimationFrame(() => {
                fitView({ padding: 0.2, duration: 800 });
            });
        }, 200);
      } catch (err) {
        console.error('Import failed:', err);
        setTerminalLogs(prev => [...prev, `\x1b[31mError: Import failed (Invalid JSON)\x1b[0m`]);
      }
    };
    reader.readAsText(file);
    // Reset input
    event.target.value = '';
  }, [setNodes, setEdges, takeSnapshot, fitView]);

  const clearConfig = useCallback(() => {
      if (window.confirm('Are you sure you want to clear the current layout? This cannot be undone.')) {
          takeSnapshot();
          setNodes([]);
          setEdges([]);
          setTerminalLogs(prev => [...prev, `\x1b[33mLayout cleared.\x1b[0m`]);
      }
  }, [setNodes, setEdges, takeSnapshot]);

  // Auto-load on mount (optional, maybe just notify user)
  useEffect(() => {
      const saved = localStorage.getItem('network_lab_config');
      if (saved) {
          setTerminalLogs(prev => [...prev, `\x1b[36mFound saved configuration. Use the Save/Load menu to restore.\x1b[0m`]);
      }
  }, []);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Undo: Cmd+Z or Ctrl+Z
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      // Redo: Cmd+Shift+Z or Ctrl+Y
      if ((e.metaKey || e.ctrlKey) && ((e.key === 'z' && e.shiftKey) || e.key === 'y')) {
        e.preventDefault();
        redo();
      }
      // Copy: Cmd+C
      if ((e.metaKey || e.ctrlKey) && e.key === 'c') {
         if (selectedNode) {
           e.preventDefault();
           setClipboard(selectedNode);
           setTerminalLogs(prev => [...prev, `\x1b[36mCopied ${selectedNode.data.label} to clipboard\x1b[0m`]);
         }
      }
      // Paste: Cmd+V
      if ((e.metaKey || e.ctrlKey) && e.key === 'v') {
         if (clipboard) {
           e.preventDefault();
           takeSnapshot();
           
           // Create new node with offset
           const newNode: Node<NodeData> = {
             ...clipboard,
             id: uuidv4(),
             position: {
               x: clipboard.position.x + 50,
               y: clipboard.position.y + 50,
             },
             data: {
               ...clipboard.data,
               label: `${clipboard.data.label} (Copy)`,
               ip: clipboard.data.type === 'wall' ? undefined : `192.168.1.${Math.floor(Math.random() * 254) + 2}`,
             },
             selected: true,
           };
           
           setNodes((nds) => nds.concat(newNode));
           setSelectedNode(newNode);
           setTerminalLogs(prev => [...prev, `\x1b[32mPasted ${newNode.data.label}\x1b[0m`]);
         }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, selectedNode, clipboard, takeSnapshot, setNodes]);

  const getEdgeStyle = (type: ConnectionType) => {
    switch (type) {
      case 'ethernet': return { stroke: '#00ff00', strokeWidth: 2 };
      case 'wifi5': return { stroke: '#a855f7', strokeDasharray: '5,5', strokeWidth: 2 };
      case 'wifi24': return { stroke: '#eab308', strokeDasharray: '5,5', strokeWidth: 2 };
      default: return { stroke: '#00ff00', strokeWidth: 2 };
    }
  };

  const onConnect = useCallback(
    (params: Connection) => {
      takeSnapshot();
      setEdges((eds) => addEdge({ 
        ...params, 
        animated: true, 
        style: getEdgeStyle(connectionType),
        data: { type: connectionType }
      }, eds));
    },
    [setEdges, connectionType, takeSnapshot],
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow') as NodeType;
      if (typeof type === 'undefined' || !type) {
        return;
      }

      const position = reactFlowWrapper.current?.getBoundingClientRect();
      if (!position) return;

      takeSnapshot();

      const clientX = event.clientX - position.left;
      const clientY = event.clientY - position.top;

      // Generate a random IP for the new device
      const randomIp = type === 'wall' ? undefined : `192.168.1.${Math.floor(Math.random() * 254) + 2}`;

      const newNode: Node<NodeData> = {
        id: uuidv4(),
        type: type === 'wall' ? 'wall' : 'custom',
        position: { x: clientX - (type === 'wall' ? 10 : 75), y: clientY - (type === 'wall' ? 50 : 25) },
        style: type === 'wall' ? { width: 20, height: 200 } : undefined,
        data: { 
          label: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`, 
          type: type,
          ip: randomIp,
          status: 'online',
          cpu: Math.floor(Math.random() * 20),
          ram: Math.floor(Math.random() * 40),
          signalStrength: 0,
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [setNodes, takeSnapshot],
  );

  const onNodeDragStart = useCallback(() => {
    takeSnapshot();
  }, [takeSnapshot]);

  const onNodesDelete: OnNodesDelete = useCallback(() => {
    takeSnapshot();
  }, [takeSnapshot]);

  const onEdgesDelete: OnEdgesDelete = useCallback(() => {
    takeSnapshot();
  }, [takeSnapshot]);

  const onNodeClick = useCallback((e: React.MouseEvent, node: Node) => {
    setSelectedNode(node as Node<NodeData>);
  }, []);

  const onNodeDoubleClick = useCallback((e: React.MouseEvent, node: Node) => {
    if (node.data.type === 'pc') {
        setShowArchDesktop(node as Node<NodeData>);
    }
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const updateNodeData = useCallback((id: string, newData: Partial<NodeData>) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          const updatedNode = {
            ...node,
            data: { ...node.data, ...newData },
          };
          if (selectedNode?.id === id) {
            setSelectedNode(updatedNode as Node<NodeData>);
          }
          return updatedNode;
        }
        return node;
      })
    );
  }, [setNodes, selectedNode]);

  const handleDesktopSave = useCallback((state: DesktopState) => {
      if (showArchDesktop) {
          updateNodeData(showArchDesktop.id, { desktopState: state });
      }
  }, [showArchDesktop, updateNodeData]);

  const loadLayout = (layoutIndex: number) => {
    takeSnapshot();
    const layout = LAYOUTS[layoutIndex];
    setNodes(layout.nodes.map(n => ({
        ...n,
        type: n.type === 'wall' ? 'wall' : 'custom',
        data: { ...n.data, signalStrength: 0 } as NodeData
    })));
    setEdges(layout.edges || []);
    setTerminalLogs(prev => [...prev, `\x1b[32mLoaded layout: ${layout.name}\x1b[0m`]);
    
    // Wait for nodes to be rendered and measured
    setTimeout(() => {
        window.requestAnimationFrame(() => {
            fitView({ padding: 0.2, duration: 800 });
        });
    }, 200);
  };

  // Hover Handlers
  const onNodeMouseEnter = useCallback((event: React.MouseEvent, node: Node) => {
    const label = node.data.label;
    const type = node.data.type.toUpperCase();
    const ip = node.data.ip ? `IP: ${node.data.ip}` : '';
    setTooltip({
        content: label,
        description: `${type} ${ip}`,
        x: event.clientX,
        y: event.clientY,
        visible: true
    });
  }, []);

  const onNodeMouseMove = useCallback((event: React.MouseEvent) => {
    setTooltip(prev => ({ ...prev, x: event.clientX, y: event.clientY }));
  }, []);

  const onNodeMouseLeave = useCallback(() => {
    setTooltip(prev => ({ ...prev, visible: false }));
  }, []);

  const onEdgeMouseEnter = useCallback((event: React.MouseEvent, edge: Edge) => {
    const type = edge.data?.type || 'ethernet';
    let label = 'Unknown Connection';
    let desc = '';

    switch (type) {
        case 'ethernet':
            label = 'Ethernet Cable';
            desc = '1Gbps Wired Connection';
            break;
        case 'wifi5':
            label = 'WiFi 5GHz';
            desc = '802.11ac Wireless Link';
            break;
        case 'wifi24':
            label = 'WiFi 2.4GHz';
            desc = '802.11n Wireless Link';
            break;
    }

    setTooltip({
        content: label,
        description: desc,
        x: event.clientX,
        y: event.clientY,
        visible: true
    });
  }, []);

  const onEdgeMouseMove = useCallback((event: React.MouseEvent) => {
    setTooltip(prev => ({ ...prev, x: event.clientX, y: event.clientY }));
  }, []);

  const onEdgeMouseLeave = useCallback(() => {
    setTooltip(prev => ({ ...prev, visible: false }));
  }, []);

  const edgesRef = useRef(edges);

  useEffect(() => {
    edgesRef.current = edges;
  }, [edges]);

  // Signal Strength Simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setNodes((currentNodes) => {
        const waps = currentNodes.filter(n => (n.data.type === 'wap' || n.data.type === 'router') && n.data.status === 'online');
        const walls = currentNodes.filter(n => n.type === 'wall');
        const currentEdges = edgesRef.current;

        return currentNodes.map(node => {
          if (node.data.type === 'pc' || node.data.type === 'wap') {
            // Check if node has any wireless connection
            const isWireless = currentEdges.some(e => 
                (e.source === node.id || e.target === node.id) && 
                (e.data?.type === 'wifi5' || e.data?.type === 'wifi24')
            );

            if (!isWireless && node.data.type === 'pc') {
                if (node.data.signalStrength !== undefined) {
                    return {
                        ...node,
                        data: { ...node.data, signalStrength: undefined }
                    };
                }
                return node;
            }

            // Find closest WAP
            let maxSignal = 0;

            waps.forEach(wap => {
              if (wap.id === node.id) return; // Don't connect to self

              const dx = node.position.x - wap.position.x;
              const dy = node.position.y - wap.position.y;
              const distance = Math.sqrt(dx * dx + dy * dy);
              
              // Base signal calculation (inverse square law-ish)
              // Assume max range 600px
              let signal = Math.max(0, 100 - (distance / 6));

              // Wall attenuation
              walls.forEach(wall => {
                 const wx = wall.position.x;
                 const wy = wall.position.y;
                 const ww = wall.style?.width ? Number(wall.style.width) : 20;
                 const wh = wall.style?.height ? Number(wall.style.height) : 200;
                 
                 const midX = (node.position.x + wap.position.x) / 2;
                 const midY = (node.position.y + wap.position.y) / 2;
                 
                 if (midX > wx && midX < wx + ww && midY > wy && midY < wy + wh) {
                     signal -= 40; // Heavy penalty for walls
                 }
              });

              if (signal > maxSignal) maxSignal = signal;
            });

            // Add some noise
            maxSignal = Math.min(100, Math.max(0, maxSignal + (Math.random() * 5 - 2.5)));

            if (node.data.signalStrength !== Math.floor(maxSignal)) {
                return {
                    ...node,
                    data: { ...node.data, signalStrength: Math.floor(maxSignal) }
                };
            }
          }
          return node;
        });
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [setNodes]);

  const handleTerminalCommand = useCallback((cmd: string) => {
    const args = cmd.split(' ');
    const command = args[0].toLowerCase();

    let response = '';

    switch (command) {
      case 'help':
        response = 'Available commands:\r\n  \x1b[33mhelp\x1b[0m - Show this help message\r\n  \x1b[33mls\x1b[0m - List all devices\r\n  \x1b[33mping <ip>\x1b[0m - Ping a device by IP\r\n  \x1b[33mconnect <ip1> <ip2>\x1b[0m - Connect two devices\r\n  \x1b[33mdisconnect <ip1> <ip2>\x1b[0m - Disconnect two devices\r\n  \x1b[33mstatus <ip>\x1b[0m - Show device status\r\n  \x1b[33mclear\x1b[0m - Clear terminal';
        break;
      case 'ls':
        response = nodes.filter(n => n.type !== 'wall').map(n => `\x1b[36m${n.data.label}\x1b[0m (${n.data.ip}) - [${n.data.status}]`).join('\r\n');
        break;
      case 'clear':
        setTerminalLogs([]); 
        return;
      case 'ping':
        if (!args[1]) {
          response = '\x1b[31mError: Missing IP address\x1b[0m';
        } else {
          const target = nodes.find(n => n.data.ip === args[1]);
          if (target) {
            if (target.data.status === 'online') {
              response = `Pinging ${args[1]} with 32 bytes of data:\r\nReply from ${args[1]}: bytes=32 time<1ms TTL=64\r\nReply from ${args[1]}: bytes=32 time<1ms TTL=64\r\nReply from ${args[1]}: bytes=32 time<1ms TTL=64\r\nReply from ${args[1]}: bytes=32 time<1ms TTL=64`;
            } else {
              response = `Pinging ${args[1]} with 32 bytes of data:\r\nRequest timed out.\r\nRequest timed out.\r\nRequest timed out.\r\nRequest timed out.`;
            }
          } else {
            response = `Pinging ${args[1]} with 32 bytes of data:\r\nDestination host unreachable.`;
          }
        }
        break;
      case 'status':
        if (!args[1]) {
          response = '\x1b[31mError: Missing IP address\x1b[0m';
        } else {
          const target = nodes.find(n => n.data.ip === args[1]);
          if (target) {
            response = `Device: ${target.data.label}\r\nType: ${target.data.type}\r\nStatus: ${target.data.status}\r\nCPU: ${target.data.cpu}%\r\nRAM: ${target.data.ram}%`;
          } else {
            response = '\x1b[31mError: Device not found\x1b[0m';
          }
        }
        break;
      case 'connect':
        if (!args[1] || !args[2]) {
          response = '\x1b[31mUsage: connect <source_ip> <target_ip>\x1b[0m';
        } else {
          const source = nodes.find(n => n.data.ip === args[1]);
          const target = nodes.find(n => n.data.ip === args[2]);
          
          if (source && target) {
            const edgeId = `e${source.id}-${target.id}`;
            const exists = edges.some(e => 
              (e.source === source.id && e.target === target.id) || 
              (e.source === target.id && e.target === source.id)
            );
            
            if (exists) {
              response = `\x1b[33mConnection already exists between ${args[1]} and ${args[2]}\x1b[0m`;
            } else {
              setEdges((eds) => addEdge({ 
                id: edgeId, 
                source: source.id, 
                target: target.id, 
                animated: true, 
                style: getEdgeStyle('ethernet'), // Default to ethernet for CLI connections
                data: { type: 'ethernet' }
              }, eds));
              response = `\x1b[32mConnected ${args[1]} to ${args[2]}\x1b[0m`;
            }
          } else {
            response = '\x1b[31mError: One or both devices not found\x1b[0m';
          }
        }
        break;
      case 'disconnect':
        if (!args[1] || !args[2]) {
          response = '\x1b[31mUsage: disconnect <source_ip> <target_ip>\x1b[0m';
        } else {
          const source = nodes.find(n => n.data.ip === args[1]);
          const target = nodes.find(n => n.data.ip === args[2]);
          
          if (source && target) {
            setEdges((eds) => eds.filter(e => 
              !((e.source === source.id && e.target === target.id) || 
                (e.source === target.id && e.target === source.id))
            ));
            response = `\x1b[32mDisconnected ${args[1]} from ${args[2]}\x1b[0m`;
          } else {
            response = '\x1b[31mError: One or both devices not found\x1b[0m';
          }
        }
        break;
      default:
        response = `\x1b[31mCommand not found: ${command}\x1b[0m`;
    }

    if (response) {
      setTerminalLogs(prev => [...prev, response]);
    }
  }, [nodes, edges]);

  return (
    <div className="flex h-screen w-screen bg-[#0D0D0D] overflow-hidden font-sans text-[#F2F2F2]">
      <Sidebar />
      
      <div className="flex-1 flex flex-col relative h-full">
        <div className="flex-1 h-full" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onNodeDoubleClick={onNodeDoubleClick}
            onPaneClick={onPaneClick}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onNodeMouseEnter={onNodeMouseEnter}
            onNodeMouseMove={onNodeMouseMove}
            onNodeMouseLeave={onNodeMouseLeave}
            onEdgeMouseEnter={onEdgeMouseEnter}
            onEdgeMouseMove={onEdgeMouseMove}
            onEdgeMouseLeave={onEdgeMouseLeave}
            onNodeDragStart={onNodeDragStart}
            onNodesDelete={onNodesDelete}
            onEdgesDelete={onEdgesDelete}
            nodeTypes={nodeTypes}
            fitView
            className="bg-[#0D0D0D]"
          >
            <Background color="#333333" gap={24} size={1} variant={BackgroundVariant.Dots} />
            <Controls className="bg-[#1A1A1A] border-white/10 fill-white" />
            
            {/* Top Left Toolbar (Undo/Redo) */}
            <Panel position="top-left" className="flex gap-2">
                <div className="glass-panel p-2 rounded-none flex items-center gap-2">
                    <button 
                        onClick={undo}
                        disabled={past.length === 0}
                        className={cn("p-1 hover:text-[#D71920] transition-colors disabled:opacity-30 disabled:hover:text-white/50")}
                        title="Undo (Ctrl+Z)"
                    >
                        <Undo2 size={20} />
                    </button>
                    <button 
                        onClick={redo}
                        disabled={future.length === 0}
                        className={cn("p-1 hover:text-[#D71920] transition-colors disabled:opacity-30 disabled:hover:text-white/50")}
                        title="Redo (Ctrl+Y)"
                    >
                        <Redo2 size={20} />
                    </button>
                </div>
            </Panel>

            {/* Top Toolbar */}
            <Panel position="top-right" className="flex gap-2">
                {/* Save/Load Controls */}
                <div className="glass-panel p-2 rounded-none flex items-center gap-2">
                    <div className="flex items-center mr-2">
                        {isAutoSaving ? (
                            <span className="text-[10px] text-[#D71920] font-mono animate-pulse">SAVING...</span>
                        ) : lastSaved ? (
                            <span className="text-[10px] text-white/30 font-mono">SAVED {lastSaved.toLocaleTimeString()}</span>
                        ) : null}
                    </div>
                    <button 
                        onClick={() => saveToLocalStorage(false)}
                        className="p-1 hover:text-[#D71920] transition-colors"
                        title="Save to Browser Storage"
                    >
                        <Save size={16} />
                    </button>
                    <button 
                        onClick={loadFromLocalStorage}
                        className="p-1 hover:text-[#D71920] transition-colors"
                        title="Load from Browser Storage"
                    >
                        <Upload size={16} className="rotate-180" /> {/* Reuse Upload icon rotated for 'Load' visual if needed, or just use Upload/Download logic */}
                    </button>
                    <div className="w-[1px] h-4 bg-white/10 mx-1" />
                    <button 
                        onClick={exportConfig}
                        className="p-1 hover:text-[#D71920] transition-colors"
                        title="Export Config to JSON"
                    >
                        <Download size={16} />
                    </button>
                    <label className="p-1 hover:text-[#D71920] transition-colors cursor-pointer" title="Import Config from JSON">
                        <Upload size={16} />
                        <input type="file" accept=".json" onChange={importConfig} className="hidden" />
                    </label>
                    <div className="w-[1px] h-4 bg-white/10 mx-1" />
                    <button 
                        onClick={clearConfig}
                        className="p-1 hover:text-[#D71920] transition-colors"
                        title="Clear Layout"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>

                {/* Connection Selector */}
                <div className="glass-panel p-2 rounded-none flex items-center gap-4">
                    <Cable size={16} className="text-[#D71920]" />
                    <div className="flex gap-1 font-dot text-xs tracking-widest">
                        <button 
                            onClick={() => setConnectionType('ethernet')}
                            className={cn("px-2 py-1 transition-all uppercase", connectionType === 'ethernet' ? "bg-[#D71920] text-white" : "hover:bg-white/10 text-white/50")}
                            title="Ethernet"
                        >
                            ETH
                        </button>
                        <button 
                            onClick={() => setConnectionType('wifi5')}
                            className={cn("px-2 py-1 transition-all uppercase", connectionType === 'wifi5' ? "bg-[#D71920] text-white" : "hover:bg-white/10 text-white/50")}
                            title="WiFi 5GHz"
                        >
                            5G
                        </button>
                        <button 
                            onClick={() => setConnectionType('wifi24')}
                            className={cn("px-2 py-1 transition-all uppercase", connectionType === 'wifi24' ? "bg-[#D71920] text-white" : "hover:bg-white/10 text-white/50")}
                            title="WiFi 2.4GHz"
                        >
                            2.4G
                        </button>
                    </div>
                </div>

                {/* Layout Selector */}
                <div className="glass-panel p-2 rounded-none flex items-center gap-2">
                    <Layout size={16} className="text-[#D71920]" />
                    <select 
                        className="bg-transparent border-none outline-none text-white/80 cursor-pointer font-dot text-xs uppercase tracking-widest"
                        onChange={(e) => loadLayout(Number(e.target.value))}
                        defaultValue=""
                    >
                        <option value="" disabled className="bg-[#1A1A1A]">LOAD_LAYOUT</option>
                        {LAYOUTS.map((l, i) => (
                            <option key={i} value={i} className="bg-[#1A1A1A]">{l.name.toUpperCase()}</option>
                        ))}
                    </select>
                </div>

                {/* Help Button */}
                <button 
                    onClick={restartTutorial}
                    className="glass-panel p-2 rounded-none text-white/50 hover:text-[#D71920] hover:border-[#D71920] transition-all"
                    title="Start Tutorial"
                >
                    <HelpCircle size={16} />
                </button>
            </Panel>

            <Panel position="bottom-right" className="glass-panel px-3 py-1 rounded-full border-white/10 text-white/40 text-[10px] font-mono tracking-widest uppercase">
              SIGNAL_SIM: {nodes.some(n => n.type === 'wall') ? 'ACTIVE (WALLS DETECTED)' : 'ACTIVE'}
            </Panel>
          </ReactFlow>
        </div>

        {/* Terminal Panel */}
        <div 
          className={cn(
            "border-t border-white/10 bg-[#0D0D0D] transition-all duration-300 ease-in-out flex flex-col",
            terminalOpen ? "h-64" : "h-10"
          )}
        >
          <div 
            className="flex items-center justify-between px-4 py-2 bg-white/5 cursor-pointer hover:bg-white/10 transition-colors border-b border-white/5"
            onClick={() => setTerminalOpen(!terminalOpen)}
          >
            <div className="flex items-center text-xs font-dot text-[#D71920] tracking-widest uppercase">
              <TerminalIcon size={14} className="mr-2" />
              TERMINAL_ACCESS
            </div>
            <button className="text-white/40 hover:text-white">
              {terminalOpen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            </button>
          </div>
          
          <div className={cn("flex-1 overflow-hidden", !terminalOpen && "hidden")}>
            <Terminal onCommand={handleTerminalCommand} logs={terminalLogs} />
          </div>
        </div>

        <DetailsPanel 
          selectedNode={selectedNode} 
          onClose={() => setSelectedNode(null)} 
          onUpdate={updateNodeData}
        />

        {/* Overlays */}
        <Tooltip {...tooltip} />
        {showArchDesktop && (
            <ArchDesktop 
                key={showArchDesktop.id}
                nodeLabel={showArchDesktop.data.label} 
                initialState={showArchDesktop.data.desktopState}
                onClose={() => setShowArchDesktop(null)} 
                onSaveState={handleDesktopSave}
            />
        )}
        {showTutorial && (
            <GuidedTutorial 
                steps={TUTORIAL_STEPS}
                currentStepIndex={tutorialStep}
                onComplete={() => setShowTutorial(false)}
                onSkip={handleTutorialSkip}
                onNext={handleTutorialNext}
            />
        )}
      </div>
    </div>
  );
};

export default function App() {
  return (
    <ReactFlowProvider>
      <AppContent />
    </ReactFlowProvider>
  );
}
