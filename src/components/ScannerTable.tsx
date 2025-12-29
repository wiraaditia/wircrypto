"use client";

import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Loader2, TrendingUp, Zap } from 'lucide-react';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface ScannerTableProps {
    pools: any[];
    isLoading: boolean;
    selectedPoolId: string | null;
    onSelectPool: (pool: any) => void;
    networkName: string;
}

export default function ScannerTable({ pools, isLoading, selectedPoolId, onSelectPool, networkName }: ScannerTableProps) {
    return (
        <div className="flex-1 overflow-y-auto no-scrollbar select-none bg-black/20">
            <table className="w-full text-left border-collapse table-fixed">
                <thead className="bg-[#0a0a0a] sticky top-0 z-20 border-b border-white/[0.05]">
                    <tr className="text-[8px] text-gray-600 uppercase font-black tracking-[0.2em]">
                        <th className="p-2 pl-4 w-1/3">Market Entity</th>
                        <th className="p-2 text-right">Valuation</th>
                        <th className="p-2 text-right w-16">Age</th>
                        <th className="p-2 text-right w-20">Liquidity</th>
                        <th className="p-2 text-center w-12">Score</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.02]">
                    {isLoading ? (
                        <tr>
                            <td colSpan={5} className="p-16 text-center">
                                <div className="flex flex-col items-center gap-4">
                                    <div className="relative">
                                        <Loader2 className="animate-spin text-terminal-mint" size={24} />
                                        <div className="absolute inset-0 bg-terminal-mint/20 blur-xl animate-pulse" />
                                    </div>
                                    <span className="text-[9px] text-gray-500 font-black tracking-[0.3em] uppercase animate-pulse">
                                        Querying {networkName.toUpperCase()} Data Cluster...
                                    </span>
                                </div>
                            </td>
                        </tr>
                    ) : pools.length === 0 ? (
                        <tr>
                            <td colSpan={5} className="p-16 text-center text-gray-700 font-mono text-[9px] uppercase tracking-[0.4em] italic opacity-50">
                                [ No Alpha Signals Isolated ]
                            </td>
                        </tr>
                    ) : pools.map((pool: any) => {
                        const ageHrs = (Date.now() - new Date(pool.created_at).getTime()) / (1000 * 60 * 60);
                        const ageStr = ageHrs < 1 ? `${Math.round(ageHrs * 60)}m` : ageHrs < 24 ? `${Math.round(ageHrs)}h` : `${Math.round(ageHrs / 24)}d`;
                        const isHot = pool.hypeScore > 85;

                        return (
                            <tr
                                key={pool.id}
                                onClick={() => onSelectPool(pool)}
                                className={cn(
                                    "cursor-pointer transition-all duration-75 relative group border-l-2",
                                    selectedPoolId === pool.id
                                        ? "bg-terminal-mint/[0.03] border-l-terminal-mint"
                                        : "hover:bg-white/[0.02] border-l-transparent"
                                )}
                            >
                                <td className="p-2 pl-4 overflow-hidden">
                                    <div className="flex items-center gap-3">
                                        <div className="relative flex-shrink-0">
                                            <div className="w-7 h-7 rounded-full bg-[#111] border border-white/10 overflow-hidden shadow-inner flex items-center justify-center">
                                                {pool.image_url ? (
                                                    <img src={pool.image_url} alt="" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                                ) : (
                                                    <span className="text-[10px] font-black text-terminal-mint/40">{pool.symbol[0]}</span>
                                                )}
                                            </div>
                                            {isHot && (
                                                <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-terminal-mint rounded-full shadow-glow-small animate-pulse" />
                                            )}
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <div className="flex items-center gap-1.5">
                                                <span className={cn(
                                                    "text-[10px] font-black tracking-tight truncate",
                                                    selectedPoolId === pool.id ? "text-terminal-mint" : "text-gray-200 group-hover:text-white"
                                                )}>
                                                    {pool.symbol}
                                                </span>
                                                {pool.isWatchlisted && <div className="w-1 h-1 bg-yellow-500 rounded-full" />}
                                            </div>
                                            <span className="text-[7px] text-gray-600 truncate font-black uppercase tracking-wider">{pool.name}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-2 text-right">
                                    <span className="text-[9px] font-mono text-terminal-mint font-black">
                                        ${pool.price_usd < 0.000001 ? pool.price_usd.toExponential(2) : pool.price_usd.toFixed(pool.price_usd < 1 ? 8 : 2)}
                                    </span>
                                </td>
                                <td className="p-2 text-right text-[9px] text-gray-600 font-mono italic">{ageStr}</td>
                                <td className="p-2 text-right text-[9px] text-gray-400 font-mono font-bold">${(pool.reserve_usd / 1000).toFixed(1)}K</td>
                                <td className="p-2 text-center">
                                    <div className={cn(
                                        "inline-flex items-center justify-center min-w-[24px] h-[14px] rounded-[1px] text-[8px] font-black tracking-tighter",
                                        isHot
                                            ? "bg-terminal-mint text-black shadow-glow-small"
                                            : "bg-[#1a1a1a] text-terminal-mint/60 border border-white/5"
                                    )}>
                                        {pool.hypeScore}
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
