"use client"

import { useRouter } from "next/navigation"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import StatsSection from "@/components/stats-counter"
import InvestmentSection from "@/components/investment-plans"
import MarketSection from "@/components/MarketSection"
import HowItWorksSection from "@/components/HowItWorksSection"
import TestimonialsSection from "@/components/testimonials"
import CTASection from "@/components/CTASection"
import HeroSection from "@/components/HeroSection"

export default function Home() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95">

        {/* Hero Section */}
        <HeroSection/>

        {/* Stats Section */}
        <StatsSection/>

        {/* Investment Plans Section */}
       <InvestmentSection/>

        {/* Market Trends Section with 3D Chart */}
       <MarketSection/>

        {/* How It Works Section */}
       <HowItWorksSection/>

        {/* Testimonials Section */}
       <TestimonialsSection/>

        {/* CTA Section */}
      <CTASection/>
    </div>
  )
}
