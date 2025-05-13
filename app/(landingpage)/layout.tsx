import type React from "react"
import "@/styles/globals.css"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import SupportChatButton from "@/components/support-chat/chat-button"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { AuthProvider } from "@/hooks/use-auth"
import { Toaster } from "@/components/ui/toaster"

export const metadata = {
  title: "TradeScend - Cryptocurrency & Stock Market Copy Trading",
  description:
    "Copy trade from expert investors and earn daily returns on your investments with our secure and reliable platform.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
        <AuthProvider>
          <Navbar/>
          {children}
          <Footer/>
          <SupportChatButton />
          <Toaster/>
        </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
