"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { TrendingUp, Menu, X } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import MagneticButton from "@/components/animations/magnetic-button"
import { useState } from "react"

export default function Navbar() {
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <header className="border-b border-border backdrop-blur-sm bg-background/70 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-secondary p-2 rounded-full">
            <TrendingUp className="h-6 w-6 text-accent" />
          </div>
          <span className="text-2xl font-bold text-foreground">TradeScend</span>
        </Link>
        <nav className="hidden md:flex items-center space-x-8">
          <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
            Home
          </Link>
          <Link href="/#plans" className="text-muted-foreground hover:text-foreground transition-colors">
            Investment Plans
          </Link>
          <Link href="/#trends" className="text-muted-foreground hover:text-foreground transition-colors">
            Market Trends
          </Link>
          <Link href="/#testimonials" className="text-muted-foreground hover:text-foreground transition-colors">
            Testimonials
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="hidden md:inline-flex px-4 py-2 text-sm font-medium text-accent bg-background dark:bg-white rounded-md hover:bg-muted transition-colors"
          >
            Login
          </Link>
          <MagneticButton
            className="hidden md:inline-flex px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90 transition-colors"
            onClick={() => router.push("/register")}
          >
            Register
          </MagneticButton>
          <button className="md:hidden" onClick={toggleMenu}>
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 bg-black/95 backdrop-blur-lg transition-opacity duration-300 ease-in-out md:hidden ${isMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      >
        <div className="p-6 md:p-8 w-full max-w-md mx-auto min-h-[100dvh] bg-black/95 flex flex-col justify-center">
          <button
            className="absolute top-4 right-4 text-white/90 hover:text-white transition-colors"
            onClick={toggleMenu}
            aria-label="Close menu"
          >
            <X className="h-8 w-8" />
          </button>
          <nav className="flex flex-col space-y-6 text-center flex-1 justify-center">
            <Link
              href="/"
              className="text-xl font-medium text-white/90 hover:text-white transition-colors active:scale-95"
              onClick={toggleMenu}
            >
              Home
            </Link>
            <Link
              href="/#plans"
              className="text-xl font-medium text-white/90 hover:text-white transition-colors active:scale-95"
              onClick={toggleMenu}
            >
              Investment Plans
            </Link>
            <Link
              href="/#trends"
              className="text-xl font-medium text-white/90 hover:text-white transition-colors active:scale-95"
              onClick={toggleMenu}
            >
              Market Trends
            </Link>
            <Link
              href="/#testimonials"
              className="text-xl font-medium text-white/90 hover:text-white transition-colors active:scale-95"
              onClick={toggleMenu}
            >
              Testimonials
            </Link>
          </nav>
          <div className="space-y-3 w-full max-w-xs mx-auto">
            <Link
              href="/login"
              className="block w-full px-5 py-2.5 text-base font-medium text-white bg-secondary/80 rounded-md hover:bg-secondary transition-colors text-center active:scale-95"
              onClick={toggleMenu}
            >
              Login
            </Link>
            <button
              className="block w-full px-5 py-2.5 text-base font-medium text-white bg-primary/90 rounded-md hover:bg-primary transition-colors active:scale-95"
              onClick={() => {
                router.push("/register")
                toggleMenu()
              }}
            >
              Register
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}