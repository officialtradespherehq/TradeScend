"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  const [amount, setAmount] = useState<string>("")

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
      const newBalance = user.balance + numAmount
      await updateDoc(userRef, {
        balance: newBalance,
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
          u.id === userId ? { ...u, balance: newBalance } : u
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

  return (
    <div className="space-y-8 p-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">User Management</h2>
        <p className="text-muted-foreground">Manage user balances and transactions.</p>
      </div>

      {/* <AdminNav /> */}

      <div className="grid gap-4">
        {users.map((user) => (
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
                  <Button
                    onClick={() => setSelectedUser(user.id)}
                    className="rounded-2xl"
                  >
                    Top Up Balance
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        {users.length === 0 && !loading && (
          <Card className="bg-card/50 rounded-[20px]">
            <CardContent className="p-6 text-center text-muted-foreground">
              No users found
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}