"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { TrendingUp, ArrowLeft, Mail, Lock, Eye, EyeOff, Shield } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import ParticleBackground from "@/components/3d/particle-background"
import AnimatedGradientBackground from "@/components/animations/animated-gradient-background"
import MagneticButton from "@/components/animations/magnetic-button"
import { gsap } from "gsap"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { onAuthStateChanged, signOut } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { toast } from "sonner"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  // 2FA State
  const [show2FA, setShow2FA] = useState(false)
  const [twoFactorCode, setTwoFactorCode] = useState("")
  const [userId, setUserId] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isVerifying2FA, setIsVerifying2FA] = useState(false)

  const { login, error: authError } = useAuth()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
  
    try {
      // Get user role from login response
      const loginResult = await login(email, password);
      const userIsAdmin = loginResult.isAdmin;
      setIsAdmin(userIsAdmin);
      
      // Wait for auth state to update to get user ID
      const firebaseUser = await new Promise<any>((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          if (user) {
            resolve(user);
            unsubscribe();
          }
        });
      });
      
      setUserId(firebaseUser.uid);
      
      // Check if user has 2FA enabled
      try {
        const response = await fetch(`/api/2fa?uid=${firebaseUser.uid}`);
        if (response.ok) {
          const data = await response.json();
          
          if (data.twoFactorEnabled) {
            // User has 2FA enabled, show 2FA input
            setShow2FA(true);
            setIsLoading(false);
            toast.info("Please enter your 2FA code to complete login");
            return;
          }
        }
      } catch (err) {
        console.error("Error checking 2FA status:", err);
        // Continue with login if 2FA check fails
      }
      
      // No 2FA or 2FA check failed, proceed with normal login
      await completeLogin(userIsAdmin);
    } catch (err) {
      setError(authError || "An error occurred. Please try again.");
      // Error shake animation
      const formElement = document.querySelector("form");
      if (formElement) {
        gsap.to(formElement, {
          x: "[-10, 10, -10, 10, 0]",
          duration: 0.5,
          ease: "power2.out",
        });
      }
      setIsLoading(false);
    }
  };

  const handle2FAVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || twoFactorCode.length !== 6) {
      setError("Please enter a valid 6-digit code");
      return;
    }

    setIsVerifying2FA(true);
    setError("");

    try {
      // Verify 2FA code for login
      const response = await fetch('/api/2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify-login',
          uid: userId,
          code: twoFactorCode,
        }),
      });

      if (response.ok) {
        // 2FA verified, complete login
        await completeLogin(isAdmin);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Invalid verification code. Please try again.");
        setTwoFactorCode("");
        
        // Sign out the user since 2FA failed
        try {
          await signOut(auth);
        } catch (signOutError) {
          console.error("Error signing out:", signOutError);
        }
        
        // Error shake animation
        const formElement = document.querySelector("form");
        if (formElement) {
          gsap.to(formElement, {
            x: "[-10, 10, -10, 10, 0]",
            duration: 0.5,
            ease: "power2.out",
          });
        }
      }
    } catch (err) {
      setError("Failed to verify 2FA code. Please try again.");
      setTwoFactorCode("");
      
      // Sign out the user since 2FA verification failed
      try {
        await signOut(auth);
      } catch (signOutError) {
        console.error("Error signing out:", signOutError);
      }
    } finally {
      setIsVerifying2FA(false);
    }
  };

  const completeLogin = async (userIsAdmin: boolean) => {
    // Determine redirect path based on user role
    const redirectPath = userIsAdmin ? '/admin' : '/dashboard';
      
      toast.success("Login successful!")
      console.log(`Login successful, redirecting to ${redirectPath}...`);
      
      // Successful login animation
      const formElement = document.querySelector("form");
      if (formElement) {
        gsap.to(formElement, {
          y: -20,
          opacity: 0,
          duration: 0.5,
          onComplete: () => {
            // Use router for navigation after animation completes
            window.location.href = redirectPath;
          },
        });
      } else {
        // Fallback if animation can't be applied
        window.location.href = redirectPath;
    }
  };

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
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Welcome Back</h1>
              <p className="text-muted-foreground">Log in to your TradeScend account</p>
            </div>

            <div className="bg-card/50 backdrop-blur-sm p-6 rounded-lg border border-border">
              {error && (
                <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 mb-4 text-red-500">{error}</div>
              )}

              {show2FA ? (
                <form onSubmit={handle2FAVerification} className="space-y-4">
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/20 rounded-full mb-4">
                      <Shield className="h-8 w-8 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">Two-Factor Authentication</h2>
                    <p className="text-muted-foreground">
                      Enter the 6-digit code from your authenticator app
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="twoFactorCode" className="block text-sm font-medium text-foreground">
                      Verification Code
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Shield className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <input
                        id="twoFactorCode"
                        name="twoFactorCode"
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={6}
                        required
                        value={twoFactorCode}
                        onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ''))}
                        className="block w-full pl-10 pr-3 py-3 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-center text-2xl tracking-widest font-mono"
                        placeholder="000000"
                        autoFocus
                      />
                    </div>
                    <p className="text-xs text-muted-foreground text-center">
                      Open your authenticator app to get the code
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={async () => {
                        // Sign out the user since they're going back
                        try {
                          await signOut(auth);
                        } catch (signOutError) {
                          console.error("Error signing out:", signOutError);
                        }
                        setShow2FA(false);
                        setTwoFactorCode("");
                        setUserId(null);
                        setError("");
                      }}
                      className="flex-1 px-4 py-3 bg-background border border-border text-foreground font-medium rounded-md hover:bg-card/50 transition-colors"
                    >
                      Back
                    </button>
                    <MagneticButton
                      type="submit"
                      disabled={isVerifying2FA || twoFactorCode.length !== 6}
                      className="flex-1 px-4 py-3 bg-primary text-white font-medium rounded-md hover:bg-primary/90 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isVerifying2FA ? (
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
                              stroke="#fff"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="#fff"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Verifying...
                        </span>
                      ) : (
                        "Verify & Continue"
                      )}
                    </MagneticButton>
                  </div>
                </form>
              ) : (
              <form onSubmit={handleLogin} className="space-y-4">
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
                  <div className="flex items-center justify-between">
                    <label htmlFor="password" className="block text-sm font-medium text-foreground">
                      Password
                    </label>
                    <Link
                      href="/forgot-password"
                      className="text-sm text-primary hover:text-primary/80 transition-colors"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
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
                </div>

                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 border border-border rounded bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-muted-foreground">
                    Remember me
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
                          stroke="#fff"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="#fff"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Logging in...
                    </span>
                  ) : (
                    "Log In"
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
              )}

              {!show2FA && (
              <div className="mt-6 text-center">
                <p className="text-muted-foreground">
                  Don&apos;t have an account?{" "}
                  <Link href="/register" className="text-primary font-medium hover:text-primary/80 transition-colors">
                    Register
                  </Link>
                </p>
              </div>
              )}
            </div>

            <div className="mt-8 bg-card/50 backdrop-blur-sm p-4 rounded-lg border border-border">
              <div className="flex items-center text-sm text-muted-foreground">
                <div className="bg-primary/20 p-2 rounded-full mr-3">
                  <Lock className="h-4 w-4 text-primary" />
                </div>
                <p>Your connection to TradeScend is secure and encrypted</p>
              </div>
            </div>
          </div>
        </div>
      </main>

     
    </div>
  )
}
