"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { ScrollToPlugin } from "gsap/ScrollToPlugin"

export default function ScrollAnimations() {
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    // Register plugins
    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin)

    // Detect if we're on mobile
    const isMobile = window.innerWidth < 768

    // Smooth scroll on anchor links
    const anchorLinks = document.querySelectorAll('a[href^="#"]')
    anchorLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault()
        const targetId = link.getAttribute("href")
        if (targetId === "#") return

        gsap.to(window, {
          duration: isMobile ? 0.8 : 1,
          scrollTo: {
            y: targetId,
            offsetY: 20,
          },
          ease: "power2.inOut",
        })
      })
    })

    // Create reveal animations for sections - simplified for mobile
    const sections = document.querySelectorAll("section")
    sections.forEach((section) => {
      gsap.fromTo(
        section.children,
        {
          y: isMobile ? 30 : 50,
          opacity: 0,
        },
        {
          y: 0,
          opacity: 1,
          stagger: isMobile ? 0.05 : 0.1,
          duration: isMobile ? 0.6 : 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: section,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        },
      )
    })

    // Stats counter animation - simplified for mobile
    const statsContainers = document.querySelectorAll("[data-stats-container]")
    statsContainers.forEach((container) => {
      const items = container.querySelectorAll("[data-stats-item]")

      gsap.fromTo(
        items,
        {
          scale: isMobile ? 0.9 : 0.8,
          opacity: 0,
        },
        {
          scale: 1,
          opacity: 1,
          stagger: isMobile ? 0.1 : 0.15,
          duration: isMobile ? 0.5 : 0.6,
          ease: "back.out(1.7)",
          scrollTrigger: {
            trigger: container,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        },
      )
    })

    // Parallax effects for the hero section - reduced on mobile
    const heroSection = document.querySelector("[data-hero-section]")
    if (heroSection) {
      const heroContent = heroSection.querySelector("[data-hero-content]")

      if (heroContent) {
        ScrollTrigger.create({
          trigger: heroSection,
          start: "top top",
          end: "bottom top",
          scrub: true,
          onUpdate: (self) => {
            gsap.to(heroContent, {
              y: self.progress * (isMobile ? 80 : 150),
              ease: "none",
              duration: 0.1,
            })
          },
        })
      }
    }

    // Clean up all ScrollTriggers when the component unmounts
    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
    }
  }, [])

  return null
}
