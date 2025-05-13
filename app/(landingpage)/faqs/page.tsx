"use client"

import { useState } from "react"
import Link from "next/link"
import { TrendingUp, ArrowLeft, Search, ChevronDown, ChevronUp } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import ParticleBackground from "@/components/3d/particle-background"
import AnimatedGradientBackground from "@/components/animations/animated-gradient-background"
import { gsap } from "gsap"

// FAQ data organized by categories
const faqData = [
  {
    category: "General",
    questions: [
      {
        question: "What is TradeScend?",
        answer:
          "TradeScend is a cryptocurrency and stock market copy trading investment platform that allows users to follow and copy trades from expert investors. Our platform enables you to earn daily returns on your investments with minimal effort.",
      },
      {
        question: "How does copy trading work?",
        answer:
          "Copy trading allows you to automatically copy the trades of experienced investors. When they make a trade, the same trade is executed in your account proportionally to your investment amount. This way, you can benefit from their expertise without having to analyze the markets yourself.",
      },
      {
        question: "Is TradeScend available worldwide?",
        answer:
          "Yes, TradeScend is available to users from most countries worldwide. However, there may be some restrictions based on local regulations. Please check our Terms of Service or contact our support team to confirm availability in your specific location.",
      },
      {
        question: "What are the minimum system requirements to use TradeScend?",
        answer:
          "TradeScend is a web-based platform that works on most modern browsers including Chrome, Firefox, Safari, and Edge. We recommend using the latest version of your preferred browser for the best experience. We also offer mobile apps for iOS and Android devices.",
      },
    ],
  },
  {
    category: "Account & Registration",
    questions: [
      {
        question: "How do I create an account?",
        answer:
          "To create an account, click on the 'Register' button on our homepage. Fill in your personal details, verify your email address, and complete the KYC (Know Your Customer) verification process. Once approved, you can deposit funds and start investing.",
      },
      {
        question: "Is there a fee to create an account?",
        answer:
          "No, creating an account on TradeScend is completely free. You only pay fees when you invest in our plans or make transactions on the platform.",
      },
      {
        question: "What documents do I need for verification?",
        answer:
          "For KYC verification, you'll need to provide a valid government-issued ID (passport, driver's license, or national ID card), proof of address (utility bill or bank statement not older than 3 months), and in some cases, additional documents depending on your country of residence.",
      },
      {
        question: "How long does the verification process take?",
        answer:
          "The verification process typically takes 1-2 business days. In some cases, it may take longer if additional information is required. You'll receive email notifications about the status of your verification.",
      },
    ],
  },
  {
    category: "Investments & Returns",
    questions: [
      {
        question: "What is the minimum investment amount?",
        answer:
          "The minimum investment amount starts at $20 for our Starter plan. Higher-tier plans require larger minimum investments: $500 for the Growth plan and $2,500 for the Premium plan.",
      },
      {
        question: "How are returns calculated and distributed?",
        answer:
          "Returns are calculated based on the performance of the traders you're copying and the specific investment plan you've chosen. Daily returns range from 0.5% to 3% depending on your plan. Returns are credited to your account daily and can be withdrawn according to your plan's terms.",
      },
      {
        question: "Are my returns guaranteed?",
        answer:
          "No, returns are not guaranteed as they depend on market conditions and the performance of the traders you're copying. The estimated returns provided are based on historical data and past performance, which is not indicative of future results.",
      },
      {
        question: "What happens if a trader I'm copying makes a loss?",
        answer:
          "If a trader you're copying makes a loss, your investment will also experience a proportional loss. This is why we carefully select and monitor our expert traders and implement risk management strategies to minimize potential losses.",
      },
      {
        question: "Can I change my investment plan?",
        answer:
          "Yes, you can upgrade or downgrade your investment plan at any time, subject to the minimum investment requirements of each plan. Changes will take effect at the start of the next investment cycle.",
      },
    ],
  },
  {
    category: "Deposits & Withdrawals",
    questions: [
      {
        question: "What payment methods are accepted?",
        answer:
          "We accept various payment methods including credit/debit cards, bank transfers, and cryptocurrencies (Bitcoin, Ethereum, USDT, etc.). Available payment methods may vary depending on your country of residence.",
      },
      {
        question: "How long do deposits take to process?",
        answer:
          "Credit/debit card deposits are usually instant. Bank transfers typically take 1-3 business days. Cryptocurrency deposits are confirmed after the required number of blockchain confirmations, usually within 10-60 minutes depending on the cryptocurrency and network congestion.",
      },
      {
        question: "Is there a minimum withdrawal amount?",
        answer:
          "Yes, the minimum withdrawal amount is $20 or equivalent in other currencies. Withdrawal fees may apply depending on your chosen withdrawal method.",
      },
      {
        question: "How long do withdrawals take to process?",
        answer:
          "Withdrawal processing times vary depending on the method: cryptocurrency withdrawals are processed within 24 hours, while bank transfers and card withdrawals may take 3-5 business days after approval.",
      },
    ],
  },
  {
    category: "Security & Privacy",
    questions: [
      {
        question: "How secure is my investment on TradeScend?",
        answer:
          "We implement industry-standard security measures including 256-bit SSL encryption, two-factor authentication (2FA), cold storage for cryptocurrencies, and regular security audits. Client funds are kept separate from operational funds to ensure maximum security.",
      },
      {
        question: "Is my personal information safe?",
        answer:
          "Yes, we take data privacy very seriously. Your personal information is protected in accordance with our Privacy Policy and applicable data protection laws. We never share your information with third parties without your consent, except as required by law.",
      },
      {
        question: "What happens if I lose access to my account?",
        answer:
          "If you lose access to your account, you can use the 'Forgot Password' feature on the login page. If you've lost access to your registered email or 2FA device, contact our support team with your account details and identification documents to verify your identity and regain access.",
      },
    ],
  },
  {
    category: "Support",
    questions: [
      {
        question: "How can I contact customer support?",
        answer:
          "You can contact our customer support team through multiple channels: email (support@TradeScend.com), live chat on our website, phone support, or by submitting a ticket through your account dashboard. Our support team is available 24/7 for urgent inquiries.",
      },
      {
        question: "Do you offer educational resources?",
        answer:
          "Yes, we provide a comprehensive knowledge base, video tutorials, webinars, and a blog with market insights and trading strategies. Premium and Growth plan members also get access to exclusive educational content and one-on-one sessions with trading experts.",
      },
    ],
  },
]

export default function FAQsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({})
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  // Filter FAQs based on search query
  const filteredFAQs = faqData
    .map((category) => ({
      ...category,
      questions: category.questions.filter(
        (item) =>
          item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.answer.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    }))
    .filter((category) => category.questions.length > 0)

  const toggleItem = (categoryIndex: number, questionIndex: number) => {
    const itemKey = `${categoryIndex}-${questionIndex}`
    setOpenItems((prev) => {
      const newState = { ...prev }

      // Close all other items
      Object.keys(newState).forEach((key) => {
        if (key !== itemKey) {
          newState[key] = false
        }
      })

      // Toggle the clicked item
      newState[itemKey] = !prev[itemKey]

      return newState
    })

    // Animate the answer with GSAP
    if (!openItems[itemKey]) {
      const answerElement = document.getElementById(`answer-${itemKey}`)
      if (answerElement) {
        gsap.fromTo(
          answerElement,
          { height: 0, opacity: 0 },
          { height: "auto", opacity: 1, duration: 0.3, ease: "power2.out" },
        )
      }
    }
  }

  const scrollToCategory = (categoryId: string) => {
    const element = document.getElementById(categoryId)
    if (element) {
      const headerOffset = 100
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      })

      setActiveCategory(categoryId)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95">


      <main className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center mb-8">
            <Link href="/" className="flex items-center text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-8">Frequently Asked Questions</h1>

          <div className="mb-12">
            <div className="relative max-w-2xl mx-auto">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-muted-foreground" />
              </div>
              <input
                type="text"
                placeholder="Search for questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {/* Category Navigation Sidebar */}
            <div className="md:col-span-1">
              <div className="bg-card/50 backdrop-blur-sm p-4 rounded-lg border border-border sticky top-24">
                <h2 className="text-lg font-semibold text-foreground mb-4">Categories</h2>
                <nav className="space-y-1">
                  {faqData.map((category, index) => (
                    <button
                      key={index}
                      onClick={() => scrollToCategory(`category-${index}`)}
                      className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                        activeCategory === `category-${index}`
                          ? "bg-primary text-white"
                          : "text-foreground hover:bg-muted"
                      }`}
                    >
                      {category.category}
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* FAQ Content */}
            <div className="md:col-span-3 space-y-12">
              {filteredFAQs.length > 0 ? (
                filteredFAQs.map((category, categoryIndex) => (
                  <div key={categoryIndex} id={`category-${categoryIndex}`} className="scroll-mt-24">
                    <h2 className="text-2xl font-semibold text-foreground mb-6 border-b border-border pb-2">
                      {category.category}
                    </h2>
                    <div className="space-y-4">
                      {category.questions.map((item, questionIndex) => {
                        const itemKey = `${categoryIndex}-${questionIndex}`
                        const isOpen = openItems[itemKey] || false

                        return (
                          <div
                            key={questionIndex}
                            className="bg-card/50 backdrop-blur-sm border border-border rounded-lg overflow-hidden"
                          >
                            <button
                              onClick={() => toggleItem(categoryIndex, questionIndex)}
                              className="w-full flex items-center justify-between p-4 text-left focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset"
                            >
                              <span className="font-medium text-foreground">{item.question}</span>
                              {isOpen ? (
                                <ChevronUp className="h-5 w-5 text-muted-foreground" />
                              ) : (
                                <ChevronDown className="h-5 w-5 text-muted-foreground" />
                              )}
                            </button>
                            {isOpen && (
                              <div id={`answer-${itemKey}`} className="px-4 pb-4 text-muted-foreground">
                                <p>{item.answer}</p>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground text-lg">No results found for "{searchQuery}"</p>
                  <p className="text-muted-foreground">Try a different search term or browse by category</p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-16 bg-card/50 backdrop-blur-sm p-6 rounded-lg border border-border text-center">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Still Have Questions?</h2>
            <p className="text-muted-foreground mb-6">
              Our support team is available 24/7 to assist you with any questions or concerns.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/contact"
                className="px-6 py-3 bg-primary text-white font-medium rounded-md hover:bg-primary/90 transition-colors"
              >
                Contact Support
              </Link>
              <Link
                href="/#plans"
                className="px-6 py-3 bg-secondary text-accent font-medium rounded-md hover:bg-gold-dark transition-colors"
              >
                View Investment Plans
              </Link>
            </div>
          </div>
        </div>
      </main>

    </div>
  )
}
