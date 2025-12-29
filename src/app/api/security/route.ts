import { NextRequest, NextResponse } from 'next/server';
import { checkTokenSecurity } from '@/lib/go-plus';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const network = searchParams.get('network');
    const address = searchParams.get('address');

    if (!network || !address) {
        return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    try {
        const security = await checkTokenSecurity(network, address);
        return NextResponse.json(security);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch security data' }, { status: 500 });
    }
}
