import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const network = searchParams.get('network');
    const address = searchParams.get('address');

    if (!network || !address) {
        return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    try {
        const response = await axios.get(
            `https://api.geckoterminal.com/api/v2/networks/${network}/pools/${address}/trades`
        );

        // Transform data to a simpler format for our UI
        const trades = response.data.data.map((item: any) => {
            const attr = item.attributes;
            return {
                id: item.id,
                time: new Date(attr.block_timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' ago',
                shortTime: attr.block_timestamp,
                type: attr.kind === 'buy' ? 'Buy' : 'Sell',
                usd: parseFloat(attr.price_from_in_usd || attr.price_to_in_usd || 0),
                volumeUsd: parseFloat(attr.volume_in_usd || 0),
                amount: parseFloat(attr.from_token_amount || attr.to_token_amount || 0),
                price: parseFloat(attr.price_from_in_usd || attr.price_to_in_usd || 0),
                maker: attr.tx_from_address ? `${attr.tx_from_address.slice(0, 4)}...${attr.tx_from_address.slice(-2)}` : 'Unknown',
                hash: attr.tx_hash
            };
        });

        return NextResponse.json(trades);
    } catch (error) {
        console.error('Trades API Error:', error);
        return NextResponse.json({ error: 'Failed to fetch trades' }, { status: 500 });
    }
}
