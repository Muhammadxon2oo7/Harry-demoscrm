"use client"

import type React from "react"

import { useState, useRef } from "react"
import { ChevronDown } from "lucide-react"

const COURSES = [
  { value: "555 (1–4 sinf, rus va o‘zbek guruhlari)", label: "555 (1–4 sinf)" },
  { value: "Matematika (DTM va sertifikat)", label: "Matematika" },
  { value: "Kimyo (DTM va sertifikat)", label: "Kimyo" },
  { value: "Biologiya (DTM va sertifikat)", label: "Biologiya" },
  { value: "Tarix (DTM)", label: "Tarix" },
  { value: "Ona tili (DTM va sertifikat)", label: "Ona tili" },
  { value: "Rus tili (sertifikat va og‘zaki nutq)", label: "Rus tili" },
  { value: "Ingliz tili (CEFR, IELTS, Speaking Club)", label: "Ingliz tili" },
  { value: "Turk tili (razgovor / sertifikat)", label: "Turk tili" },
  { value: "Nemis tili (sertifikat)", label: "Nemis tili" },
  { value: "Koreys tili (sertifikat)", label: "Koreys tili" },
];
export default function CTA() {
  const [formData, setFormData] = useState({
    name: "",
    course: "",
    phone: "",
  })
  const [submitted, setSubmitted] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  
  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!formData.name || !formData.course || !formData.phone) {
    alert("Barcha maydonlarni to‘ldiring!");
    return;
  }

  try {
    // particle burst qismi o‘zgarmaydi...

    const response = await fetch("/api/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error("Xabar yuborishda xato");
    }

    // muvaffaqiyat
    const formCard = formRef.current?.closest(".bg-primary\\/10");
    if (formCard) {
      const rect = formCard.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      window.dispatchEvent(
        new CustomEvent("particleBurst", {
          detail: { x: centerX, y: centerY },
        })
      );
    }

    setSubmitted(true);
    setFormData({ name: "", course: "", phone: "" });
    setTimeout(() => setSubmitted(false), 3000);
  } catch (err) {
    console.error(err);
    alert("Xatolik yuz berdi. Iltimos qayta urinib ko‘ring.");
  }
};

  return (
    <section id="contact" className="py-20 px-6 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-emerald-400/5"></div>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="bg-primary/10 border border-primary/30 rounded-2xl p-12">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-6">Bugun Qo'shilgin</h2>
            <p className="text-xl text-foreground/70 max-w-2xl mx-auto">
              Bilimga to'la poyezd astanizni boshlang. Bizning ustozlar sizni kutmoqda!
            </p>
          </div>

          {submitted ? (
            <div className="max-w-2xl mx-auto text-center animate-fade-in">
              <div className="bg-emerald-100 border-2 border-emerald-400 rounded-2xl p-12 mb-8">
                <div className="text-6xl mb-4">✨</div>
                <h3 className="text-3xl font-serif font-bold text-emerald-900 mb-4">Rahmat!</h3>
                <p className="text-xl text-emerald-800 mb-2">Sizning Bog'lanishinish so'rovingiz qabul qilindi</p>
                <p className="text-lg text-emerald-700 font-semibold">Tez orada bog'lanamiz!</p>
              </div>
            </div>
          ) : (
            <form ref={formRef} onSubmit={handleSubmit} className="max-w-2xl mx-auto">
              <div className="space-y-4 mb-8">
                {/* Name Field */}
                <div className="relative group">
                  <input
                    type="text"
                    placeholder="Ismingiz"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-6 py-4 bg-background border-2 border-primary/30 rounded-xl focus:outline-none focus:border-primary transition-all duration-300 placeholder-foreground/40 text-foreground"
                    required
                  />
                  <div className="absolute inset-0 rounded-xl bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none -z-10" />
                </div>

                {/* Course Selection Dropdown */}
                <div className="relative group">
                  <select
                    value={formData.course}
                    onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                    className="w-full px-6 py-4 bg-background border-2 border-primary/30 rounded-xl focus:outline-none focus:border-primary transition-all duration-300 appearance-none text-foreground cursor-pointer"
                    required
                  >
                    <option value="">Kursni Tanlang</option>
                    {COURSES.map((course) => (
                      <option key={course.value} value={course.value}>
                        {course.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-primary/60 w-5 h-5" />
                  <div className="absolute inset-0 rounded-xl bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none -z-10" />
                </div>

<div className="relative group">
  <input
    type="tel"
    placeholder="+998 (00) 000 00 00"
    value={formData.phone}
    onChange={(e) => {
      const input = e.target.value.replace(/\D/g, ""); // faqat raqamlarni qoldiramiz

      // +998 ni majburiy qilamiz
      let formatted = "+998";

      // qolgan raqamlarni olamiz (maksimal 9 ta raqam)
      const digits = input.startsWith("998") ? input.slice(3) : input;

      if (digits.length > 0) {
        formatted += " (" + digits.slice(0, 2);
      }
      if (digits.length > 2) {
        formatted += ") " + digits.slice(2, 5);
      }
      if (digits.length > 5) {
        formatted += " " + digits.slice(5, 7);
      }
      if (digits.length > 7) {
        formatted += " " + digits.slice(7, 9);
      }

      // Maksimal uzunlikni cheklaymiz
      if (digits.length > 9) {
        formatted = "+998 (" + digits.slice(0, 2) + ") " + digits.slice(2, 5) + " " + digits.slice(5, 7) + " " + digits.slice(7, 9);
      }

      setFormData({ ...formData, phone: formatted });
    }}
    onFocus={(e) => {
      // Agar bo'sh bo'lsa +998 ni qo'yib qo'yamiz
      if (!formData.phone) {
        setFormData({ ...formData, phone: "+998 " });
      }
    }}
    className="w-full px-6 py-4 bg-background border-2 border-primary/30 rounded-xl focus:outline-none focus:border-primary transition-all duration-300 placeholder-foreground/40 text-foreground"
    required
  />
  <div className="absolute inset-0 rounded-xl bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none -z-10" />
</div>

              </div>

              <button
                ref={buttonRef}
                type="submit"
                className="relative w-full px-8 py-4 bg-primary text-primary-foreground rounded-xl font-bold text-lg overflow-hidden group transition-all duration-300 hover:shadow-2xl hover:shadow-primary/40 transform hover:-translate-y-1"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <span className="group-hover:animate-bounce inline-block">→</span>
                  Bog'lanish
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-white/20 to-primary/0 translate-x-full group-hover:translate-x-0 transition-transform duration-700" />
              </button>
            </form>
          )}

          <div className="flex items-center justify-center gap-8 text-center text-sm text-foreground/60 flex-col sm:flex-row mt-12 pt-8 border-t border-primary/20">
            <div className="hover:text-primary transition-colors duration-300">
              <div className="font-bold text-lg text-primary"><a href="tel:+998972393332">+998 97 239 33 32</a></div>
              <div className="text-sm">Telefon orqali murojaat qiling</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
