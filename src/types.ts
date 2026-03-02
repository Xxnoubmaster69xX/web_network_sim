import { Node, Edge } from 'reactflow';

export type NodeType = 'server' | 'router' | 'switch' | 'pc' | 'firewall' | 'wall' | 'wap';

export type ConnectionType = 'ethernet' | 'wifi5' | 'wifi24';

export interface WindowState {
  id: string;
  appId: string;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  isMinimized: boolean;
  isMaximized: boolean;
}

export interface DesktopState {
  windows: WindowState[];
  wallpaper: string;
  wallpaperImage: string | null;
  iconPositions: { [key: string]: { x: number, y: number } };
}

export interface NodeData {
  label: string;
  type: NodeType;
  ip?: string;
  status: 'online' | 'offline' | 'booting';
  cpu?: number;
  ram?: number;
  disk?: number;
  signalStrength?: number; // 0-100
  desktopState?: DesktopState;
}

export interface CustomNode extends Node<NodeData> {}

export interface CustomEdgeData {
    type: ConnectionType;
}

export type CustomEdge = Edge<CustomEdgeData>;

export const INITIAL_NODES: CustomNode[] = [
  {
    id: '1',
    type: 'custom',
    position: { x: 250, y: 50 },
    data: { 
      label: 'Main Router', 
      type: 'router', 
      ip: '192.168.1.1', 
      status: 'online' 
    },
  },
];
