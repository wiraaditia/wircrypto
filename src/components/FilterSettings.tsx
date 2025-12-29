"use client";

import React from 'react';
import { Settings, X } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface FilterSettingsProps {
    filters: {
        minLiquidity: number;
        minVolMcRatio: number;
        minTx1h: number;
    };
    onUpdate: (filters: any) => void;
    onClose: () => void;
}

export default function FilterSettings({ filters, onUpdate, onClose }: FilterSettingsProps) {
    return (
        <div className="absolute inset-0 bg-terminal-black/90 z-50 p-4 border border-terminal-border flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-bold flex items-center gap-2 uppercase">
                    <Settings size={14} className="text-terminal-mint" />
                    Filter Calibration
                </h3>
                <button onClick={onClose} className="text-gray-500 hover:text-white">
                    <X size={16} />
                </button>
            </div>

            <div className="space-y-6">
                <div>
                    <label className="text-[10px] text-gray-500 uppercase block mb-2">
                        Min Liquidity (USD): <span className="text-terminal-mint font-mono">${filters.minLiquidity.toLocaleString()}</span>
                    </label>
                    <input
                        type="range"
                        min="1000"
                        max="100000"
                        step="1000"
                        value={filters.minLiquidity}
                        onChange={(e) => onUpdate({ ...filters, minLiquidity: parseInt(e.target.value) })}
                        className="w-full accent-terminal-mint bg-terminal-charcoal h-1 rounded-lg appearance-none cursor-pointer"
                    />
                </div>

                <div>
                    <label className="text-[10px] text-gray-500 uppercase block mb-2">
                        Min Vol/MC Ratio: <span className="text-terminal-mint font-mono">{filters.minVolMcRatio}</span>
                    </label>
                    <input
                        type="range"
                        min="0"
                        max="2"
                        step="0.05"
                        value={filters.minVolMcRatio}
                        onChange={(e) => onUpdate({ ...filters, minVolMcRatio: parseFloat(e.target.value) })}
                        className="w-full accent-terminal-mint bg-terminal-charcoal h-1 rounded-lg appearance-none cursor-pointer"
                    />
                </div>

                <div>
                    <label className="text-[10px] text-gray-500 uppercase block mb-2">
                        Min Transactions (1h): <span className="text-terminal-mint font-mono">{filters.minTx1h}</span>
                    </label>
                    <input
                        type="range"
                        min="10"
                        max="500"
                        step="10"
                        value={filters.minTx1h}
                        onChange={(e) => onUpdate({ ...filters, minTx1h: parseInt(e.target.value) })}
                        className="w-full accent-terminal-mint bg-terminal-charcoal h-1 rounded-lg appearance-none cursor-pointer"
                    />
                </div>
            </div>

            <div className="mt-auto p-3 bg-terminal-charcoal border border-terminal-border text-[9px] text-gray-500 leading-tight italic">
                * Calibration changes are applied instantly to the live scanner. High thresholds will yield fewer, but higher quality 'Alpha' results.
            </div>
        </div>
    );
}
