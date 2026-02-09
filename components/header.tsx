"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { label: "Kurslar", href: "#courses" },
  { label: "Xususiyatlar", href: "#features" },
  { label: "Bog'lanish", href: "#contact" },
  { label: "CRM tizimi", href: "/login", isButton: true, isExternal: true },
  { label: "Qo'shilish", href: "#join", isButton: true },
];

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Doimiy header (faqat logo + hamburger) */}
      <header className="fixed w-full top-0 z-[100] bg-background/80 backdrop-blur-md border-b border-accent/20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="Harry Potter Academy asosiy logotipi"
              width={40}
              height={40}
              className="rounded-lg"
            />
            <span className="text-xl font-serif font-bold text-primary hidden sm:inline">
              Harry Potter Academy
            </span>
          </a>

          {/* Hamburger - faqat mobil uchun */}
          <button
            className="md:hidden text-foreground p-2 rounded-full hover:bg-accent/20 transition-colors"
            onClick={() => setIsOpen(true)}
          >
            <Menu size={28} />
          </button>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) =>
              item.isButton ? (
                <a
                  key={item.label}
                  href={item.href}
                  className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  {item.label}
                </a>
              ) : (
                <a
                  key={item.label}
                  href={item.href}
                  className="text-foreground/80 hover:text-primary transition-colors"
                >
                  {item.label}
                </a>
              )
            )}
          </div>
        </div>
      </header>

      {/* Full-screen mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[99] md:hidden"
          >
            {/* Blur + qorong‘i fon */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.9 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70 backdrop-blur-xl"
              onClick={() => setIsOpen(false)}
            />

            {/* Yopish tugmasi */}
            <button
              className="absolute top-6 right-6 z-50 text-white p-3 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <X size={32} />
            </button>

            {/* Bubble menyular - ekranning markazida */}
            {/* <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-full max-w-md h-full flex items-center justify-center">
                {navItems.map((item, index) => {
                  const angle = (index / navItems.length) * 360;
                  const radius = 140; // bubble'lar orasidagi masofa

                  return (
                    <motion.a
                      key={item.label}
                      href={item.href}
                      className={`absolute flex items-center justify-center rounded-full text-center font-medium shadow-2xl backdrop-blur-lg pointer-events-auto border-2 ${
                        item.isButton
                          ? "bg-gradient-to-br from-primary to-primary/80 text-white w-36 h-36 text-xl font-bold border-white/30"
                          : "bg-white/10 border-white/20 text-white w-32 h-32 text-lg"
                      }`}
                      initial={{ scale: 0, opacity: 0, x: 0, y: 0 }}
                      animate={{
                        scale: 1,
                        opacity: 1,
                        x: radius * Math.cos((angle * Math.PI) / 180),
                        y: radius * Math.sin((angle * Math.PI) / 180),
                      }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{
                        delay: index * 0.1,
                        type: "spring",
                        stiffness: 200,
                        damping: 15,
                      }}
                      whileHover={{ scale: 1.15, boxShadow: "0 20px 60px rgba(0,0,0,0.4)" }}
                      whileTap={{ scale: 0.92 }}
                      onClick={() => setIsOpen(false)}
                    >
                      {item.label}
                    </motion.a>
                  );
                })}
              </div>
            </div> */}
            {/* Bubble menyular - ekranning markazida */}
<div className="absolute inset-0 flex items-center justify-center">
  <div className="relative w-full max-w-md h-full flex items-center justify-center">
    {navItems.map((item, index) => {
      // Ekran o'lchamiga qarab radiusni sozlaymiz
      const radius =
        typeof window !== "undefined"
          ? Math.min(window.innerWidth / 4, 140)
          : 140;

      const angle = (index / navItems.length) * 360;

      // Bubble o'lchami ekran o'lchamiga qarab
      const size =
        typeof window !== "undefined"
          ? Math.min(120, window.innerWidth / 4)
          : item.isButton
          ? 144
          : 120;

      return (
        <motion.a
          key={item.label}
          href={item.href}
          className={`absolute flex items-center justify-center rounded-full text-center font-medium shadow-2xl backdrop-blur-lg pointer-events-auto border-2 ${
            item.isButton
              ? `bg-gradient-to-br from-primary to-primary/80 text-white border-white/30`
              : `bg-white/10 border-white/20 text-white`
          }`}
          style={{
            width: size,
            height: size,
            fontSize: item.isButton ? 18 : 16,
          }}
          initial={{ scale: 0, opacity: 0, x: 0, y: 0 }}
          animate={{
            scale: 1,
            opacity: 1,
            x: radius * Math.cos((angle * Math.PI) / 180),
            y: radius * Math.sin((angle * Math.PI) / 180),
          }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{
            delay: index * 0.1,
            type: "spring",
            stiffness: 200,
            damping: 15,
          }}
          whileHover={{
            scale: 1.15,
            boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
          }}
          whileTap={{ scale: 0.92 }}
          onClick={() => setIsOpen(false)}
        >
          {item.label}
        </motion.a>
      );
    })}
  </div>
</div>

          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
