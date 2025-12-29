"use client";

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link2, Loader2, TrendingUp, TrendingDown, MousePointer2, User, Wallet, History, BarChart2, ExternalLink } from 'lucide-react';

interface TransactionsTableProps {
    symbol: string;
    network?: string;
    address?: string;
    solPrice?: number;
}

export default function TransactionsTable({ symbol, network, address, solPrice = 152 }: TransactionsTableProps) {
    const [trades, setTrades] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('Live Stream');

    useEffect(() => {
        let interval: any;

        async function fetchTrades() {
            if (!network || !address || activeTab !== 'Live Stream') return;

            try {
                const response = await axios.get(`/api/trades?network=${network}&address=${address}`);
                if (response.data && Array.isArray(response.data)) {
                    setTrades(response.data);
                }
            } catch (error) {
                console.error('Error fetching trades:', error);
            }
        }

        if (network && address && activeTab === 'Live Stream') {
            setIsLoading(true);
            fetchTrades().finally(() => setIsLoading(false));
            interval = setInterval(fetchTrades, 10000);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [network, address, activeTab]);

    if (!address) return (
        <div className="flex-1 flex items-center justify-center text-gray-700 font-mono text-[10px] uppercase tracking-[0.3em] bg-[#050505]">
            <MousePointer2 size={14} className="animate-pulse mr-2" />
            Initializing Deep Flow Synchronization...
        </div>
    );

    const renderContent = () => {
        switch (activeTab) {
            case 'Live Stream':
                return (
                    <table className="w-full text-left border-collapse table-fixed">
                        <thead className="sticky top-0 bg-[#0d0d0d] z-10 text-[10px] font-bold text-gray-500 border-b border-[#2a2e39]">
                            <tr>
                                <th className="p-2 pl-4 w-20 cursor-pointer hover:text-gray-300">DATE <span className="text-[8px] ml-0.5">▼</span></th>
                                <th className="p-2 w-12 cursor-pointer hover:text-gray-300">TYPE <span className="text-[8px] ml-0.5">Y</span></th>
                                <th className="p-2 text-right cursor-pointer hover:text-gray-300">USD <span className="text-[8px] ml-0.5">Y</span></th>
                                <th className="p-2 text-right cursor-pointer hover:text-gray-300">{symbol} <span className="text-[8px] ml-0.5">Y</span></th>
                                <th className="p-2 text-right cursor-pointer hover:text-gray-300">{network === 'solana' ? 'SOL' : 'ETH'} <span className="text-[8px] ml-0.5">Y</span></th>
                                <th className="p-2 text-right cursor-pointer hover:text-gray-300">PRICE <span className="text-[8px] ml-0.5">Y</span></th>
                                <th className="p-2 text-right cursor-pointer hover:text-gray-300">MAKER <span className="text-[8px] ml-0.5">Y</span></th>
                                <th className="p-2 text-right pr-4 w-10">TXN</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#2a2e39]">
                            {trades.length === 0 && !isLoading ? (
                                <tr>
                                    <td colSpan={8} className="p-12 text-center text-gray-700 font-mono text-[9px] uppercase tracking-[0.4em] italic opacity-50">
                                        [ No recent block activity detected ]
                                    </td>
                                </tr>
                            ) : trades.map((tx, i) => {
                                const isBuy = tx.type === 'Buy';
                                const priceColor = isBuy ? 'text-terminal-mint' : 'text-terminal-red';

                                return (
                                    <tr
                                        key={tx.id || i}
                                        className="hover:bg-white/[0.03] transition-colors group text-[11px] font-mono leading-none"
                                    >
                                        <td className="p-1.5 pl-4 text-gray-400">
                                            {new Date(tx.shortTime).toLocaleTimeString([], { hour12: false })}
                                        </td>
                                        <td className={cn("p-1.5 font-bold uppercase", priceColor)}>
                                            {tx.type}
                                        </td>
                                        <td className={cn("p-1.5 text-right font-bold", priceColor)}>
                                            {tx.volumeUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </td>
                                        <td className={cn("p-1.5 text-right font-bold", priceColor)}>
                                            {tx.amount > 1000000 ? (tx.amount / 1000000).toFixed(1) + 'M' : tx.amount > 1000 ? (tx.amount / 1000).toFixed(1) + 'K' : tx.amount.toFixed(0)}
                                        </td>
                                        <td className={cn("p-1.5 text-right font-bold", priceColor)}>
                                            {(tx.volumeUsd / (solPrice || 145)).toFixed(2)}
                                        </td>
                                        <td className={cn("p-1.5 text-right font-bold", priceColor)}>
                                            {tx.price < 0.0001 ? tx.price.toExponential(4) : tx.price.toFixed(8)}
                                        </td>
                                        <td className="p-1.5 text-right">
                                            <a
                                                href={tx.network === 'solana' ? `https://solscan.io/account/${tx.maker}` : `https://etherscan.io/address/${tx.maker}`}
                                                target="_blank"
                                                className="text-[#2962ff] hover:underline"
                                            >
                                                {tx.maker?.substring(0, 4)}...{tx.maker?.substring(tx.maker.length - 4)} <span className="text-gray-600 ml-1">▼</span>
                                            </a >
                                        </td >
                                        <td className="p-1.5 text-right pr-4">
                                            <a href={tx.network === 'solana' ? `https://solscan.io/tx/${tx.hash}` : `https://etherscan.io/tx/${tx.hash}`} target="_blank">
                                                <ExternalLink size={10} className="text-gray-600 hover:text-white ml-auto" />
                                            </a>
                                        </td>
                                    </tr >
                                );
                            })}
                        </tbody >
                    </table >
                );
            case 'Top Traders':
                return (
                    <div className="flex flex-col p-4 gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="flex items-center justify-between border-b border-white/5 pb-2">
                            <div className="flex items-center gap-2 text-terminal-mint">
                                <TrendingUp size={16} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Smart Money Entities</span>
                            </div>
                            <span className="text-[9px] text-gray-500 italic">Tracking ROI &gt; 500%</span>
                        </div>
                        <div className="grid gap-2">
                            {[
                                { address: '0x8a...f3e2', roi: '1,420%', pnl: '+$42.5K', status: 'Whale' },
                                { address: '7zW...9k2a', roi: '840%', pnl: '+$12.1K', status: 'KOL' },
                                { address: '0x21...a1b2', roi: '520%', pnl: '+$8.3K', status: 'Farmer' },
                                { address: '4mR...v90p', roi: '480%', pnl: '+$5.4K', status: 'Degen' }
                            ].map((trader, i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/[0.05] rounded-[3px] hover:bg-white/[0.05] transition-all">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-terminal-mint/10 flex items-center justify-center text-terminal-mint border border-terminal-mint/20">
                                            <User size={14} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-mono text-blue-400 font-bold">{trader.address}</span>
                                            <span className="text-[8px] text-gray-600 font-black uppercase">{trader.status}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-[10px] text-terminal-mint font-black">{trader.roi} ROI</span>
                                        <span className="text-[10px] text-white font-mono">{trader.pnl}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 'Holders':
                return (
                    <div className="p-4 flex flex-col gap-4 animate-in fade-in duration-300">
                        <div className="flex items-center gap-2 text-terminal-mint border-b border-white/5 pb-2">
                            <Wallet size={16} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Token Distribution</span>
                        </div>
                        <div className="space-y-2">
                            {[
                                { label: 'Dex Liquidity', pct: '45.2%', val: '452,000,000', color: 'bg-terminal-mint' },
                                { label: 'Top 10 Holders', pct: '12.8%', val: '128,000,000', color: 'bg-blue-500' },
                                { label: 'Retail', pct: '42.0%', val: '420,000,000', color: 'bg-gray-700' }
                            ].map((h, i) => (
                                <div key={i} className="bg-white/[0.02] p-3 rounded-[3px] border border-white/5 group hover:border-terminal-mint/30 transition-all">
                                    <div className="flex justify-between mb-2">
                                        <span className="text-[10px] font-black text-gray-400 uppercase">{h.label}</span>
                                        <span className="text-[10px] font-black text-white">{h.pct}</span>
                                    </div>
                                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                        <div className={cn("h-full transition-all duration-1000", h.color)} style={{ width: h.pct }} />
                                    </div>
                                    <div className="mt-2 text-[8px] text-gray-600 font-mono text-right">{h.val} {symbol}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 'Flows':
                return (
                    <div className="p-4 flex flex-col gap-4 animate-in fade-in duration-300">
                        <div className="flex items-center gap-2 text-terminal-mint border-b border-white/5 pb-2">
                            <BarChart2 size={16} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Net Capital Flow (24H)</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-terminal-mint/[0.03] border border-terminal-mint/10 p-4 rounded-[4px] flex flex-col items-center">
                                <span className="text-[10px] text-terminal-mint font-black uppercase mb-1">Net Inflow</span>
                                <span className="text-xl font-black text-white font-mono">+$242.5K</span>
                            </div>
                            <div className="bg-terminal-red/[0.03] border border-terminal-red/10 p-4 rounded-[4px] flex flex-col items-center">
                                <span className="text-[10px] text-terminal-red font-black uppercase mb-1">Sell Pressure</span>
                                <span className="text-xl font-black text-white font-mono">-$12.1K</span>
                            </div>
                        </div>
                        <div className="bg-white/[0.02] p-4 rounded-[4px] border border-white/5">
                            <span className="text-[9px] text-gray-500 font-black uppercase mb-2 block">Pressure Heatmap</span>
                            <div className="h-12 bg-gradient-to-r from-terminal-mint/20 via-terminal-mint/50 to-terminal-red/10 rounded-[2px] relative overflow-hidden">
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-[8px] font-black text-white tracking-[0.5em] uppercase opacity-50">Accumulation Zone</span>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            default:
                return <div className="p-10 text-center text-gray-600 font-mono text-[9px] uppercase tracking-widest italic opacity-50">[ Module in development ]</div>;
        }
    };

    return (
        <div className="flex-1 bg-[#050505] flex flex-col min-h-0 select-none">
            {/* Professional Tabs Layer */}
            <div className="flex items-center justify-between px-3 h-8 border-b border-white/[0.03] bg-[#0a0a0a]">
                <div className="flex items-center gap-5 h-full">
                    {['Live Stream', 'Top Traders', 'Holders', 'Flows'].map(tab => (
                        <div
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className="relative h-full flex items-center px-1 group cursor-pointer"
                        >
                            <span className={cn(
                                "text-[9px] font-black uppercase tracking-widest transition-all",
                                activeTab === tab ? "text-terminal-mint" : "text-gray-600 group-hover:text-gray-300"
                            )}>
                                {tab}
                            </span>
                            {activeTab === tab && (
                                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-terminal-mint shadow-glow-small" />
                            )}
                        </div>
                    ))}
                </div>
                <div className="flex items-center gap-3">
                    {isLoading && <Loader2 size={10} className="animate-spin text-terminal-mint" />}
                    <div className="flex items-center gap-1.5 bg-terminal-mint/5 px-2 py-0.5 rounded-full border border-terminal-mint/10">
                        <div className="w-1.5 h-1.5 rounded-full bg-terminal-mint animate-pulse" />
                        <span className="text-[8px] text-terminal-mint font-black uppercase">Realtime Sync</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar relative">
                {renderContent()}
            </div>
        </div>
    );
}

function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(' ');
}
