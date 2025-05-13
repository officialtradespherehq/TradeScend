import { DollarSign, TrendingUp, Users } from 'lucide-react'
import React from 'react'

export default function HowItWorksSection () {
  return (
    <section className="py-16 md:py-24">
    <div className="container mx-auto px-4">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          How <span className="text-secondary">Copy Trading</span> Works
        </h2>
        <p className="text-muted-foreground text-lg">
          Our platform makes it easy to follow and copy trades from expert investors in real-time.
        </p>
      </div>
      <div className="grid md:grid-cols-3 gap-8">
        <div className="bg-card/50 backdrop-blur-sm p-8 rounded-lg border border-border relative">
          <div className="absolute -top-4 -left-4 bg-primary w-8 h-8 rounded-full flex items-center justify-center text-white font-bold">
            1
          </div>
          <div className="mb-6 flex justify-center">
            <div className="bg-primary/20 p-4 rounded-full">
              <Users className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-foreground text-center mb-4">Choose a Plan</h3>
          <p className="text-muted-foreground text-center">
            Browse our range of investment plans and select the one that best matches your investment goals and
            budget.
          </p>
        </div>
        <div className="bg-card/50 backdrop-blur-sm p-8 rounded-lg border border-border relative">
          <div className="absolute -top-4 -left-4 bg-primary w-8 h-8 rounded-full flex items-center justify-center text-white font-bold">
            2
          </div>
          <div className="mb-6 flex justify-center">
            <div className="bg-primary/20 p-4 rounded-full">
              <DollarSign className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-foreground text-center mb-4">Allocate Your Investment</h3>
          <p className="text-muted-foreground text-center">
            Decide how much you want to invest, starting from just $1,000, and allocate your funds to your chosen
            plan.
          </p>
        </div>
        <div className="bg-card/50 backdrop-blur-sm p-8 rounded-lg border border-border relative">
          <div className="absolute -top-4 -left-4 bg-primary w-8 h-8 rounded-full flex items-center justify-center text-white font-bold">
            3
          </div>
          <div className="mb-6 flex justify-center">
            <div className="bg-primary/20 p-4 rounded-full">
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-foreground text-center mb-4">Earn Daily Returns</h3>
          <p className="text-muted-foreground text-center">
            Our system automatically copies trades and you earn daily returns based on the performance of your
            chosen plan.
          </p>
        </div>
      </div>
    </div>
  </section>
  )
}
