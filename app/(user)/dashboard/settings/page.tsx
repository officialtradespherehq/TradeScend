"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { AlertCircle, CheckCircle, KeyRound, User, Wallet, X, Shield, Copy, Check } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useAuth } from "@/hooks/use-auth"
import { doc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function SettingsPage() {
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
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

  // 2FA State
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [twoFactorLoading, setTwoFactorLoading] = useState(false)
  const [showQRCode, setShowQRCode] = useState(false)
  const [qrCodeData, setQrCodeData] = useState<string>("")
  const [manualEntryKey, setManualEntryKey] = useState<string>("")
  const [verificationCode, setVerificationCode] = useState<string>("")
  const [copied, setCopied] = useState(false)
  const [showDisableDialog, setShowDisableDialog] = useState(false)

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
      
      // Check 2FA status
      check2FAStatus()
    }
  }, [user])

  const check2FAStatus = async () => {
    if (!user?.uid) return
    
    try {
      const response = await fetch(`/api/2fa?uid=${user.uid}`)
      if (response.ok) {
        const data = await response.json()
        setTwoFactorEnabled(data.twoFactorEnabled || false)
      }
    } catch (error) {
      console.error("Error checking 2FA status:", error)
    }
  }

  const handleGenerate2FA = async () => {
    if (!user?.uid) return
    
    setTwoFactorLoading(true)
    try {
      const response = await fetch('/api/2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate',
          uid: user.uid,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setQrCodeData(data.qrCode)
        setManualEntryKey(data.manualEntryKey)
        setShowQRCode(true)
        toast.success("QR code generated. Scan it with your authenticator app.")
      } else {
        const error = await response.json()
        toast.error(error.error || "Failed to generate QR code")
      }
    } catch (error) {
      console.error("Error generating 2FA:", error)
      toast.error("Failed to generate QR code")
    } finally {
      setTwoFactorLoading(false)
    }
  }

  const handleVerify2FA = async () => {
    if (!user?.uid || !verificationCode) {
      toast.error("Please enter a verification code")
      return
    }

    setTwoFactorLoading(true)
    try {
      const response = await fetch('/api/2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify',
          uid: user.uid,
          code: verificationCode,
        }),
      })

      if (response.ok) {
        setTwoFactorEnabled(true)
        setShowQRCode(false)
        setVerificationCode("")
        setQrCodeData("")
        setManualEntryKey("")
        toast.success("2FA enabled successfully!")
        setSuccessMessage("Two-factor authentication has been enabled successfully!")
        setShowSuccessModal(true)
      } else {
        const error = await response.json()
        toast.error(error.error || "Invalid verification code")
      }
    } catch (error) {
      console.error("Error verifying 2FA:", error)
      toast.error("Failed to verify code")
    } finally {
      setTwoFactorLoading(false)
    }
  }

  const handleDisable2FA = async () => {
    if (!user?.uid) return
    
    setTwoFactorLoading(true)
    try {
      const response = await fetch('/api/2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'disable',
          uid: user.uid,
        }),
      })

      if (response.ok) {
        setTwoFactorEnabled(false)
        setShowQRCode(false)
        setQrCodeData("")
        setManualEntryKey("")
        toast.success("2FA disabled successfully")
      } else {
        const error = await response.json()
        toast.error(error.error || "Failed to disable 2FA")
      }
    } catch (error) {
      console.error("Error disabling 2FA:", error)
      toast.error("Failed to disable 2FA")
    } finally {
      setTwoFactorLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success("Copied to clipboard!")
    setTimeout(() => setCopied(false), 2000)
  }

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
      setSuccessMessage("Your profile has been updated successfully!")
      setShowSuccessModal(true)
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
      setSuccessMessage("Your security settings have been updated successfully!")
      setShowSuccessModal(true)
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
      setSuccessMessage("Your wallet addresses have been updated successfully!")
      setShowSuccessModal(true)
    } catch (error) {
      toast.error("Failed to update wallet addresses")
      console.error("Error updating wallet addresses:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-8 p-4 pb-14">
      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-green-500" />
              Success
            </DialogTitle>
            <DialogDescription>
              {successMessage}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center py-4">
            <CheckCircle className="h-24 w-24 text-green-500 animate-pulse" />
          </div>
          <div className="flex justify-end">
            <Button 
              onClick={() => setShowSuccessModal(false)} 
              className="rounded-2xl">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Disable 2FA Confirmation Dialog */}
      <Dialog open={showDisableDialog} onOpenChange={setShowDisableDialog}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-6 w-6 text-amber-500" />
              Disable Two-Factor Authentication?
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to disable 2FA? This will make your account less secure. You'll need to set it up again if you want to re-enable it.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setShowDisableDialog(false)}
              className="rounded-2xl"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                setShowDisableDialog(false)
                handleDisable2FA()
              }}
              variant="destructive"
              className="rounded-2xl"
            >
              Disable 2FA
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
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

              {/* Two-Factor Authentication Section */}
              <div className="mt-8 pt-8 border-t">
                <div className="flex flex-wrap gap-4 items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Two-Factor Authentication (2FA)
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Add an extra layer of security to your account using an authenticator app.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm ${twoFactorEnabled ? 'text-green-500' : 'text-muted-foreground'}`}>
                      {twoFactorEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                    <Switch
                      checked={twoFactorEnabled}
                      onCheckedChange={(checked) => {
                        if (checked && !twoFactorEnabled) {
                          handleGenerate2FA()
                        } else if (!checked && twoFactorEnabled) {
                          setShowDisableDialog(true)
                        }
                      }}
                      disabled={twoFactorLoading}
                    />
                  </div>
                </div>

                {showQRCode && (
                  <div className="mt-6 p-6 bg-card rounded-2xl border space-y-4">
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Scan QR Code</AlertTitle>
                      <AlertDescription>
                        Scan this QR code with your authenticator app (Google Authenticator, Authy, Microsoft Authenticator, etc.)
                      </AlertDescription>
                    </Alert>

                    <div className="flex flex-col items-center space-y-4">
                      {qrCodeData && (
                        <div className="p-4 bg-white rounded-lg">
                          <img src={qrCodeData} alt="QR Code" className="w-64 h-64" />
                        </div>
                      )}

                      <div className="w-full space-y-2">
                        <Label>Manual Entry Key</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            value={manualEntryKey}
                            readOnly
                            className="rounded-2xl font-mono text-sm"
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => copyToClipboard(manualEntryKey)}
                            className="rounded-2xl"
                          >
                            {copied ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Use this key if you can't scan the QR code
                        </p>
                      </div>

                      <div className="w-full space-y-2">
                        <Label htmlFor="verificationCode">Enter Verification Code</Label>
                        <Input
                          id="verificationCode"
                          type="text"
                          placeholder="000000"
                          maxLength={6}
                          value={verificationCode}
                          onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                          className="rounded-2xl text-center text-2xl tracking-widest"
                        />
                        <p className="text-xs text-muted-foreground">
                          Enter the 6-digit code from your authenticator app
                        </p>
                      </div>

                      <div className="flex gap-2 w-full">
                        <Button
                          onClick={handleVerify2FA}
                          disabled={twoFactorLoading || verificationCode.length !== 6}
                          className="flex-1 rounded-2xl"
                        >
                          {twoFactorLoading ? "Verifying..." : "Verify & Enable"}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowQRCode(false)
                            setQrCodeData("")
                            setManualEntryKey("")
                            setVerificationCode("")
                          }}
                          className="rounded-2xl"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {twoFactorEnabled && !showQRCode && (
                  <Alert className="mt-4">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <AlertTitle>2FA is Enabled</AlertTitle>
                    <AlertDescription>
                      Your account is protected with two-factor authentication. You'll need to enter a code from your authenticator app when logging in.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
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
