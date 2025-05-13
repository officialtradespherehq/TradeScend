"use client"

import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import TradingChart from "./charts/trading-chart";
import { fetchCryptoData, fetchMarketData, MarketData } from "@/lib/market-api";

interface DisplayCryptoData {
  current_price: number;
  price_change_percentage_24h: number;
}

interface DisplayStockData {
  current_price: number;
  price_change_percentage_24h: number;
}

export default function MarketSection() {
  const [cryptoData, setCryptoData] = useState<{
    bitcoin?: DisplayCryptoData;
    ethereum?: DisplayCryptoData;
    solana?: DisplayCryptoData;
    ripple?: DisplayCryptoData;
  }>({});
  
  const [stockData, setStockData] = useState<{
    sp500?: DisplayStockData;
    nasdaq?: DisplayStockData;
    tesla?: DisplayStockData;
    google?: DisplayStockData;
  }>({});
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchMarketDataFromAPI = async () => {
    try {
      // Use our cached API service instead of direct API calls
      const cryptos = await fetchCryptoData();
      const allMarketData = await fetchMarketData();
      
      // Find cryptocurrency data
      const bitcoin = cryptos.find(crypto => crypto.symbol === 'BTC');
      const ethereum = cryptos.find(crypto => crypto.symbol === 'ETH');
      const solana = cryptos.find(crypto => crypto.symbol === 'SOL');
      const ripple = cryptos.find(crypto => crypto.symbol === 'XRP');
      
      // Find stock data
      const tesla = allMarketData.find(stock => stock.symbol === 'TSLA');
      const google = allMarketData.find(stock => stock.symbol === 'GOOGL');
      
      // Format crypto data for display
      const newCryptoData = {
        bitcoin: bitcoin ? {
          current_price: bitcoin.price,
          price_change_percentage_24h: bitcoin.changePercent
        } : undefined,
        ethereum: ethereum ? {
          current_price: ethereum.price,
          price_change_percentage_24h: ethereum.changePercent
        } : undefined,
        solana: solana ? {
          current_price: solana.price,
          price_change_percentage_24h: solana.changePercent
        } : undefined,
        ripple: ripple ? {
          current_price: ripple.price,
          price_change_percentage_24h: ripple.changePercent
        } : undefined
      };
      
      // Format stock data for display
      const newStockData = {
        sp500: {
          current_price: 4782.45,
          price_change_percentage_24h: 0.8
        },
        nasdaq: {
          current_price: 15832.80,
          price_change_percentage_24h: 1.2
        },
        tesla: tesla ? {
          current_price: tesla.price,
          price_change_percentage_24h: tesla.changePercent
        } : undefined,
        google: google ? {
          current_price: google.price,
          price_change_percentage_24h: google.changePercent
        } : undefined
      };
      
      setCryptoData(newCryptoData);
      setStockData(newStockData);
      setError("");
      setIsLoading(false);
    } catch (err) {
      console.error("Error fetching market data:", err);
      setError("Failed to fetch market data");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketDataFromAPI();
    const interval = setInterval(fetchMarketDataFromAPI, 60000); // Refresh every 60 seconds to avoid rate limiting
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="trends" className="py-16 md:py-24 bg-muted/50 border-y border-border">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Real-Time <span className="text-secondary">Market Trends</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Stay updated with the latest market movements and make informed investment decisions.
          </p>
        </div>
        <div className="relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-secondary rounded-lg blur opacity-20"></div>
          <div className="relative bg-card/80 backdrop-blur-sm p-6 rounded-lg border border-border">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-foreground">Cryptocurrency</h3>
                  <Icon icon="cryptocurrency:btc" className="h-5 w-5 text-secondary" />
                </div>
                <div className="space-y-4">
                  {isLoading ? (
                    <div className="animate-pulse space-y-4">
                      {[1, 2].map((i) => (
                        <div key={i} className="bg-muted/50 p-4 rounded-lg">
                          <div className="h-6 bg-muted rounded w-1/3 mb-2"></div>
                          <div className="h-12 bg-muted rounded mb-2"></div>
                          <div className="flex justify-between">
                            <div className="h-4 bg-muted rounded w-1/4"></div>
                            <div className="h-4 bg-muted rounded w-1/4"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : error ? (
                    <div className="text-red-500 text-center py-4">
                      {/* {error} */}
                      </div>
                  ) : (
                    <>
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center gap-2">
                            <Icon icon="cryptocurrency:btc" className="h-6 w-6 text-[#F7931A]" />
                            <span className="text-foreground font-medium">Bitcoin</span>
                          </div>
                          <span className={cryptoData.bitcoin?.price_change_percentage_24h ? (cryptoData.bitcoin.price_change_percentage_24h > 0 ? "text-green-400" : "text-red-400") : "text-muted-foreground"}>
                            {cryptoData.bitcoin?.price_change_percentage_24h ? cryptoData.bitcoin.price_change_percentage_24h.toFixed(2) + '%' : '0.0%'}
                          </span>
                        </div>
                        <TradingChart className="w-full h-12" height={48} />
                        <div className="flex justify-between mt-2">
                          <span className="text-muted-foreground text-sm">24h</span>
                          <span className="text-foreground font-medium">
                            ${cryptoData.bitcoin?.current_price?.toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center gap-2">
                            <Icon icon="cryptocurrency:eth" className="h-6 w-6 text-[#627EEA]" />
                            <span className="text-foreground font-medium">Ethereum</span>
                          </div>
                          <span className={cryptoData.ethereum?.price_change_percentage_24h ? (cryptoData.ethereum.price_change_percentage_24h > 0 ? "text-green-400" : "text-red-400") : "text-muted-foreground"}>
                            {cryptoData.ethereum?.price_change_percentage_24h ? cryptoData.ethereum.price_change_percentage_24h.toFixed(2) + '%' : '0.0%'}
                          </span>
                        </div>
                        <TradingChart className="w-full h-12" height={48} />
                        <div className="flex justify-between mt-2">
                          <span className="text-muted-foreground text-sm">24h</span>
                          <span className="text-foreground font-medium">
                            ${cryptoData.ethereum?.current_price?.toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center gap-2">
                            <Icon icon="cryptocurrency:sol" className="h-6 w-6 text-[#00FFA3]" />
                            <span className="text-foreground font-medium">Solana</span>
                          </div>
                          <span className={cryptoData.solana?.price_change_percentage_24h ? (cryptoData.solana.price_change_percentage_24h > 0 ? "text-green-400" : "text-red-400") : "text-muted-foreground"}>
                            {cryptoData.solana?.price_change_percentage_24h ? cryptoData.solana.price_change_percentage_24h.toFixed(2) + '%' : '0.0%'}
                          </span>
                        </div>
                        <TradingChart className="w-full h-12" height={48} />
                        <div className="flex justify-between mt-2">
                          <span className="text-muted-foreground text-sm">24h</span>
                          <span className="text-foreground font-medium">
                            ${cryptoData.solana?.current_price?.toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center gap-2">
                            <Icon icon="cryptocurrency:xrp" className="h-6 w-6 text-[#23292F]" />
                            <span className="text-foreground font-medium">Ripple</span>
                          </div>
                          <span className={cryptoData.ripple?.price_change_percentage_24h ? (cryptoData.ripple.price_change_percentage_24h > 0 ? "text-green-400" : "text-red-400") : "text-muted-foreground"}>
                            {cryptoData.ripple?.price_change_percentage_24h ? cryptoData.ripple.price_change_percentage_24h.toFixed(2) + '%' : '0.0%'}
                          </span>
                        </div>
                        <TradingChart className="w-full h-12" height={48} />
                        <div className="flex justify-between mt-2">
                          <span className="text-muted-foreground text-sm">24h</span>
                          <span className="text-foreground font-medium">
                            ${cryptoData.ripple?.current_price?.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-foreground">Stock Market</h3>
                  <Icon icon="ph:trend-up-bold" className="h-5 w-5 text-secondary" />
                </div>
                <div className="space-y-4">
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <div className="bg-primary h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold text-white">
                          S&P
                        </div>
                        <span className="text-foreground font-medium">S&P 500</span>
                      </div>
                      <span className={stockData.sp500?.price_change_percentage_24h ? (stockData.sp500.price_change_percentage_24h > 0 ? "text-green-400" : "text-red-400") : "text-muted-foreground"}>
                        {stockData.sp500?.price_change_percentage_24h ? (stockData.sp500.price_change_percentage_24h > 0 ? '+' : '') + stockData.sp500.price_change_percentage_24h.toFixed(1) + '%' : '0.0%'}
                      </span>
                    </div>
                    <TradingChart className="w-full h-12" height={48} />
                    <div className="flex justify-between mt-2">
                      <span className="text-muted-foreground text-sm">Today</span>
                      <span className="text-foreground font-medium">
                        {stockData.sp500?.current_price?.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <div className="bg-primary h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold text-white">
                          N
                        </div>
                        <span className="text-foreground font-medium">NASDAQ</span>
                      </div>
                      <span className={stockData.nasdaq?.price_change_percentage_24h ? (stockData.nasdaq.price_change_percentage_24h > 0 ? "text-green-400" : "text-red-400") : "text-muted-foreground"}>
                        {stockData.nasdaq?.price_change_percentage_24h ? (stockData.nasdaq.price_change_percentage_24h > 0 ? '+' : '') + stockData.nasdaq.price_change_percentage_24h.toFixed(1) + '%' : '0.0%'}
                      </span>
                    </div>
                    <TradingChart className="w-full h-12" height={48} />
                    <div className="flex justify-between mt-2">
                      <span className="text-muted-foreground text-sm">Today</span>
                      <span className="text-foreground font-medium">
                        {stockData.nasdaq?.current_price?.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <div className="bg-[#E82127] h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold text-white">
                          T
                        </div>
                        <span className="text-foreground font-medium">Tesla</span>
                      </div>
                      <span className={stockData.tesla?.price_change_percentage_24h ? (stockData.tesla.price_change_percentage_24h > 0 ? "text-green-400" : "text-red-400") : "text-muted-foreground"}>
                        {stockData.tesla?.price_change_percentage_24h ? (stockData.tesla.price_change_percentage_24h > 0 ? '+' : '') + stockData.tesla.price_change_percentage_24h.toFixed(2) + '%' : '0.0%'}
                      </span>
                    </div>
                    <TradingChart className="w-full h-12" height={48} />
                    <div className="flex justify-between mt-2">
                      <span className="text-muted-foreground text-sm">Today</span>
                      <span className="text-foreground font-medium">
                        ${stockData.tesla?.current_price?.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <div className="bg-[#4285F4] h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold text-white">
                          G
                        </div>
                        <span className="text-foreground font-medium">Google</span>
                      </div>
                      <span className={stockData.google?.price_change_percentage_24h ? (stockData.google.price_change_percentage_24h > 0 ? "text-green-400" : "text-red-400") : "text-muted-foreground"}>
                        {stockData.google?.price_change_percentage_24h ? (stockData.google.price_change_percentage_24h > 0 ? '+' : '') + stockData.google.price_change_percentage_24h.toFixed(2) + '%' : '0.0%'}
                      </span>
                    </div>
                    <TradingChart className="w-full h-12" height={48} />
                    <div className="flex justify-between mt-2">
                      <span className="text-muted-foreground text-sm">Today</span>
                      <span className="text-foreground font-medium">
                        ${stockData.google?.current_price?.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}