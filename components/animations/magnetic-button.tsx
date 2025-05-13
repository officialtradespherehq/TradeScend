"use client"

import type React from "react"
import { useRef, useState } from "react"
import { gsap } from "gsap"
import { cn } from "@/lib/utils"

interface MagneticButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  strength?: number
  children: React.ReactNode
  className?: string
}

export default function MagneticButton({ strength = 30, children, className, ...props }: MagneticButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [isHovering, setIsHovering] = useState(false)

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!buttonRef.current) return

    const rect = buttonRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    const distanceX = e.clientX - centerX
    const distanceY = e.clientY - centerY

    gsap.to(buttonRef.current, {
      x: distanceX * 0.2,
      y: distanceY * 0.2,
      duration: 0.3,
      ease: "power2.out",
    })

    // Move inner content slightly for a 3D effect
    const innerContent = buttonRef.current.querySelector("[data-magnetic-content]")
    if (innerContent) {
      gsap.to(innerContent, {
        x: distanceX * 0.03,
        y: distanceY * 0.03,
        duration: 0.3,
        ease: "power2.out",
      })
    }
  }

  const handleMouseEnter = () => {
    setIsHovering(true)

    if (!buttonRef.current) return

    gsap.to(buttonRef.current, {
      scale: 1.05,
      duration: 0.3,
      ease: "power1.out",
    })
  }

  const handleMouseLeave = () => {
    setIsHovering(false)

    if (!buttonRef.current) return

    gsap.to(buttonRef.current, {
      x: 0,
      y: 0,
      scale: 1,
      duration: 0.5,
      ease: "elastic.out(1, 0.3)",
    })

    const innerContent = buttonRef.current.querySelector("[data-magnetic-content]")
    if (innerContent) {
      gsap.to(innerContent, {
        x: 0,
        y: 0,
        duration: 0.5,
        ease: "elastic.out(1, 0.3)",
      })
    }
  }

  return (
    <button
      ref={buttonRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn("relative overflow-hidden transition-all", isHovering && "z-10", className)}
      {...props}
    >
      <span data-magnetic-content className="relative z-10 flex items-center justify-center">
        {children}
      </span>
    </button>
  )
}
