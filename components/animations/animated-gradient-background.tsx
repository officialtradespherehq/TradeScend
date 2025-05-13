"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { useTheme } from "next-themes"

export default function AnimatedGradientBackground() {
  const gradientRef = useRef<HTMLDivElement>(null)
  const timelineRef = useRef<gsap.core.Timeline | null>(null)
  const { theme } = useTheme()

  useEffect(() => {
    if (!gradientRef.current) return

    // Color stops for dark and light themes
    const colors =
      theme === "dark"
        ? [
            { x: "0%", y: "0%", color: "rgba(30, 58, 138, 0.5)" }, // Darker Royal Blue
            { x: "100%", y: "100%", color: "rgba(65, 105, 225, 0.3)" }, // Royal Blue
            { x: "0%", y: "100%", color: "rgba(248, 196, 0, 0.2)" }, // Darker Gold
          ]
        : [
            { x: "0%", y: "0%", color: "rgba(65, 105, 225, 0.2)" }, // Royal Blue
            { x: "100%", y: "100%", color: "rgba(255, 215, 0, 0.15)" }, // Gold
            { x: "0%", y: "100%", color: "rgba(65, 105, 225, 0.1)" }, // Royal Blue
          ]

    const tl = gsap.timeline({
      repeat: -1,
      yoyo: true,
      defaults: { duration: 20, ease: "sine.inOut" },
    })

    // Animate each color stop position
    colors.forEach((color, index) => {
      const xPos = Number.parseFloat(color.x)
      const yPos = Number.parseFloat(color.y)

      tl.to(
        `#gradient-stop-${index}`,
        {
          attr: {
            cx: `${xPos + (Math.random() * 30 - 15)}%`,
            cy: `${yPos + (Math.random() * 30 - 15)}%`,
          },
        },
        0,
      )
    })

    timelineRef.current = tl

    // Cleanup
    return () => {
      if (timelineRef.current) {
        timelineRef.current.kill()
      }
    }
  }, [theme])

  return (
    <div ref={gradientRef} className="fixed inset-0 z-[-3] pointer-events-none overflow-hidden" aria-hidden="true">
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
        <defs>
          <radialGradient id="bg-gradient" gradientUnits="userSpaceOnUse">
            <stop
              id="gradient-stop-0"
              offset="0%"
              stopColor={theme === "dark" ? "rgba(30, 58, 138, 0.5)" : "rgba(65, 105, 225, 0.2)"}
              cx="0%"
              cy="0%"
            />
            <stop
              id="gradient-stop-1"
              offset="50%"
              stopColor={theme === "dark" ? "rgba(65, 105, 225, 0.3)" : "rgba(255, 215, 0, 0.15)"}
              cx="100%"
              cy="100%"
            />
            <stop
              id="gradient-stop-2"
              offset="100%"
              stopColor={theme === "dark" ? "rgba(248, 196, 0, 0.2)" : "rgba(65, 105, 225, 0.1)"}
              cx="0%"
              cy="100%"
            />
          </radialGradient>
        </defs>
        <rect x="0" y="0" width="100%" height="100%" fill="url(#bg-gradient)" />
      </svg>
    </div>
  )
}
