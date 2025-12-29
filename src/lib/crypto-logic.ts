import axios from 'axios';

const GECKO_TERMINAL_API = 'https://api.geckoterminal.com/api/v2';

export interface TokenPool {
    id: string;
    name: string;
    address: string;
    base_token_address: string;
    quote_token_address?: string; // Made optional
    price_usd: number;
    reserve_usd: number;
    volume_24h_usd: number;
    market_cap_usd: number;
    transactions_1h: number;
    created_at: string;
    network: string;
    symbol: string;
    twitter?: string;
    telegram?: string;
    discord?: string;
    website?: string;
    image_url?: string;
}

export const fetchNewPools = async (network: string = 'solana', filters?: any): Promise<TokenPool[]> => {
    try {
        const pages = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

        // Parallel fetching for extreme speed
        const results = await Promise.all(pages.map(async (page) => {
            try {
                const response = await axios.get(`${GECKO_TERMINAL_API}/networks/${network}/new_pools`, {
                    params: {
                        include: 'base_token',
                        page: page
                    }
                });
                return response.data;
            } catch (e) {
                return null;
            }
        }));

        const allPools: TokenPool[] = [];
        results.forEach((data: any) => {
            if (!data || !data.data) return;

            const pagePools = data.data.map((pool: any) => {
                const attributes = pool.attributes;
                const baseToken = data.included?.find(
                    (inc: any) => inc.type === 'token' && inc.id === pool.relationships.base_token.data.id
                );

                const tokenData: TokenPool = {
                    id: pool.id,
                    name: attributes.name,
                    address: attributes.address,
                    base_token_address: attributes.base_token_id?.split('_')[1] || '',
                    price_usd: parseFloat(attributes.base_token_price_usd) || 0,
                    reserve_usd: parseFloat(attributes.reserve_in_usd) || 0,
                    volume_24h_usd: parseFloat(attributes.volume_usd.h24) || 0,
                    market_cap_usd: parseFloat(attributes.fdv_usd) || 0,
                    transactions_1h: attributes.transactions.h1.buys + attributes.transactions.h1.sells,
                    created_at: attributes.pool_created_at,
                    network: network,
                    symbol: attributes.name.split(' / ')[0],
                    twitter: attributes.twitter_handle || baseToken?.attributes?.twitter_handle,
                    telegram: attributes.telegram_handle || baseToken?.attributes?.telegram_handle,
                    discord: attributes.discord_url || baseToken?.attributes?.discord_url,
                    website: attributes.websites?.[0] || baseToken?.attributes?.websites?.[0],
                    image_url: attributes.image_url || baseToken?.attributes?.image_url
                };

                return {
                    ...tokenData,
                    hypeScore: calculateHypeScore(tokenData)
                };
            });
            allPools.push(...pagePools);
        });

        const criteria = {
            MIN_LIQUIDITY: filters?.minLiquidity || 5000,
            MIN_VOL_MC_RATIO: filters?.minVolMcRatio || 0.15,
            MIN_TX_1H: filters?.minTx1h || 50
        };

        // Filter based on Wircrypto Alpha criteria
        return allPools.filter((pool: any) =>
            pool.reserve_usd > criteria.MIN_LIQUIDITY &&
            (pool.volume_24h_usd / (pool.market_cap_usd || 1)) > criteria.MIN_VOL_MC_RATIO &&
            pool.transactions_1h >= criteria.MIN_TX_1H
        ).sort((a: any, b: any) => b.hypeScore - a.hypeScore);
    } catch (error) {
        console.error('Error fetching new pools:', error);
        return [];
    }
};

export const calculateHypeScore = (pool: TokenPool): number => {
    let score = 0;

    // 1. Volume/MarketCap Ratio (up to 40 points)
    const volMcRatio = pool.volume_24h_usd / (pool.market_cap_usd || 1);
    score += Math.min(volMcRatio * 100, 40);

    // 2. Transaction Velocity (up to 30 points)
    score += Math.min(pool.transactions_1h / 5, 30);

    // 3. Liquidity Depth (up to 20 points)
    score += Math.min(pool.reserve_usd / 50000 * 20, 20);

    // 4. Social Presence Bonus (up to 10 points)
    if (pool.twitter) score += 5;
    if (pool.telegram) score += 5;
    if (pool.website) score += 2;

    // 5. Freshness Bonus (if created in last 6h)
    const ageHrs = (Date.now() - new Date(pool.created_at).getTime()) / (1000 * 60 * 60);
    if (ageHrs < 6) score += 10;

    return Math.min(Math.round(score), 100);
};

export const fetchTokenData = async (network: string, address: string) => {
    try {
        const response = await axios.get(`${GECKO_TERMINAL_API}/networks/${network}/pools/${address}`, {
            params: {
                include: 'base_token'
            }
        });

        const pool = response.data.data;
        const attributes = pool.attributes;

        return {
            id: pool.id,
            name: attributes.name,
            address: attributes.address,
            base_token_address: attributes.base_token_id?.split('_')[1] || '',
            price_usd: parseFloat(attributes.base_token_price_usd) || 0,
            reserve_usd: parseFloat(attributes.reserve_in_usd) || 0,
            volume_24h_usd: parseFloat(attributes.volume_usd.h24) || 0,
            market_cap_usd: parseFloat(attributes.fdv_usd) || 0,
            transactions_1h: attributes.transactions.h1.buys + attributes.transactions.h1.sells,
            created_at: attributes.pool_created_at,
            network: network,
            symbol: attributes.name.split(' / ')[0]
        };
    } catch (error) {
        console.error('Error fetching token data:', error);
        return null;
    }
};

