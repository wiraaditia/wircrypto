"use client";

import React, { useState, useEffect } from 'react';
import { useCryptoScanner } from '@/hooks/useCryptoScanner';
import { useTokenSecurity } from '@/hooks/useTokenSecurity';
import TradingChart from '@/components/TradingChart';
import ScannerTable from '@/components/ScannerTable';
import TokenDetailSidebar from '@/components/TokenDetailSidebar';
import TransactionsTable from '@/components/TransactionsTable';
import FilterSettings from '@/components/FilterSettings';
import TerminalConsole from '@/components/TerminalConsole';
import { fetchTokenData, calculateHypeScore } from '@/lib/crypto-logic';
import { Shield, Zap, Star, Search as SearchIcon, Loader2, Settings } from 'lucide-react';

function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(' ');
}

interface Pool {
    id: string;
    address: string;
    symbol: string;
    name: string;
    price_usd: number;
    reserve_usd: number;
    market_cap_usd: number;
    created_at: string;
    network?: string;
    hypeScore?: number;
    twitter?: string;
    telegram?: string;
    website?: string;
    image_url?: string;
}

export default function TerminalMain() {
    const [selectedNetwork, setSelectedNetwork] = useState('solana');
    const [view, setView] = useState<'scanner' | 'watchlist'>('scanner');
    const [watchlist, setWatchlist] = useState<Pool[]>([]);
    const [selectedPool, setSelectedPool] = useState<Pool | null>(null);

    const [filters, setFilters] = useState({
        minLiquidity: 5000,
        minVolMcRatio: 0.15,
        minTx1h: 50
    });
    const [showFilters, setShowFilters] = useState(false);

    // Sidebar collapse state
    const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(false);
    const [rightSidebarVisible, setRightSidebarVisible] = useState(typeof window !== 'undefined' ? window.innerWidth >= 1440 : true);

    // Monitor screen size for right sidebar
    useEffect(() => {
        const handleResize = () => {
            setRightSidebarVisible(window.innerWidth >= 1440);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const { pools, isLoading } = useCryptoScanner(selectedNetwork, filters);

    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    const { security, isLoading: isSecLoading } = useTokenSecurity(
        selectedPool ? (selectedPool.network || selectedNetwork) : null,
        selectedPool?.address || null
    );

    const networks = [
        { id: 'solana', name: 'SOLANA' },
        { id: 'base', name: 'BASE' },
        { id: 'eth', name: 'ETHEREUM' },
        { id: 'bsc', name: 'BSC' },
        { id: 'polygon_pos', name: 'POLYGON' },
        { id: 'arbitrum', name: 'ARBITRUM' },
        { id: 'avax', name: 'AVALANCHE' }
    ];

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery) return;

        setIsSearching(true);
        const data = await fetchTokenData(selectedNetwork, searchQuery);
        if (data) {
            const hype = calculateHypeScore(data as any);
            setSelectedPool({ ...data, hypeScore: hype, network: selectedNetwork });
        } else {
            alert("Token not found on this network. Please check the address and network.");
        }
        setIsSearching(false);
    };

    useEffect(() => {
        const savedWatchlist = localStorage.getItem('wircrypto_watchlist');
        if (savedWatchlist) setWatchlist(JSON.parse(savedWatchlist));

        const savedFilters = localStorage.getItem('wircrypto_filters');
        if (savedFilters) setFilters(JSON.parse(savedFilters));
    }, []);

    const updateFilters = (newFilters: any) => {
        setFilters(newFilters);
        localStorage.setItem('wircrypto_filters', JSON.stringify(newFilters));
    };

    const toggleWatchlist = (e: React.MouseEvent, pool: Pool) => {
        e.stopPropagation();
        const exists = watchlist.find(item => item.id === pool.id);
        let updated;
        if (exists) {
            updated = watchlist.filter(item => item.id !== pool.id);
        } else {
            updated = [...watchlist, { ...pool, network: pool.network || selectedNetwork }];
        }
        setWatchlist(updated);
        localStorage.setItem('wircrypto_watchlist', JSON.stringify(updated));
    };

    const filteredScannerPools = pools.filter(p =>
        p.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.address.toLowerCase() === searchQuery.toLowerCase()
    );

    const displayedPools = view === 'scanner' ? filteredScannerPools : watchlist;

    return (
        <div className="flex h-full flex-col relative bg-[#050505] min-h-0">
            {showFilters && (
                <FilterSettings
                    filters={filters}
                    onUpdate={updateFilters}
                    onClose={() => setShowFilters(false)}
                />
            )}

            <div className="flex flex-1 overflow-hidden relative gap-2 min-h-0">
                {/* 1. LEFT PANEL: SCANNER - Chart-First Design: 280px fixed, collapsible */}
                <div className={cn(
                    "hidden lg:flex border-r border-white/5 flex-col bg-[#0a0a0a] z-20 shrink-0 transition-all duration-300 min-h-0",
                    leftSidebarCollapsed ? "w-[60px]" : "w-[280px]"
                )}>
                    <div className="p-2 border-b border-white/5 bg-[#0d0d0d] flex justify-between items-center h-10 flex-none shrink-0">
                        {!leftSidebarCollapsed && (
                            <>
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => setView('scanner')}
                                        className={cn(
                                            "px-2 py-1 text-[9px] rounded-[3px] transition-all flex items-center gap-1 font-black tracking-tighter",
                                            view === 'scanner' ? "bg-terminal-mint text-black" : "text-gray-500 hover:text-white"
                                        )}
                                    >
                                        <Zap size={10} /> SCANNER
                                    </button>
                                    <button
                                        onClick={() => setView('watchlist')}
                                        className={cn(
                                            "px-2 py-1 text-[9px] rounded-[3px] transition-all flex items-center gap-1 font-black tracking-tighter",
                                            view === 'watchlist' ? "bg-terminal-mint text-black" : "text-gray-500 hover:text-white"
                                        )}
                                    >
                                        <Star size={10} /> WATCHLIST
                                    </button>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => setShowFilters(true)}
                                        className="p-1 hover:text-terminal-mint transition-colors text-gray-600"
                                    >
                                        <Settings size={12} />
                                    </button>
                                </div>
                            </>
                        )}
                        <button
                            onClick={() => setLeftSidebarCollapsed(!leftSidebarCollapsed)}
                            className="p-1 hover:text-terminal-mint transition-colors text-gray-600 ml-auto"
                            title={leftSidebarCollapsed ? "Expand" : "Collapse"}
                        >
                            {leftSidebarCollapsed ? '→' : '←'}
                        </button>
                    </div>

                    {!leftSidebarCollapsed && (
                        <div className="p-2 border-b border-white/5 bg-[#0a0a0a] flex-none shrink-0">
                            {view === 'scanner' && (
                                <div className="flex gap-1 overflow-x-auto no-scrollbar mb-2">
                                    {networks.map(net => (
                                        <button
                                            key={net.id}
                                            onClick={() => {
                                                setSelectedNetwork(net.id);
                                                setSelectedPool(null);
                                            }}
                                            className={cn(
                                                "px-1.5 py-0.5 text-[8px] border rounded-[2px] transition-all whitespace-nowrap font-black tracking-tighter",
                                                selectedNetwork === net.id
                                                    ? "border-terminal-mint text-terminal-mint bg-terminal-mint/5"
                                                    : "border-white/5 text-gray-600 hover:border-gray-600 hover:text-gray-300"
                                            )}
                                        >
                                            {net.name}
                                        </button>
                                    ))}
                                </div>
                            )}

                            <form onSubmit={handleSearch} className="relative group">
                                <input
                                    id="terminal-search-input"
                                    type="text"
                                    placeholder="Paste CA..."
                                    className="w-full bg-[#111] border border-white/5 text-[9px] px-2 py-1.5 focus:outline-none focus:border-terminal-mint/50 pr-8 font-mono transition-all rounded-[3px] placeholder:text-gray-700"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600 group-hover:text-terminal-mint transition-colors">
                                    {isSearching ? <Loader2 size={11} className="animate-spin" /> : <SearchIcon size={11} />}
                                </button>
                            </form>
                        </div>
                    )}

                    <div className="flex-1 overflow-hidden flex flex-col">
                        <ScannerTable
                            pools={displayedPools.map((p: Pool) => ({
                                ...p,
                                symbol: (
                                    <div className="flex items-center gap-2">
                                        <Star
                                            size={12}
                                            className={cn(
                                                "cursor-pointer transition-colors",
                                                watchlist.find(w => w.id === p.id) ? "text-yellow-500 fill-yellow-500" : "text-gray-700 hover:text-gray-400"
                                            )}
                                            onClick={(e) => toggleWatchlist(e, p)}
                                        />
                                        {p.symbol}
                                    </div>
                                )
                            }))}
                            isLoading={isLoading && view === 'scanner'}
                            selectedPoolId={selectedPool?.id || null}
                            onSelectPool={setSelectedPool}
                            networkName={selectedNetwork}
                        />

                        {/* DEGEN MODE Mini Baner */}
                        <div
                            onClick={() => {
                                const degenFilters = { minLiquidity: 1000, minVolMcRatio: 0, minTx1h: 5 };
                                setFilters(degenFilters);
                                localStorage.setItem('wircrypto_filters', JSON.stringify(degenFilters));
                            }}
                            className="p-3 bg-terminal-red/10 border-t border-white/5 cursor-pointer hover:bg-terminal-red/15 transition-all group flex items-center justify-between"
                        >
                            <span className="text-[10px] font-black text-terminal-red italic tracking-widest uppercase">Unleash Degen Mode</span>
                            <Zap size={12} className="text-terminal-red group-hover:animate-bounce" />
                        </div>
                    </div>
                </div>

                {/* 2. CENTER PANEL: CHART-FIRST DESIGN */}
                <div className="flex-1 flex flex-col bg-terminal-black min-w-0 relative z-10 gap-2 min-h-0">
                    {/* Chart Area: flex-1 with min-height 60vh for optimal display */}
                    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                        <TradingChart
                            symbol={selectedPool?.symbol || 'SELECT ASSET'}
                            network={selectedPool?.network || selectedNetwork}
                            address={selectedPool?.address}
                            dex={selectedPool?.network === 'solana' ? 'Raydium' : 'Uniswap'}
                            poolMarketCap={selectedPool?.market_cap_usd}
                            poolPrice={selectedPool?.price_usd}
                        />
                    </div>

                    {/* Panel Bawah: Fixed 300px dengan overflow scroll */}
                    <div className="h-[300px] flex-none flex flex-col bg-[#0d0d0d] overflow-hidden shrink-0">
                        <TransactionsTable
                            symbol={selectedPool?.symbol || ''}
                            network={selectedPool?.network || selectedNetwork}
                            address={selectedPool?.address}
                            solPrice={selectedPool?.network === 'solana' && selectedPool?.price_usd ? selectedPool.price_usd / (selectedPool.price_usd / 152) : 152}
                        />
                    </div>
                </div>

                {/* 3. RIGHT PANEL: TOKEN DETAIL - 320px, hidden below 1440px */}
                {rightSidebarVisible && (
                    <div className="w-[320px] min-w-[320px] flex-none z-20 h-full border-l border-white/5 bg-[#0a0a0a] shrink-0 min-h-0">
                        <TokenDetailSidebar
                            pool={selectedPool}
                            security={security}
                        />
                    </div>
                )}
            </div>

            {/* Professional Console Area - Compact edge-to-edge */}
            <div className="h-20 flex-none shrink-0">
                <TerminalConsole pools={pools} networkName={selectedNetwork} />
            </div>

            {/* Minimal Footer - Edge-to-edge */}
            <div className="h-5 flex-none shrink-0 bg-[#050505] border-t border-white/5 px-2 flex items-center justify-between text-[7px] text-gray-600 font-bold tracking-wider">
                <div className="flex gap-2">
                    <span className="flex items-center gap-1"><div className="w-1 h-1 bg-terminal-mint rounded-full" /> GPLUS</span>
                    <span className="flex items-center gap-1"><div className="w-1 h-1 bg-terminal-mint rounded-full" /> DEX</span>
                    <span className="flex items-center gap-1"><div className="w-1 h-1 bg-terminal-mint rounded-full" /> NODES</span>
                </div>
                <div className="text-gray-500">WIRCRYPTO v1.5.1</div>
            </div>
        </div>
    );
}
