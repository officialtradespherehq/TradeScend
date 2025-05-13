"use client"

import { Award, DollarSign, TrendingUp, Users } from "lucide-react"
import { useEffect, useState, type ReactNode } from "react"

interface StatsCounterProps {
  label: string
  value: string
  icon: ReactNode
}

function StatsCounter({ label, value, icon }: StatsCounterProps) {
  const [displayValue, setDisplayValue] = useState("0")

  useEffect(() => {
    // Extract numeric part for animation
    const numericPart = value.replace(/[^0-9.]/g, "")
    const suffix = value.replace(numericPart, "")
    const targetValue = Number.parseFloat(numericPart)

    const startValue = 0
    const duration = 2000 // 2 seconds
    const startTime = Date.now()

    const updateValue = () => {
      const currentTime = Date.now()
      const elapsed = currentTime - startTime

      if (elapsed < duration) {
        const progress = elapsed / duration
        const currentValue = startValue + progress * (targetValue - startValue)

        if (Number.isInteger(targetValue)) {
          setDisplayValue(Math.floor(currentValue) + suffix)
        } else {
          setDisplayValue(currentValue.toFixed(1) + suffix)
        }

        requestAnimationFrame(updateValue)
      } else {
        setDisplayValue(value)
      }
    }

    updateValue()
  }, [value])

  return (
    <div className="text-center">
      <div className="flex justify-center mb-4">
        <div className="bg-muted/50 p-3 rounded-full">{icon}</div>
      </div>
      <div className="text-2xl md:text-3xl font-bold text-foreground mb-1">{displayValue}</div>
      <div className="text-muted-foreground">{label}</div>
    </div>
  )
}

export default function StatsSection() {
  return (
    <section className="py-12 bg-muted/50 border-y border-border">
  <div className="container mx-auto px-4">
    <div data-stats-container className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
      <div data-stats-item>
        <StatsCounter
          label="Total Investors"
          value="60K+"
          icon={<Users className="h-6 w-6 text-secondary" />}
        />
      </div>
      <div data-stats-item>
        <StatsCounter
          label="Daily ROI"
          value="0.5-3%"
          icon={<TrendingUp className="h-6 w-6 text-secondary" />}
        />
      </div>
      <div data-stats-item>
        <StatsCounter
          label="Assets Managed"
          value="$25M+"
          icon={<DollarSign className="h-6 w-6 text-secondary" />}
        />
      </div>
      <div data-stats-item>
        <StatsCounter label="Success Rate" value="94%" icon={<Award className="h-6 w-6 text-secondary" />} />
      </div>
      <div data-stats-item>
        <StatsCounter
          label="Awards Won"
          value="24+"
          icon={<Award className="h-6 w-6 text-secondary" />}
        />
      </div>
      <div data-stats-item>
        <StatsCounter
          label="Global Offices"
          value="15+"
          icon={<Users className="h-6 w-6 text-secondary" />}
        />
      </div>
    </div>
  </div>
</section> 
  )
}