"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

export default function FloatingTokens() {
  const containerRef = useRef<HTMLDivElement>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const tokensRef = useRef<THREE.Group | null>(null)
  const frameIdRef = useRef<number | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Register ScrollTrigger plugin
    gsap.registerPlugin(ScrollTrigger)

    // Check if we're on mobile
    const isMobile = window.innerWidth < 768

    // Setup scene
    const scene = new THREE.Scene()
    sceneRef.current = scene

    // Setup camera
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    camera.position.z = isMobile ? 6 : 5 // Move camera back on mobile for better view
    cameraRef.current = camera

    // Setup renderer
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance", // Better performance on mobile
    })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    containerRef.current.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Create token group
    const tokens = new THREE.Group()
    tokensRef.current = tokens
    scene.add(tokens)

    // Create crypto tokens
    const createToken = (color: string, position: [number, number, number], scale = 1) => {
      // Reduce geometry detail on mobile
      const segments = isMobile ? 16 : 32
      const geometry = new THREE.CylinderGeometry(0.8 * scale, 0.8 * scale, 0.2 * scale, segments)
      const material = new THREE.MeshStandardMaterial({
        color: new THREE.Color(color),
        metalness: 0.7,
        roughness: 0.3,
        emissive: new THREE.Color(color).multiplyScalar(0.2),
      })

      const token = new THREE.Mesh(geometry, material)
      token.position.set(...position)
      token.rotation.x = Math.PI / 2
      tokens.add(token)

      // Add random animation to each token - slower on mobile
      gsap.to(token.rotation, {
        x: `+=${Math.PI * 2}`,
        y: `+=${Math.random() * Math.PI}`,
        duration: isMobile ? 15 + Math.random() * 15 : 10 + Math.random() * 20,
        ease: "none",
        repeat: -1,
      })

      gsap.to(token.position, {
        y: position[1] + (Math.random() - 0.5) * (isMobile ? 0.3 : 0.5),
        duration: 4 + Math.random() * 4,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      })

      return token
    }

    // Create ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
    scene.add(ambientLight)

    // Create directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
    directionalLight.position.set(5, 5, 5)
    scene.add(directionalLight)

    // Create tokens - fewer and smaller on mobile
    if (isMobile) {
      createToken("#F7931A", [-1.5, 0, 0], 1) // Bitcoin
      createToken("#627EEA", [0, 0.8, 0.8], 0.8) // Ethereum
      createToken("#26A17B", [1.5, -0.3, -0.8], 0.7) // Tether
    } else {
      createToken("#F7931A", [-2, 0, 0], 1.2) // Bitcoin
      createToken("#627EEA", [0, 1, 1], 1) // Ethereum
      createToken("#26A17B", [2, -0.5, -1], 0.9) // Tether
      createToken("#FF9900", [-1.5, -1, -2], 0.8) // Binance
      createToken("#345D9D", [1.5, 1.5, 0], 0.7) // Cardano
    }

    // Animation function
    const animate = () => {
      if (!tokensRef.current || !rendererRef.current || !sceneRef.current || !cameraRef.current) return

      // Rotate the entire token group - slower on mobile
      tokensRef.current.rotation.y += isMobile ? 0.002 : 0.003

      // Render the scene
      rendererRef.current.render(sceneRef.current, cameraRef.current)

      // Request next frame
      frameIdRef.current = requestAnimationFrame(animate)
    }

    // Start animation
    animate()

    // Mouse movement effect - reduced sensitivity on mobile
    const handleMouseMove = (event: MouseEvent) => {
      if (!tokensRef.current) return

      const mouseX = (event.clientX / window.innerWidth) * 2 - 1
      const mouseY = -(event.clientY / window.innerHeight) * 2 + 1
      const factor = isMobile ? 0.1 : 0.2

      gsap.to(tokensRef.current.rotation, {
        x: mouseY * factor,
        z: mouseX * factor,
        duration: 1,
        ease: "power2.out",
      })
    }

    window.addEventListener("mousemove", handleMouseMove, { passive: true })

    // Handle scroll effects
    ScrollTrigger.create({
      trigger: containerRef.current,
      start: "top top",
      end: "bottom top",
      onUpdate: (self) => {
        if (!tokensRef.current) return
        gsap.to(tokensRef.current.position, {
          y: self.progress * -1,
          duration: 0.5,
        })
      },
    })

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
      window.removeEventListener("resize", handleResize)

      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement)
      }

      ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-[-1] pointer-events-none overflow-hidden"
      aria-hidden="true"
    />
  )
}
