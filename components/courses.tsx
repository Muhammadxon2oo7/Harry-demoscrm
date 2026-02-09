'use client'

import { useState } from 'react'

export default function Courses() {
  const [expandedId, setExpandedId] = useState<number | null>(null)

  const courses = [
    {
      icon: "📚",
      title: "555",
      duration: "1-4 sinf",
      description: "Rus va o'zbek guruhlari",
      fullDetails: "Maktab dasturi va uyga vazifalarda yordam beriladi. Tajribali ustozlar bilan qulay va samara'li o'qitish.",
      color: "from-blue-400 to-blue-600"
    },
    {
      icon: "🔢",
      title: "Matematika",
      duration: "1-2 yil",
      description: "DTM va sertifikat imtihonlariga tayyorlov",
      fullDetails: "Murakkab mavzularni chuqur o'rganib, imtihonlarda yuqori natija olishga yordam beriladi.",
      color: "from-purple-400 to-purple-600"
    },
    {
      icon: "⚗️",
      title: "Kimyo",
      duration: "1-2 yil",
      description: "DTM va sertifikat imtihonlariga tayyorlov",
      fullDetails: "Laboratoriya ishlarida amaliyot, nazariy bilim va imtihonlarga tayyorlov 1 yil uchun.",
      color: "from-green-400 to-green-600"
    },
    {
      icon: "🧬",
      title: "Biologiya",
      duration: "1-2 yil",
      description: "DTM va sertifikat imtihonlariga tayyorlov",
      fullDetails: "Hayotiy tizimlarni chuqur o'rganib, imtihonlarda muvaffaqiyat qozonish.",
      color: "from-emerald-400 to-emerald-600"
    },
    {
      icon: "📖",
      title: "Tarix",
      duration: "1-1.5 yil",
      description: "DTM imtihoniga tayyorlov",
      fullDetails: "Tarixiy voqea va jarayonlarni chuqur o'rganib, DTM imtihoniga tayyorlov.",
      color: "from-amber-400 to-amber-600"
    },
    {
      icon: "✍️",
      title: "Ona tili",
      duration: "1-1.5 yil",
      description: "DTM va sertifikat imtihonlariga tayyorlov",
      fullDetails: "Grammatika, yo'l, ijodiy yozish va imtihonlarga tayyorlov.",
      color: "from-rose-400 to-rose-600"
    },
    {
      icon: "🇷🇺",
      title: "Rus tili",
      duration: "8 oy - 1 yil",
      description: "Sertifikat va og'zaki nutqni rivojlantirish",
      fullDetails: "Boshlangichdan advanced darajagacha, speaking club va sertifikat imtihonlariga tayyorlov.",
      color: "from-red-400 to-red-600"
    },
    {
      icon: "🇬🇧",
      title: "Ingliz tili",
      duration: "8 oy - 1.5 yil",
      description: "CEFR va IELTS sertifikatlariga tayyorlov",
      fullDetails: "CEFR va IELTS sertifikatlariga tayyorlov, Speaking Club bilan amaliyot.",
      color: "from-blue-400 to-indigo-600"
    },
    {
      icon: "🇹🇷",
      title: "Turk tili",
      duration: "5-6 oy / 3 oy",
      description: "Og'zaki muloqot va sertifikat",
      fullDetails: "Og'zaki muloqot 5-6 oyda yoki sertifikat 3 oyda. Turk madaniyatini o'rganib turli vaziyatlarda gapira olish.",
      color: "from-red-400 to-rose-600"
    },
    {
      icon: "🇩🇪",
      title: "Nemis tili",
      duration: "8-9 oy",
      description: "Sertifikatga tayyorlov",
      fullDetails: "Nemis tilini chuqur o'rganib sertifikat imtihonlariga tayyorlov.",
      color: "from-yellow-400 to-yellow-600"
    },
    {
      icon: "🇰🇷",
      title: "Koreys tili",
      duration: "8-9 oy",
      description: "Sertifikatga tayyorlov",
      fullDetails: "Koreys tilini o'rganib sertifikat imtihonlariga tayyorlov. Koreys madaniyatini tanish.",
      color: "from-pink-400 to-pink-600"
    },
  ]

  return (
    <section id="courses" className="py-20 px-6 bg-secondary/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-6">Bizning Kurslar</h2>
          <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
            Barcha yoshdagi o'quvchilar uchun sifatli ta'lim. Hover qiling yoki bosing batafsil ma'lumot uchun
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {courses.map((course, i) => (
            <div
              key={i}
              onClick={() => setExpandedId(expandedId === i ? null : i)}
              className={`relative cursor-pointer transition-all duration-500 ${
                expandedId === i ? 'md:col-span-2 lg:col-span-2' : ''
              }`}
            >
              {/* Collapsed State */}
              <div
                className={`p-6 bg-gradient-to-br ${course.color} rounded-lg shadow-lg transform transition-all duration-500 ${
                  expandedId === i ? 'opacity-0 absolute scale-0' : 'opacity-100 scale-100'
                } hover:scale-105 hover:shadow-xl`}
              >
                <div className="text-5xl mb-3">{course.icon}</div>
                <h3 className="text-xl font-bold text-white mb-2">{course.title}</h3>
                <p className="text-white/90 text-sm mb-3">{course.duration}</p>
                <p className="text-white/80 text-xs leading-relaxed">{course.description}</p>
                <div className="mt-3 text-white/70 text-xs font-medium">
                  Bosing batafsil uchun →
                </div>
              </div>

              {/* Expanded State */}
              <div
                className={`p-8 bg-gradient-to-br ${course.color} rounded-lg shadow-2xl transform transition-all duration-500 ${
                  expandedId === i ? 'opacity-100 scale-100' : 'opacity-0 absolute scale-50 pointer-events-none'
                }`}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setExpandedId(null)
                  }}
                  className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors"
                >
                  ✕
                </button>
                
                <div className="text-6xl mb-4">{course.icon}</div>
                <h3 className="text-2xl font-bold text-white mb-2">{course.title}</h3>
                <div className="h-1 w-12 bg-white/50 mb-4 rounded"></div>
                
                <div className="space-y-3 text-white">
                  <div>
                    <p className="text-sm text-white/70 font-semibold">DAVOMIYLIGI:</p>
                    <p className="text-lg font-bold">{course.duration}</p>
                  </div>
                  <div>
                    <p className="text-sm text-white/70 font-semibold">KURS TARIFI:</p>
                    <p className="text-sm leading-relaxed">{course.description}</p>
                  </div>
                  <div>
                    <p className="text-sm text-white/70 font-semibold">TO'LIQ MA'LUMOT:</p>
                    <p className="text-sm leading-relaxed">{course.fullDetails}</p>
                  </div>
                </div>

                <button className="mt-6 w-full bg-white/20 hover:bg-white/30 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 border border-white/30">
                  <a href="#contact">
Bog'lanish
                  </a>
                  
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
