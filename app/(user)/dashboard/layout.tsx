import "@/styles/globals.css"
import "../../(landingpage)/globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/hooks/use-auth"
import Bottombar from "@/components/dashboard/bottombar"
import ChatNavbar from "@/components/support-chat/chat-navbar"
import { Toaster } from "@/components/ui/toaster"

export const metadata = {
  title: "TradeSphere - Dashboard",
  description:
    "Manage your investments and track your returns with TradeSphere's secure trading platform.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="dark:bg-black">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <div className="flex h-screen overflow-hidden bg-black">
              <Bottombar />
              <main className="flex-1 overflow-y-auto">
                <div className="container mx-auto px-4 py-8">
                  {children}
                </div>
              </main>
              <ChatNavbar />
            </div>
            <Toaster/>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
