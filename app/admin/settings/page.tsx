"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { collection, doc, getDoc, setDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { toast } from "sonner"
import { AdminNav } from "@/components/admin-nav"

interface PlatformSettings {
  minInvestment: number
  maxInvestment: number
  minWithdrawal: number
  withdrawalFee: number
  referralBonus: number
  maintenanceFee: number
  termsAndConditions: string
  privacyPolicy: string
  supportEmail: string
  supportPhone: string
}

const defaultSettings: PlatformSettings = {
  minInvestment: 100,
  maxInvestment: 100000,
  minWithdrawal: 50,
  withdrawalFee: 2.5,
  referralBonus: 5,
  maintenanceFee: 1,
  termsAndConditions: "",
  privacyPolicy: "",
  supportEmail: "support@tradesphere.com",
  supportPhone: "+1234567890",
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<PlatformSettings>(defaultSettings)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settingsDoc = await getDoc(doc(db, "settings", "platform"))
        if (settingsDoc.exists()) {
          setSettings(settingsDoc.data() as PlatformSettings)
        } else {
          // Initialize settings if they don't exist
          await setDoc(doc(db, "settings", "platform"), defaultSettings)
        }
      } catch (error) {
        console.error("Error fetching settings:", error)
        toast.error("Failed to fetch settings")
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, [])

  const handleSaveSettings = async () => {
    try {
      await setDoc(doc(db, "settings", "platform"), settings)
      toast.success("Settings updated successfully")
    } catch (error) {
      console.error("Error saving settings:", error)
      toast.error("Failed to save settings")
    }
  }

  const handleInputChange = (field: keyof PlatformSettings, value: string | number) => {
    setSettings((prev) => ({
      ...prev,
      [field]: field.includes("Fee") || field.includes("min") || field.includes("max") || field.includes("Bonus")
        ? parseFloat(value as string)
        : value,
    }))
  }

  return (
    <div className="space-y-8 p-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Platform Settings</h2>
        <p className="text-muted-foreground">Configure platform parameters and policies.</p>
      </div>

      {/* <AdminNav /> */}

      <div className="grid gap-4">
        <Card className="bg-card/50 rounded-[20px]">
          <CardHeader>
            <CardTitle>Investment Parameters</CardTitle>
            <CardDescription>Set investment limits and fees</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Minimum Investment ($)</label>
              <Input
                type="number"
                value={settings.minInvestment}
                onChange={(e) => handleInputChange("minInvestment", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Maximum Investment ($)</label>
              <Input
                type="number"
                value={settings.maxInvestment}
                onChange={(e) => handleInputChange("maxInvestment", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Minimum Withdrawal ($)</label>
              <Input
                type="number"
                value={settings.minWithdrawal}
                onChange={(e) => handleInputChange("minWithdrawal", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Withdrawal Fee (%)</label>
              <Input
                type="number"
                value={settings.withdrawalFee}
                onChange={(e) => handleInputChange("withdrawalFee", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Referral Bonus (%)</label>
              <Input
                type="number"
                value={settings.referralBonus}
                onChange={(e) => handleInputChange("referralBonus", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Maintenance Fee (%)</label>
              <Input
                type="number"
                value={settings.maintenanceFee}
                onChange={(e) => handleInputChange("maintenanceFee", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 rounded-[20px]">
          <CardHeader>
            <CardTitle>Support Information</CardTitle>
            <CardDescription>Update contact details</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Support Email</label>
              <Input
                type="email"
                value={settings.supportEmail}
                onChange={(e) => handleInputChange("supportEmail", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Support Phone</label>
              <Input
                type="tel"
                value={settings.supportPhone}
                onChange={(e) => handleInputChange("supportPhone", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 rounded-[20px]">
          <CardHeader>
            <CardTitle>Legal Documents</CardTitle>
            <CardDescription>Update terms and privacy policy</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Terms and Conditions</label>
              <Textarea
                value={settings.termsAndConditions}
                onChange={(e) => handleInputChange("termsAndConditions", e.target.value)}
                rows={10}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Privacy Policy</label>
              <Textarea
                value={settings.privacyPolicy}
                onChange={(e) => handleInputChange("privacyPolicy", e.target.value)}
                rows={10}
              />
            </div>
          </CardContent>
        </Card>

        <Button
          onClick={handleSaveSettings}
          className="w-full bg-primary hover:bg-primary/90 rounded-2xl"
        >
          Save Settings
        </Button>
      </div>
    </div>
  )
}