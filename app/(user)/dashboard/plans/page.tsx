"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, Info, Copy, X } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { plans } from "@/components/investment-plans"
import { useInvestments, InvestmentData } from "@/hooks/useInvestments"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTransactions } from "@/hooks/useTransactions"
import { uploadFile } from "@/utils/cloudinary"
import Image from "next/image"

const PAYMENT_METHODS = [
  { name: 'Bitcoin', address: 'bc1qava56rr6ak6ee3fx0xte8gs4g42886flyn7klx' },
  { name: 'USDT (ERC 20)', address: 'rM3TfaLmck8anPVpscfvTK9kxLaQFWsWJS' },
  { name: 'USDT (TRC 20)', address: 'TYn9k1WRdB9P6X5A62toZtnEqK8D52KtPu' },
  { name: 'XRP', address: 'rM3TfaLmck8anPVpscfvTK9kxLaQFWsWJS' },
  { name: 'Solana', address: 'ET6N1iu7HE6UNA6BTNEbZJSujLfMiuAjuKztnJAT2mzc' },
  { name: 'Ethereum', address: '0xaEBa4F2B51E050F46eA85E880274D6EB4Aa42537' }
]

export default function PlansPage() {
  const { toast } = useToast()
  const { investments, create } = useInvestments()
  const { create: createTransaction } = useTransactions()
  const [selectedPlan, setSelectedPlan] = useState<typeof plans[0] | null>(null)
  const [investmentAmount, setInvestmentAmount] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [paymentStep, setPaymentStep] = useState(1)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(PAYMENT_METHODS[0])
  const [receiptUrl, setReceiptUrl] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [amountError, setAmountError] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Get current active investment
  const currentInvestment = investments?.find(inv => inv.status === 'active')
  const currentPlan = currentInvestment ? plans.find(p => p.name === currentInvestment.planName) : null
  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address)
    toast({
      title: "Address Copied",
      description: "Payment address has been copied to clipboard.",
    })
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInvestmentAmount(value)
    
    if (!value) {
      setAmountError("Please enter an investment amount")
      return
    }

    const amount = parseFloat(value)
    const minAmount = parseFloat(selectedPlan?.price?.replace(/[^0-9.]/g, '') || '0')
    
    if (amount < minAmount) {
      setAmountError(`Minimum investment amount is ${selectedPlan?.price}`)
    } else {
      setAmountError("")
    }
  }

  const handleInvest = async () => {
    if (paymentStep === 1) {
      const amount = parseFloat(investmentAmount)
      const minAmount = parseFloat(selectedPlan?.price?.replace(/[^0-9.]/g, '') || '0')
      
      if (amount < minAmount) {
        toast({
          title: "Invalid Amount",
          description: `Minimum investment amount is ${selectedPlan?.price}`,
          variant: "destructive",
        })
        return
      }
      setPaymentStep(2)
      return
    }

    if (!receiptUrl) {
      toast({
        title: "Payment Receipt Required",
        description: "Please upload your payment receipt to proceed.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      // Submit investment to Firebase
      const investment: InvestmentData = {
        planName: selectedPlan?.name || '',
        amount: parseFloat(investmentAmount),
        paymentMethod: selectedPaymentMethod.name,
        transactionHash: "", // Empty string as we're using receiptUrl instead
        receiptUrl: receiptUrl,
      }

      await create(investment)

      // Create transaction record
      await createTransaction({
        type: 'deposit',
        amount: parseFloat(investmentAmount),
        description: `Investment in ${selectedPlan?.name} plan`
      })

      toast({
        title: "Investment Successful",
        description: `Successfully invested ${investmentAmount} in ${selectedPlan?.name} plan. Your investment is pending admin verification.`,
      })

      // Reset form state after successful submission
      setTimeout(() => {
        setSelectedPlan(null)
        setInvestmentAmount("")
        setPaymentStep(1)
        setReceiptUrl("")
        window.location.reload()
      }, 2000)
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your investment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-background pb-16">
      <div className="p-4 space-y-6">
        {currentInvestment && currentPlan && (
          <Card className="bg-gradient-to-br from-royal to-royal-dark rounded-[20px] text-white">
            <CardHeader>
              <CardTitle>Current Investment Plan</CardTitle>
              <CardDescription className="text-white/80">
                Your active investment in {currentPlan.name} plan
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-3xl font-bold text-gold">${currentInvestment.amount}</div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-gold" />
                  Plan: {currentPlan.name}
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-gold" />
                  Monthly ROI: {currentPlan.features[1].split(":")[1].trim()}
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-gold" />
                  Status: {currentInvestment.status}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        <div>
          <h2 className="text-2xl font-bold">Investment Plans</h2>
          <p className="text-muted-foreground">Choose the perfect plan for your investment goals.</p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-md rounded-[20px]">
            <DialogHeader>
              <DialogTitle>Invest in {selectedPlan?.name} Plan</DialogTitle>
              <DialogDescription>
                {paymentStep === 1
                  ? `Enter the amount you want to invest. The minimum investment is ${selectedPlan?.price}.`
                  : "Complete your payment and provide the transaction hash."}
              </DialogDescription>
            </DialogHeader>

            {paymentStep === 1 ? (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Investment Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="Enter amount"
                    value={investmentAmount}
                    onChange={handleAmountChange}
                    min={selectedPlan ? parseFloat(selectedPlan.price.replace(/[^0-9.]/g, '')) : 0}
                    className={`rounded-2xl ${amountError ? 'border-destructive' : ''}`}
                  />
                  {amountError && (
                    <p className="text-sm text-destructive">{amountError}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Info className="h-4 w-4" />
                  <span>Expected monthly return: {selectedPlan?.features[1].split(":")[1].trim()}</span>
                </div>
              </div>
            ) : (
              <div className="space-y-4 py-4">
                <div className="p-4 bg-muted rounded-2xl">
                  <p className="text-sm font-medium">Amount to Pay</p>
                  <p className="text-2xl font-bold text-secondary">${investmentAmount}</p>
                </div>
                <Select defaultValue={PAYMENT_METHODS[0].name} onValueChange={(value) => setSelectedPaymentMethod(PAYMENT_METHODS.find(m => m.name === value) || PAYMENT_METHODS[0])}>
                  <SelectTrigger className="w-full rounded-2xl">
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_METHODS.map((method) => (
                      <SelectItem key={method.name} value={method.name}>
                        {method.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Card className="rounded-[20px]">
                  <CardContent className="space-y-4 pt-4">
                    <div className="flex items-center justify-between">
                      <Label>Payment Address</Label>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleCopyAddress(selectedPaymentMethod.address)}
                        className="rounded-2xl"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <Input readOnly value={selectedPaymentMethod.address} className="rounded-2xl font-mono text-sm" />
                    
                    <div className="space-y-2">
                      <Label htmlFor="receipt">Payment Receipt</Label>
                      <div className="flex flex-col gap-3">
                        <input
                          type="file"
                          id="receipt"
                          ref={fileInputRef}
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              try {
                                setIsUploading(true);
                                const result = await uploadFile(file);
                                setReceiptUrl(result.url);
                                toast({
                                  title: "Upload Successful",
                                  description: "Your payment receipt has been uploaded.",
                                });
                              } catch (error) {
                                toast({
                                  title: "Upload Failed",
                                  description: "Failed to upload receipt. Please try again.",
                                  variant: "destructive",
                                });
                              } finally {
                                setIsUploading(false);
                              }
                            }
                          }}
                        />
                        {receiptUrl ? (
                          <div className="relative w-full h-48 rounded-lg overflow-hidden border border-border">
                            <Image 
                              src={receiptUrl}
                              alt="Payment receipt"
                              fill
                              className="object-contain"
                            />
                            <Button
                              variant="destructive"
                              size="sm"
                              className="absolute top-2 right-2 rounded-full"
                              onClick={() => setReceiptUrl("")}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            type="button"
                            variant="outline"
                            className="rounded-2xl w-full h-24 border-dashed"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                          >
                            {isUploading ? (
                              <div className="flex items-center gap-2">
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                                <span>Uploading...</span>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center gap-1">
                                <span>Click to upload payment receipt</span>
                                <span className="text-xs text-muted-foreground">PNG, JPG or JPEG (max 5MB)</span>
                              </div>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            <DialogFooter>
              <Button
                onClick={handleInvest}
                disabled={paymentStep === 1 ? !investmentAmount || !!amountError : isSubmitting || isUploading || !receiptUrl}
                className="rounded-2xl text-white"
              >
                {isSubmitting
                  ? "Processing..."
                  : paymentStep === 1
                  ? "Proceed to Payment"
                  : "Submit for Verification"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative bg-gradient-to-br from-royal to-royal-dark rounded-[20px] text-white ${plan.highlighted ? "border-gold" : ""}`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-gold text-royal font-medium rounded-full">
                  Most Popular
                </div>
              )}
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription className="text-white/80">{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-3xl font-bold text-gold">{plan.price}</div>
                <ul className="space-y-2 text-sm">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-gold" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full rounded-2xl text-white"
                  variant={plan.highlighted ? "secondary" : "outline"}
                  onClick={() => {
                    setSelectedPlan(plan)
                    setPaymentStep(1)
                    setAmountError("")
                    setDialogOpen(true)
                  }}
                >
                  {plan.buttonText}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
