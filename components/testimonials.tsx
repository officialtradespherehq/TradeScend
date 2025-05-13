"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Star } from "lucide-react"

const testimonials = [
  {
    name: "Michael R.",
    role: "Retail Investor",
    content: "I've been using TradeScend for 6 months and my portfolio has grown by 47%. The copy trading feature makes it so easy to follow expert traders and learn from their strategies.",
    stars: 5,
  },
  {
    name: "Sarah J.",
    role: "Day Trader",
    content: "The real-time market data and analysis tools are exceptional. I've tried many platforms, but TradeScend offers the best combination of ease of use and powerful features.",
    stars: 5,
  },
  {
    name: "David L.",
    role: "Retirement Planner",
    content: "I was skeptical at first, but the daily returns have been consistent and the platform is very transparent about risks. Great for diversifying my retirement portfolio.",
    stars: 4,
  },
  {
    name: "Emma W.",
    role: "Crypto Enthusiast",
    content: "The cryptocurrency trading features are outstanding. Real-time alerts and market analysis help me make informed decisions in the volatile crypto market.",
    stars: 5,
  },
  {
    name: "James H.",
    role: "Forex Trader",
    content: "The forex trading tools are comprehensive and the execution speed is impressive. I've seen a significant improvement in my trading performance.",
    stars: 5,
  },
  {
    name: "Linda M.",
    role: "Portfolio Manager",
    content: "Managing multiple client portfolios has never been easier. The automated reporting and risk management tools save me hours of work every week.",
    stars: 4,
  },
  {
    name: "Thomas B.",
    role: "Options Trader",
    content: "The options chain analysis and Greeks calculations are spot-on. It's helped me develop more sophisticated trading strategies.",
    stars: 5,
  },
  {
    name: "Patricia C.",
    role: "Long-term Investor",
    content: "The portfolio rebalancing tools and dividend tracking features are perfect for my buy-and-hold strategy. Very pleased with the results.",
    stars: 5,
  },
  {
    name: "Kevin Y.",
    role: "Technical Analyst",
    content: "The charting tools and technical indicators are world-class. I can customize everything to match my analysis style perfectly.",
    stars: 4,
  },
  {
    name: "Rachel S.",
    role: "Algorithmic Trader",
    content: "The API integration and backtesting capabilities are exceptional. I've successfully automated my entire trading strategy.",
    stars: 5,
  },
  {
    name: "George P.",
    role: "Value Investor",
    content: "The fundamental analysis tools and financial statement comparisons make finding undervalued stocks much easier.",
    stars: 4,
  },
  {
    name: "Maria D.",
    role: "ESG Investor",
    content: "Love the ESG scoring and sustainable investment screening tools. They align perfectly with my values-based investing approach.",
    stars: 5,
  },
  {
    name: "William K.",
    role: "Futures Trader",
    content: "The futures trading interface is intuitive and the margin calculations are always accurate. Great platform for serious traders.",
    stars: 4,
  },
  {
    name: "Sophie L.",
    role: "Hedge Fund Manager",
    content: "The risk management and portfolio optimization tools are sophisticated yet user-friendly. Essential for professional money management.",
    stars: 5,
  },
  {
    name: "Daniel R.",
    role: "Swing Trader",
    content: "The pattern recognition and momentum indicators have significantly improved my trade timing. Very satisfied with the results.",
    stars: 4,
  },
  {
    name: "Nancy H.",
    role: "Income Investor",
    content: "The yield analysis and income forecasting tools are excellent. Perfect for planning reliable investment income streams.",
    stars: 5,
  },
  {
    name: "Robert M.",
    role: "Market Maker",
    content: "The order flow analysis and liquidity management tools are top-notch. Essential features for professional market making.",
    stars: 5,
  },
  {
    name: "Julia F.",
    role: "Quantitative Analyst",
    content: "The statistical analysis tools and data visualization capabilities are impressive. Great for developing and testing trading models.",
    stars: 4,
  },
  {
    name: "Andrew B.",
    role: "Global Macro Trader",
    content: "The global market coverage and economic indicators are comprehensive. Excellent for macro-level investment decisions.",
    stars: 5,
  },
  {
    name: "Catherine W.",
    role: "ETF Strategist",
    content: "The ETF screening and comparison tools are invaluable. Makes building diversified portfolios much more efficient.",
    stars: 5,
  },
]

function Testimonials() {
  const [currentPage, setCurrentPage] = useState(0)
  const itemsPerPage = 3
  const totalPages = Math.ceil(testimonials.length / itemsPerPage)

  const nextPage = () => {
    setCurrentPage((prevPage) => (prevPage + 1) % totalPages)
  }

  const prevPage = () => {
    setCurrentPage((prevPage) => (prevPage - 1 + totalPages) % totalPages)
  }

  const startIndex = currentPage * itemsPerPage
  const visibleTestimonials = testimonials.slice(startIndex, startIndex + itemsPerPage)

  return (
    <div className="relative">
      <div className="hidden md:grid md:grid-cols-3 gap-6">
        {visibleTestimonials.map((testimonial, index) => (
          <div key={index} className="bg-card/50 p-6 rounded-lg border border-border">
            <div className="flex flex-col mb-4">
              <h4 className="text-foreground font-medium">{testimonial.name}</h4>
              <p className="text-muted-foreground text-sm">{testimonial.role}</p>
            </div>
            <div className="flex mb-4">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${i < testimonial.stars ? "text-secondary fill-secondary" : "text-muted"}`}
                />
              ))}
            </div>
            <p className="text-muted-foreground">{testimonial.content}</p>
          </div>
        ))}
      </div>

      <div className="md:hidden">
        <div className="bg-card/50 p-6 rounded-lg border border-border">
          <div className="flex flex-col mb-4">
            <h4 className="text-foreground font-medium">{testimonials[startIndex].name}</h4>
            <p className="text-muted-foreground text-sm">{testimonials[startIndex].role}</p>
          </div>
          <div className="flex mb-4">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${i < testimonials[startIndex].stars ? "text-secondary fill-secondary" : "text-muted"}`}
              />
            ))}
          </div>
          <p className="text-muted-foreground">{testimonials[startIndex].content}</p>
        </div>
      </div>

      <div className="flex justify-center mt-8 gap-4 items-center">
        <button
          onClick={prevPage}
          className="p-2 rounded-full bg-muted hover:bg-primary text-foreground hover:text-white transition-colors"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        {/* <span className="text-muted-foreground">
          {currentPage + 1} / {totalPages}
        </span> */}
        <button
          onClick={nextPage}
          className="p-2 rounded-full bg-muted hover:bg-primary text-foreground hover:text-white transition-colors"
          aria-label="Next page"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}

export default function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-16 md:py-24 bg-muted/50 border-y border-border">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            What Our <span className="text-secondary">Investors</span> Say
          </h2>
          <p className="text-muted-foreground text-lg">
            Join thousands of satisfied investors who have grown their wealth with our platform.
          </p>
        </div>
        <Testimonials />
      </div>
    </section>
  )
}