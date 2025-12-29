"use client";

import useSWR from 'swr';
import axios from 'axios';

export function useTokenSecurity(network: string | null, address: string | null) {
    const { data, error, isLoading } = useSWR(
        network && address ? `/api/security?network=${network}&address=${address}` : null,
        (url) => axios.get(url).then(res => res.data),
        {
            revalidateOnFocus: false,
            dedupingInterval: 60000 // Cache for 1 minute
        }
    );

    return {
        security: data,
        isLoading,
        isError: error
    };
}
