import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const network = searchParams.get('network');
    const address = searchParams.get('address');
    const timeframe = searchParams.get('timeframe') || 'day';
    const aggregate = searchParams.get('aggregate') || '1';

    if (!network || !address) {
        return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    try {
        const response = await axios.get(
            `https://api.geckoterminal.com/api/v2/networks/${network}/pools/${address}/ohlcv/${timeframe}`,
            {
                params: {
                    aggregate: aggregate,
                    limit: 100
                }
            }
        );

        const ohlcvData = response.data.data.attributes.ohlcv_list.map((item: any) => ({
            time: item[0], // timestamp in seconds
            open: item[1],
            high: item[2],
            low: item[3],
            close: item[4],
            volume: item[5]
        })).sort((a: any, b: any) => a.time - b.time);

        return NextResponse.json(ohlcvData);
    } catch (error) {
        console.error('OHLCV API Error:', error);
        return NextResponse.json({ error: 'Failed to fetch OHLCV data' }, { status: 500 });
    }
}
