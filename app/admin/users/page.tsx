"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationEllipsis,
} from "@/components/ui/pagination"
import { ChevronLeft, ChevronRight, Search } from "lucide-react"
import { collection, query, getDocs, doc, updateDoc, addDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { toast } from "sonner"
import { AdminNav } from "@/components/admin-nav"

interface User {
  id: string
  email: string
  name: string
  phone: string
  balance: number
  kycVerified: boolean
  joinedAt?: Date
  lastLogin?: Date
  totalInvestments?: number
  totalTransactions?: number
}

const ITEMS_PER_PAGE = 10

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  const [amount, setAmount] = useState<string>("")
  const [editBalanceDialogOpen, setEditBalanceDialogOpen] = useState(false)
  const [editingUserId, setEditingUserId] = useState<string | null>(null)
  const [newBalance, setNewBalance] = useState<string>("")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [currentPage, setCurrentPage] = useState<number>(1)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersQuery = query(collection(db, "Users"))
        const snapshot = await getDocs(usersQuery)
        
        // Get transaction counts for each user
        const transactionCounts = new Map()
        const transactionsQuery = query(collection(db, "transactions"))
        const transactionsSnapshot = await getDocs(transactionsQuery)
        
        transactionsSnapshot.docs.forEach(doc => {
          const userId = doc.data().userId
          if (userId) {
            transactionCounts.set(userId, (transactionCounts.get(userId) || 0) + 1)
          }
        })
        
        // Get investment counts for each user
        const investmentCounts = new Map()
        const investmentsQuery = query(collection(db, "investments"))
        const investmentsSnapshot = await getDocs(investmentsQuery)
        
        investmentsSnapshot.docs.forEach(doc => {
          const userId = doc.data().userId
          if (userId) {
            investmentCounts.set(userId, (investmentCounts.get(userId) || 0) + 1)
          }
        })
        
        const userData = snapshot.docs.map((doc) => {
          const data = doc.data()
          return {
            id: doc.id,
            email: data.email || "",
            name: data.name || "",
            phone: data.phone || "",
            balance: data.balance || 0,
            kycVerified: data.kycVerified || false,
            joinedAt: data.createdAt ? new Date(data.createdAt.toDate()) : undefined,
            lastLogin: data.lastLogin ? new Date(data.lastLogin.toDate()) : undefined,
            totalInvestments: investmentCounts.get(doc.id) || 0,
            totalTransactions: transactionCounts.get(doc.id) || 0
          }
        }) as User[]
        
        setUsers(userData)
      } catch (error) {
        console.error("Error fetching users:", error)
        toast.error("Failed to fetch users")
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  const handleTopUp = async (userId: string) => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast.error("Please enter a valid amount")
      return
    }

    const numAmount = Number(amount)
    const user = users.find((u) => u.id === userId)

    if (!user) {
      toast.error("User not found")
      return
    }

    try {
      // Update user balance
      const userRef = doc(db, "Users", userId)
      const updatedBalance = user.balance + numAmount
      await updateDoc(userRef, {
        balance: updatedBalance,
      })

      // Create transaction record
      await addDoc(collection(db, "transactions"), {
        userId,
        type: "topup",
        amount: numAmount,
        status: "completed",
        createdAt: serverTimestamp(),
        description: "Admin top-up",
      })

      // Update local state
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, balance: updatedBalance } : u
        )
      )
      setAmount("")
      setSelectedUser(null)
      toast.success("Balance updated successfully")
    } catch (error) {
      console.error("Error updating balance:", error)
      toast.error("Failed to update balance")
    }
  }

  const handleOpenEditBalance = (userId: string) => {
    const user = users.find((u) => u.id === userId)
    if (user) {
      setEditingUserId(userId)
      setNewBalance(user.balance.toString())
      setEditBalanceDialogOpen(true)
    }
  }

  const handleSetBalance = async () => {
    if (!editingUserId) return

    const balanceValue = parseFloat(newBalance)
    if (isNaN(balanceValue) || balanceValue < 0) {
      toast.error("Please enter a valid balance (must be 0 or greater)")
      return
    }

    const user = users.find((u) => u.id === editingUserId)
    if (!user) {
      toast.error("User not found")
      return
    }

    try {
      // Update user balance
      const userRef = doc(db, "Users", editingUserId)
      const oldBalance = user.balance
      await updateDoc(userRef, {
        balance: balanceValue,
      })

      // Create transaction record for audit
      const balanceDifference = balanceValue - oldBalance
      await addDoc(collection(db, "transactions"), {
        userId: editingUserId,
        type: balanceDifference >= 0 ? "admin_adjustment" : "admin_adjustment",
        amount: Math.abs(balanceDifference),
        status: "completed",
        createdAt: serverTimestamp(),
        description: `Admin balance adjustment: ${oldBalance.toFixed(2)} → ${balanceValue.toFixed(2)}`,
      })

      // Update local state
      setUsers((prev) =>
        prev.map((u) =>
          u.id === editingUserId ? { ...u, balance: balanceValue } : u
        )
      )
      
      setEditBalanceDialogOpen(false)
      setEditingUserId(null)
      setNewBalance("")
      toast.success(`Balance set to $${balanceValue.toFixed(2)}`)
    } catch (error) {
      console.error("Error setting balance:", error)
      toast.error("Failed to set balance")
    }
  }

  // Filter users based on search query
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) {
      return users
    }

    const query = searchQuery.toLowerCase().trim()
    return users.filter((user) => {
      const nameMatch = user.name.toLowerCase().includes(query)
      const emailMatch = user.email.toLowerCase().includes(query)
      const phoneMatch = user.phone?.toLowerCase().includes(query) || false
      return nameMatch || emailMatch || phoneMatch
    })
  }, [users, searchQuery])

  // Calculate pagination
  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex)

  // Reset to page 1 when search query changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery])

  return (
    <div className="space-y-8 p-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">User Management</h2>
        <p className="text-muted-foreground">Manage user balances and transactions.</p>
      </div>

      {/* <AdminNav /> */}

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search by name, email, or phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 rounded-2xl"
        />
      </div>

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        Showing {paginatedUsers.length} of {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}
        {searchQuery && ` matching "${searchQuery}"`}
      </div>

      <div className="grid gap-4">
        {loading ? (
          <Card className="bg-card/50 rounded-[20px]">
            <CardContent className="p-6 text-center text-muted-foreground">
              Loading users...
            </CardContent>
          </Card>
        ) : paginatedUsers.length === 0 ? (
          <Card className="bg-card/50 rounded-[20px]">
            <CardContent className="p-6 text-center text-muted-foreground">
              {searchQuery ? `No users found matching "${searchQuery}"` : "No users found"}
            </CardContent>
          </Card>
        ) : (
          paginatedUsers.map((user) => (
          <Card key={user.id} className="bg-card/50 rounded-[20px]">
            <CardHeader>
              <CardTitle>{user.name}</CardTitle>
              <CardDescription>{user.email}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">User Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Phone:</span>
                      <span>{user.phone || 'Not provided'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">KYC Status:</span>
                      <span className={user.kycVerified ? 'text-green-500' : 'text-amber-500'}>
                        {user.kycVerified ? 'Verified' : 'Not Verified'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Joined:</span>
                      <span>{user.joinedAt ? user.joinedAt.toLocaleDateString() : 'Unknown'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Last Login:</span>
                      <span>{user.lastLogin ? user.lastLogin.toLocaleDateString() : 'Unknown'}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Financial Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Current Balance:</span>
                      <span className="font-semibold">${user.balance.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Investments:</span>
                      <span>{user.totalInvestments}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Transactions:</span>
                      <span>{user.totalTransactions}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-end gap-2 mt-4 border-t pt-4">
                {selectedUser === user.id ? (
                  <>
                    <Input
                      type="number"
                      placeholder="Enter amount"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-32"
                    />
                    <Button
                      onClick={() => handleTopUp(user.id)}
                      className="bg-green-600 hover:bg-green-700 rounded-2xl"
                    >
                      Confirm
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedUser(null)
                        setAmount("")
                      }}
                      className="rounded-2xl"
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      onClick={() => handleOpenEditBalance(user.id)}
                      variant="outline"
                      className="rounded-2xl"
                    >
                      Set Balance
                    </Button>
                    <Button
                      onClick={() => setSelectedUser(user.id)}
                      className="rounded-2xl"
                    >
                      Top Up Balance
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <Button
                  variant="ghost"
                  size="default"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="gap-1 pl-2.5"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Previous</span>
                </Button>
              </PaginationItem>
              
              {(() => {
                const pages: (number | 'ellipsis')[] = []
                
                if (totalPages <= 7) {
                  // Show all pages if 7 or fewer
                  for (let i = 1; i <= totalPages; i++) {
                    pages.push(i)
                  }
                } else {
                  // Always show first page
                  pages.push(1)
                  
                  if (currentPage <= 4) {
                    // Near the start
                    for (let i = 2; i <= 5; i++) {
                      pages.push(i)
                    }
                    pages.push('ellipsis')
                    pages.push(totalPages)
                  } else if (currentPage >= totalPages - 3) {
                    // Near the end
                    pages.push('ellipsis')
                    for (let i = totalPages - 4; i <= totalPages; i++) {
                      pages.push(i)
                    }
                  } else {
                    // In the middle
                    pages.push('ellipsis')
                    for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                      pages.push(i)
                    }
                    pages.push('ellipsis')
                    pages.push(totalPages)
                  }
                }
                
                return pages.map((item, index) => {
                  if (item === 'ellipsis') {
                    return (
                      <PaginationItem key={`ellipsis-${index}`}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    )
                  }
                  return (
                    <PaginationItem key={item}>
                      <Button
                        variant={currentPage === item ? "outline" : "ghost"}
                        size="icon"
                        onClick={() => setCurrentPage(item)}
                        className="h-9 w-9"
                      >
                        {item}
                      </Button>
                    </PaginationItem>
                  )
                })
              })()}
              
              <PaginationItem>
                <Button
                  variant="ghost"
                  size="default"
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="gap-1 pr-2.5"
                >
                  <span>Next</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      <Dialog open={editBalanceDialogOpen} onOpenChange={setEditBalanceDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Set User Balance</DialogTitle>
            <DialogDescription>
              {editingUserId && (
                <>
                  Set the balance for {users.find((u) => u.id === editingUserId)?.name || "this user"}.
                  Current balance: ${users.find((u) => u.id === editingUserId)?.balance.toFixed(2) || "0.00"}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="balance">New Balance ($)</Label>
              <Input
                id="balance"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={newBalance}
                onChange={(e) => setNewBalance(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditBalanceDialogOpen(false)
                setEditingUserId(null)
                setNewBalance("")
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSetBalance} className="bg-blue-600 hover:bg-blue-700">
              Set Balance
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
