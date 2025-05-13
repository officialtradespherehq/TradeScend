"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { AlertCircle, KeyRound, User, Wallet } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useAuth } from "@/hooks/use-auth"
import { doc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { toast } from "sonner"

export default function SettingsPage() {
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [profileData, setProfileData] = useState({
    fullName: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
  })

  const [securityData, setSecurityData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [walletData, setWalletData] = useState({
    btcAddress: user?.wallets?.btc || "",
    ethAddress: user?.wallets?.eth || "",
    usdtAddress: user?.wallets?.usdt || "",
    xrpAddress: user?.wallets?.xrp || "",
    solAddress: user?.wallets?.sol || "",
  })

  useEffect(() => {
    if (user) {
      setProfileData({
        fullName: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      })
      setSecurityData(prev => ({
        ...prev,
      }))
      setWalletData({
        btcAddress: user.wallets?.btc || "",
        ethAddress: user.wallets?.eth || "",
        usdtAddress: user.wallets?.usdt || "",
        xrpAddress: user.wallets?.xrp || "",
        solAddress: user.wallets?.sol || "",
      })
    }
  }, [user])

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setIsSubmitting(true)

    try {
      await updateDoc(doc(db, "Users", user.uid), {
        name: profileData.fullName,
        phone: profileData.phone,
      })

      toast.success("Profile updated successfully")
    } catch (error) {
      toast.error("Failed to update profile")
      console.error("Error updating profile:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSecuritySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setIsSubmitting(true)

    try {
      toast.success("Security settings updated successfully")
      setSecurityData((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }))
    } catch (error) {
      toast.error("Failed to update security settings")
      console.error("Error updating security settings:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleWalletSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setIsSubmitting(true)

    try {
      await updateDoc(doc(db, "Users", user.uid), {
        wallets: {
          btc: walletData.btcAddress,
          eth: walletData.ethAddress,
          usdt: walletData.usdtAddress,
          xrp: walletData.xrpAddress,
          sol: walletData.solAddress,
        },
      })

      toast.success("Wallet addresses updated successfully")
    } catch (error) {
      toast.error("Failed to update wallet addresses")
      console.error("Error updating wallet addresses:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-8 p-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">Manage your account settings and preferences.</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="bg-primary/50 rounded-[20px] w-full space-x-4">
          <TabsTrigger value="profile" className="flex items-center gap-2 rounded-2xl">
            <User className="h-4 w-4" /> Profile
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2 rounded-2xl">
            <KeyRound className="h-4 w-4" /> Security
          </TabsTrigger>
          <TabsTrigger value="wallet" className="flex items-center gap-2 rounded-2xl">
            <Wallet className="h-4 w-4" /> Wallets
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card className="bg-card/50 rounded-[20px]">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal information and contact details.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={profileData.fullName}
                    disabled
                    onChange={(e) =>
                      setProfileData((prev) => ({ ...prev, fullName: e.target.value }))
                    }
                    className="rounded-2xl bg-gray-800"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    disabled
                    className="rounded-2xl bg-gray-800"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={profileData.phone}
                    onChange={(e) =>
                      setProfileData((prev) => ({ ...prev, phone: e.target.value }))
                    }
                    className="rounded-2xl"
                  />
                </div>

                <Button type="submit" disabled={isSubmitting} className="rounded-2xl">
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card className="bg-card/50 rounded-[20px]">
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Manage your password and two-factor authentication settings.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSecuritySubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={securityData.currentPassword}
                    onChange={(e) =>
                      setSecurityData((prev) => ({ ...prev, currentPassword: e.target.value }))
                    }
                    className="rounded-2xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={securityData.newPassword}
                    onChange={(e) =>
                      setSecurityData((prev) => ({ ...prev, newPassword: e.target.value }))
                    }
                    className="rounded-2xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={securityData.confirmPassword}
                    onChange={(e) =>
                      setSecurityData((prev) => ({ ...prev, confirmPassword: e.target.value }))
                    }
                    className="rounded-2xl"
                  />
                </div>

        

                <Button type="submit" disabled={isSubmitting} className="rounded-2xl">
                  {isSubmitting ? "Saving..." : "Update Security Settings"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="wallet">
          <Card className="bg-card/50 rounded-[20px] mb-10">
            <CardHeader>
              <CardTitle>Withdrawal Wallets</CardTitle>
              <CardDescription>
                Add or update your cryptocurrency wallet addresses for withdrawals.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleWalletSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="btcAddress">Bitcoin (BTC) Address</Label>
                  <Input
                    id="btcAddress"
                    value={walletData.btcAddress}
                    onChange={(e) =>
                      setWalletData((prev) => ({ ...prev, btcAddress: e.target.value }))
                    }
                    placeholder="Enter your BTC wallet address"
                    className="rounded-2xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ethAddress">Ethereum (ETH) Address</Label>
                  <Input
                    id="ethAddress"
                    value={walletData.ethAddress}
                    onChange={(e) =>
                      setWalletData((prev) => ({ ...prev, ethAddress: e.target.value }))
                    }
                    placeholder="Enter your ETH wallet address"
                    className="rounded-2xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="usdtAddress">Tether (USDT) Address</Label>
                  <Input
                    id="usdtAddress"
                    value={walletData.usdtAddress}
                    onChange={(e) =>
                      setWalletData((prev) => ({ ...prev, usdtAddress: e.target.value }))
                    }
                    placeholder="Enter your USDT wallet address"
                    className="rounded-2xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="xrpAddress">Ripple (XRP) Address</Label>
                  <Input
                    id="xrpAddress"
                    value={walletData.xrpAddress}
                    onChange={(e) =>
                      setWalletData((prev) => ({ ...prev, xrpAddress: e.target.value }))
                    }
                    placeholder="Enter your XRP wallet address"
                    className="rounded-2xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="solAddress">Solana (SOL) Address</Label>
                  <Input
                    id="solAddress"
                    value={walletData.solAddress}
                    onChange={(e) =>
                      setWalletData((prev) => ({ ...prev, solAddress: e.target.value }))
                    }
                    placeholder="Enter your SOL wallet address"
                    className="rounded-2xl"
                  />
                </div>

                <Button type="submit" disabled={isSubmitting} className="rounded-2xl">
                  {isSubmitting ? "Saving..." : "Save Wallet Addresses"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}