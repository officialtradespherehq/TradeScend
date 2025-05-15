"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { collection, query, where, getDocs, doc, updateDoc, getCountFromServer } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "sonner"
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { ArrowUpIcon, ArrowDownIcon, UserIcon, CheckCircleIcon, ArrowDownTrayIcon } from "@heroicons/react/24/outline"
import Image from "next/image"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"

interface KYCRequest {
  id: string
  fullName: string
  dateOfBirth: string
  nationality: string
  documentType: string
  documentNumber: string
  address: string
  city: string
  country: string
  postalCode: string
  status: string
  userId: string
  documentUrl?: string
}

interface WithdrawalRequest {
  id: string
  userId: string
  name: string
  email: string
  amount: number
  walletAddress: string
  status: string
  createdAt: Date
}

interface DashboardStats {
  totalUsers: number
  verifiedUsers: number
  pendingKyc: number
  pendingWithdrawals: number
  totalTransactions: number
  recentActivity: Array<{
    date: string
    transactions: number
  }>
  userDistribution: Array<{
    name: string
    value: number
  }>
}

export default function AdminPage() {
  const { user } = useAuth()
  const [kycRequests, setKycRequests] = useState<KYCRequest[]>([])
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    verifiedUsers: 0,
    pendingKyc: 0,
    pendingWithdrawals: 0,
    totalTransactions: 0,
    recentActivity: [],
    userDistribution: []
  })

  useEffect(() => {
    if (!user?.isAdmin) {
      window.location.href = "/dashboard"
      return
    }

    const fetchRequests = async () => {
      try {
        // Fetch KYC requests
        const kycQuery = query(
          collection(db, "Users"),
          where("kycVerified", "==", false),
          where("kycData", "!=", null)
        )
        const kycSnapshot = await getDocs(kycQuery)
        const kycData = kycSnapshot.docs.map((doc) => {
          const userData = doc.data();
          return {
            id: doc.id,
            ...userData.kycData,
            status: "pending",
            userId: doc.id,
            documentUrl: userData.kycData?.documentUrl || null,
          };
        }) as KYCRequest[]
        setKycRequests(kycData)

        // Fetch withdrawal requests
        const withdrawalQuery = query(
          collection(db, "withdrawals"),
          where("status", "==", "pending")
        )
        const withdrawalSnapshot = await getDocs(withdrawalQuery)
        const withdrawalData = withdrawalSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
        })) as WithdrawalRequest[]
        setWithdrawalRequests(withdrawalData)

        // Fetch dashboard stats
        await fetchDashboardStats(kycData.length, withdrawalData.length)
      } catch (error) {
        console.error("Error fetching requests:", error)
        toast.error("Failed to fetch requests")
      } finally {
        setLoading(false)
      }
    }

    const fetchDashboardStats = async (pendingKyc: number, pendingWithdrawals: number) => {
      try {
        // Get total users count
        const usersSnapshot = await getCountFromServer(collection(db, "Users"))
        const totalUsers = usersSnapshot.data().count

        // Get verified users count
        const verifiedUsersQuery = query(collection(db, "Users"), where("kycVerified", "==", true))
        const verifiedUsersSnapshot = await getCountFromServer(verifiedUsersQuery)
        const verifiedUsers = verifiedUsersSnapshot.data().count

        // Get total transactions count
        const transactionsSnapshot = await getCountFromServer(collection(db, "transactions"))
        const totalTransactions = transactionsSnapshot.data().count

        // Generate mock data for recent activity (last 7 days)
        const recentActivity = generateRecentActivityData()

        // User distribution data
        const userDistribution = [
          { name: "Verified", value: verifiedUsers },
          { name: "Pending", value: pendingKyc },
          { name: "Unverified", value: totalUsers - verifiedUsers - pendingKyc }
        ]

        setStats({
          totalUsers,
          verifiedUsers,
          pendingKyc,
          pendingWithdrawals,
          totalTransactions,
          recentActivity,
          userDistribution
        })
      } catch (error) {
        console.error("Error fetching dashboard stats:", error)
      }
    }

    // Generate mock data for recent activity
    const generateRecentActivityData = () => {
      const data = []
      const today = new Date()
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today)
        date.setDate(today.getDate() - i)
        
        data.push({
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          transactions: Math.floor(Math.random() * 50) + 10 // Random number between 10-60
        })
      }
      
      return data
    }

    fetchRequests()
  }, [user])

  const handleKycApproval = async (userId: string, approved: boolean) => {
    try {
      await updateDoc(doc(db, "Users", userId), {
        kycVerified: approved,
      })

      setKycRequests((prev) => prev.filter((req) => req.userId !== userId))
      toast.success(`KYC request ${approved ? "approved" : "rejected"}`)
    } catch (error) {
      console.error("Error updating KYC status:", error)
      toast.error("Failed to update KYC status")
    }
  }

  const handleWithdrawalApproval = async (requestId: string, approved: boolean) => {
    try {
      await updateDoc(doc(db, "withdrawals", requestId), {
        status: approved ? "completed" : "rejected",
      })

      setWithdrawalRequests((prev) => prev.filter((req) => req.id !== requestId))
      toast.success(`Withdrawal request ${approved ? "approved" : "rejected"}`)
    } catch (error) {
      console.error("Error updating withdrawal status:", error)
      toast.error("Failed to update withdrawal status")
    }
  }

  if (!user?.isAdmin) {
    return null
  }

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

  return (
    <div className="space-y-8 p-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Admin Dashboard</h2>
        <p className="text-muted-foreground">Manage user requests and approvals.</p>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card/50 rounded-[20px]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <UserIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalUsers > 0 ? `${Math.round((stats.verifiedUsers / stats.totalUsers) * 100)}% verified` : '0% verified'}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 rounded-[20px]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending KYC</CardTitle>
            <CheckCircleIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingKyc}</div>
            <p className="text-xs text-muted-foreground">
              {stats.pendingKyc > 0 ? "Requires attention" : "All clear"}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 rounded-[20px]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Withdrawals</CardTitle>
            <ArrowUpIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingWithdrawals}</div>
            <p className="text-xs text-muted-foreground">
              {stats.pendingWithdrawals > 0 ? "Requires approval" : "All clear"}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 rounded-[20px]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <ArrowDownIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTransactions}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-card/50 rounded-[20px]">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Transaction volume over the last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={stats.recentActivity}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="transactions" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 rounded-[20px]">
          <CardHeader>
            <CardTitle>User Distribution</CardTitle>
            <CardDescription>Verification status breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.userDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {stats.userDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="kyc" className="space-y-4">
        <TabsList className="bg-primary/50 rounded-[20px] w-full space-x-4">
          <TabsTrigger value="kyc" className="flex items-center gap-2 rounded-2xl">
            KYC Requests
          </TabsTrigger>
          <TabsTrigger value="withdrawals" className="flex items-center gap-2 rounded-2xl">
            Withdrawal Requests
          </TabsTrigger>
        </TabsList>

        <TabsContent value="kyc">
          <div className="grid gap-4">
            {kycRequests.map((request) => (
              <Card key={request.id} className="bg-card/50 rounded-[20px]">
                <CardHeader>
                  <CardTitle>KYC Request</CardTitle>
                  <CardDescription>From {request.fullName}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="font-medium">Personal Information</p>
                      <div className="mt-2 space-y-2 text-sm">
                        <p>Date of Birth: {request.dateOfBirth}</p>
                        <p>Nationality: {request.nationality}</p>
                        <p>Document Type: {request.documentType}</p>
                        <p>Document Number: {request.documentNumber}</p>
                      </div>
                    </div>
                    <div>
                      <p className="font-medium">Address Information</p>
                      <div className="mt-2 space-y-2 text-sm">
                        <p>Address: {request.address}</p>
                        <p>City: {request.city}</p>
                        <p>Country: {request.country}</p>
                        <p>Postal Code: {request.postalCode}</p>
                      </div>
                    </div>
                    {request.documentUrl && (
                      <div className="col-span-2 mt-4">
                        <p className="font-medium mb-2">Identification Document:</p>
                        <Dialog>
                          <DialogTrigger asChild>
                            <div className="relative w-32 h-32 rounded cursor-pointer hover:opacity-80 border border-border overflow-hidden">
                              <Image 
                                src={request.documentUrl} 
                                alt="Identification Document" 
                                fill 
                                className="object-cover"
                              />
                              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                <span className="text-xs text-white font-medium">View Document</span>
                              </div>
                            </div>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-md">
                            <div className="relative w-full h-[500px]">
                              <Image 
                                src={request.documentUrl} 
                                alt="Identification Document" 
                                fill 
                                className="object-contain"
                              />
                            </div>
                            <div className="mt-4 flex justify-end">
                              <a 
                                href={request.documentUrl} 
                                download="kyc_document.jpg"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90"
                              >
                                <ArrowDownTrayIcon className="h-4 w-4" />
                                Download
                              </a>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button
                      onClick={() => handleKycApproval(request.userId, true)}
                      className="bg-green-600 hover:bg-green-700 rounded-2xl"
                    >
                      Approve
                    </Button>
                    <Button
                      onClick={() => handleKycApproval(request.userId, false)}
                      variant="destructive"
                      className="rounded-2xl"
                    >
                      Reject
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {kycRequests.length === 0 && (
              <Card className="bg-card/50 rounded-[20px]">
                <CardContent className="p-6 text-center text-muted-foreground">
                  No pending KYC requests
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="withdrawals">
          <div className="grid gap-4">
            {withdrawalRequests.map((request) => (
              <Card key={request.id} className="bg-card/50 rounded-[20px]">
                <CardHeader>
                  <CardTitle>Withdrawal Request</CardTitle>
                  <CardDescription>From {request.name}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="font-medium">Request Details</p>
                      <div className="mt-2 space-y-2 text-sm">
                        <p>Amount: ${request.amount.toFixed(2)}</p>
                        <p>Email: {request.email}</p>
                        <p>Date: {request.createdAt.toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div>
                      <p className="font-medium">Wallet Information</p>
                      <div className="mt-2 space-y-2 text-sm">
                        <p className="break-all">Address: {request.walletAddress}</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button
                      onClick={() => handleWithdrawalApproval(request.id, true)}
                      className="bg-green-600 hover:bg-green-700 rounded-2xl"
                    >
                      Approve
                    </Button>
                    <Button
                      onClick={() => handleWithdrawalApproval(request.id, false)}
                      variant="destructive"
                      className="rounded-2xl"
                    >
                      Reject
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {withdrawalRequests.length === 0 && (
              <Card className="bg-card/50 rounded-[20px]">
                <CardContent className="p-6 text-center text-muted-foreground">
                  No pending withdrawal requests
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
