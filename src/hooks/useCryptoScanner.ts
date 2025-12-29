"use client";

import useSWR from 'swr';
import { fetchNewPools, calculateHypeScore, TokenPool } from '@/lib/crypto-logic';

const WIRCRYPTO_CRITERIA = {
    MIN_LIQUIDITY: 5000,
    MIN_VOL_MC_RATIO: 0.15,
    MIN_TX_1H: 50
};

export function useCryptoScanner(network: string = 'solana', filters?: any) {
    const { data, error, isLoading } = useSWR(
        network ? [`/api/scanner`, network, JSON.stringify(filters)] : null,
        () => fetchNewPools(network, filters),
        {
            refreshInterval: 30000,
            revalidateOnFocus: false
        }
    );

    return {
        pools: data || [],
        isLoading,
        isError: error
    };
}
