"use client";

import React, { useState, useEffect } from 'react';
import {
    LayoutDashboard,
    Search,
    Zap,
    ShieldCheck,
    Bell,
    Settings,
    BarChart3,
    Activity,
    ArrowUpRight,
    ArrowDownRight,
    Wifi,
    Cpu
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export default function TerminalDashboard({ children }: { children: React.ReactNode }) {
    const [mounted, setMounted] = useState(false);
    const [currentTime, setCurrentTime] = useState("");
    const [activeNav, setActiveNav] = useState('dashboard');

    useEffect(() => {
        setMounted(true);
        const timer = setInterval(() => {
            setCurrentTime(new Date().toLocaleTimeString([], { hour12: false }));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const sidebarItems = [
        { id: 'dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
        { id: 'search', icon: <Search size={20} />, label: 'Deep Search' },
        { id: 'activity', icon: <Activity size={20} />, label: 'Live Signal' },
        { id: 'chart', icon: <BarChart3 size={20} />, label: 'Market Chart' },
        { id: 'alerts', icon: <Bell size={20} />, label: 'Trading Alerts' },
    ];

    const bottomItems = [
        { id: 'security', icon: <ShieldCheck size={20} />, label: 'Security Audit' },
        { id: 'settings', icon: <Settings size={20} />, label: 'Terminal Config' },
    ];

    const handleNavClick = (id: string) => {
        setActiveNav(id);
        if (id === 'search') {
            const input = document.getElementById('terminal-search-input');
            if (input) {
                input.focus();
                // Select all text if any
                (input as HTMLInputElement).select();
            }
        }
    };

    return (
        <div className="flex h-screen w-full bg-terminal-black text-foreground overflow-hidden font-mono text-xs">
            {/* Sidebar */}
            <aside className="w-12 flex flex-col items-center py-4 border-r border-terminal-border bg-terminal-charcoal z-50 shrink-0">
                <div className="mb-8 p-1">
                    <img src="/logo-eye.png" alt="Wircrypto" className="w-8 h-8 object-contain drop-shadow-glow" />
                </div>
                <nav className="flex flex-col gap-6 flex-1">
                    {sidebarItems.map((item) => (
                        <SidebarIcon
                            key={item.id}
                            icon={item.icon}
                            active={activeNav === item.id}
                            label={item.label}
                            onClick={() => handleNavClick(item.id)}
                        />
                    ))}
                </nav>
                <div className="mt-auto flex flex-col gap-6">
                    {bottomItems.map((item) => (
                        <SidebarIcon
                            key={item.id}
                            icon={item.icon}
                            active={activeNav === item.id}
                            label={item.label}
                            onClick={() => handleNavClick(item.id)}
                        />
                    ))}
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col relative min-w-0 min-h-0">
                {/* Top Header / Ticker */}
                {/* DexScreener 1:1 Header */}
                <header className="flex flex-col z-40 shadow-xl">
                    {/* Top Scrolling Ticker - Enhanced visibility */}
                    <div className="h-7 flex-none shrink-0 bg-[#0e0f14] border-b border-[#2a2e39] flex items-center overflow-hidden whitespace-nowrap relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-[#0e0f14] via-transparent to-[#0e0f14] pointer-events-none z-10" />
                        <div className="flex items-center gap-6 animate-marquee text-[10px] font-bold">
                            {[...Array(2)].map((_, setIndex) => (
                                <React.Fragment key={setIndex}>
                                    {[
                                        { i: 1, n: 'CoinCasino', p: '+340%', hot: true },
                                        { i: 2, n: 'SilverWhale', p: '+124%', hot: true },
                                        { i: 3, n: 'RUGPROOF', p: '+100%', hot: true },
                                        { i: 4, n: 'HACHI', p: '-11%', hot: false },
                                        { i: 5, n: 'BlackWhale', p: '+87%', hot: true },
                                        { i: 6, n: 'learing', p: '+34%', hot: true },
                                        { i: 7, n: 'VIBRA', p: '+210%', hot: true },
                                        { i: 8, n: 'CATWIF', p: '-5%', hot: false },
                                        { i: 9, n: 'PEPE', p: '+12%', hot: true },
                                        { i: 10, n: 'SOL', p: '+4.2%', hot: true },
                                    ].map((coin) => (
                                        <div key={`${setIndex}-${coin.n}`} className="flex items-center gap-2 pr-6">
                                            <span className="text-gray-600">#{coin.i}</span>
                                            <span className="text-white">{coin.n}</span>
                                            <span className={coin.hot ? "text-terminal-mint font-mono" : "text-terminal-red font-mono"}>{coin.p}</span>
                                            {coin.hot && <span className="w-1.5 h-1.5 rounded-full bg-terminal-mint animate-pulse" />}
                                        </div>
                                    ))}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>

                    {/* Main Nav Bar */}
                    <div className="h-12 flex-none shrink-0 bg-[#1b1d24] border-b border-[#2a2e39] flex items-center justify-between px-4">
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-terminal-mint/5 rounded-lg flex items-center justify-center border border-terminal-mint/20 overflow-hidden">
                                    <img src="/logo-eye.png" alt="Wircrypto" className="w-full h-full object-cover" />
                                </div>
                                <div className="flex flex-col leading-none">
                                    <span className="font-black text-[14px] text-white tracking-tight">WIRCRYPTO</span>
                                    <span className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">Terminal</span>
                                </div>
                            </div>

                            <div className="h-6 w-[1px] bg-[#2a2e39]" />

                            <div className="relative w-80 group">
                                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                    <Search size={14} className="text-gray-500 group-focus-within:text-terminal-mint transition-colors" />
                                </div>
                                <input
                                    id="terminal-search-input"
                                    type="text"
                                    className="w-full h-9 bg-[#111216] border border-[#2a2e39] rounded-md pl-9 pr-3 text-[12px] text-gray-200 focus:border-terminal-mint/50 focus:ring-1 focus:ring-terminal-mint/20 focus:outline-none transition-all placeholder:text-gray-600"
                                    placeholder="Search for token, pair, or address..."
                                />
                                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                                    <span className="text-[10px] text-gray-600 px-1.5 py-0.5 border border-[#2a2e39] rounded bg-[#18191e]">/</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex flex-col items-end leading-none">
                                {mounted ? (
                                    <span suppressHydrationWarning className="text-[12px] text-gray-300 font-bold font-mono tracking-wide">{currentTime}</span>
                                ) : (
                                    <span className="text-[12px] text-transparent font-mono">00:00:00</span>
                                )}
                                <span className="text-[9px] text-gray-600 font-bold uppercase tracking-wider flex items-center gap-1.5 mt-0.5">
                                    <span className="w-1.5 h-1.5 bg-terminal-mint rounded-full" />
                                    Solana Mainnet
                                </span>
                            </div>

                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 border border-white/10 flex items-center justify-center hover:border-terminal-mint/50 cursor-pointer transition-all">
                                <div className="w-8 h-8 rounded-full bg-[#111] flex items-center justify-center">
                                    <div className="w-2 h-2 bg-terminal-mint rounded-full animate-pulse" />
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Dashboard Panels */}
                <main className="flex-1 overflow-hidden relative min-h-0">
                    {children}

                    {/* Active Module Indicator Overlay (Briefly shown when switching) */}
                    {activeNav !== 'dashboard' && (
                        <div className="absolute top-2 right-2 bg-terminal-mint/10 border border-terminal-mint/30 px-3 py-1 rounded-sm z-50 pointer-events-none animate-in fade-out slide-out-to-right-4 duration-1000 fill-mode-forwards">
                            <span className="text-[9px] text-terminal-mint font-black uppercase tracking-widest">NAVIGATING TO {activeNav.toUpperCase()}...</span>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}

function SidebarIcon({ icon, active = false, label, onClick }: { icon: React.ReactNode, active?: boolean, label: string, onClick: () => void }) {
    return (
        <div
            onClick={onClick}
            className={cn(
                "p-2.5 cursor-pointer transition-all duration-200 rounded-[4px] relative group",
                active ? "text-terminal-mint bg-terminal-mint/5" : "text-gray-600 hover:text-white hover:bg-white/[0.03]"
            )}
            title={label}
        >
            {icon}
            {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-terminal-mint shadow-glow" />}

            {/* Tooltip on hover */}
            <div className="absolute left-14 top-1/2 -translate-y-1/2 bg-[#111] border border-white/10 px-2 py-1 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-[100] pointer-events-none shadow-2xl">
                <span className="text-[9px] font-black text-white uppercase tracking-widest">{label}</span>
            </div>
        </div>
    );
}

function TickerItem({ label, price, change, positive = false }: { label: string, price: string, change: string, positive?: boolean }) {
    return (
        <div className="flex items-center gap-2 bg-white/[0.02] px-2 py-0.5 rounded-[2px] border border-white/[0.05] hover:border-white/10 transition-colors cursor-default">
            <span className="text-gray-500 font-black text-[9px]">{label}</span>
            <span className="text-white font-bold">{price}</span>
            <span className={cn(
                "flex items-center gap-0.5 text-[9px] font-black",
                positive ? "text-terminal-mint" : "text-terminal-red"
            )}>
                {positive ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                {change}
            </span>
        </div>
    );
}
