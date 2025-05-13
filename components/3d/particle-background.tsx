"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"
import { gsap } from "gsap"
import { useTheme } from "next-themes"

export default function ParticleBackground() {
  const containerRef = useRef<HTMLDivElement>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const particlesRef = useRef<THREE.Points | null>(null)
  const frameIdRef = useRef<number | null>(null)
  const mouseRef = useRef({ x: 0, y: 0 })
  const { theme } = useTheme()

  useEffect(() => {
    if (!containerRef.current) return

    // Setup scene
    const scene = new THREE.Scene()
    sceneRef.current = scene

    // Setup camera with responsive adjustments
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    camera.position.z = 10
    cameraRef.current = camera

    // Setup renderer with responsive settings
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance", // Better performance on mobile
    })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)) // Limit pixel ratio for better performance
    containerRef.current.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Create particles - reduce count on mobile for better performance
    const isMobile = window.innerWidth < 768
    const particleCount = isMobile ? 800 : 1500
    const particleGeometry = new THREE.BufferGeometry()

    // Create positions array
    const positions = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)
    const sizes = new Float32Array(particleCount)

    // Base colors for light/dark mode
    const primaryColor = new THREE.Color(theme === "dark" ? "#4169E1" : "#4169E1")
    const secondaryColor = new THREE.Color(theme === "dark" ? "#FFD700" : "#FFD700")

    // Populate position and color arrays
    for (let i = 0; i < particleCount; i++) {
      // Positions
      positions[i * 3] = (Math.random() - 0.5) * 20 // x
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20 // y
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20 // z

      // Sizes - smaller on mobile
      sizes[i] = Math.random() * (isMobile ? 0.3 : 0.5) + 0.1

      // Color (mix between primary and secondary)
      const mixFactor = Math.random()
      const color = new THREE.Color().lerpColors(primaryColor, secondaryColor, mixFactor)

      colors[i * 3] = color.r
      colors[i * 3 + 1] = color.g
      colors[i * 3 + 2] = color.b
    }

    // Set geometry attributes
    particleGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3))
    particleGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3))
    particleGeometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1))

    // Create particle material
    const particleMaterial = new THREE.PointsMaterial({
      size: isMobile ? 0.08 : 0.1,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.8,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })

    // Create particles mesh
    const particles = new THREE.Points(particleGeometry, particleMaterial)
    scene.add(particles)
    particlesRef.current = particles

    // Animation function with performance optimization
    const animate = () => {
      if (!particlesRef.current || !rendererRef.current || !sceneRef.current || !cameraRef.current) return

      // Slow rotation of particles - slower on mobile
      particlesRef.current.rotation.y += isMobile ? 0.0003 : 0.0005
      particlesRef.current.rotation.x += isMobile ? 0.0001 : 0.0002

      // Mouse influence - reduced on mobile
      const mouseFactor = isMobile ? 0.00002 : 0.00005
      particlesRef.current.rotation.y += mouseRef.current.x * mouseFactor
      particlesRef.current.rotation.x += mouseRef.current.y * mouseFactor

      // Render the scene
      rendererRef.current.render(sceneRef.current, cameraRef.current)

      // Request next frame
      frameIdRef.current = requestAnimationFrame(animate)
    }

    // Start animation
    animate()

    // Mouse movement effect - passive for better performance
    const handleMouseMove = (event: MouseEvent) => {
      mouseRef.current.x = event.clientX - window.innerWidth / 2
      mouseRef.current.y = event.clientY - window.innerHeight / 2
    }

    window.addEventListener("mousemove", handleMouseMove, { passive: true })

    // Handle scroll effects - passive for better performance
    const handleScroll = () => {
      if (!particlesRef.current) return

      const scrollY = window.scrollY
      gsap.to(particlesRef.current.rotation, {
        z: scrollY * 0.0001,
        duration: 0.5,
      })
    }

    window.addEventListener("scroll", handleScroll, { passive: true })

    // Handle window resize
    const handleResize = () => {
      if (!cameraRef.current || !rendererRef.current) return

      // Update camera aspect ratio
      cameraRef.current.aspect = window.innerWidth / window.innerHeight
      cameraRef.current.updateProjectionMatrix()

      // Update renderer size
      rendererRef.current.setSize(window.innerWidth, window.innerHeight)
    }

    window.addEventListener("resize", handleResize)

    // Cleanup
    return () => {
      if (frameIdRef.current) {
        cancelAnimationFrame(frameIdRef.current)
      }

      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("scroll", handleScroll)
      window.removeEventListener("resize", handleResize)

      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement)
      }
    }
  }, [theme])

  // Update particles when theme changes
  useEffect(() => {
    if (!particlesRef.current) return

    const positions = particlesRef.current.geometry.attributes.position.array
    const colors = particlesRef.current.geometry.attributes.color.array
    const particleCount = positions.length / 3

    // Base colors for light/dark mode
    const primaryColor = new THREE.Color(theme === "dark" ? "#4169E1" : "#4169E1")
    const secondaryColor = new THREE.Color(theme === "dark" ? "#FFD700" : "#FFD700")

    // Update colors based on theme
    for (let i = 0; i < particleCount; i++) {
      const mixFactor = Math.random()
      const color = new THREE.Color().lerpColors(primaryColor, secondaryColor, mixFactor)

      colors[i * 3] = color.r
      colors[i * 3 + 1] = color.g
      colors[i * 3 + 2] = color.b
    }

    particlesRef.current.geometry.attributes.color.needsUpdate = true
  }, [theme])

  // Update the return statement to ensure proper positioning
  return (
    <div ref={containerRef} className="fixed inset-0 z-[-2] pointer-events-none overflow-hidden" aria-hidden="true" />
  )
}
