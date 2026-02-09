"use client"

import { useEffect, useRef } from "react"

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  size: number
  rotation: number
  rotationSpeed: number
}

export function ParticleBurstCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
const animationRef = useRef<number | null>(null);

  const isActiveRef = useRef(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    const createParticleBurst = (event: CustomEvent) => {
      const { x, y } = event.detail
      isActiveRef.current = true

      // Create paper-like particles
      for (let i = 0; i < 60; i++) {
        const angle = Math.random() * Math.PI * 2
        const velocity = 4 + Math.random() * 8
        const size = 4 + Math.random() * 12

        particlesRef.current.push({
          x,
          y,
          vx: Math.cos(angle) * velocity,
          vy: Math.sin(angle) * velocity - 2,
          life: 1,
          maxLife: 2000 + Math.random() * 1000,
          size,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.1,
        })
      }
    }

    window.addEventListener("particleBurst", createParticleBurst as EventListener)

    // Animation loop
    const animate = () => {
      // Clear with semi-transparent background for motion blur effect
      ctx.fillStyle = "rgba(255, 255, 255, 0.02)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Update and draw particles
      particlesRef.current = particlesRef.current.filter((particle) => {
        particle.life -= 16.67
        const progress = 1 - particle.life / particle.maxLife

        // Physics
        particle.vy += 0.15 // gravity
        particle.x += particle.vx * (1 - progress * 0.3)
        particle.y += particle.vy

        // Rotation
        particle.rotation += particle.rotationSpeed

        // Draw particle
        ctx.save()
        ctx.globalAlpha = Math.max(0, particle.life / particle.maxLife)
        ctx.translate(particle.x, particle.y)
        ctx.rotate(particle.rotation)

        // Paper-like shape (rectangle)
        ctx.fillStyle = `hsl(35, 40%, ${70 + Math.sin(progress) * 10}%)`
        ctx.shadowColor = "rgba(166, 124, 82, 0.3)"
        ctx.shadowBlur = 4
        ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size)

        // Paper texture edges
        ctx.strokeStyle = `hsla(35, 50%, 50%, ${0.3 * (particle.life / particle.maxLife)})`
        ctx.lineWidth = 1
        ctx.strokeRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size)

        ctx.restore()

        return particle.life > 0
      })

      if (particlesRef.current.length > 0 || isActiveRef.current) {
        animationRef.current = requestAnimationFrame(animate)
      }

      if (particlesRef.current.length === 0) {
        isActiveRef.current = false
      }
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      window.removeEventListener("particleBurst", createParticleBurst as EventListener)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  return (
    <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-50" style={{ background: "transparent" }} />
  )
}
