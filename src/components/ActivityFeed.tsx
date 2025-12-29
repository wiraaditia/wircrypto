"use client";

import React from 'react';
import { Activity, Zap } from 'lucide-react';

interface ActivityFeedProps {
    pools: any[];
    networkName: string;
}

export default function ActivityFeed({ pools, networkName }: ActivityFeedProps) {
    return (
        <div className="h-24 border-t border-terminal-border bg-terminal-charcoal p-2 flex flex-col overflow-hidden">
            <div className="flex items-center gap-2 mb-1 border-b border-terminal-border/30 pb-1">
                <Zap size={12} className="text-terminal-mint" />
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Global Live Activity</span>
            </div>
            <div className="flex-1 overflow-y-auto font-mono text-[9px] text-gray-500 space-y-0.5">
                {pools.slice(0, 10).map((pool: any, i: number) => (
                    <div key={i} className="flex gap-4 items-center">
                        <span className="text-terminal-mint">[{new Date().toLocaleTimeString()}]</span>
                        <span className="flex items-center gap-1">
                            TOKEN DETECTED: <span className="text-white font-bold">{pool.symbol}</span>
                            <span className="text-[7px] px-1 bg-terminal-gray border border-terminal-border rounded text-gray-400 font-sans">{networkName.toUpperCase()}</span>
                        </span>
                        <span className="text-gray-600">| LIQ: ${pool.reserve_usd.toLocaleString()}</span>
                        <span className="text-terminal-mint">| HYPE: {pool.hypeScore}</span>
                        {pool.hypeScore > 85 && (
                            <span className="text-terminal-red animate-pulse font-bold ml-auto uppercase text-[8px]">🚨 High Volatility Detected</span>
                        )}
                    </div>
                ))}
                {pools.length === 0 && (
                    <div className="animate-pulse text-gray-600">SCANNING BLOCKCHAIN NETWORKS FOR NEW LIQUIDITY POOLS...</div>
                )}
            </div>
        </div>
    );
}
