import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Types for the asset and data
export interface AssetData {
  date: string;
  value: number;
  formattedDate?: string;
}

export interface Asset {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent?: number;
  color: string;
  type: "stock" | "crypto";
  data?: AssetData[];
  hourlyData?: AssetData[];
  weeklyData?: AssetData[];
  monthlyData?: AssetData[];
  description?: string;
  marketCap?: string;
  volume?: string;
  high24h?: number;
  low24h?: number;
}

interface AssetDetailModalProps {
  asset: Asset | null;
  open: boolean;
  onClose: () => void;
}

export const AssetDetailModal: React.FC<AssetDetailModalProps> = ({
  asset,
  open,
  onClose,
}) => {
  if (!asset) return null;

  // Format price based on asset type and value
  const formatPrice = (price: number, type: string) => {
    if (type === "crypto" && price > 1000) {
      return `$${price.toLocaleString()}`;
    } else if (type === "crypto" && price < 1) {
      return `$${price.toFixed(4)}`;
    } else {
      return `$${price.toFixed(2)}`;
    }
  };

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background/95 border border-border p-2 rounded-md shadow-md">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-sm font-medium">
            {formatPrice(payload[0].value, asset.type)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
              style={{ backgroundColor: asset.color }}
            >
              {asset.symbol.charAt(0)}
            </div>
            <div>
              <DialogTitle className="text-xl">{asset.name}</DialogTitle>
              <DialogDescription className="text-sm">
                {asset.symbol} • {asset.type === "crypto" ? "Cryptocurrency" : "Stock"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Current Price */}
          <div className="flex justify-between items-baseline">
            <div>
              <p className="text-sm text-muted-foreground">Current Price</p>
              <p className="text-2xl font-bold">
                {formatPrice(asset.price, asset.type)}
              </p>
            </div>
            <div
              className={`text-lg font-medium ${
                asset.change > 0 ? "text-emerald-500" : "text-red-500"
              }`}
            >
              {asset.change > 0 ? "+" : ""}
              {asset.change}%
            </div>
          </div>

          {/* Chart Tabs */}
          <Tabs defaultValue="1D" className="w-full">
            <TabsList className="grid grid-cols-5 mb-4">
              <TabsTrigger value="1D">1D</TabsTrigger>
              <TabsTrigger value="1W">1W</TabsTrigger>
              <TabsTrigger value="1M">1M</TabsTrigger>
              <TabsTrigger value="3M">3M</TabsTrigger>
              <TabsTrigger value="1Y">1Y</TabsTrigger>
            </TabsList>

            {/* Chart content for each tab */}
            {["1D", "1W", "1M", "3M", "1Y"].map((period) => {
              // Select appropriate data based on period
              const chartData = 
                period === "1D" ? asset.hourlyData || asset.data :
                period === "1W" ? asset.weeklyData || asset.hourlyData :
                period === "1M" || period === "3M" || period === "1Y" ? asset.monthlyData || asset.weeklyData :
                asset.hourlyData || asset.data || [];
                
              return (
                <TabsContent key={period} value={period} className="mt-0">
                  <Card className="p-4">
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={chartData}
                          margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
                      >
                        <defs>
                          <linearGradient
                            id={`colorGradient-${asset.symbol}`}
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor={asset.change > 0 ? "#10b981" : "#ef4444"}
                              stopOpacity={0.8}
                            />
                            <stop
                              offset="95%"
                              stopColor={asset.change > 0 ? "#10b981" : "#ef4444"}
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke="#333"
                        />
                        <XAxis
                          dataKey="formattedDate"
                          tick={{ fontSize: 12 }}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          domain={["dataMin - 1%", "dataMax + 1%"]}
                          tick={{ fontSize: 12 }}
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(value) =>
                            asset.type === "crypto" && asset.price < 1
                              ? value.toFixed(4)
                              : value.toFixed(0)
                          }
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                          type="monotone"
                          dataKey="value"
                          stroke={asset.change > 0 ? "#10b981" : "#ef4444"}
                          strokeWidth={2}
                          fillOpacity={1}
                          fill={`url(#colorGradient-${asset.symbol})`}
                          animationDuration={1000}
                          animationEasing="ease-in-out"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </TabsContent>
              );
            })}
          </Tabs>

          {/* Asset Details */}
          <div className="grid grid-cols-2 gap-4">
            {asset.marketCap && (
              <div>
                <p className="text-sm text-muted-foreground">Market Cap</p>
                <p className="font-medium">{asset.marketCap}</p>
              </div>
            )}
            {asset.volume && (
              <div>
                <p className="text-sm text-muted-foreground">24h Volume</p>
                <p className="font-medium">{asset.volume}</p>
              </div>
            )}
            {asset.high24h && (
              <div>
                <p className="text-sm text-muted-foreground">24h High</p>
                <p className="font-medium">{formatPrice(asset.high24h, asset.type)}</p>
              </div>
            )}
            {asset.low24h && (
              <div>
                <p className="text-sm text-muted-foreground">24h Low</p>
                <p className="font-medium">{formatPrice(asset.low24h, asset.type)}</p>
              </div>
            )}
          </div>

          {/* Asset Description */}
          {asset.description && (
            <div>
              <p className="text-sm text-muted-foreground mb-2">About {asset.name}</p>
              <p className="text-sm">{asset.description}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
