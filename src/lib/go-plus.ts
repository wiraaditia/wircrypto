import axios from 'axios';

/**
 * GoPlus Security API Integration
 * Documentation: https://docs.gopluslabs.io/
 */

const GOPLUS_API = 'https://api.gopluslabs.io/api/v1';

export async function checkTokenSecurity(networkId: string, tokenAddress: string) {
    try {
        // networkId mapping for GoPlus
        const chainMap: Record<string, string> = {
            'solana': 'solana',
            'base': '8453',
            'bsc': '56'
        };

        const chainId = chainMap[networkId] || networkId;

        const endpoint = networkId === 'solana'
            ? `${GOPLUS_API}/solana/token_security?address=${tokenAddress}`
            : `${GOPLUS_API}/token_security/${chainId}?contract_addresses=${tokenAddress}`;

        const response = await axios.get(endpoint);

        if (response.data.code === 1) {
            const data = networkId === 'solana'
                ? response.data.result
                : response.data.result[tokenAddress.toLowerCase()];

            if (!data) return { score: 50, issues: ["No data found"], details: null };

            // Calculate Trust Score
            let score = 100;
            const issues: string[] = [];

            if (data.is_honeypot === "1") {
                score -= 80;
                issues.push("Honeypot detected");
            }

            const buyTax = parseFloat(data.buy_tax || 0) * 100;
            const sellTax = parseFloat(data.sell_tax || 0) * 100;

            if (buyTax > 10 || sellTax > 10) {
                score -= 20;
                issues.push(`High tax: B:${buyTax.toFixed(1)}% S:${sellTax.toFixed(1)}%`);
            }

            if (data.is_mintable === "1") {
                score -= 15;
                issues.push("Mint function enabled");
            }

            return {
                score: Math.max(0, score),
                issues,
                details: data
            };
        }
    } catch (error) {
        console.error("GoPlus API error:", error);
    }
    return { score: 50, issues: ["Audit failed"], details: null };
}
