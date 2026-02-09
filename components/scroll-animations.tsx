"use client"

import { useEffect, useRef, useState } from "react"

interface ScrollElement {
  id: string
  delay: number
  rotation: number
}

const MAGICAL_ELEMENTS: ScrollElement[] = [
  { id: "✨", delay: 0, rotation: 15 },
  { id: "⭐", delay: 200, rotation: -25 },
  { id: "✨", delay: 400, rotation: 45 },
  { id: "⭐", delay: 600, rotation: -15 },
  { id: "✨", delay: 800, rotation: 30 },
]

export default function ScrollAnimations() {
  const [visibleElements, setVisibleElements] = useState<Set<string>>(new Set())
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleElements((prev) => new Set(prev).add(entry.target.id))
          }
        })
      },
      { threshold: 0.1 },
    )

    if (containerRef.current) {
      const elements = containerRef.current.querySelectorAll("[data-scroll-animate]")
      elements.forEach((el) => observer.observe(el))
    }

    return () => observer.disconnect()
  }, [])

  return (
    <div ref={containerRef} className="fixed inset-0 pointer-events-none overflow-hidden -z-5">
      {MAGICAL_ELEMENTS.map((element, index) => (
        <div
          key={index}
          id={`scroll-${index}`}
          data-scroll-animate
          className="absolute text-4xl opacity-0 will-change-transform"
          style={{
            left: `${15 + index * 18}%`,
            top: "-100px",
            animation: visibleElements.has(`scroll-${index}`)
              ? `float-up 6s ease-in-out ${element.delay}ms infinite`
              : "none",
            transform: `rotate(${element.rotation}deg)`,
          }}
        >
          {element.id}
        </div>
      ))}

      <style>{`
        @keyframes float-up {
          0% {
            opacity: 0;
            transform: translateY(-100px) rotate(${MAGICAL_ELEMENTS[0]?.rotation || 0}deg) scale(0.5);
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: translateY(100vh) rotate(${MAGICAL_ELEMENTS[0]?.rotation || 0}deg) scale(0.8);
          }
        }

        @keyframes sparkle {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }

        [data-scroll-animate] {
          animation: sparkle 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
