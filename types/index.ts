export interface User {
  name: string;
  phone?: string;
  kycVerified: boolean;
  balance: number;
  isAdmin: boolean;
  wallets?: {
    btc?: string;
    eth?: string;
    usdt?: string;
    xrp?: string;
    sol?: string;
  };
  investments: {
    plan: string;
    amount: number;
    roi: number;
    max: number;
  }[];
  recentTransactions: {
    id: string;
    type: 'deposit' | 'withdrawal' | 'roi';
    amount: number;
    status: 'completed' | 'pending' | 'failed';
    date: string;
  }[];
  trendingStocks: {
    symbol: string;
    name: string;
    price: number;
    change: number;
  }[];
}