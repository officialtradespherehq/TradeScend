"use client"

import { useEffect, useState } from "react"
import { TrendingUp, TrendingDown } from "lucide-react"
import { Icon } from "@iconify/react"
import { fetchCryptoData, fetchMarketData, MarketData as ApiMarketData } from "@/lib/market-api"

type DisplayMarketData = {
  id: string
  name: string
  symbol: string
  current_price: number
  price_change_percentage_24h: number
  image: string
  type?: 'stock' | 'crypto'
}

export default function MarketTrends() {
  const [data, setData] = useState<DisplayMarketData[]>([])

  const fetchMarketDataFromAPI = async () => {
    try {
      // Use our cached API service to get both crypto and stock data
      const allMarketData = await fetchMarketData()
      
      // Convert our API format to the display format
      const displayData: DisplayMarketData[] = allMarketData.map(asset => {
        // Default image URLs for common cryptocurrencies and stocks
        const imageMap: Record<string, string> = {
          // Cryptocurrencies
          "BTC": "https://assets.coingecko.com/coins/images/1/small/bitcoin.png",
          "ETH": "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
          "SOL": "https://assets.coingecko.com/coins/images/4128/small/solana.png",
          "XRP": "https://assets.coingecko.com/coins/images/44/small/xrp-symbol-white-128.png",
          
          // Stocks
          "TSLA": "https://logo.clearbit.com/tesla.com",
          "GOOGL": "https://logo.clearbit.com/google.com",
          "AAPL": "https://logo.clearbit.com/apple.com",
          "MSFT": "https://logo.clearbit.com/microsoft.com"
        };
        
        return {
          id: asset.symbol.toLowerCase(),
          name: asset.name,
          symbol: asset.symbol,
          current_price: asset.price,
          price_change_percentage_24h: asset.changePercent,
          image: imageMap[asset.symbol] || `https://ui-avatars.com/api/?name=${asset.symbol}&background=random&color=fff&size=128`,
          type: asset.type // Add type to distinguish between crypto and stocks
        };
      })
      
      // Select a mix of crypto and stocks (2 crypto, 3 stocks)
      const cryptoAssets = displayData.filter(asset => asset.type === 'crypto').slice(0, 2)
      const stockAssets = displayData.filter(asset => asset.type === 'stock').slice(0, 3)
      
      // Combine and shuffle to create a mixed list
      const mixedAssets = [...cryptoAssets, ...stockAssets]
      
      setData(mixedAssets)
      setError(null)
    } catch (err) {
      setError('Failed to fetch market data. Please try again later.')
      console.error('Error fetching market data:', err)
    } finally {
      setLoading(false)
    }
  }

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchMarketDataFromAPI()
    const interval = setInterval(fetchMarketDataFromAPI, 60000) // Update every 60 seconds to avoid rate limiting
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="h-6 w-40 bg-muted rounded"></div>
          <div className="h-4 w-24 bg-muted rounded-full"></div>
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-muted/50 p-3 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-muted"></div>
              <div>
                <div className="h-4 w-24 bg-muted rounded mb-2"></div>
                <div className="h-3 w-32 bg-muted rounded"></div>
              </div>
            </div>
            <div className="text-right">
              <div className="h-4 w-28 bg-muted rounded mb-2"></div>
              <div className="h-3 w-16 bg-muted rounded"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-red-400 p-4 rounded-lg bg-red-400/10 text-center">
        {/* {error} */}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-foreground">Live Market Data</h3>
        <div className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">Auto-updating</div>
      </div>
      <div className="space-y-3">
        {data.map((item) => (
          <div key={item.id} className="bg-muted/50 p-3 rounded-lg flex items-center justify-between hover:bg-muted/70 transition-colors">
            <div className="flex items-center gap-3">
              <img src={item.image} alt={item.name} className="h-8 w-8 rounded-full" />
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-foreground font-medium">{item.name}</p>
                  <span className="text-xs text-muted-foreground uppercase">{item.symbol}</span>
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Icon icon="mdi:clock-outline" className="h-3 w-3" />
                  Updated just now
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-foreground font-medium">
                ${item.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <div
                className={`flex items-center justify-end text-sm ${item.price_change_percentage_24h >= 0 ? "text-green-400" : "text-red-400"}`}
              >
                {item.price_change_percentage_24h >= 0 ? (
                  <Icon icon="mdi:trending-up" className="h-4 w-4 mr-1" />
                ) : (
                  <Icon icon="mdi:trending-down" className="h-4 w-4 mr-1" />
                )}
                {item.price_change_percentage_24h >= 0 ? "+" : ""}
                {item.price_change_percentage_24h.toFixed(2)}%
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}