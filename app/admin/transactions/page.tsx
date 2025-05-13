"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { collection, query, getDocs, doc, updateDoc, orderBy, where, deleteDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { toast } from "sonner"
import { ArrowUpIcon, ArrowDownIcon, RefreshCwIcon, CheckIcon, XIcon, SearchIcon, Trash2Icon } from "lucide-react"

interface Transaction {
  id: string
  type: 'deposit' | 'withdrawal' | 'roi'
  amount: number
  status: 'pending' | 'completed' | 'failed'
  timestamp: Date
  uid: string
  description?: string
  userName?: string
  userEmail?: string
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState<string>("")

  useEffect(() => {
    fetchTransactions()
  }, [])

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      // Get all transactions
      const transactionsQuery = query(
        collection(db, "Transactions"),
        orderBy("timestamp", "desc")
      )
      const snapshot = await getDocs(transactionsQuery)
      
      // Get user details for each transaction
      const transactionData = await Promise.all(
        snapshot.docs.map(async (doc) => {
          const data = doc.data()
          
          // Fetch user details
          const userDoc = await getDocs(query(
            collection(db, "Users"),
            where("__name__", "==", data.uid)
          ))
          const userData = userDoc.docs[0]?.data()
          
          return {
            id: doc.id,
            type: data.type,
            amount: data.amount,
            status: data.status,
            timestamp: data.timestamp?.toDate ? data.timestamp.toDate() : new Date(),
            uid: data.uid,
            description: data.description,
            userName: userData?.name || "Unknown User",
            userEmail: userData?.email || "No Email"
          } as Transaction
        })
      )
      
      setTransactions(transactionData)
    } catch (error) {
      console.error("Error fetching transactions:", error)
      toast.error("Failed to fetch transactions")
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (transactionId: string, newStatus: string) => {
    try {
      const transactionRef = doc(db, "Transactions", transactionId)
      await updateDoc(transactionRef, {
        status: newStatus
      })

      // If completing a deposit, update user balance
      const transaction = transactions.find(t => t.id === transactionId)
      if (transaction && transaction.type === 'deposit' && newStatus === 'completed' && transaction.status !== 'completed') {
        const userRef = doc(db, "Users", transaction.uid)
        // Get current user data to update balance
        const userDoc = await getDocs(query(
          collection(db, "Users"),
          where("__name__", "==", transaction.uid)
        ))
        
        if (userDoc.docs[0]) {
          const userData = userDoc.docs[0].data()
          const currentBalance = userData.balance || 0
          await updateDoc(userRef, {
            balance: currentBalance + transaction.amount
          })
        }
      }

      // Update local state
      setTransactions(prev =>
        prev.map(tx =>
          tx.id === transactionId ? { ...tx, status: newStatus as any } : tx
        )
      )
      
      toast.success(`Transaction status updated to ${newStatus}`)
    } catch (error) {
      console.error("Error updating transaction status:", error)
      toast.error("Failed to update transaction status")
    }
  }
  
  const handleDeleteTransaction = async (transactionId: string) => {
    if (!confirm("Are you sure you want to delete this transaction? This action cannot be undone.")) {
      return
    }
    
    try {
      const transactionRef = doc(db, "Transactions", transactionId)
      await deleteDoc(transactionRef)
      
      // Update local state
      setTransactions(prev => prev.filter(tx => tx.id !== transactionId))
      
      toast.success("Transaction deleted successfully")
    } catch (error) {
      console.error("Error deleting transaction:", error)
      toast.error("Failed to delete transaction")
    }
  }

  // Filter transactions based on filters
  const filteredTransactions = transactions.filter(transaction => {
    // Filter by status
    if (statusFilter !== "all" && transaction.status !== statusFilter) {
      return false
    }
    
    // Filter by type
    if (typeFilter !== "all" && transaction.type !== typeFilter) {
      return false
    }
    
    // Filter by search query (user name, email, or transaction ID)
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        transaction.userName?.toLowerCase().includes(query) ||
        transaction.userEmail?.toLowerCase().includes(query) ||
        transaction.id.toLowerCase().includes(query) ||
        transaction.description?.toLowerCase().includes(query)
      )
    }
    
    return true
  })

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500'
      case 'pending':
        return 'bg-yellow-500'
      case 'failed':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  // Get transaction type icon
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <ArrowDownIcon className="h-4 w-4 text-green-500" />
      case 'withdrawal':
        return <ArrowUpIcon className="h-4 w-4 text-red-500" />
      case 'roi':
        return <RefreshCwIcon className="h-4 w-4 text-blue-500" />
      default:
        return null
    }
  }

  return (
    <div className="space-y-8 p-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Transaction Management</h2>
        <p className="text-muted-foreground">View and update transaction statuses</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by user or transaction..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="deposit">Deposits</SelectItem>
            <SelectItem value="withdrawal">Withdrawals</SelectItem>
            <SelectItem value="roi">ROI Payments</SelectItem>
          </SelectContent>
        </Select>
        <Button 
          onClick={fetchTransactions} 
          variant="outline"
          className="w-full sm:w-auto"
        >
          Refresh
        </Button>
      </div>

      {/* Transactions List */}
      <div className="grid gap-4">
        {loading ? (
          <Card className="bg-card/50 rounded-[20px]">
            <CardContent className="p-6 text-center">
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
              <p className="mt-2 text-muted-foreground">Loading transactions...</p>
            </CardContent>
          </Card>
        ) : filteredTransactions.length === 0 ? (
          <Card className="bg-card/50 rounded-[20px]">
            <CardContent className="p-6 text-center text-muted-foreground">
              No transactions found
            </CardContent>
          </Card>
        ) : (
          filteredTransactions.map((transaction) => (
            <Card key={transaction.id} className="bg-card/50 rounded-[20px]">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      {getTypeIcon(transaction.type)}
                      <span className="capitalize">{transaction.type}</span>
                      <Badge className={`ml-2 ${getStatusColor(transaction.status)}`}>
                        {transaction.status}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      {transaction.timestamp.toLocaleString()}
                    </CardDescription>
                  </div>
                  <div className="text-xl font-bold">
                    ${transaction.amount.toFixed(2)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm font-medium mb-1">User Information</p>
                    <div className="text-sm space-y-1">
                      <p>Name: {transaction.userName}</p>
                      <p>Email: {transaction.userEmail}</p>
                      <p>User ID: {transaction.uid}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">Transaction Details</p>
                    <div className="text-sm space-y-1">
                      <p>Transaction ID: {transaction.id}</p>
                      <p>Description: {transaction.description || "N/A"}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {transaction.status !== 'completed' && (
                          <Button
                            onClick={() => handleUpdateStatus(transaction.id, 'completed')}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 rounded-2xl"
                          >
                            <CheckIcon className="h-4 w-4 mr-1" />
                            Complete
                          </Button>
                        )}
                        {transaction.status !== 'failed' && (
                          <Button
                            onClick={() => handleUpdateStatus(transaction.id, 'failed')}
                            size="sm"
                            variant="destructive"
                            className="rounded-2xl"
                          >
                            <XIcon className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        )}
                        {transaction.status !== 'pending' && (
                          <Button
                            onClick={() => handleUpdateStatus(transaction.id, 'pending')}
                            size="sm"
                            variant="outline"
                            className="rounded-2xl"
                          >
                            Reset to Pending
                          </Button>
                        )}
                        <Button
                          onClick={() => handleDeleteTransaction(transaction.id)}
                          size="sm"
                          variant="outline"
                          className="rounded-2xl border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                        >
                          <Trash2Icon className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
