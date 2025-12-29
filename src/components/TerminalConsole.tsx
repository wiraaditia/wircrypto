"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Shield, Zap, Info } from 'lucide-react';

interface LogEntry {
    timestamp: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error' | 'alpha';
}

export default function TerminalConsole({ pools, networkName }: { pools: any[], networkName: string }) {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);

    const addLog = (message: string, type: LogEntry['type'] = 'info') => {
        const newLog: LogEntry = {
            timestamp: new Date().toLocaleTimeString([], { hour12: false }),
            message,
            type
        };
        setLogs(prev => [...prev.slice(-19), newLog]);
    };

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs]);

    // Initial log
    useEffect(() => {
        addLog(`INTEGRATING WITH ${networkName.toUpperCase()} RPC NODES...`, 'info');
        addLog(`SECURITY AUDIT ENGINE: ONLINE`, 'success');
        addLog(`HYPE SCANNER: V2.4.0 INITIALIZED`, 'info');
    }, [networkName]);

    // Track new koin discoveries
    useEffect(() => {
        if (pools.length > 0) {
            const last = pools[0];
            if (last.hypeScore > 85) {
                addLog(`CRITICAL ALPHA: ${last.symbol} DETECTED WITH HYPE ${last.hypeScore}!`, 'alpha');
            } else {
                addLog(`NEW LIQUIDITY: ${last.symbol} / ${last.reserve_usd > 10000 ? "HIGH" : "LOW"} LIQ DETECTED`, 'info');
            }
        }
    }, [pools]);

    return (
        <div className="h-full bg-black flex flex-col font-mono text-[10px] select-none border-t border-white/5">
            <div className="flex items-center gap-2 px-3 h-6 bg-[#0d0d0d] border-b border-white/5">
                <Terminal size={12} className="text-terminal-mint" />
                <span className="text-gray-500 font-black tracking-widest uppercase">System Console Logs</span>
            </div>

            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-2 space-y-0.5 no-scrollbar scroll-smooth"
            >
                {logs.map((log, i) => (
                    <div key={i} className="flex gap-3 leading-tight animate-in fade-in slide-in-from-left-2 duration-300">
                        <span className="text-gray-700 whitespace-nowrap">[{log.timestamp}]</span>
                        <span className={cn(
                            "break-all",
                            log.type === 'info' && "text-gray-400",
                            log.type === 'success' && "text-terminal-mint",
                            log.type === 'error' && "text-terminal-red",
                            log.type === 'alpha' && "text-yellow-400 font-bold italic"
                        )}>
                            {log.type === 'alpha' && " [ALPHA ALERT] "}
                            {log.message}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(' ');
}
