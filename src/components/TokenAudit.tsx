"use client";

import React from 'react';
import { Shield, AlertTriangle, Loader2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface TokenAuditProps {
    security: any;
    isLoading: boolean;
    hasSelectedPool: boolean;
}

export default function TokenAudit({ security, isLoading, hasSelectedPool }: TokenAuditProps) {
    return (
        <div className="border border-terminal-border p-3 bg-terminal-charcoal">
            <h3 className="text-sm font-bold flex items-center gap-2 mb-4 uppercase">
                <Shield size={14} className="text-terminal-mint" />
                Rug-Check Audit
            </h3>

            {!hasSelectedPool ? (
                <div className="h-32 flex flex-col items-center justify-center text-gray-600 text-[10px]">
                    SELECT A TOKEN TO AUDIT
                </div>
            ) : isLoading ? (
                <div className="h-32 flex flex-col items-center justify-center text-terminal-mint">
                    <Loader2 className="animate-spin mb-2" />
                    <span className="animate-pulse text-[10px] uppercase">Analyzing Smart Contract...</span>
                </div>
            ) : (
                <>
                    <div className="flex items-center gap-4 mb-4">
                        <div className={cn(
                            "w-14 h-14 rounded-full border-4 flex items-center justify-center text-lg font-bold transition-colors",
                            security?.score > 80 ? "border-terminal-mint text-terminal-mint" : "border-terminal-red text-terminal-red"
                        )}>
                            {security?.score || 0}
                        </div>
                        <div>
                            <div className={cn(
                                "font-bold text-[10px] uppercase",
                                security?.score > 80 ? "text-terminal-mint" : "text-terminal-red"
                            )}>
                                {security?.score > 80 ? "TRUSTED ALPHA" : "HIGH RISK WARNING"}
                            </div>
                            <div className="text-[10px] text-gray-500 uppercase">GOPLUS SCAN COMPLETE</div>
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <SecurityRow label="Honeypot Risk" passed={security?.details?.is_honeypot === "0"} />
                        <SecurityRow label="Tax Policy" passed={parseFloat(security?.details?.buy_tax || 0) < 0.1 && parseFloat(security?.details?.sell_tax || 0) < 0.1} />
                        <SecurityRow label="Mint Function" passed={security?.details?.is_mintable === "0"} />
                        <SecurityRow label="Auth Status" passed={security?.details?.is_proxy === "0"} />
                    </div>
                </>
            )}
        </div>
    );
}

function SecurityRow({ label, passed }: { label: string, passed: boolean }) {
    return (
        <div className="flex justify-between items-center text-[10px]">
            <span className="text-gray-400 capitalize">{label}</span>
            {passed ? (
                <span className="text-terminal-mint flex items-center gap-1 font-bold">
                    PASSED <Shield size={10} />
                </span>
            ) : (
                <span className="text-terminal-red flex items-center gap-1 font-bold">
                    FAILED <AlertTriangle size={10} />
                </span>
            )}
        </div>
    );
}
