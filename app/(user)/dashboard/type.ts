import { User } from "@/types";

export const mockUser: User = {
  name: "Andreas",
  kycVerified: true,
  isAdmin: false,
  balance: 18908.00,
  investments: [{
    plan: "Quantum",
    amount: 3300,
    roi: 15,
    max: 10000
  },
  {
    plan: "Growth",
    amount: 5000,
    roi: 12,
    max: 15000
  }],
  recentTransactions: [
    { id: "tx1", type: "deposit", amount: 5000, status: "completed", date: "2024-01-15" },
    { id: "tx2", type: "withdrawal", amount: 2000, status: "pending", date: "2024-01-14" },
    { id: "tx3", type: "deposit", amount: 3000, status: "completed", date: "2024-01-13" }
  ],
  trendingStocks: [
    { symbol: "NFLX", name: "Netflix", price: 303.89, change: -1.78 },
    { symbol: "AMZN", name: "Amazon", price: 100.78, change: 1.78 },
    { symbol: "AAPL", name: "Apple Inc.", price: 185.92, change: 0.45 },
    { symbol: "MSFT", name: "Microsoft", price: 376.17, change: 2.15 },
    { symbol: "GOOGL", name: "Alphabet Inc.", price: 142.65, change: -0.89 },
    { symbol: "TSLA", name: "Tesla Inc.", price: 218.89, change: -2.34 },
    { symbol: "META", name: "Meta Platforms", price: 374.49, change: 1.67 },
    { symbol: "NVDA", name: "NVIDIA Corp.", price: 547.10, change: 3.21 },
    { symbol: "AMD", name: "Advanced Micro Devices", price: 137.89, change: 2.78 },
    { symbol: "INTC", name: "Intel Corp.", price: 47.06, change: 0.92 },
    { symbol: "CRM", name: "Salesforce", price: 251.90, change: 1.45 },
    { symbol: "ADBE", name: "Adobe Inc.", price: 596.89, change: -0.67 }
  ]
};