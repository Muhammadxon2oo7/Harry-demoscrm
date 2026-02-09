"use client";

import { useEffect, useRef } from "react";
import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";

const bubbles = [
  { src: "/111.jpg",    size: 140, baseX: "15%",  baseY: "20%",  delay: 0.3  },
  { src: "/222.jpg",    size: 160, baseX: "70%",  baseY: "30%",  delay: 0.6  },
  { src: "/333.jpg",    size: 130, baseX: "25%",  baseY: "60%",  delay: 0.9  },
  { src: "/444.jpg",    size: 180, baseX: "78%",  baseY: "72%",  delay: 1.2  },
  { src: "/555.jpg",    size: 150, baseX: "40%",  baseY: "15%",  delay: 1.5  },
  { src: "/666.jpg",    size: 170, baseX: "55%",  baseY: "82%",  delay: 1.8  },
  { src: "/777.jpeg",    size: 145, baseX: "10%",  baseY: "45%",  delay: 2.1  },
  { src: "/888.jpeg",    size: 165, baseX: "85%",  baseY: "25%",  delay: 2.4  },
  { src: "/101010.jpeg", size: 175, baseX: "65%",  baseY: "10%",  delay: 2.7  },
  { src: "/111111.jpeg", size: 155, baseX: "20%",  baseY: "88%",  delay: 3.0  },
  { src: "/141414.jpeg", size: 160, baseX: "5%",   baseY: "65%",  delay: 3.3  },
  { src: "/151515.jpeg", size: 170, baseX: "90%",  baseY: "50%",  delay: 3.6  },
];

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useRef(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const smoothX = useSpring(mouseX, { damping: 60, stiffness: 300 });
  const smoothY = useSpring(mouseY, { damping: 60, stiffness: 300 });

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const yParallax = useTransform(scrollYProgress, [0, 1], [0, 120]); 

  useEffect(() => {
    isMobile.current = window.innerWidth < 768;

    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!containerRef.current) return;

      let clientX: number, clientY: number;

      if (e instanceof TouchEvent && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else if (e instanceof MouseEvent) {
        clientX = e.clientX;
        clientY = e.clientY;
      } else {
        return;
      }

      const rect = containerRef.current.getBoundingClientRect();
      const x = (clientX / rect.width - 0.5) * (isMobile.current ? 40 : 80);
      const y = (clientY / rect.height - 0.5) * (isMobile.current ? 40 : 80);

      mouseX.set(x);
      mouseY.set(y);
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("touchmove", handleMove, { passive: true });

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("touchmove", handleMove);
    };
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center px-6 py-20 overflow-hidden bg-gradient-to-br from-background via-secondary/5 to-background"
    >
    
      <div className="absolute inset-0 bg-gradient-radial from-primary/10 via-transparent to-transparent pointer-events-none" />

      {bubbles.map((bubble, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full overflow-hidden shadow-2xl border-4 border-white/15 backdrop-blur-md"
          style={{
            width: bubble.size,
            height: bubble.size,
            left: bubble.baseX,
            top: bubble.baseY,
            x: smoothX,
            y: smoothY,
            rotate: useTransform(smoothX, [-40, 40], [-5, 5]),
            perspective: "1200px",
            transformStyle: "preserve-3d",
            boxShadow: "0 25px 70px rgba(0,0,0,0.25), inset 0 0 40px rgba(255,255,255,0.18)",
          }}
          initial={{ opacity: 0, scale: 0.3, y: 120 }}
          animate={{ opacity: isMobile.current ? 0.75 : 0.82, scale: 1, y: 0 }}
          transition={{
            delay: bubble.delay,
            duration: 2.2,
            ease: "easeOut",
          }}
          whileHover={!isMobile.current ? {
            scale: 1.28,
            opacity: 1,
            rotateY: 15,
            rotateX: -10,
            boxShadow: "0 40px 100px rgba(0,0,0,0.4), inset 0 0 60px rgba(255,255,255,0.35)",
            zIndex: 40,
            transition: { duration: 0.6, ease: "easeOut" },
          } : {}}
          whileTap={{
            scale: 1.2,
            opacity: 1,
            transition: { duration: 0.4 },
          }}
        >
          <motion.img
            src={bubble.src}
            alt={`Harry Potter Academy memory ${i+1}`}
            className="w-full h-full object-cover"
            style={{ y: yParallax }}
          />

          <motion.div
            className="absolute inset-0 rounded-full bg-gradient-to-br from-white/30 to-transparent pointer-events-none"
            animate={{
              scale: [1, 1.35, 1],
              opacity: [0.25, 0.55, 0.25],
            }}
            transition={{
              duration: 7,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
              delay: i * 0.9,
            }}
          />
        </motion.div>
      ))}


      <div className="relative z-30 text-center max-w-5xl mx-auto backdrop-blur-sm bg-background/50 border border-white/10 rounded-3xl p-8 md:p-16 shadow-2xl">
        <span className="inline-block px-6 py-2 bg-primary/20 backdrop-blur-md rounded-full text-sm md:text-base font-semibold text-primary uppercase tracking-widest mb-6">
          Bilim sari ishonchli qadam
        </span>

        <h1 className="text-4xl md:text-7xl font-serif font-extrabold text-foreground mb-6 md:mb-8 leading-tight drop-shadow-xl">
          Harry Potter Academy
        </h1>

        <p className="text-base md:text-xl text-foreground/90 mb-10 md:mb-14 max-w-3xl mx-auto leading-relaxed drop-shadow-md">
          Bolalar va kattalar uchun zamonaviy o'quv markazi. Ingliz, rus, turk va koreys tillari, shuningdek kimyo va biologiya fanlari bo'yicha samarali kurslar.
        </p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <button className="px-10 py-5 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-3xl font-bold text-lg md:text-xl hover:shadow-2xl hover:shadow-primary/50 transition-all transform hover:-translate-y-2 hover:scale-105">
            <a href="#courses">Kurs tanlang</a>
          </button>
          <button className="px-10 py-5 border-2 border-primary/60 text-primary rounded-3xl font-bold text-lg md:text-xl hover:bg-primary/10 hover:border-primary transition-all hover:scale-105">
            <a href="#contact">Batafsil ma'lumot</a>
          </button>
        </div>
      </div>
    </section>
  );
}