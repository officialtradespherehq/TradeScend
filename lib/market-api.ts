// Market data API service

// Types for market data
export interface MarketData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  high24h?: number;
  low24h?: number;
  marketCap?: string;
  volume?: string;
  type: 'stock' | 'crypto';
  color: string;
  description?: string;
  hourlyData?: ChartDataPoint[];
  weeklyData?: ChartDataPoint[];
  monthlyData?: ChartDataPoint[];
}

// CoinGecko API response types
interface CoinGeckoPrice {
  [currency: string]: number;
}

interface CoinGeckoChange {
  [currency: string]: number;
}

interface CoinGeckoResponse {
  [coin: string]: {
    usd: number;
    usd_24h_change?: number;
  };
}

export interface ChartDataPoint {
  date: string;
  value: number;
  formattedDate: string;
}

// Sample market data with more realistic price history
const generateHistoricalData = (
  basePrice: number, 
  volatility: number, 
  dataPoints: number = 24,
  trend: 'up' | 'down' | 'sideways' = 'sideways'
): ChartDataPoint[] => {
  const data: ChartDataPoint[] = [];
  let currentPrice = basePrice;
  const now = new Date();
  
  // Create trend factor
  const trendFactor = trend === 'up' ? 1.002 : trend === 'down' ? 0.998 : 1;
  
  for (let i = dataPoints; i >= 0; i--) {
    // Calculate time for this data point (going back in time)
    const pointDate = new Date(now.getTime() - (i * 3600000)); // hourly data points
    
    // Add random movement with trend bias
    const randomFactor = 1 + (Math.random() * volatility * 2 - volatility) * (basePrice < 1 ? 0.1 : 1);
    currentPrice = currentPrice * randomFactor * trendFactor;
    
    // Ensure price doesn't go negative
    currentPrice = Math.max(currentPrice, basePrice * 0.5);
    
    // Format the date for display
    const formattedDate = pointDate.getHours() + ':00';
    
    data.push({
      date: pointDate.toISOString(),
      value: currentPrice,
      formattedDate
    });
  }
  
  return data;
};

// Generate weekly data (7 days)
const generateWeeklyData = (
  basePrice: number, 
  volatility: number, 
  trend: 'up' | 'down' | 'sideways' = 'sideways'
): ChartDataPoint[] => {
  const data: ChartDataPoint[] = [];
  let currentPrice = basePrice;
  const now = new Date();
  
  // Create trend factor
  const trendFactor = trend === 'up' ? 1.01 : trend === 'down' ? 0.99 : 1;
  
  for (let i = 7; i >= 0; i--) {
    // Calculate time for this data point (going back in time)
    const pointDate = new Date(now.getTime() - (i * 86400000)); // daily data points
    
    // Add random movement with trend bias
    const randomFactor = 1 + (Math.random() * volatility * 2 - volatility) * (basePrice < 1 ? 0.1 : 1);
    currentPrice = currentPrice * randomFactor * trendFactor;
    
    // Ensure price doesn't go negative
    currentPrice = Math.max(currentPrice, basePrice * 0.5);
    
    // Format the date for display
    const formattedDate = pointDate.toLocaleDateString(undefined, { weekday: 'short' });
    
    data.push({
      date: pointDate.toISOString(),
      value: currentPrice,
      formattedDate
    });
  }
  
  return data;
};

// Generate monthly data (30 days)
const generateMonthlyData = (
  basePrice: number, 
  volatility: number, 
  trend: 'up' | 'down' | 'sideways' = 'sideways'
): ChartDataPoint[] => {
  const data: ChartDataPoint[] = [];
  let currentPrice = basePrice;
  const now = new Date();
  
  // Create trend factor
  const trendFactor = trend === 'up' ? 1.015 : trend === 'down' ? 0.985 : 1;
  
  for (let i = 30; i >= 0; i--) {
    // Calculate time for this data point (going back in time)
    const pointDate = new Date(now.getTime() - (i * 86400000)); // daily data points
    
    // Add random movement with trend bias
    const randomFactor = 1 + (Math.random() * volatility * 2 - volatility) * (basePrice < 1 ? 0.1 : 1);
    currentPrice = currentPrice * randomFactor * trendFactor;
    
    // Ensure price doesn't go negative
    currentPrice = Math.max(currentPrice, basePrice * 0.5);
    
    // Format the date for display
    const formattedDate = `${pointDate.getDate()}/${pointDate.getMonth() + 1}`;
    
    data.push({
      date: pointDate.toISOString(),
      value: currentPrice,
      formattedDate
    });
  }
  
  return data;
};

// Cache for crypto data
interface CryptoCache {
  data: MarketData[];
  timestamp: number;
  expiryTime: number;
}

let cryptoCache: CryptoCache = {
  data: [],
  timestamp: 0,
  expiryTime: 5 * 60 * 1000 // 5 minutes cache expiry
};

// Fetch cryptocurrency data from CoinGecko API with caching
export const fetchCryptoData = async (): Promise<MarketData[]> => {
  const now = Date.now();
  
  // Return cached data if it's still valid
  if (cryptoCache.data.length > 0 && now - cryptoCache.timestamp < cryptoCache.expiryTime) {
   //  console.log('Using cached crypto data');
    return cryptoCache.data;
  }
  
  try {
    // Fetch data from CoinGecko API
   //  console.log('Fetching fresh crypto data from CoinGecko API');
    const response = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,ripple,cardano,dogecoin&vs_currencies=usd&include_24h_change=true"
    );
    
    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }
    
    const data: CoinGeckoResponse = await response.json();
    
    // Map CoinGecko data to our MarketData format
    const cryptoAssets: MarketData[] = [
      {
        symbol: "BTC",
        name: "Bitcoin",
        price: data.bitcoin?.usd || 0,
        change: data.bitcoin?.usd_24h_change || 0,
        changePercent: data.bitcoin?.usd_24h_change || 0,
        color: "#F7931A",
        type: "crypto",
        marketCap: "$1.2T",
        volume: "$45.8B",
        high24h: (data.bitcoin?.usd || 0) * 1.02, // Approximate high
        low24h: (data.bitcoin?.usd || 0) * 0.98, // Approximate low
        description: "Bitcoin is a decentralized digital currency, without a central bank or single administrator, that can be sent from user to user on the peer-to-peer bitcoin network."
      },
      {
        symbol: "ETH",
        name: "Ethereum",
        price: data.ethereum?.usd || 0,
        change: data.ethereum?.usd_24h_change || 0,
        changePercent: data.ethereum?.usd_24h_change || 0,
        color: "#627EEA",
        type: "crypto",
        marketCap: "$375.2B",
        volume: "$22.1B",
        high24h: (data.ethereum?.usd || 0) * 1.02,
        low24h: (data.ethereum?.usd || 0) * 0.98,
        description: "Ethereum is a decentralized, open-source blockchain with smart contract functionality. Ether is the native cryptocurrency of the platform."
      },
      {
        symbol: "SOL",
        name: "Solana",
        price: data.solana?.usd || 0,
        change: data.solana?.usd_24h_change || 0,
        changePercent: data.solana?.usd_24h_change || 0,
        color: "#00FFA3",
        type: "crypto",
        marketCap: "$61.5B",
        volume: "$3.8B",
        high24h: (data.solana?.usd || 0) * 1.02,
        low24h: (data.solana?.usd || 0) * 0.98,
        description: "Solana is a high-performance blockchain supporting builders around the world creating crypto apps that scale."
      },
      {
        symbol: "XRP",
        name: "Ripple",
        price: data.ripple?.usd || 0,
        change: data.ripple?.usd_24h_change || 0,
        changePercent: data.ripple?.usd_24h_change || 0,
        color: "#23292F",
        type: "crypto",
        marketCap: "$29.8B",
        volume: "$1.2B",
        high24h: (data.ripple?.usd || 0) * 1.02,
        low24h: (data.ripple?.usd || 0) * 0.98,
        description: "XRP is the native cryptocurrency of the XRP Ledger, which uses a consensus protocol that differs from proof-of-work systems."
      },
    ];
    
    // Generate chart data for each crypto asset
    const cryptoWithChartData = cryptoAssets.map(asset => {
      // Determine trend based on change
      const trend = asset.change > 0 ? 'up' : asset.change < 0 ? 'down' : 'sideways';
      const volatility = 0.015; // Crypto is more volatile
      
      // Generate historical data for different time periods
      const hourlyData = generateHistoricalData(asset.price, volatility, 24, trend);
      const weeklyData = generateWeeklyData(asset.price, volatility * 2, trend);
      const monthlyData = generateMonthlyData(asset.price, volatility * 3, trend);
      
      return {
        ...asset,
        hourlyData,
        weeklyData,
        monthlyData
      };
    });
    
    // Update cache with new data
    cryptoCache = {
      data: cryptoWithChartData,
      timestamp: now,
      expiryTime: 5 * 60 * 1000 // 5 minutes
    };
    
    return cryptoWithChartData;
  } catch (error) {
    console.error("Error fetching crypto data:", error);
    
    // If we have cached data, use it even if expired
    if (cryptoCache.data.length > 0) {
     //  console.log('Using expired cache data as fallback');
      return cryptoCache.data;
    }
    
    // If no cached data available, throw the error
    throw new Error(`Failed to fetch cryptocurrency data: ${error}`);
  }
};

const FINNHUB_API_KEY = 'd1q1tjpr01qrh89nlb8gd1q1tjpr01qrh89nlb90';
const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1/quote';

const STOCK_SYMBOLS = ["AAPL", "MSFT", "TSLA", "GOOGL"];

// In-memory cache for stock data
let stockCache: { data: MarketData[]; timestamp: number } = { data: [], timestamp: 0 };
const STOCK_CACHE_EXPIRY = 60 * 60 * 1000; // 1 hour

async function fetchStockDataFromFinnhub(): Promise<MarketData[]> {
  const now = Date.now();
  if (stockCache.data.length > 0 && now - stockCache.timestamp < STOCK_CACHE_EXPIRY) {
    return stockCache.data;
  }
  if (!FINNHUB_API_KEY) {
    console.warn('Finnhub API key not set. No stock data will be returned.');
    return [];
  }
  try {
    const results: MarketData[] = [];
    for (const symbol of STOCK_SYMBOLS) {
      const url = `${FINNHUB_BASE_URL}?symbol=${symbol}&token=${FINNHUB_API_KEY}`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.error) {
        console.error(`Finnhub error for ${symbol}:`, data.error);
        continue;
      }
      // Finnhub fields: c=current, d=change, dp=change %, h=high, l=low, o=open, pc=prev close
      const price = data.c;
      const change = data.d;
      const changePercent = data.dp;
      const high24h = data.h;
      const low24h = data.l;
      // Generate chart data
      const trend = change > 0 ? 'up' : change < 0 ? 'down' : 'sideways';
      const volatility = 0.008;
      const hourlyData = generateHistoricalData(price, volatility, 24, trend);
      const weeklyData = generateWeeklyData(price, volatility * 2, trend);
      const monthlyData = generateMonthlyData(price, volatility * 3, trend);
      // Descriptions and colors as before
      const meta = {
        AAPL: {
          name: "Apple Inc.",
          color: "#E44D26",
          marketCap: "$2.8T",
          description: "Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide."
        },
        MSFT: {
          name: "Microsoft Corp.",
          color: "#00A4EF",
          marketCap: "$2.7T",
          description: "Microsoft Corporation develops, licenses, and supports software, services, devices, and solutions worldwide."
        },
        TSLA: {
          name: "Tesla Inc.",
          color: "#E82127",
          marketCap: "$556B",
          description: "Tesla, Inc. designs, develops, manufactures, sells, and leases electric vehicles and energy generation and storage systems worldwide."
        },
        GOOGL: {
          name: "Alphabet Inc.",
          color: "#4285F4",
          marketCap: "$2.1T",
          description: "Alphabet Inc. provides various products and platforms in the United States, Europe, the Middle East, Africa, the Asia-Pacific, Canada, and Latin America."
        }
      };
      const m = meta[symbol as keyof typeof meta];
      results.push({
        symbol,
        name: m.name,
        price,
        change,
        changePercent,
        color: m.color,
        type: "stock",
        marketCap: m.marketCap,
        volume: undefined,
        high24h,
        low24h,
        description: m.description,
        hourlyData,
        weeklyData,
        monthlyData
      });
    }
    stockCache = { data: results, timestamp: now };
    return results;
  } catch (error) {
    console.error('Error fetching stock data from Finnhub:', error);
    return [];
  }
}

// Market data with price history
export const fetchMarketData = async (): Promise<MarketData[]> => {
  // Fetch real crypto data from CoinGecko API
  const cryptoData = await fetchCryptoData();

  // Fetch real stock data from Finnhub (with cache)
  const stocksWithChartData = await fetchStockDataFromFinnhub();

  // Combine crypto and stock data
  return [...cryptoData, ...stocksWithChartData];
};

// Function to fetch detailed data for a specific asset
export const fetchAssetDetail = async (symbol: string): Promise<MarketData | null> => {
  const allAssets = await fetchMarketData();
  return allAssets.find(asset => asset.symbol === symbol) || null;
};
