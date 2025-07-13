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

const ALPHA_VANTAGE_API_KEY = '496RQ7J4F7M4QOP7';
const ALPHA_VANTAGE_BASE_URL = 'https://www.alphavantage.co/query';

const STOCK_SYMBOLS = ["AAPL", "MSFT", "TSLA", "GOOGL"];

async function fetchStockDataFromAlphaVantage(): Promise<MarketData[]> {
  if (!ALPHA_VANTAGE_API_KEY) {
    console.warn('Alpha Vantage API key not set. No stock data will be returned.');
    return [];
  }
  try {
    const results: MarketData[] = [];
    for (const symbol of STOCK_SYMBOLS) {
      const url = `${ALPHA_VANTAGE_BASE_URL}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`;
     //  console.log('Fetching stock data from:', url); // DEBUG
      const response = await fetch(url);
      const raw = await response.text();
     //  console.log('Raw response:', raw); // DEBUG
      if (!response.ok) throw new Error(`Alpha Vantage error: ${response.status}`);
      const data = JSON.parse(raw);
      if (data["Note"] || data["Error Message"]) {
        console.error('Alpha Vantage API error:', data["Note"] || data["Error Message"]);
        continue;
      }
      const quote = data["Global Quote"];
      if (!quote) {
        console.error(`No Global Quote for symbol ${symbol}:`, data);
        continue;
      }
      const price = parseFloat(quote["05. price"]);
      const change = parseFloat(quote["09. change"]);
      const changePercent = parseFloat(quote["10. change percent"]?.replace('%',''));
      const high24h = parseFloat(quote["03. high"]);
      const low24h = parseFloat(quote["04. low"]);
      const volume = quote["06. volume"];
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
        volume,
        high24h,
        low24h,
        description: m.description,
        hourlyData,
        weeklyData,
        monthlyData
      });
    }
    return results;
  } catch (error) {
    console.error('Error fetching stock data from Alpha Vantage:', error);
    return [];
  }
}

// Market data with price history
export const fetchMarketData = async (): Promise<MarketData[]> => {
  // Fetch real crypto data from CoinGecko API
  const cryptoData = await fetchCryptoData();

  // Fetch real stock data from Alpha Vantage (fallback to simulated if needed)
  const stocksWithChartData = await fetchStockDataFromAlphaVantage();

  // Combine crypto and stock data
  return [...cryptoData, ...stocksWithChartData];
};

// Function to fetch detailed data for a specific asset
export const fetchAssetDetail = async (symbol: string): Promise<MarketData | null> => {
  const allAssets = await fetchMarketData();
  return allAssets.find(asset => asset.symbol === symbol) || null;
};
