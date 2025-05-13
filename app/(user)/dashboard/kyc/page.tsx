"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/hooks/use-auth"
import { useForm } from "react-hook-form"
import { CheckCircle2, Clock } from "lucide-react"
import { useMailNotification } from "@/hooks/useMailNotification"

export default function KYCPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const { notifyKycSubmission } = useMailNotification()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [kycStatus, setKycStatus] = useState<string | null>(null)
  const { register, handleSubmit: handleFormSubmit, formState: { errors }, reset, watch } = useForm({
    defaultValues: {
      fullName: "",
      dateOfBirth: "",
      nationality: "",
      documentType: "",
      documentNumber: "",
      address: "",
      city: "",
      country: "",
      postalCode: "",
    }
  })

  const [userName, setUserName] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)

  useEffect(() => {
    const checkKycStatus = async () => {
      if (!user) return
      try {
        const userDoc = await getDoc(doc(db, "Users", user.uid))
        if (userDoc.exists()) {
          const userData = userDoc.data()
          
          // Check if user has submitted KYC data
          if (userData.kycData && Object.keys(userData.kycData).length > 0) {
            // If KYC data exists, check if it's approved or pending
            setKycStatus(userData.kycVerified ? "approved" : "pending")
            reset(userData.kycData)
          } else {
            // No KYC data submitted yet - show the form
            setKycStatus(null)
          }
        }
      } catch (error) {
        console.error("Error checking KYC status:", error)
      }
    }

    checkKycStatus()
  }, [user, reset])

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return
      try {
        const userDoc = await getDoc(doc(db, "Users", user.uid))
        if (userDoc.exists()) {
          const userData = userDoc.data()
          setUserName(userData.name)
          setUserEmail(userData.email)
          reset({ ...userData.kycData, fullName: userData.name })
        }
      } catch (error) {
        console.error("Error fetching user data:", error)
      }
    }

    fetchUserData()
  }, [user, reset])

  const onSubmit = async (data: any) => {
    if (!user) return
    setIsSubmitting(true)

    try {
      await updateDoc(doc(db, "Users", user.uid), {
        kycData: data,
        kycVerified: false
      })
      setKycStatus("pending")

      // Send email notification to admin about KYC submission
      try {
        await notifyKycSubmission({
          userName: userName || data.fullName,
          userEmail: userEmail || undefined, // Convert null to undefined to match expected type
          userId: user.uid,
          kycData: data
        })
        console.log("KYC submission notification sent successfully")
      } catch (notificationError) {
        console.error("Failed to send KYC submission notification:", notificationError)
        // Continue with KYC submission even if notification fails
      }

      toast({
        title: "Verification Submitted",
        description: "Your KYC verification request has been submitted for review.",
      })

      // router.push("/dashboard")
    } catch (error) {
      console.error("KYC submission error:", error)
      toast({
        title: "Error",
        description: "There was an error submitting your verification. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (kycStatus === "approved") {
    return (
      <div className="max-w-2xl mx-auto pb-20">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle>KYC Status</CardTitle>
            </div>
            <CardDescription className="text-green-600 font-semibold">
              Your KYC verification has been approved! You now have full access to all features.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 flex flex-col lg:flex-row justify-center">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <p className="text-green-500">{watch("fullName")}</p>
                </div>
                <div className="space-y-2">
                  <Label>Date of Birth</Label>
                  <p className="text-green-500">{watch("dateOfBirth")}</p>
                </div>
              </div>
              <Button onClick={() => router.push("/dashboard")} className="w-full rounded-2xl">
                Return to Dashboard
              </Button>
            </div>
            <CheckCircle2 className="mx-auto w-80 h-80 mt-10 flex justify-center items-center text-green-500 animate-pulse" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (kycStatus === "pending") {
    return (
      <div className="max-w-2xl mx-auto pb-20">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle className="text-2xl">KYC Status</CardTitle>
            </div>
            <CardDescription className="text-yellow-600 font-semibold">
              Your KYC verification is pending review. We will notify you once it's approved.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col lg:flex-row justify-center">
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <p className="text-yellow-500">{watch("fullName")}</p>
                </div>
                <div className="space-y-2">
                  <Label>Date of Birth</Label>
                  <p className="text-yellow-500">{watch("dateOfBirth")}</p>
                </div>
              </div>
              <Button onClick={() => router.push("/dashboard")} className="w-full rounded-2xl">
                Return to Dashboard
              </Button>
            </div>
            <Clock className="mx-auto w-80 h-80 mt-10 flex justify-center items-center text-yellow-500 animate-pulse" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto pb-20">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">KYC Verification</CardTitle>
          <CardDescription>
            Please provide your personal information for verification. This is required to comply with
            financial regulations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleFormSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    {...register("fullName", { required: "Full name is required" })}
                    placeholder="John Doe"
                    value={userName || ""}
                    disabled
                    className="bg-gray-900"
                  />
                  {errors.fullName && (
                    <p className="text-sm text-red-500">{errors.fullName.message as string}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    {...register("dateOfBirth", { required: "Date of birth is required" })}
                  />
                  {errors.dateOfBirth && (
                    <p className="text-sm text-red-500">{errors.dateOfBirth.message as string}</p>
                  )}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="nationality">Nationality</Label>
                  <Input
                    id="nationality"
                    {...register("nationality", { required: "Nationality is required" })}
                    placeholder="Your nationality"
                  />
                  {errors.nationality && (
                    <p className="text-sm text-red-500">{errors.nationality.message as string}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="documentType">Document Type</Label>
                  <Select value={watch("documentType")} onValueChange={(value) => {
                    const event = { target: { name: "documentType", value }};
                    register("documentType").onChange(event);
                  }}>
                    <SelectTrigger id="documentType">
                      <SelectValue placeholder="Select ID type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="passport">Passport</SelectItem>
                      <SelectItem value="nationalId">National ID</SelectItem>
                      <SelectItem value="drivingLicense">Driving License</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.documentType && (
                    <p className="text-sm text-red-500">{errors.documentType.message as string}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="documentNumber">Document Number</Label>
                <Input
                  id="documentNumber"
                  {...register("documentNumber", { required: "Document number is required" })}
                  placeholder="Document identification number"
                />
                {errors.documentNumber && (
                  <p className="text-sm text-red-500">{errors.documentNumber.message as string}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  {...register("address", { required: "Address is required" })}
                  placeholder="Your street address"
                />
                {errors.address && (
                  <p className="text-sm text-red-500">{errors.address.message as string}</p>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    {...register("city", { required: "City is required" })}
                    placeholder="City"
                  />
                  {errors.city && (
                    <p className="text-sm text-red-500">{errors.city.message as string}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    {...register("country", { required: "Country is required" })}
                    placeholder="Country"
                  />
                  {errors.country && (
                    <p className="text-sm text-red-500">{errors.country.message as string}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postalCode">Postal Code</Label>
                  <Input
                    id="postalCode"
                    {...register("postalCode", { required: "Postal code is required" })}
                    placeholder="Postal code"
                  />
                  {errors.postalCode && (
                    <p className="text-sm text-red-500">{errors.postalCode.message as string}</p>
                  )}
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full text-white rounded-2xl" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit for Verification"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
