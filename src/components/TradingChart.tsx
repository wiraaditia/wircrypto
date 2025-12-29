"use client";

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
    createChart,
    ColorType,
    IChartApi,
    ISeriesApi,
    CandlestickSeries,
    HistogramSeries,
    LineSeries,
    AreaSeries,
    PriceLineOptions,
    Time,
    UTCTimestamp
} from 'lightweight-charts';
import axios from 'axios';
import {
    MousePointer2,
    PenTool,
    Type,
    Ruler,
    Camera,
    Plus,
    Settings2,
    Maximize2,
    Loader2,
    Eye,
    TrendingUp,
    ChevronDown,
    Zap,
    History,
    Bell,
    Share2,
    Layers,
    Undo2,
    Redo2,
    LineChart,
    Shapes,
    Search,
    X,
    Trash2,
    Lock,
    Unlock,
    Grid3x3,
    ZoomIn,
    ZoomOut
} from 'lucide-react';

interface TradingChartProps {
    symbol: string;
    network?: string;
    address?: string;
    dex?: string;
    poolMarketCap?: number;
    poolPrice?: number;
}

interface Indicator {
    id: string;
    name: string;
    type: 'ma' | 'ema' | 'rsi' | 'bb' | 'macd' | 'vwap';
    period?: number;
    color?: string;
    series?: ISeriesApi<any>;
}

interface Drawing {
    id: string;
    type: 'trend' | 'fib' | 'horizontal' | 'vertical';
    points: any[];
    color: string;
}

function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(' ');
}

export default function TradingChart({ symbol, network, address, dex = 'Uniswap', poolMarketCap, poolPrice }: TradingChartProps) {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const mainContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
    const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);
    const indicatorsRef = useRef<Indicator[]>([]);
    const drawingsRef = useRef<Drawing[]>([]);

    const [isLoading, setIsLoading] = useState(false);
    const [timeframe, setTimeframe] = useState('hour');
    const [aggregate, setAggregate] = useState('1');
    const [lastPrice, setLastPrice] = useState<any>(null);
    const [showIndicators, setShowIndicators] = useState(false);
    const [showAlerts, setShowAlerts] = useState(false);
    const [showReplay, setShowReplay] = useState(false);
    const [scaleMode, setScaleMode] = useState<'price' | 'mcap'>('price');
    const [activeTool, setActiveTool] = useState('cursor');
    const [mounted, setMounted] = useState(false);
    const [currentTime, setCurrentTime] = useState("");
    const [selectedRange, setSelectedRange] = useState('All');
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [ohlcData, setOhlcData] = useState<any[]>([]);
    const [hideDrawings, setHideDrawings] = useState(false);
    const [magnetMode, setMagnetMode] = useState(true);

    useEffect(() => {
        setMounted(true);
        const timer = setInterval(() => {
            setCurrentTime(new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const supplyFactor = (poolMarketCap && poolPrice) ? poolMarketCap / poolPrice : 0;

    const formatPrice = (val: number) => {
        if (!val) return '0.00';

        if (scaleMode === 'mcap') {
            if (val >= 1000000000) return '$' + (val / 1000000000).toFixed(2) + 'B';
            if (val >= 1000000) return '$' + (val / 1000000).toFixed(2) + 'M';
            if (val >= 1000) return '$' + (val / 1000).toFixed(1) + 'K';
            return '$' + val.toFixed(0);
        }

        if (val >= 1000) return val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        if (val >= 1) return val.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 });
        if (val < 0.00000001) return val.toExponential(4);

        const str = val.toFixed(14);
        const match = str.match(/0\.0+/);
        if (match && match[0].length > 5) {
            const zeros = match[0].length - 2;
            const remaining = str.replace(/0\.0+/, '');
            return `0.0(${zeros})${remaining.substring(0, 4)}`;
        }

        return val.toFixed(8).replace(/0+$/, '').replace(/\.$/, '');
    };

    // Sync Data with Scale Mode
    useEffect(() => {
        if (!seriesRef.current || !chartRef.current || ohlcData.length === 0) return;

        let displayData = ohlcData;

        // Calculate supply factor if MCap mode
        if (scaleMode === 'mcap' && poolMarketCap && poolPrice) {
            const supply = poolMarketCap / poolPrice;
            displayData = ohlcData.map(d => ({
                time: d.time,
                open: d.open * supply,
                high: d.high * supply,
                low: d.low * supply,
                close: d.close * supply,
                volume: d.volume // Preserve volume
            }));

            // Update series options for large numbers
            seriesRef.current.applyOptions({
                priceFormat: {
                    type: 'custom',
                    formatter: (price: number) => {
                        if (price >= 1000000000) return '$' + (price / 1000000000).toFixed(2) + 'B';
                        if (price >= 1000000) return '$' + (price / 1000000).toFixed(2) + 'M';
                        if (price >= 1000) return '$' + (price / 1000).toFixed(1) + 'K';
                        return '$' + price.toFixed(0);
                    },
                    minMove: 0.01
                }
            });
        } else {
            // Reset to normal price formatting
            seriesRef.current.applyOptions({
                priceFormat: {
                    type: 'price',
                    precision: 8,
                    minMove: 0.00000001
                }
            });
        }

        seriesRef.current.setData(displayData);
        setLastPrice(displayData[displayData.length - 1]);

        // Re-apply time range logic when data changes
        let visibleCount = displayData.length;
        if (selectedRange === '1D') visibleCount = Math.min(100, displayData.length);
        else if (selectedRange === '5D') visibleCount = Math.min(200, displayData.length);
        else if (selectedRange === '1M') visibleCount = Math.min(800, displayData.length);
        else if (selectedRange === '3M') visibleCount = Math.min(2500, displayData.length);
        else if (selectedRange === '6M') visibleCount = Math.min(5000, displayData.length);

        // Only set range if it wasn't manual (simplified check for now)
        // For now, always re-centering on data load is acceptable
        chartRef.current.timeScale().setVisibleLogicalRange({
            from: displayData.length - visibleCount,
            to: displayData.length + 5
        });

        // Re-update indicators with new data scale? 
        // Indicators are calculated on OHLC. If we switch to MCap, MA should be on MCap too.
        indicatorsRef.current.forEach(ind => {
            // We need to re-add indicators using current displayData
            if (ind.series) {
                chartRef.current?.removeSeries(ind.series);
            }
        });
        // Note: Full indicator re-calc logic would require calling addIndicator again with displayedData
        // For simplicity, we'll clear indicators when switching modes for now, or users re-add them.
        // Or we can trigger a re-calc. Ideally `addIndicator` should use `seriesRef.current` data but it uses `ohlcData` state.
        // We should probably update `addLineSeries` to use the derived data, but `ohlcData` is the source. 
        // If we want indicators to scale, we need `addIndicator` to accept custom data or check scaleMode.

    }, [ohlcData, scaleMode, poolMarketCap, poolPrice, selectedRange]);

    // Calculate indicators
    const calculateMA = (data: any[], period: number) => {
        const result: any[] = [];
        for (let i = period - 1; i < data.length; i++) {
            const sum = data.slice(i - period + 1, i + 1).reduce((acc, d) => acc + d.close, 0);
            result.push({ time: data[i].time, value: sum / period });
        }
        return result;
    };

    const calculateEMA = (data: any[], period: number) => {
        const result: any[] = [];
        const multiplier = 2 / (period + 1);
        let ema = data[0].close;
        result.push({ time: data[0].time, value: ema });

        for (let i = 1; i < data.length; i++) {
            ema = (data[i].close - ema) * multiplier + ema;
            result.push({ time: data[i].time, value: ema });
        }
        return result;
    };

    const calculateRSI = (data: any[], period: number = 14) => {
        const result: any[] = [];
        const changes: number[] = [];

        for (let i = 1; i < data.length; i++) {
            changes.push(data[i].close - data[i - 1].close);
        }

        for (let i = period; i < changes.length; i++) {
            const gains = changes.slice(i - period, i).filter(c => c > 0).reduce((a, b) => a + b, 0) / period;
            const losses = Math.abs(changes.slice(i - period, i).filter(c => c < 0).reduce((a, b) => a + b, 0)) / period;
            const rs = gains / (losses || 1);
            const rsi = 100 - (100 / (1 + rs));
            result.push({ time: data[i].time, value: rsi });
        }
        return result;
    };

    const addIndicator = useCallback((indicator: Indicator) => {
        if (!chartRef.current || !ohlcData.length) return;

        let series: ISeriesApi<any> | null = null;
        let data: any[] = [];

        switch (indicator.type) {
            case 'ma':
                data = calculateMA(ohlcData, indicator.period || 20);
                series = chartRef.current.addSeries(LineSeries, {
                    color: indicator.color || '#2962ff',
                    lineWidth: 2,
                    title: `MA(${indicator.period || 20})`,
                    priceFormat: { type: 'price', precision: 8, minMove: 0.00000001 },
                });
                break;
            case 'ema':
                data = calculateEMA(ohlcData, indicator.period || 20);
                series = chartRef.current.addSeries(LineSeries, {
                    color: indicator.color || '#ff6d00',
                    lineWidth: 2,
                    title: `EMA(${indicator.period || 20})`,
                    priceFormat: { type: 'price', precision: 8, minMove: 0.00000001 },
                });
                break;
            case 'rsi':
                data = calculateRSI(ohlcData, indicator.period || 14);
                const rsiSeries = chartRef.current.addSeries(LineSeries, {
                    color: indicator.color || '#9c27b0',
                    lineWidth: 2,
                    title: `RSI(${indicator.period || 14})`,
                    priceFormat: { type: 'price', precision: 2, minMove: 0.01 },
                });
                rsiSeries.priceScale().applyOptions({
                    scaleMargins: { top: 0.8, bottom: 0 },
                });
                // Add RSI levels
                rsiSeries.createPriceLine({ price: 70, color: '#ef5350', lineWidth: 1, lineStyle: 2, axisLabelVisible: true });
                rsiSeries.createPriceLine({ price: 30, color: '#26a69a', lineWidth: 1, lineStyle: 2, axisLabelVisible: true });
                series = rsiSeries;
                break;
        }

        if (series && data.length) {
            series.setData(data);
            indicatorsRef.current.push({ ...indicator, series });
        }
    }, [ohlcData]);

    const removeIndicator = useCallback((id: string) => {
        const indicator = indicatorsRef.current.find(ind => ind.id === id);
        if (indicator?.series && chartRef.current) {
            chartRef.current.removeSeries(indicator.series);
            indicatorsRef.current = indicatorsRef.current.filter(ind => ind.id !== id);
        }
    }, []);

    useEffect(() => {
        if (!chartContainerRef.current) return;

        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: '#090909' },
                textColor: '#787b86',
                fontSize: 11,
                fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
            },
            grid: {
                vertLines: {
                    color: 'rgba(42, 46, 57, 0.1)',
                    style: 0,
                },
                horzLines: {
                    color: 'rgba(42, 46, 57, 0.1)',
                    style: 0,
                },
            },
            width: chartContainerRef.current.clientWidth,
            height: chartContainerRef.current.clientHeight || 400,
            timeScale: {
                borderColor: 'rgba(42, 46, 57, 0.3)',
                timeVisible: true,
                secondsVisible: false,
                barSpacing: 6,
                rightOffset: 12,
                minBarSpacing: 0.5,
                fixLeftEdge: false,
                fixRightEdge: false,
            },
            rightPriceScale: {
                borderColor: 'rgba(42, 46, 57, 0.3)',
                autoScale: true,
                scaleMargins: {
                    top: 0.1,
                    bottom: 0.2,
                },
            },
            crosshair: {
                mode: magnetMode ? 1 : 0,
                vertLine: {
                    color: 'rgba(117, 134, 150, 0.5)',
                    width: 1,
                    style: 3,
                    labelBackgroundColor: '#131722',
                },
                horzLine: {
                    color: 'rgba(117, 134, 150, 0.5)',
                    width: 1,
                    style: 3,
                    labelBackgroundColor: '#131722',
                },
            },
            handleScroll: {
                mouseWheel: true,
                pressedMouseMove: true,
            },
            handleScale: {
                axisPressedMouseMove: true,
                mouseWheel: true,
                pinch: true,
            },
        });

        const candlestickSeries = chart.addSeries(CandlestickSeries, {
            upColor: '#26a69a',
            downColor: '#ef5350',
            borderVisible: false,
            wickUpColor: '#26a69a',
            wickDownColor: '#ef5350',
            priceFormat: {
                type: 'price',
                precision: 8,
                minMove: 0.00000001,
            },
        });

        const volumeSeries = chart.addSeries(HistogramSeries, {
            color: '#26a69a',
            priceFormat: {
                type: 'volume',
            },
            priceScaleId: '',
        });

        volumeSeries.priceScale().applyOptions({
            scaleMargins: {
                top: 0.8,
                bottom: 0,
            },
        });

        chartRef.current = chart;
        seriesRef.current = candlestickSeries;
        volumeSeriesRef.current = volumeSeries;

        const handleResize = () => {
            if (chartContainerRef.current) {
                chart.applyOptions({
                    width: chartContainerRef.current.clientWidth,
                    height: chartContainerRef.current.clientHeight || 400
                });
            }
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
            chart.remove();
        };
    }, [magnetMode]);

    useEffect(() => {
        async function fetchData() {
            if (!network || !address || !seriesRef.current || !volumeSeriesRef.current || !chartRef.current) return;

            setIsLoading(true);
            try {
                const response = await axios.get(`/api/ohlcv?network=${network}&address=${address}&timeframe=${timeframe}&aggregate=${aggregate}`);
                if (response.data && Array.isArray(response.data)) {
                    const data = response.data.map((d: any) => ({
                        time: d.time as UTCTimestamp,
                        open: d.open,
                        high: d.high,
                        low: d.low,
                        close: d.close,
                        volume: d.volume // Added volume here
                    }));

                    setOhlcData(data); // Effect will handle chart update

                    volumeSeriesRef.current.setData(response.data.map((d: any) => ({
                        time: d.time as UTCTimestamp,
                        value: d.volume,
                        color: d.close >= d.open ? 'rgba(38, 166, 154, 0.3)' : 'rgba(239, 83, 80, 0.3)'
                    })));

                }
            } catch (error) {
                console.error('Error fetching chart data:', error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchData();
    }, [network, address, timeframe, aggregate]); // Removed selectedRange dependency as it's handled in the sync effect

    const timeframeOptions = [
        { label: '5m', value: 'minute', agg: '5' },
        { label: '15m', value: 'minute', agg: '15' },
        { label: '1h', value: 'hour', agg: '1' },
        { label: '4h', value: 'hour', agg: '4' },
        { label: '1D', value: 'day', agg: '1' },
    ];

    const timeRanges = ['1D', '5D', '1M', '3M', '6M', 'YTD', '1Y', 'All'];

    const indicatorOptions = [
        { id: 'ma20', name: 'Moving Average (20)', type: 'ma' as const, period: 20, color: '#2962ff' },
        { id: 'ma50', name: 'Moving Average (50)', type: 'ma' as const, period: 50, color: '#ff6d00' },
        { id: 'ema20', name: 'EMA (20)', type: 'ema' as const, period: 20, color: '#9c27b0' },
        { id: 'ema50', name: 'EMA (50)', type: 'ema' as const, period: 50, color: '#00bcd4' },
        { id: 'rsi14', name: 'RSI (14)', type: 'rsi' as const, period: 14, color: '#9c27b0' },
    ];

    const handleAddIndicator = (indicator: typeof indicatorOptions[0]) => {
        const newIndicator: Indicator = {
            id: `${indicator.type}-${indicator.period}-${Date.now()}`,
            name: indicator.name,
            type: indicator.type,
            period: indicator.period,
            color: indicator.color,
        };
        addIndicator(newIndicator);
        setShowIndicators(false);
    };

    // Handle resize
    useEffect(() => {
        const handleResize = () => {
            if (chartContainerRef.current && chartRef.current) {
                const { clientWidth, clientHeight } = chartContainerRef.current;
                chartRef.current.applyOptions({ width: clientWidth, height: clientHeight });
            }
        };

        window.addEventListener('resize', handleResize);
        document.addEventListener('fullscreenchange', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            document.removeEventListener('fullscreenchange', handleResize);
        };
    }, []);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            mainContainerRef.current?.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };



    return (
        <div ref={mainContainerRef} className={`w-full h-full bg-[#131722] border border-white/5 rounded-[2px] flex flex-col select-none overflow-hidden shadow-2xl relative group ${isFullscreen ? 'fixed inset-0 z-[9999]' : ''}`}>
            {/* Top Toolbar */}
            <div className="h-10 flex-none shrink-0 border-b border-[#2a2e39] flex items-center justify-between px-2 bg-[#131722]">
                <div className="flex items-center gap-1 h-full">
                    <div className="flex items-center gap-2 px-2 hover:bg-[#2a2e39] h-8 rounded-sm cursor-pointer transition-colors mr-2">
                        <div className="w-5 h-5 rounded-full bg-terminal-mint/20 flex items-center justify-center text-[10px] font-black text-terminal-mint">
                            <Search size={12} strokeWidth={3} />
                        </div>
                        <span className="text-[12px] font-bold text-[#d1d4dc] uppercase tracking-tighter">{symbol || 'Search'}</span>
                        <ChevronDown size={12} className="text-[#a3a6af]" />
                    </div>

                    <div className="w-[1px] h-5 bg-[#2a2e39] mx-1" />

                    <div className="flex gap-0.5 ml-1">
                        {timeframeOptions.map(option => (
                            <button
                                key={option.label}
                                onClick={() => {
                                    setTimeframe(option.value);
                                    setAggregate(option.agg);
                                }}
                                className={`h-8 px-2 text-[11px] font-medium transition-all rounded-sm flex items-center ${(timeframe === option.value && aggregate === option.agg)
                                    ? "bg-[#2a2e39] text-[#2962ff]"
                                    : "text-[#d1d4dc] hover:bg-[#2a2e39]"
                                    }`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>

                    <div className="w-[1px] h-5 bg-[#2a2e39] mx-1" />

                    <div className="flex items-center gap-1">
                        <div className="p-1.5 hover:bg-[#2a2e39] rounded-sm cursor-pointer text-[#d1d4dc]">
                            <LineChart size={16} />
                        </div>
                        <button
                            onClick={() => setShowIndicators(!showIndicators)}
                            className={cn(
                                "flex items-center gap-1 px-2 h-8 rounded-sm cursor-pointer transition-colors text-[11px] font-medium",
                                showIndicators ? "bg-[#2a2e39] text-[#2962ff]" : "text-[#d1d4dc] hover:bg-[#2a2e39]"
                            )}
                        >
                            Indicators
                        </button>
                        <button
                            onClick={() => setShowAlerts(!showAlerts)}
                            className={cn(
                                "p-1.5 hover:bg-[#2a2e39] rounded-sm cursor-pointer text-[#d1d4dc] flex items-center gap-1 px-2 h-8",
                                showAlerts && "bg-[#2a2e39] text-[#2962ff]"
                            )}
                        >
                            <Bell size={16} />
                            <span className="text-[11px] font-medium hidden md:block">Alert</span>
                        </button>
                        <button
                            onClick={() => setShowReplay(!showReplay)}
                            className={cn(
                                "p-1.5 hover:bg-[#2a2e39] rounded-sm cursor-pointer text-[#d1d4dc] flex items-center gap-1 px-2 h-8",
                                showReplay && "bg-[#2a2e39] text-[#2962ff]"
                            )}
                        >
                            <History size={16} />
                            <span className="text-[11px] font-medium hidden md:block">Replay</span>
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex bg-[#2a2e39]/50 rounded-sm p-0.5">
                        <button
                            onClick={() => setScaleMode('price')}
                            className={cn(
                                "px-2 py-0.5 text-[10px] font-bold rounded-[2px] transition-all",
                                scaleMode === 'price' ? "bg-[#2a2e39] text-[#2962ff]" : "text-gray-500 hover:text-white"
                            )}
                        >
                            Price
                        </button>
                        <button
                            onClick={() => setScaleMode('mcap')}
                            className={cn(
                                "px-2 py-0.5 text-[10px] font-bold rounded-[2px] transition-all",
                                scaleMode === 'mcap' ? "bg-[#2a2e39] text-[#2962ff]" : "text-gray-500 hover:text-white"
                            )}
                        >
                            MCap
                        </button>
                    </div>

                    <div className="flex items-center gap-2 pr-2">
                        <button
                            onClick={() => chartRef.current?.timeScale().scrollToPosition(0, true)}
                            className="p-1.5 hover:bg-[#2a2e39] rounded-sm"
                        >
                            <Undo2 size={16} className="text-gray-600 hover:text-white cursor-pointer" />
                        </button>
                        <button
                            onClick={() => chartRef.current?.timeScale().scrollToPosition(-1, true)}
                            className="p-1.5 hover:bg-[#2a2e39] rounded-sm"
                        >
                            <Redo2 size={16} className="text-gray-600 hover:text-white cursor-pointer" />
                        </button>
                        <div className="w-[1px] h-5 bg-[#2a2e39] mx-1" />
                        <button
                            onClick={toggleFullscreen}
                            className="p-1.5 hover:bg-[#2a2e39] rounded-sm"
                        >
                            <Maximize2 size={16} className="text-gray-500 hover:text-white cursor-pointer" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex flex-1 relative min-h-0 overflow-hidden">
                {/* Left Sidebar Tools */}
                <div className="w-11 flex-none shrink-0 border-r border-[#2a2e39] flex flex-col items-center py-2 gap-4 bg-[#131722] z-30">
                    <SidebarTool
                        id="cursor"
                        activeTool={activeTool}
                        onClick={setActiveTool}
                        icon={<MousePointer2 size={16} />}
                        title="Crosshair"
                    />
                    <SidebarTool
                        id="trend"
                        activeTool={activeTool}
                        onClick={setActiveTool}
                        icon={<TrendingUp size={16} />}
                        title="Trend Line"
                    />
                    <SidebarTool
                        id="fib"
                        activeTool={activeTool}
                        onClick={setActiveTool}
                        icon={<Zap size={16} />}
                        title="Fibonacci"
                    />
                    <SidebarTool
                        id="brush"
                        activeTool={activeTool}
                        onClick={setActiveTool}
                        icon={<PenTool size={16} />}
                        title="Brush"
                    />
                    <SidebarTool
                        id="text"
                        activeTool={activeTool}
                        onClick={setActiveTool}
                        icon={<Type size={16} />}
                        title="Text"
                    />
                    <SidebarTool
                        id="shape"
                        activeTool={activeTool}
                        onClick={setActiveTool}
                        icon={<Shapes size={16} />}
                        title="Shapes"
                    />
                    <SidebarTool
                        id="ruler"
                        activeTool={activeTool}
                        onClick={setActiveTool}
                        icon={<Ruler size={16} />}
                        title="Ruler"
                    />

                    <div className="mt-auto flex flex-col gap-4 mb-2">
                        <button
                            onClick={() => setMagnetMode(!magnetMode)}
                            className={cn(
                                "p-2 transition-all duration-200 rounded-sm cursor-pointer",
                                magnetMode ? "bg-[#2a2e39] text-[#2962ff]" : "text-[#a3a6af] hover:text-white hover:bg-[#2a2e39]/50"
                            )}
                            title="Magnet Mode"
                        >
                            <Grid3x3 size={16} />
                        </button>
                        <SidebarTool
                            id="hide"
                            activeTool={activeTool}
                            onClick={() => setHideDrawings(!hideDrawings)}
                            icon={<Eye size={16} />}
                            title="Hide Drawings"
                        />
                        <SidebarTool
                            id="layers"
                            activeTool={activeTool}
                            onClick={setActiveTool}
                            icon={<Layers size={16} />}
                            title="Layers"
                        />
                        <SidebarTool
                            id="settings"
                            activeTool={activeTool}
                            onClick={setActiveTool}
                            icon={<Settings2 size={16} />}
                            title="Settings"
                        />
                    </div>
                </div>

                <div className="flex-1 relative group bg-[#090909] min-h-0">
                    {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-[#090909]/80 z-50">
                            <div className="flex flex-col items-center gap-2">
                                <Loader2 size={24} className="animate-spin text-[#2962ff]" />
                                <span className="text-[11px] text-[#787b86]">Loading chart data...</span>
                            </div>
                        </div>
                    )}

                    <div className="absolute top-4 left-5 z-20 pointer-events-none flex flex-col gap-0.5">
                        <div className="flex items-center gap-2">
                            <span className="text-[14px] font-black text-[#d1d4dc] uppercase">
                                {symbol} / {network === 'solana' ? 'SOL' : 'WETH'} <span className="text-[#2962ff]">{scaleMode === 'mcap' ? '(Market Cap)' : ''}</span> <span className="text-[#787b86]">on</span> {dex}
                            </span>
                        </div>

                        {lastPrice && (
                            <div className="flex flex-col gap-0.5">
                                <div className="flex gap-3 font-mono text-[12px]">
                                    <span className="flex gap-1"><span className="text-[#a3a6af]">O</span><span className="text-[#d1d4dc] font-bold">{formatPrice(lastPrice.open).replace('$', '')}</span></span>
                                    <span className="flex gap-1"><span className="text-[#a3a6af]">H</span><span className="text-[#d1d4dc] font-bold">{formatPrice(lastPrice.high).replace('$', '')}</span></span>
                                    <span className="flex gap-1"><span className="text-[#a3a6af]">L</span><span className="text-[#d1d4dc] font-bold">{formatPrice(lastPrice.low).replace('$', '')}</span></span>
                                    <span className="flex gap-1"><span className="text-[#a3a6af]">C</span><span className={cn("font-bold", lastPrice.close >= lastPrice.open ? "text-[#26a69a]" : "text-[#ef5350]")}>{formatPrice(lastPrice.close).replace('$', '')}</span></span>
                                    <span className={cn(
                                        "px-1.5 rounded-sm font-black",
                                        lastPrice.close >= lastPrice.open ? "text-[#26a69a] bg-[#26a69a]/10" : "text-[#ef5350] bg-[#ef5350]/10"
                                    )}>
                                        {((lastPrice.close - lastPrice.open) / lastPrice.open * 100).toFixed(2)}%
                                    </span>
                                </div>
                                <div className="flex gap-1 font-mono text-[12px]">
                                    <span className="text-[#a3a6af]">Vol</span>
                                    <span className={cn("font-bold", lastPrice.close >= lastPrice.open ? "text-[#26a69a]" : "text-[#ef5350]")}>
                                        {scaleMode === 'mcap'
                                            ? formatPrice(lastPrice.volume || 0).replace('$', '')
                                            : (lastPrice.volume || 0).toFixed(2)
                                        }
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-[0.03] select-none z-10">
                        <span className="text-[140px] font-black italic tracking-tighter text-white transform rotate-[-10deg]">WIRCRYPTO</span>
                        <span className="text-[40px] font-black tracking-[0.5em] text-[#2962ff] -mt-10 mr-20">TRADING PRO</span>
                    </div>

                    <div ref={chartContainerRef} className="w-full h-full min-h-0" />
                </div>
            </div>

            {/* Bottom Status Bar */}
            <div className="h-8 flex-none shrink-0 border-t border-[#2a2e39] flex items-center justify-between px-3 bg-[#131722] text-[10px] text-[#787b86] font-medium z-30">
                <div className="flex gap-4">
                    {timeRanges.map(range => (
                        <button
                            key={range}
                            onClick={() => setSelectedRange(range)}
                            className={cn(
                                "hover:text-white cursor-pointer px-1 rounded-sm hover:bg-[#2a2e39] transition-colors",
                                selectedRange === range && "text-[#2962ff] bg-[#2a2e39]"
                            )}
                        >
                            {range}
                        </button>
                    ))}
                    <button className="hover:text-white cursor-pointer ml-2 p-1 hover:bg-[#2a2e39] rounded-sm">
                        <Camera size={14} />
                    </button>
                </div>
                <div className="flex gap-4 items-center">
                    {mounted && (
                        <span suppressHydrationWarning>{currentTime} UTC+8</span>
                    )}
                    <span className="text-[#2962ff] font-bold tracking-widest uppercase">Nodes Online</span>
                </div>
            </div>

            {/* Indicators Modal */}
            {showIndicators && (
                <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowIndicators(false)}>
                    <div className="w-[500px] max-h-[500px] bg-[#1e222d] border border-[#2a2e39] rounded-lg shadow-2xl flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center p-4 border-b border-[#2a2e39]">
                            <h3 className="text-sm font-bold text-white uppercase tracking-widest">Technical Indicators</h3>
                            <button onClick={() => setShowIndicators(false)} className="text-[#a3a6af] hover:text-white p-1">
                                <X size={16} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2 space-y-1">
                            {indicatorOptions.map((ind) => (
                                <button
                                    key={ind.id}
                                    onClick={() => handleAddIndicator(ind)}
                                    className="w-full flex justify-between items-center p-2.5 hover:bg-[#2a2e39] rounded-sm group cursor-pointer transition-colors"
                                >
                                    <span className="text-gray-300 group-hover:text-white font-medium uppercase text-[11px] tracking-tighter">{ind.name}</span>
                                    <Plus size={14} className="text-[#2962ff]" />
                                </button>
                            ))}
                        </div>
                        {indicatorsRef.current.length > 0 && (
                            <div className="border-t border-[#2a2e39] p-2">
                                <div className="text-[10px] text-[#787b86] uppercase font-bold mb-2 px-2">Active Indicators</div>
                                <div className="space-y-1 max-h-32 overflow-y-auto">
                                    {indicatorsRef.current.map((ind) => (
                                        <div key={ind.id} className="flex justify-between items-center p-2 hover:bg-[#2a2e39] rounded-sm group">
                                            <span className="text-[11px] text-gray-400">{ind.name}</span>
                                            <button
                                                onClick={() => removeIndicator(ind.id)}
                                                className="p-1 hover:bg-[#3a3e4d] rounded text-gray-500 hover:text-red-400"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Alerts Modal */}
            {showAlerts && (
                <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowAlerts(false)}>
                    <div className="w-[400px] bg-[#1e222d] border border-[#2a2e39] rounded-lg shadow-2xl flex flex-col p-4" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4 border-b border-[#2a2e39] pb-3">
                            <h3 className="text-sm font-bold text-white uppercase tracking-widest">Price Alerts</h3>
                            <button onClick={() => setShowAlerts(false)} className="text-[#a3a6af] hover:text-white p-1">
                                <X size={16} />
                            </button>
                        </div>
                        <div className="space-y-3">
                            <div className="text-[11px] text-gray-400">
                                Set price alerts to get notified when {symbol} reaches your target price.
                            </div>
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    placeholder="Target Price"
                                    className="flex-1 bg-[#131722] border border-[#2a2e39] rounded px-3 py-2 text-[12px] text-white focus:outline-none focus:border-[#2962ff]"
                                />
                                <button className="px-4 py-2 bg-[#2962ff] text-white text-[11px] font-bold rounded hover:bg-[#2962ff]/80 transition-colors">
                                    Add Alert
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Replay Modal */}
            {showReplay && (
                <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowReplay(false)}>
                    <div className="w-[400px] bg-[#1e222d] border border-[#2a2e39] rounded-lg shadow-2xl flex flex-col p-4" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4 border-b border-[#2a2e39] pb-3">
                            <h3 className="text-sm font-bold text-white uppercase tracking-widest">Chart Replay</h3>
                            <button onClick={() => setShowReplay(false)} className="text-[#a3a6af] hover:text-white p-1">
                                <X size={16} />
                            </button>
                        </div>
                        <div className="space-y-3">
                            <div className="text-[11px] text-gray-400">
                                Replay historical price action to analyze market behavior.
                            </div>
                            <div className="flex gap-2">
                                <button className="flex-1 px-4 py-2 bg-[#2962ff] text-white text-[11px] font-bold rounded hover:bg-[#2962ff]/80 transition-colors">
                                    Start Replay
                                </button>
                                <button className="px-4 py-2 bg-[#2a2e39] text-gray-300 text-[11px] font-bold rounded hover:bg-[#3a3e4d] transition-colors">
                                    Pause
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function SidebarTool({
    id,
    activeTool,
    onClick,
    icon,
    title
}: {
    id: string,
    activeTool: string,
    onClick: (id: string) => void,
    icon: React.ReactNode,
    title?: string
}) {
    const active = id === activeTool;
    return (
        <button
            onClick={() => onClick(id)}
            className={cn(
                "p-2 transition-all duration-200 rounded-sm cursor-pointer",
                active ? "bg-[#2a2e39] text-[#2962ff] shadow-lg" : "text-[#a3a6af] hover:text-white hover:bg-[#2a2e39]/50"
            )}
            title={title}
        >
            {icon}
        </button>
    );
}
