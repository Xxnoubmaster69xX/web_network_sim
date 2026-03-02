import React, { useEffect, useRef } from 'react';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';

interface TerminalProps {
  onCommand: (command: string) => void;
  logs: string[];
}

const Terminal: React.FC<TerminalProps> = ({ onCommand, logs }) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const commandBufferRef = useRef<string>('');
  const lastLogIndexRef = useRef<number>(0);

  useEffect(() => {
    if (!terminalRef.current) return;

    const term = new XTerm({
      cursorBlink: true,
      cursorStyle: 'block',
      theme: {
        background: '#0D0D0D',
        foreground: '#F2F2F2',
        cursor: '#D71920',
        selectionBackground: '#D7192040',
        black: '#0D0D0D',
        red: '#D71920',
        green: '#F2F2F2', // Use white for success
        yellow: '#808080', // Use grey for warnings
        blue: '#F2F2F2',
        magenta: '#D71920',
        cyan: '#808080',
        white: '#F2F2F2',
        brightBlack: '#333333',
        brightRed: '#FF0000',
        brightGreen: '#FFFFFF',
        brightYellow: '#AAAAAA',
        brightBlue: '#FFFFFF',
        brightMagenta: '#FF0000',
        brightCyan: '#AAAAAA',
        brightWhite: '#FFFFFF',
      },
      fontFamily: '"JetBrains Mono", monospace',
      fontSize: 12,
      lineHeight: 1.4,
      letterSpacing: 0.5,
      rows: 12,
      convertEol: true,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    
    term.open(terminalRef.current);
    fitAddon.fit();

    term.writeln('\x1b[1;37mNOTHING_OS TERMINAL v1.0.0\x1b[0m');
    term.writeln('Type \x1b[31mhelp\x1b[0m for available commands.');
    term.write('\r\n$ ');

    term.onData((data) => {
      const code = data.charCodeAt(0);

      if (code === 13) { // Enter
        term.write('\r\n');
        const cmd = commandBufferRef.current.trim();
        if (cmd) {
            onCommand(cmd);
        } else {
            term.write('$ ');
        }
        commandBufferRef.current = '';
      } else if (code === 127) { // Backspace
        if (commandBufferRef.current.length > 0) {
            commandBufferRef.current = commandBufferRef.current.slice(0, -1);
            term.write('\b \b');
        }
      } else {
        commandBufferRef.current += data;
        term.write(data);
      }
    });

    xtermRef.current = term;
    fitAddonRef.current = fitAddon;

    const handleResize = () => fitAddon.fit();
    
    const resizeObserver = new ResizeObserver(() => {
        requestAnimationFrame(() => fitAddon.fit());
    });
    
    if (terminalRef.current) {
        resizeObserver.observe(terminalRef.current);
    }
    
    window.addEventListener('resize', handleResize);

    return () => {
      term.dispose();
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Sync logs
  useEffect(() => {
    if (!xtermRef.current) return;
    
    const newLogs = logs.slice(lastLogIndexRef.current);
    if (newLogs.length > 0) {
        newLogs.forEach(log => {
            xtermRef.current?.writeln(log);
        });
        xtermRef.current.write('$ ');
        lastLogIndexRef.current = logs.length;
    }
  }, [logs]);

  return <div className="h-full w-full overflow-hidden bg-[#0D0D0D]" ref={terminalRef} />;
};

export default Terminal;
