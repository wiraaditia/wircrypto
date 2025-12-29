"use client";

import React, { useState } from 'react';
import {
    Twitter,
    MessageCircle,
    Globe,
    ExternalLink,
    ShieldAlert,
    CheckCircle2,
    Zap,
    Copy,
    Check,
    ShieldCheck,
    BarChart3,
    AlertTriangle
} from 'lucide-react';

interface TokenDetailSidebarProps {
    pool: any;
    security: any;
}

export default function TokenDetailSidebar({ pool, security }: TokenDetailSidebarProps) {
    const [copied, setCopied] = useState(false);

    if (!pool) return (
        <div className="w-[340px] border-l border-[#2a2e39] bg-[#111216] p-6 flex flex-col items-center justify-center text-center gap-4 animate-in fade-in duration-700">
            <div className="w-16 h-16 rounded-full bg-[#1b1d24] flex items-center justify-center border border-white/5 shadow-inner">
                <BarChart3 size={32} className="text-gray-700" />
            </div>
            <p className="text-[11px] text-gray-500 font-bold uppercase tracking-widest italic leading-relaxed">
                Select a token to view<br />market intelligence
            </p>
        </div>
    );

    const fdv = pool.market_cap_usd || (pool.price_usd * 1000000);
    const mcap = fdv; // DexScreener often shows same for fully circulating

    // Calculate format for large numbers
    const formatKMB = (num: number) => {
        if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `$${(num / 1000).toFixed(1)}K`;
        return `$${num.toFixed(0)}`;
    };

    const copyToClipboard = () => {
        if (pool.address) {
            navigator.clipboard.writeText(pool.address);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="w-full h-full bg-[#111216] flex flex-col overflow-y-auto scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent select-none font-sans">
            {/* 1:1 Banner Header */}
            <div className="relative h-24 overflow-hidden">
                {/* Blurred Banner Background */}
                <div
                    className="absolute inset-0 bg-cover bg-center blur-sm opacity-30"
                    style={{ backgroundImage: `url(${pool.image_url})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#111216] to-transparent" />

                <div className="absolute bottom-3 left-4 flex flex-col z-10">
                    <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                        {pool.symbol} / {pool.network === 'solana' ? 'SOL' : 'WETH'}
                        <span className="text-gray-600">•</span>
                        <span className="text-gray-500">12m ago</span>
                    </span>
                </div>
            </div>

            {/* Token Info & Socials */}
            <div className="px-4 mt-2 relative z-20 flex justify-between items-end mb-4">
                <div className="flex items-end gap-3 w-full">
                    <div className="w-14 h-14 rounded-lg bg-[#1b1d24] border-2 border-[#2a2e39] overflow-hidden shadow-2xl relative group flex-shrink-0">
                        {pool.image_url ? (
                            <img src={pool.image_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-lg font-black bg-terminal-mint/10 text-terminal-mint">
                                {pool.symbol[0]}
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col mb-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                            <h2 className="text-[18px] font-black text-white leading-none tracking-tight truncate">{pool.name}</h2>
                            <button
                                onClick={copyToClipboard}
                                className="flex items-center gap-1 px-1.5 py-0.5 bg-[#2a2e39] hover:bg-[#3fac9e] hover:text-black rounded-[2px] text-[8px] text-gray-400 transition-all border border-white/5 active:scale-95"
                                title="Copy Contract Address"
                            >
                                {copied ? <Check size={10} /> : <Copy size={10} />}
                                <span className="font-mono">{pool.address.slice(0, 4)}...{pool.address.slice(-4)}</span>
                            </button>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                            {/* Socials Row */}
                            <div className="flex bg-[#2a2e39] rounded px-1 py-0.5 gap-0.5">
                                <SocialIcon href={pool.website} icon={<Globe size={10} />} label="Website" />
                                <SocialIcon href={pool.twitter ? `https://twitter.com/${pool.twitter}` : null} icon={<Twitter size={10} />} label="Twitter" />
                                <SocialIcon href={pool.telegram} icon={<MessageCircle size={10} />} label="Telegram" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Stats Grid - Improved spacing */}
            <div className="px-3 mb-3">
                <div className="grid grid-cols-2 gap-0.5 bg-[#2a2e39] border border-[#2a2e39] rounded overflow-hidden">
                    {/* Row 1 */}
                    <div className="bg-[#111216] p-2.5 flex flex-col justify-center">
                        <span className="text-[9px] text-gray-500 font-bold uppercase mb-0.5">PRICE USD</span>
                        <span className="text-[13px] text-terminal-mint font-bold font-mono">
                            ${pool.price_usd < 0.000001 ? pool.price_usd.toExponential(4) : pool.price_usd.toFixed(8)}
                        </span>
                    </div>
                    <div className="bg-[#111216] p-2.5 flex flex-col justify-center">
                        <span className="text-[9px] text-gray-500 font-bold uppercase mb-0.5">PRICE {pool.network === 'solana' ? 'SOL' : 'ETH'}</span>
                        <span className="text-[13px] text-white font-bold font-mono">
                            {(pool.price_usd / 145).toFixed(9)}
                        </span>
                    </div>

                    {/* Row 2 */}
                    <div className="bg-[#111216] p-2.5 flex flex-col justify-center">
                        <span className="text-[9px] text-gray-500 font-bold uppercase mb-0.5">LIQUIDITY</span>
                        <span className="text-[13px] text-white font-bold font-mono">{formatKMB(pool.reserve_usd)}</span>
                    </div>
                    <div className="bg-[#111216] p-2.5 flex flex-col justify-center">
                        <span className="text-[9px] text-gray-500 font-bold uppercase mb-0.5">FDV</span>
                        <span className="text-[13px] text-white font-bold font-mono">{formatKMB(fdv)}</span>
                    </div>

                    {/* Row 3 */}
                    <div className="bg-[#111216] p-2.5 flex flex-col justify-center col-span-2">
                        <span className="text-[9px] text-gray-500 font-bold uppercase mb-1">MKT CAP</span>
                        <span className="text-[16px] text-white font-black font-mono tracking-tight">{formatKMB(mcap)}</span>
                    </div>
                </div>
            </div>

            {/* Change Grid */}
            <div className="px-2 mb-4">
                <div className="grid grid-cols-4 gap-px bg-[#2a2e39] border border-[#2a2e39] rounded overflow-hidden text-center">
                    <ChangeBox label="5M" val="+2.43%" color="text-terminal-mint" />
                    <ChangeBox label="1H" val="-5.03%" color="text-terminal-red" />
                    <ChangeBox label="6H" val="+55.3%" color="text-terminal-mint" />
                    <ChangeBox label="24H" val="+104%" color="text-terminal-mint" />
                </div>
            </div>

            {/* Volume / Txns / Makers Summary Table */}
            <div className="px-3 mb-4">
                <table className="w-full text-[10px]">
                    <thead>
                        <tr className="text-gray-500 border-b border-[#2a2e39]">
                            <th className="pb-1 text-left font-normal pl-1">TXNS</th>
                            <th className="pb-1 text-right font-normal">BUYS</th>
                            <th className="pb-1 text-right font-normal pr-1">SELLS</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="text-white border-b border-[#2a2e39]">
                            <td className="py-1.5 pl-1 font-bold">12,625</td>
                            <td className="py-1.5 text-right font-bold text-gray-300">9,334</td>
                            <td className="py-1.5 text-right font-bold text-gray-300 pr-1">3,291</td>
                        </tr>
                        <tr className="text-gray-500 border-b border-[#2a2e39]">
                            <th className="py-1 pt-2 text-left font-normal pl-1">VOLUME</th>
                            <th className="py-1 pt-2 text-right font-normal">BUY VOL</th>
                            <th className="py-1 pt-2 text-right font-normal pr-1">SELL VOL</th>
                        </tr>
                        <tr className="text-white border-b border-[#2a2e39]">
                            <td className="py-1.5 pl-1 font-bold text-terminal-mint">$383K</td>
                            <td className="py-1.5 text-right font-bold text-terminal-mint">$195K</td>
                            <td className="py-1.5 text-right font-bold text-terminal-red pr-1">$188K</td>
                        </tr>
                        <tr className="text-gray-500">
                            <th className="py-1 pt-2 text-left font-normal pl-1">MAKERS</th>
                            <th className="py-1 pt-2 text-right font-normal">BUYERS</th>
                            <th className="py-1 pt-2 text-right font-normal pr-1">SELLERS</th>
                        </tr>
                        <tr className="text-white">
                            <td className="py-1 pl-1 font-bold">9,132</td>
                            <td className="py-1 text-right font-bold text-gray-300">8,345</td>
                            <td className="py-1 text-right font-bold text-gray-300 pr-1">2,790</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Actions */}
            <div className="px-2 mt-auto pb-4 gap-2 flex flex-col">
                <div className="flex gap-2">
                    <button className="flex-1 py-1.5 bg-[#2a2e39] hover:bg-[#363a45] text-white text-[10px] font-bold rounded flex items-center justify-center gap-1 transition-colors">
                        <ShieldCheck size={12} /> Watchlist
                    </button>
                    <button className="flex-1 py-1.5 bg-[#2a2e39] hover:bg-[#363a45] text-white text-[10px] font-bold rounded flex items-center justify-center gap-1 transition-colors">
                        <AlertTriangle size={12} /> Alerts
                    </button>
                </div>

                {/* 1:1 Buy/Sell Buttons */}
                <div className="h-28 bg-[#1e2025] rounded-lg p-3 flex flex-col items-center justify-center gap-2 border border-[#2a2e39] relative overflow-hidden group">
                    {/* Fake 'Flush' Ad/Button from screenshot */}
                    <div className="flex items-center gap-2 text-white font-black text-xl italic z-10">
                        <Zap size={24} className="text-white" fill="white" /> Flush
                    </div>
                    <span className="text-[9px] text-gray-400 z-10 text-center">INSTANT WITHDRAWALS<br />CASINO, SPORTS, VPN FRIENDLY</span>

                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-600 opacity-20 group-hover:opacity-30 transition-opacity" />
                </div>
            </div>
        </div>
    );
}

function SocialIcon({ href, icon, label }: { href?: string | null, icon: React.ReactNode, label: string }) {
    if (!href) return <div className="p-1 px-1.5 text-gray-600 cursor-not-allowed opacity-50">{icon}</div>;
    return (
        <a href={href} target="_blank" className="p-1 px-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors" title={label}>
            {icon}
        </a>
    );
}

function ChangeBox({ label, val, color }: { label: string, val: string, color: string }) {
    return (
        <div className="bg-[#111216] py-1.5 flex flex-col">
            <span className="text-[8px] text-gray-500 font-bold">{label}</span>
            <span className={`text-[10px] font-bold ${color}`}>{val}</span>
        </div>
    );
}

function SocialButton({ href, icon }: { href?: string | null, icon: React.ReactNode }) {
    if (!href) return <div className="flex-1 h-7 rounded-[3px] bg-white/[0.02] flex items-center justify-center border border-white/5 grayscale opacity-20 cursor-not-allowed">{icon}</div>;
    return (
        <a href={href} target="_blank" className="flex-1 h-7 rounded-[3px] bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all border border-white/5 text-gray-400 hover:text-white active:scale-95">
            {icon}
        </a>
    );
}

function MetricItem({ label, value }: { label: string, value: string }) {
    return (
        <div>
            <div className="text-[8px] text-gray-600 font-black uppercase mb-0.5 tracking-widest">{label}</div>
            <div className="text-[11px] font-mono font-black text-white tracking-tighter">{value}</div>
        </div>
    );
}

function PerfBox({ label, val, up = false }: { label: string, val: string, up?: boolean }) {
    return (
        <div className="bg-white/[0.01] p-2 rounded-[2px] border border-white/[0.03] flex flex-col items-center hover:bg-white/[0.03] transition-colors">
            <span className="text-[7px] text-gray-600 font-black mb-1 tracking-widest">{label}</span>
            <span className={cn("text-[9px] font-black font-mono", up ? 'text-terminal-mint' : 'text-terminal-red')}>
                {val}
            </span>
        </div>
    );
}

function AuditRow({ label, status, success = false }: { label: string, status: string, success?: boolean }) {
    return (
        <div className="flex justify-between items-center bg-black/20 p-2 rounded-[3px] border border-white/[0.02] hover:border-white/10 transition-colors">
            <span className="text-[9px] text-gray-500 font-bold tracking-tight">{label}</span>
            <div className="flex items-center gap-1.5">
                {success ? <CheckCircle2 size={10} className="text-terminal-mint" /> : <ShieldAlert size={10} className="text-terminal-red" />}
                <span className={cn("text-[9px] font-black tracking-widest", success ? "text-terminal-mint" : "text-terminal-red")}>
                    {status}
                </span>
            </div>
        </div>
    );
}

function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(' ');
}
