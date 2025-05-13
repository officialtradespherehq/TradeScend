"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { collection, query, getDocs, doc, updateDoc, where } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { toast } from "sonner"
import { AdminNav } from "@/components/admin-nav"

interface Investment {
  id: string
  uid: string
  planName: string
  amount: number
  status: string
  roi: number
  timestamp: Date
  lastPayout?: Date
  max: number
  paymentMethod: string
  transactionHash: string
  userEmail?: string
  userName?: string
}

export default function InvestmentsPage() {
  const [investments, setInvestments] = useState<Investment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchInvestments = async () => {
      try {
        // Use the correct collection name with capital 'I'
        const investmentsQuery = query(collection(db, "Investments"))
        const snapshot = await getDocs(investmentsQuery)
        const investmentData = await Promise.all(
          snapshot.docs.map(async (doc) => {
            const data = doc.data()
            // Fetch user details using the uid field
            const userDoc = await getDocs(query(
              collection(db, "Users"),
              where("__name__", "==", data.uid) // Query by document ID
            ))
            const userData = userDoc.docs[0]?.data()
            
            return {
              id: doc.id,
              ...data,
              timestamp: data.timestamp?.toDate() || new Date(),
              lastPayout: data.lastPayout?.toDate(),
              userEmail: userData?.email || "N/A",
              userName: userData?.name || "N/A",
            } as Investment
          })
        )
        console.log("Fetched investments:", investmentData)
        setInvestments(investmentData)
      } catch (error) {
        console.error("Error fetching investments:", error)
        toast.error("Failed to fetch investments")
      } finally {
        setLoading(false)
      }
    }

    fetchInvestments()
  }, [])

  const handleUpdateROI = async (investmentId: string, newROI: number) => {
    try {
      const investmentRef = doc(db, "Investments", investmentId)
      await updateDoc(investmentRef, {
        roi: newROI,
      })

      setInvestments((prev) =>
        prev.map((inv) =>
          inv.id === investmentId ? { ...inv, roi: newROI } : inv
        )
      )
      toast.success("Investment ROI updated successfully")
    } catch (error) {
      console.error("Error updating ROI:", error)
      toast.error("Failed to update ROI")
    }
  }

  const handleUpdateStatus = async (investmentId: string, newStatus: string) => {
    try {
      const investmentRef = doc(db, "Investments", investmentId)
      await updateDoc(investmentRef, {
        status: newStatus,
      })

      setInvestments((prev) =>
        prev.map((inv) =>
          inv.id === investmentId ? { ...inv, status: newStatus } : inv
        )
      )
      toast.success("Investment status updated successfully")
    } catch (error) {
      console.error("Error updating status:", error)
      toast.error("Failed to update status")
    }
  }

  return (
    <div className="space-y-8 p-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Investment Management</h2>
        <p className="text-muted-foreground">Monitor and manage user investments.</p>
      </div>

      {/* <AdminNav /> */}

      <div className="grid gap-4">
        {investments.map((investment) => (
          <Card key={investment.id} className="bg-card/50 rounded-[20px]">
            <CardHeader>
              <CardTitle>Investment by {investment.userName}</CardTitle>
              <CardDescription>{investment.userEmail}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="font-medium">Investment Details</p>
                  <div className="mt-2 space-y-2 text-sm">
                    <p>Plan: {investment.planName || 'N/A'}</p>
                    <p>Amount: ${investment.amount?.toFixed(2) || '0.00'}</p>
                    <p>ROI: ${investment.roi?.toFixed(2) || '0.00'}</p>
                    <p>Status: {investment.status || 'pending'}</p>
                    <p>Payment Method: {investment.paymentMethod || 'N/A'}</p>
                  </div>
                </div>
                <div>
                  <p className="font-medium">Timing</p>
                  <div className="mt-2 space-y-2 text-sm">
                    <p>Created: {investment.timestamp?.toLocaleDateString() || 'Unknown'}</p>
                    <p>Last Payout: {investment.lastPayout?.toLocaleDateString() || 'None'}</p>
                    <p>Transaction Hash: <span className="break-all">{investment.transactionHash || 'N/A'}</span></p>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Input
                  type="number"
                  placeholder="Update ROI"
                  className="w-32"
                  onBlur={(e) => {
                    const value = parseFloat(e.target.value)
                    if (!isNaN(value)) {
                      handleUpdateROI(investment.id, value)
                    }
                  }}
                />
                <select
                  className="rounded-md border p-2"
                  value={investment.status || ''}
                  onChange={(e) => handleUpdateStatus(investment.id, e.target.value)}
                >
                  <option value="pending">Pending</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </CardContent>
          </Card>
        ))}
        {investments.length === 0 && !loading && (
          <Card className="bg-card/50 rounded-[20px]">
            <CardContent className="p-6 text-center text-muted-foreground">
              No investments found
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}