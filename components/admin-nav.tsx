"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { LogOut, Menu, X } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"

const adminNavItems = [
  {
    title: "Overview",
    href: "/admin",
  },
  {
    title: "Users",
    href: "/admin/users",
  },
  {
    title: "Investments",
    href: "/admin/investments",
  },
  {
    title: "Transactions",
    href: "/admin/transactions",
  },
  {
    title: "Support Chat",
    href: "/admin/support",
  }
]

export function AdminNav() {
  const pathname = usePathname()
  const { logout } = useAuth()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    try {
      // Let the useAuth hook handle the redirection
      await logout()
      // No need to manually redirect - the hook will do it
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  return (
    <div className="relative border p-2 rounded-[20px]">
      {/* Mobile menu button */}
      <div className="flex items-center justify-between px-4 md:hidden">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleLogout} 
          className="text-muted-foreground text-red-600 hover:text-primary"
        >
          <LogOut className="h-5 w-5" />
        </Button>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="absolute top-12 left-0 right-0 z-50 bg-background border border-border rounded-md shadow-lg p-4 md:hidden">
          <div className="flex flex-col space-y-4">
            {adminNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  pathname === item.href
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.title}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Desktop navigation */}
      <nav className="hidden md:flex items-center justify-between mx-6">
        <div className="flex items-center space-x-4 lg:space-x-6">
          {adminNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname === item.href
                  ? "text-primary"
                  : "text-muted-foreground"
              }`}
            >
              {item.title}
            </Link>
          ))}
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleLogout} 
          className="text-muted-foreground text-red-600 hover:text-primary flex items-center gap-2"
        >
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </Button>
      </nav>
    </div>
  )
}