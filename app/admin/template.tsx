"use client"

import { redirect } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { AdminNav } from "@/components/admin-nav"
import { useEffect } from "react"

export default function AdminTemplate({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading && (!user || !user.isAdmin)) {
      redirect("/")
    }
  }, [user, loading])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <header className="mb-6">
        <AdminNav />
      </header>
      <main>
        {children}
      </main>
    </div>
  )
}
