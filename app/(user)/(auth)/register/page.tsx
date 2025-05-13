"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { TrendingUp, ArrowLeft, Mail, Lock, User2, Eye, EyeOff, Check, Info } from "lucide-react"
import MagneticButton from "@/components/animations/magnetic-button"
import { gsap } from "gsap"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "sonner"

export default function RegisterPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [passwordStrength, setPasswordStrength] = useState(0)
  const router = useRouter()

  const checkPasswordStrength = (password: string) => {
    let score = 0

    // Length check
    if (password.length > 8) score += 1
    if (password.length > 12) score += 1

    // Complexity checks
    if (/[A-Z]/.test(password)) score += 1
    if (/[0-9]/.test(password)) score += 1
    if (/[^A-Za-z0-9]/.test(password)) score += 1

    setPasswordStrength(Math.min(score, 5))
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value
    setPassword(newPassword)
    checkPasswordStrength(newPassword)
  }

  const { register, error: authError } = useAuth()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
  
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }
  
    if (passwordStrength < 3) {
      setError("Please use a stronger password")
      return
    }
  
    if (!agreeTerms) {
      setError("You must agree to the terms and conditions")
      return
    }
  
    setIsLoading(true)
  
    try {
      await register(email, password, name)

      toast.success("Registration successful!")

      window.location.href = "/dashboard"
  
      // Animate success
      const formElement = document.querySelector("form")
      if (formElement) {
        gsap.to(formElement, {
          y: -20,
          opacity: 0,
          duration: 0.5,
          onComplete: () => {
            router.push("/login?registered=true")
          },
        })
      }
    } catch (err) {
      setError(authError || "An error occurred. Please try again.")
      
// console.log("Registering user with email:", email);
// console.log("Password strength:", passwordStrength);
// console.log("Terms agreed:", agreeTerms);
// console.log("Registration successful for:", email);
// console.log("Registration error:", err);

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
  
  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 1) return "bg-red-500"
    if (passwordStrength <= 2) return "bg-orange-500"
    if (passwordStrength <= 3) return "bg-yellow-500"
    if (passwordStrength <= 4) return "bg-green-400"
    return "bg-green-500"
  }

  const getPasswordStrengthText = () => {
    if (password.length === 0) return ""
    if (passwordStrength <= 1) return "Very weak"
    if (passwordStrength <= 2) return "Weak"
    if (passwordStrength <= 3) return "Medium"
    if (passwordStrength <= 4) return "Strong"
    return "Very strong"
  }

  return (
    <div className="min-h-screen bg-black">
     

     
      <main className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center mb-8">
            <Link href="/" className="flex items-center text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </div>

          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Create Your Account</h1>
              <p className="text-muted-foreground">Join TradeScend and start investing today</p>
            </div>

            <div className="bg-card/50 backdrop-blur-sm p-6 rounded-lg border border-border">
              {error && (
                <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 mb-4 text-red-500">{error}</div>
              )}

              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="block text-sm font-medium text-foreground">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User2 className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="John Doe"
                    />
                  </div>
                </div>

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

                <div className="space-y-2">
                  <label htmlFor="password" className="block text-sm font-medium text-foreground">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      value={password}
                      onChange={handlePasswordChange}
                      className="block w-full pl-10 pr-10 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {password && (
                    <div className="mt-1">
                      <div className="h-1 w-full bg-muted rounded-full overflow-hidden flex">
                        <div
                          className={`h-full ${getPasswordStrengthColor()} transition-all duration-300`}
                          style={{ width: `${(passwordStrength / 5) * 100}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{getPasswordStrengthText()}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="block w-full pl-10 pr-10 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {confirmPassword && password && (
                    <div className="flex items-center mt-1">
                      {password === confirmPassword ? (
                        <>
                          <Check className="h-4 w-4 text-green-500 mr-1" />
                          <p className="text-xs text-green-500">Passwords match</p>
                        </>
                      ) : (
                        <>
                          <Info className="h-4 w-4 text-red-500 mr-1" />
                          <p className="text-xs text-red-500">Passwords do not match</p>
                        </>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center">
                  <input
                    id="agree-terms"
                    name="agree-terms"
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="h-4 w-4 border border-border rounded bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <label htmlFor="agree-terms" className="ml-2 block text-sm text-muted-foreground">
                    I agree to the{" "}
                    <Link href="/terms" className="text-primary hover:text-primary/80 transition-colors">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="text-primary hover:text-primary/80 transition-colors">
                      Privacy Policy
                    </Link>
                  </label>
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
                      Registering...
                    </span>
                  ) : (
                    "Create Account"
                  )}
                </MagneticButton>

                {/* <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-card/50 text-muted-foreground">Or continue with</span>
                  </div>
                </div> */}

                {/* <button
                  type="button"
                  className="w-full px-4 py-3 bg-background border border-border rounded-md hover:bg-card/50 transition-colors flex items-center justify-center space-x-2"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  <span className="text-foreground font-medium">Continue with Google</span>
                </button> */}
              </form>

              <div className="mt-6 text-center">
                <p className="text-muted-foreground">
                  Already have an account?{" "}
                  <Link href="/login" className="text-primary font-medium hover:text-primary/80 transition-colors">
                    Log in
                  </Link>
                </p>
              </div>
            </div>

            <div className="mt-8 bg-card/50 backdrop-blur-sm p-4 rounded-lg border border-border">
              <div className="flex items-start text-sm text-muted-foreground">
                <div className="bg-secondary/20 p-2 rounded-full mr-3 flex-shrink-0 mt-1">
                  <Info className="h-4 w-4 text-secondary" />
                </div>
                <p>
                  By creating an account, you&apos;ll gain access to our investment platform and be able to start copy
                  trading with just $1,000. Your information is secure and will never be shared with third parties.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

     
    </div>
  )
}