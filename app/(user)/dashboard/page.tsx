"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Timestamp } from "firebase/firestore";
import {
  AlertCircle,
  ArrowUpRight,
  Badge,
  BadgeCheck,
  Check,
  LogOut,
  Loader2,
} from "lucide-react";
import { LineChart, Line, ResponsiveContainer, XAxis, Tooltip } from "recharts";
import { fetchMarketData, MarketData } from "@/lib/market-api";
import { AssetDetailModal, Asset } from "@/components/dashboard/AssetDetailModal";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useRouter } from "next/navigation";
import { WithdrawModal } from "@/components/dashboard/WithdrawModal";
import { useWithdraw } from "@/hooks/useWithdraw";
import { useBalance } from "@/hooks/useBalance.ts";
import { useInvestments } from "@/hooks/useInvestments";
import { useTransactions } from "@/hooks/useTransactions";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const { user, loading: userLoading } = useAuth();
  const { balance, loading: balanceLoading } = useBalance();
  const { investments, loading: investmentsLoading } = useInvestments();
  const { transactions, loading: transactionsLoading, refreshTransactions } = useTransactions();
  const router = useRouter();
  const [progress, setProgress] = useState(33);
  const [txPage, setTxPage] = useState(1);
  const [invPage, setInvPage] = useState(1);
  const [initialLoad, setInitialLoad] = useState(true);
  const txPerPage = 3;
  const invPerPage = 1;
  const txTotalPages = Math.ceil((transactions?.length || 0) / txPerPage);
  const invTotalPages = Math.ceil((investments?.length || 0) / invPerPage);
  const paginatedTx = transactions?.slice(
    (txPage - 1) * txPerPage,
    txPage * txPerPage
  ) || [];
  // Sort investments by timestamp (newest first) before pagination
  const sortedInvestments = [...(investments || [])].sort((a, b) => {
    // Convert timestamps to Date objects if they aren't already
    const dateA = a.timestamp instanceof Date ? a.timestamp : a.timestamp.toDate();
    const dateB = b.timestamp instanceof Date ? b.timestamp : b.timestamp.toDate();
    // Sort in descending order (newest first)
    return dateB.getTime() - dateA.getTime();
  });
  
  const paginatedInv = sortedInvestments.slice(
    (invPage - 1) * invPerPage,
    invPage * invPerPage
  ) || [];
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const { submitWithdraw, loading, error } = useWithdraw();
  
  // Market data state
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [marketLoading, setMarketLoading] = useState(true);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [assetDetailOpen, setAssetDetailOpen] = useState(false);
  
  // Track if data has been loaded at least once
  useEffect(() => {
    if (user && !userLoading && initialLoad) {
      setInitialLoad(false);
    }
  }, [user, userLoading, initialLoad]);
  
  // Fetch market data
  useEffect(() => {
    const getMarketData = async () => {
      try {
        setMarketLoading(true);
        const data = await fetchMarketData();
        setMarketData(data);
      } catch (error) {
        console.error("Error fetching market data:", error);
      } finally {
        setMarketLoading(false);
      }
    };
    
    getMarketData();
    
    // Refresh market data every 60 seconds
    const intervalId = setInterval(getMarketData, 60000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Handle asset selection for detailed view
  const handleAssetClick = (asset: Asset) => {
    setSelectedAsset(asset);
    setAssetDetailOpen(true);
  };
  
  // Combined loading state - only show loading on initial load
  const isLoading = initialLoad && (userLoading || balanceLoading || investmentsLoading || transactionsLoading);
  
  // Function to get status badge styles based on investment status
  const getStatusStyles = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "bg-emerald-500/20 text-emerald-500";
      case "pending":
        return "bg-amber-500/20 text-amber-500";
      case "completed":
        return "bg-blue-500/20 text-blue-500";
      case "cancelled":
      case "failed":
        return "bg-red-500/20 text-red-500";
      default:
        return "bg-gray-500/20 text-gray-500";
    }
  };
  
  // Helper function to safely format timestamps from Firestore
  const formatTimestamp = (timestamp: any): string => {
    if (!timestamp) return "";
    
    // Handle Firestore Timestamp objects
    if (timestamp instanceof Timestamp) {
      return timestamp.toDate().toLocaleDateString();
    }
    
    // Handle timestamps that have a toDate method (Firestore Timestamp-like objects)
    if (typeof timestamp === 'object' && typeof timestamp.toDate === 'function') {
      return timestamp.toDate().toLocaleDateString();
    }
    
    // Handle Date objects
    if (timestamp instanceof Date) {
      return timestamp.toLocaleDateString();
    }
    
    // Handle string or number timestamps
    try {
      return new Date(timestamp).toLocaleDateString();
    } catch (error) {
      console.error("Error formatting timestamp:", error);
      return "Invalid date";
    }
  };

  const handleWithdraw = async ({
    amount,
    wallet,
    coin,
  }: {
    amount: number;
    wallet: string;
    coin: string;
  }) => {
    if (amount > balance) {
      toast.error("Withdrawal amount cannot exceed your available balance");
      return;
    }
    
    const success = await submitWithdraw(amount, wallet, coin);
    
    if (success) {
      toast.success("Withdrawal request submitted");
      // Refresh transactions to show the new withdrawal
      refreshTransactions();
    } else if (error) {
      toast.error(error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.refresh();
      router.push("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  // Loading screen
  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-background pb-16 bg-black relative z-50">
        <div className="p-4 space-y-6">
          <div className="flex items-center justify-center h-screen">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-lg font-medium">Loading your dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <>
      <div className="flex flex-col min-h-screen bg-background pb-16 bg-black">
        <div className="p-4 space-y-6">
          {/* User Welcome & KYC Badge */}
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-2xl font-bold">
                Hi, <br /> {user?.name || "User"} 👋
              </h2>
              <p className="text-muted-foreground">Welcome back!</p>
            </div>
            <div className="flex items-center gap-4">
              {user?.kycVerified ? (
                <div className="bg-emerald-500/10 p-1 rounded-full flex items-center gap-2">
                  <span className="text-sm font-medium text-emerald-500">
                    <BadgeCheck className="text-emerald-500" />
                  </span>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-primary hover:text-primary-foreground hover:bg-primary"
                  onClick={() => router.push("/dashboard/kyc")}
                >
                  Verify KYC
                </Button>
              )}
              <LogOut
                className="text-red-700 cursor-pointer hover:text-red-500 transition-colors"
                onClick={handleLogout}
              />
            </div>
          </div>

          {/* Balance Card */}
          <div className="relative w-full max-w-md mx-auto">
            {/* Background (stacked) card */}
            <div className="px-2">
              <div className="absolute -top-2 w-full flex justify-center h-full bg-yellow-400 rounded-[20px] z-0"></div>
            </div>

            {/* Foreground card */}
            <Card className="relative z-10 bg-gradient-to-br border-none from-royal to-royal-dark text-white rounded-[20px] py-4 overflow-hidden">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-white/80">Available Balance</p>
                      <div className="flex items-baseline gap-2">
                        <h3 className="text-3xl font-bold">
                          ${balance?.toFixed(2) || "0.00"}
                        </h3>
                        <span className="text-emerald-300 text-sm">+4.78%</span>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Button
                        variant="secondary"
                        disabled={!user?.kycVerified || balance <= 0}
                        title={
                          !user?.kycVerified
                            ? "KYC verification required for withdrawals"
                            : balance <= 0
                            ? "No funds available for withdrawal"
                            : ""
                        }
                        className="flex items-center gap-2 text-white border-white/20 rounded-xl hover:bg-white/10 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => setWithdrawOpen(true)}
                      >
                        <ArrowUpRight className="w-4 h-4" />
                        Withdraw
                      </Button>
                      {!user?.kycVerified && (
                        <p className="text-sm text-red-400 mt-2">
                          You must verify KYC to make a withdrawal.
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="w-[200px] h-[100px] invisible">hidden</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Transactions */}
          {paginatedInv.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Recent Transactions</h3>
              <div className="space-y-3">
                {paginatedTx.map((tx) => (
                  <Card key={tx.id} className="bg-card/50 rounded-[20px]">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              tx.type === "deposit"
                                ? "bg-emerald-500/10 text-emerald-500"
                                : "bg-red-500/10 text-red-500"
                            }`}
                          >
                            {tx.type === "deposit" ? "+" : "-"}
                          </div>
                          <div>
                            <p className="font-medium capitalize">{tx.type}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(tx.timestamp).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p
                            className={`font-semibold ${
                              tx.type === "deposit"
                                ? "text-emerald-500"
                                : "text-red-500"
                            }`}
                          >
                            ${tx.amount.toFixed(2)}
                          </p>
                          <p
                            className={`text-xs ${
                              tx.status === "completed"
                                ? "text-emerald-500"
                                : tx.status === "pending"
                                ? "text-amber-500"
                                : "text-red-500"
                            }`}
                          >
                            {tx.status}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                <div className="flex justify-center gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={txPage === 1}
                    onClick={() => setTxPage(txPage - 1)}
                  >
                    &lt;
                  </Button>
                  {/* <span className="text-xs text-muted-foreground">Page {txPage} of {txTotalPages}</span> */}
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={txPage === txTotalPages}
                    onClick={() => setTxPage(txPage + 1)}
                  >
                    &gt;
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Current Investment or Investment Plans */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Your Investments</h3>
              <Button
                variant="link"
                className="text-primary p-0"
                onClick={() => router.push("/dashboard/plans")}
              >
                View Plans
              </Button>
            </div>
            <div className="space-y-4">
              {paginatedInv.length > 0 ? (
                <>
                  {paginatedInv.map((investment, index) => (
                    <Card key={index} className="bg-card/50 rounded-[20px]">
                      <CardContent className="pt-6">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold">
                                {investment.planName} Plan
                              </h4>
                              <div className="flex items-center gap-2">
                                <p className="text-sm text-muted-foreground">
                                  Investment
                                </p>
                                <span
                                  className={`text-xs px-2 py-0.5 rounded-full ${getStatusStyles(
                                    investment.status
                                  )}`}
                                >
                                  {investment.status}
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">
                                ${investment.amount}
                              </p>
                              <p className="text-sm text-emerald-500">
                                +{investment.roi}% ROI
                              </p>
                            </div>
                          </div>
                          <Progress
                            value={(investment.amount / investment.max) * 100}
                            className="h-2"
                          />
                          <div className="flex justify-between items-center">
                            <p className="text-xs text-muted-foreground">
                              ${investment.amount} invested
                            </p>
                            {/* <p className="text-xs text-muted-foreground">
                              ${investment.amount} invested of ${investment.max}{" "}
                              maximum
                            </p> */}
                            <p className="text-xs text-muted-foreground">
                              {formatTimestamp(investment.timestamp)}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  <div className="flex justify-center gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={invPage === 1}
                      onClick={() => setInvPage(invPage - 1)}
                    >
                      &lt;
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={invPage === invTotalPages}
                      onClick={() => setInvPage(invPage + 1)}
                    >
                      &gt;
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center space-y-4 py-8">
                  <p className="text-muted-foreground">
                    You don't have any active investments.
                  </p>
                  <Button
                    onClick={() => router.push("/dashboard/plans")}
                    size="lg"
                    className="bg-secondary-foreground hover:bg-secondary/90 text-white rounded-2xl"
                  >
                    Invest Now
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Trending Markets */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Trending Markets</h3>
            {marketLoading ? (
              <div className="grid grid-cols-2 gap-4">
                {[...Array(6)].map((_, index) => (
                  <Card key={index} className="bg-card/50 rounded-[20px]">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <Skeleton className="w-8 h-8 rounded-full" />
                        <div className="space-y-1">
                          <Skeleton className="h-4 w-16" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-baseline justify-between">
                          <Skeleton className="h-4 w-20" />
                          <Skeleton className="h-3 w-12" />
                        </div>
                        <Skeleton className="h-[40px] w-full" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {marketData.map((asset, index) => (
                  <Card 
                    key={index} 
                    className="bg-card/50 rounded-[20px] cursor-pointer hover:bg-card/80 transition-colors duration-200"
                    onClick={() => handleAssetClick(asset)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                          style={{ backgroundColor: asset.color }}
                        >
                          {asset.symbol.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-semibold">{asset.symbol}</h4>
                          <p className="text-xs text-muted-foreground">
                            {asset.name}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-baseline justify-between">
                          <span className="font-medium">
                            {asset.type === "crypto" && asset.price > 1000 
                              ? `$${asset.price.toLocaleString()}` 
                              : asset.type === "crypto" && asset.price < 1 
                                ? `$${asset.price.toFixed(4)}` 
                                : `$${asset.price.toFixed(2)}`}
                          </span>
                          <span 
                            className={`text-sm ${asset.change > 0 ? 'text-emerald-500' : 'text-red-500'}`}
                          >
                            {asset.change > 0 ? '+' : ''}{asset.change}%
                          </span>
                        </div>
                        {/* Enhanced line chart using recharts */}
                        <div className="h-[40px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={asset.hourlyData?.slice(-12)}>
                              <Line 
                                type="monotone" 
                                dataKey="value" 
                                stroke={asset.change > 0 ? '#10b981' : '#ef4444'} 
                                strokeWidth={2} 
                                dot={false}
                                isAnimationActive={true}
                                animationDuration={1000}
                                animationEasing="ease-in-out"
                              />
                              <XAxis 
                                dataKey="formattedDate" 
                                hide={true} 
                              />
                              <Tooltip 
                                content={({ active, payload }: any) => {
                                  if (active && payload && payload.length) {
                                    const value = Number(payload[0].value);
                                    return (
                                      <div className="bg-background/95 border border-border p-2 rounded-md shadow-md">
                                        <p className="text-xs text-muted-foreground">
                                          {payload[0].payload.formattedDate}
                                        </p>
                                        <p className="text-sm font-medium">
                                          {asset.type === "crypto" && value > 1000 
                                            ? `$${value.toLocaleString()}` 
                                            : asset.type === "crypto" && value < 1 
                                              ? `$${value.toFixed(4)}` 
                                              : `$${value.toFixed(2)}`}
                                        </p>
                                      </div>
                                    );
                                  }
                                  return null;
                                }}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <WithdrawModal
        open={withdrawOpen}
        onClose={() => setWithdrawOpen(false)}
        onSubmit={handleWithdraw}
      />
      <AssetDetailModal
        asset={selectedAsset}
        open={assetDetailOpen}
        onClose={() => setAssetDetailOpen(false)}
      />
    </>
  );
}
