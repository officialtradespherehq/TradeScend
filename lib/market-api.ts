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
    console.log('Using cached crypto data');
    return cryptoCache.data;
  }
  
  try {
    // Fetch data from CoinGecko API
    console.log('Fetching fresh crypto data from CoinGecko API');
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
      console.log('Using expired cache data as fallback');
      return cryptoCache.data;
    }
    
    // If no cached data available, throw the error
    throw new Error(`Failed to fetch cryptocurrency data: ${error}`);
  }
};

// Market data with price history
export const fetchMarketData = async (): Promise<MarketData[]> => {
  // Fetch real crypto data from CoinGecko API
  const cryptoData = await fetchCryptoData();
  
  // For stocks, we'll still use simulated data
  const stockAssets: MarketData[] = [
    {
      symbol: "AAPL",
      name: "Apple Inc.",
      price: 180.95 + (Math.random() * 4 - 2), // Add some randomness
      change: 1.2,
      changePercent: 1.2,
      color: "#E44D26",
      type: "stock",
      marketCap: "$2.8T",
      volume: "$12.5B",
      high24h: 182.45,
      low24h: 179.25,
      description: "Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide."
    },
    {
      symbol: "MSFT",
      name: "Microsoft Corp.",
      price: 378.85 + (Math.random() * 6 - 3),
      change: 0.8,
      changePercent: 0.8,
      color: "#00A4EF",
      type: "stock",
      marketCap: "$2.7T",
      volume: "$10.2B",
      high24h: 380.15,
      low24h: 376.42,
      description: "Microsoft Corporation develops, licenses, and supports software, services, devices, and solutions worldwide."
    },
    {
      symbol: "TSLA",
      name: "Tesla Inc.",
      price: 175.25 + (Math.random() * 5 - 2.5),
      change: 2.3,
      changePercent: 2.3,
      color: "#E82127",
      type: "stock",
      marketCap: "$556B",
      volume: "$8.7B",
      high24h: 177.50,
      low24h: 173.10,
      description: "Tesla, Inc. designs, develops, manufactures, sells, and leases electric vehicles and energy generation and storage systems worldwide."
    },
    {
      symbol: "GOOGL",
      name: "Alphabet Inc.",
      price: 165.78 + (Math.random() * 4 - 2),
      change: 1.5,
      changePercent: 1.5,
      color: "#4285F4",
      type: "stock",
      marketCap: "$2.1T",
      volume: "$9.3B",
      high24h: 167.20,
      low24h: 164.50,
      description: "Alphabet Inc. provides various products and platforms in the United States, Europe, the Middle East, Africa, the Asia-Pacific, Canada, and Latin America."
    }
  ];
  
  // Generate chart data for stock assets
  const stocksWithChartData = stockAssets.map(asset => {
    // Determine trend based on change
    const trend = asset.change > 0 ? 'up' : asset.change < 0 ? 'down' : 'sideways';
    const volatility = 0.008; // Stocks are less volatile than crypto
    
    // Generate historical data for different time periods
    const hourlyData = generateHistoricalData(asset.price, volatility, 24, trend);
    const weeklyData = generateWeeklyData(asset.price, volatility * 2, trend);
    const monthlyData = generateMonthlyData(asset.price, volatility * 3, trend);
    
    // Calculate actual change based on first and last data points
    const firstPoint = hourlyData[0].value;
    const lastPoint = hourlyData[hourlyData.length - 1].value;
    const actualChange = ((lastPoint - firstPoint) / firstPoint) * 100;
    
    return {
      ...asset,
      change: parseFloat(actualChange.toFixed(2)),
      changePercent: parseFloat(actualChange.toFixed(2)),
      hourlyData,
      weeklyData,
      monthlyData
    };
  });
  
  // Combine crypto and stock data
  return [...cryptoData, ...stocksWithChartData];
};

// Function to fetch detailed data for a specific asset
export const fetchAssetDetail = async (symbol: string): Promise<MarketData | null> => {
  const allAssets = await fetchMarketData();
  return allAssets.find(asset => asset.symbol === symbol) || null;
};
