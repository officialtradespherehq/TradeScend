"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { TrendingUp, ArrowLeft, Mail, Check } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import ParticleBackground from "@/components/3d/particle-background"
import AnimatedGradientBackground from "@/components/animations/animated-gradient-background"
import MagneticButton from "@/components/animations/magnetic-button"
import { gsap } from "gsap"
import { useAuth } from "@/hooks/use-auth"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const { forgotPassword, error: authError } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      await forgotPassword(email)

      // Success animation
      const formElement = document.querySelector("form")
      if (formElement) {
        gsap.to(formElement, {
          opacity: 0,
          y: -20,
          duration: 0.5,
          onComplete: () => {
            setIsSubmitted(true)

            // Show success message with animation
            const successElement = document.getElementById("success-message")
            if (successElement) {
              gsap.fromTo(successElement, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 })
            }
          },
        })
      }
    } catch (err) {
      setError(authError || "An error occurred. Please try again.")
      // Error shake animation
      const formElement = document.querySelector("form")
      if (formElement) {
        gsap.to(formElement, {
          x: "[-10, 10, -10, 10, 0]",
          duration: 0.5,
          ease: "power2.out",
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95">
     
      <main className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center mb-8">
            <Link
              href="/login"
              className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Log In
            </Link>
          </div>

          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Forgot Your Password?</h1>
              <p className="text-muted-foreground">We'll send you a link to reset your password</p>
            </div>

            <div className="bg-card/50 backdrop-blur-sm p-6 rounded-lg border border-border">
              {error && (
                <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 mb-4 text-red-500">{error}</div>
              )}

              {isSubmitted ? (
                <div id="success-message" className="text-center py-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-green-500/20 rounded-full mb-4">
                    <Check className="h-6 w-6 text-green-500" />
                  </div>
                  <h3 className="text-xl font-medium text-foreground mb-2">Check Your Email</h3>
                  <p className="text-muted-foreground mb-4">
                    We've sent a password reset link to <span className="font-medium text-foreground">{email}</span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Didn't receive an email? Check your spam folder or{" "}
                    <button
                      onClick={() => setIsSubmitted(false)}
                      className="text-primary hover:text-primary/80 transition-colors"
                    >
                      try again
                    </button>
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-medium text-foreground">
                      Email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>

                  <MagneticButton
                    type="submit"
                    disabled={isLoading}
                    className="w-full px-4 py-3 bg-primary text-white font-medium rounded-md hover:bg-primary/90 transition-colors flex items-center justify-center"
                  >
                    {isLoading ? (
                      <span className="flex items-center">
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Sending...
                      </span>
                    ) : (
                      "Send Reset Link"
                    )}
                  </MagneticButton>
                </form>
              )}

              <div className="mt-6 text-center">
                <p className="text-muted-foreground">
                  Remember your password?{" "}
                  <Link href="/login" className="text-primary font-medium hover:text-primary/80 transition-colors">
                    Log in
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

    </div>
  )
}
