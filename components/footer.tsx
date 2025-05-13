import Link from "next/link"
import { TrendingUp } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-background border-t border-border py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-center">
          <Link href="/" className="flex items-center gap-2 mb-6">
            <div className="bg-secondary p-2 rounded-full">
              <TrendingUp className="h-5 w-5 text-accent" />
            </div>
            <span className="text-xl font-bold text-foreground">TradeScend</span>
          </Link>
          <div className="flex flex-wrap justify-center gap-8 mb-8">
            <Link href="/contact" className="text-muted-foreground hover:text-secondary">
              Contact
            </Link>
            <Link href="/faqs" className="text-muted-foreground hover:text-secondary">
              FAQs
            </Link>
            <Link href="/terms" className="text-muted-foreground hover:text-secondary">
              Terms & Conditions
            </Link>
            <Link href="/privacy" className="text-muted-foreground hover:text-secondary">
              Privacy Policy
            </Link>
          </div>
          <p className="text-sm text-muted-foreground text-center">
            © 2009 - {new Date().getFullYear()} TradeScend. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}