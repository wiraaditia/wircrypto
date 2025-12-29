import axios from 'axios';
import { checkTokenSecurity } from '../src/lib/go-plus';
import { calculateHypeScore, TokenPool } from '../src/lib/crypto-logic';

/**
 * Wircrypto Telegram Bot Notifier
 * Alerts when a coin hits a Hype Score >= 85 and Trust Score >= 70
 */

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

const GECKO_TERMINAL_API = 'https://api.geckoterminal.com/api/v2';

async function sendTelegramAlert(message: string) {
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
        console.log("Telegram credentials not found. Alert:", message);
        return;
    }

    try {
        await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            chat_id: TELEGRAM_CHAT_ID,
            text: message,
            parse_mode: 'Markdown'
        });
    } catch (error: any) {
        console.error("Telegram Error:", error.response?.data || error.message);
    }
}

async function monitor() {
    console.log("🚀 Wircrypto Terminal Notifier Started...");
    console.log("Monitoring networks: SOLANA, BASE, BSC...");

    const networks = ['solana', 'base', 'bsc'];
    const alertedTokens = new Set<string>();

    setInterval(async () => {
        for (const network of networks) {
            try {
                const response = await axios.get(`${GECKO_TERMINAL_API}/networks/${network}/new_pools`, {
                    params: { include: 'base_token' }
                });

                const pools = response.data.data;
                const included = response.data.included || [];

                for (const pool of pools) {
                    const attr = pool.attributes;
                    const tokenAddress = attr.address;

                    if (alertedTokens.has(tokenAddress)) continue;

                    // Find base token metadata
                    const baseToken = included.find(
                        (inc: any) => inc.type === 'token' && inc.id === pool.relationships.base_token.data.id
                    );

                    const tokenData: TokenPool = {
                        id: pool.id,
                        name: attr.name,
                        address: attr.address,
                        base_token_address: attr.base_token_id?.split('_')[1] || '',
                        price_usd: parseFloat(attr.base_token_price_usd) || 0,
                        reserve_usd: parseFloat(attr.reserve_in_usd) || 0,
                        volume_24h_usd: parseFloat(attr.volume_usd.h24) || 0,
                        market_cap_usd: parseFloat(attr.fdv_usd) || 0,
                        transactions_1h: attr.transactions.h1.buys + attr.transactions.h1.sells,
                        created_at: attr.pool_created_at,
                        network: network,
                        symbol: attr.name.split(' / ')[0],
                        twitter: attr.twitter_handle || baseToken?.attributes?.twitter_handle,
                        telegram: attr.telegram_handle || baseToken?.attributes?.telegram_handle
                    };

                    const hypeScore = calculateHypeScore(tokenData);

                    if (hypeScore >= 85) {
                        console.log(`🔥 HIGH HYPE DETECTED: ${tokenData.symbol} (${hypeScore})`);

                        // Security Check
                        const security = await checkTokenSecurity(network, tokenAddress);

                        if (security.score >= 70) {
                            const message = `
🔥 *WIRCRYPTO ALPHA ALERT* 🔥

*Token:* ${tokenData.symbol}
*Network:* ${network.toUpperCase()}
*Hype Score:* ${hypeScore}/100
*Trust Score:* ${security.score}/100

*Metrics:*
- Price: $${tokenData.price_usd.toFixed(8)}
- Liq: $${tokenData.reserve_usd.toLocaleString()}
- Vol 24h: $${tokenData.volume_24h_usd.toLocaleString()}
- Txs (1h): ${tokenData.transactions_1h}

*Links:*
- [DexScreener](https://dexscreener.com/${network}/${tokenAddress})
${tokenData.twitter ? `- [Twitter](https://twitter.com/${tokenData.twitter})\n` : ''}${tokenData.telegram ? `- [Telegram](${tokenData.telegram})\n` : ''}
              `.trim();

                            await sendTelegramAlert(message);
                            alertedTokens.add(tokenAddress);
                            console.log(`✅ Alert sent for ${tokenData.symbol}`);
                        }
                    }
                }
            } catch (err: any) {
                console.error(`Error monitoring ${network}:`, err.message);
            }
        }

        // Reset cache every hour
        if (new Date().getMinutes() === 0) alertedTokens.clear();

    }, 60000); // Check every 1 minute
}

monitor();
