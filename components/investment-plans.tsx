"use client"

import { useState } from "react"
import { Check, Info } from "lucide-react"
import { useRouter } from "next/navigation"

export const plans = [
  {
    name: "Quantum",
    description: "Strategic wealth building",
    price: "$1,000",
    features: [
      "Investment range: $1K-$10K",
      "Monthly ROI: 15%",
      "Real-time market analysis",
      "24/7 support",
      "Weekly market insights",
    ],
    highlighted: false,
    buttonText: "Start with $1K",
  },
  {
    name: "Apex",
    description: "Enhanced performance",
    price: "$10,000",
    features: [
      "Investment range: $10K-$49.9K",
      "Monthly ROI: 30%",
      "Advanced AI analytics",
      "24/7 priority support",
      "Bi-weekly strategy calls",
      "Custom portfolio management",
    ],
    highlighted: true,
    buttonText: "Join Apex",
  },
  {
    name: "Sovereign",
    description: "Elite wealth management",
    price: "$50,000",
    features: [
      "Investment range: $50K-$200K",
      "Monthly ROI: 35%",
      "Unlimited trader access",
      "Predictive market analytics",
      "Dedicated account manager",
      "Daily strategy sessions",
      "Private investment events",
      "Custom risk management",
    ],
    highlighted: false,
    buttonText: "Access Sovereign",
  },
  {
    name: "Genesis",
    description: "Ultimate investment mastery",
    price: "$200,000",
    features: [
      "Investment range: $200K-$999.9K",
      "Monthly ROI: 40%",
      "Exclusive trading algorithms",
      "Institutional-grade analytics",
      "Personal finance team",
      "24/7 concierge service",
      "Global investment access",
      "Customized wealth strategy",
    ],
    highlighted: false,
    buttonText: "Contact Us",
  },
]

function InvestmentPlans() {
  const [duration, setDuration] = useState(30)
  const router = useRouter()

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-center justify-center">
        <div className="bg-card/50 p-2 rounded-lg inline-flex mb-4">
          <button
            onClick={() => setDuration(30)}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              duration === 30 ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            1 Month
          </button>
          <button
            onClick={() => setDuration(90)}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              duration === 90 ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            3 Months
          </button>
          <button
            onClick={() => setDuration(180)}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              duration === 180 ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            6 Months
          </button>
        </div>
        <p className="text-muted-foreground text-sm mb-8">
          Select your preferred investment duration. Longer durations may offer higher returns.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
        {plans.map((plan, index) => (
          <div
            key={index}
            className={`relative bg-card/50 rounded-xl overflow-hidden border ${
              plan.highlighted ? "border-secondary" : "border-border"
            }`}
          >
            {plan.highlighted && (
              <div className="absolute top-0 left-0 right-0 bg-secondary text-white text-center text-sm font-medium py-1">
                Most Popular
              </div>
            )}
            <div className={`p-6 ${plan.highlighted ? "pt-10" : ""}`}>
              <h3 className="text-xl font-bold text-foreground mb-2">{plan.name}</h3>
              <p className="text-muted-foreground mb-4">{plan.description}</p>
              <div className="flex items-end mb-6">
                <span className="text-3xl font-bold text-foreground">{plan.price}</span>
                <span className="text-muted-foreground ml-2">minimum</span>
              </div>
              <div className="space-y-3 mb-6">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-start">
                    <Check className="h-5 w-5 text-secondary mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{feature}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => router.push("/register")}
                className={`block w-full py-3 px-4 rounded-lg text-center font-medium ${
                  plan.highlighted
                    ? "bg-secondary text-white hover:bg-gold-dark"
                    : "bg-primary text-white hover:bg-primary/90"
                } transition-colors`}
              >
                {plan.buttonText}
              </button>
            </div>
            <div className="bg-muted/50 p-4 flex items-center justify-between">
              <div className="flex items-center">
                <Info className="h-4 w-4 text-muted-foreground mr-2" />
                <span className="text-sm text-muted-foreground">
                  {duration === 30
                    ? "Est. 30-day return:"
                    : duration === 90
                      ? "Est. 90-day return:"
                      : "Est. 180-day return:"}
                </span>
              </div>
              <div className="text-sm font-medium text-secondary">
                {index === 0 && duration === 30 && "+15%"}
                {index === 0 && duration === 90 && "+45%"}
                {index === 0 && duration === 180 && "+90%"}

                {index === 1 && duration === 30 && "+30%"}
                {index === 1 && duration === 90 && "+90%"}
                {index === 1 && duration === 180 && "+180%"}

                {index === 2 && duration === 30 && "+35%"}
                {index === 2 && duration === 90 && "+105%"}
                {index === 2 && duration === 180 && "+210%"}

                {index === 3 && duration === 30 && "+40%"}
                {index === 3 && duration === 90 && "+120%"}
                {index === 3 && duration === 180 && "+240%"}
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* <div className="bg-card/50 p-4 rounded-lg border border-border mt-8">
        <div className="flex items-start">
          <Info className="h-5 w-5 text-secondary mr-3 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Important:</span> All investments carry risk. Past performance
            is not indicative of future results. The estimated returns are based on historical data and are not
            guaranteed. Please invest responsibly and only invest what you can afford to lose.
          </p>
        </div>
      </div> */}
    </div>
  )
}


export default function InvestmentSection() {
  return (
    <section id="plans" className="py-16 md:py-24">
    <div className="container mx-auto px-4">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          Investment Plans with <span className="text-secondary">Daily Returns</span>
        </h2>
        <p className="text-muted-foreground text-lg">
          Choose from our range of investment plans starting from just $1,000. Each plan runs for a minimum of 30
          days with daily returns credited to your account.
        </p>
      </div>
      <InvestmentPlans />
    </div>
  </section>
  )
}