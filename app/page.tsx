import Header from "@/components/header"
import Hero from "@/components/hero"
import Courses from "@/components/courses"
import Features from "@/components/features"
import Location from "@/components/location"
import CTA from "@/components/cta"
import Footer from "@/components/footer"
import ScrollAnimations from "@/components/scroll-animations"
import { ParticleBurstCanvas } from "@/components/particle-burst-canvas"
import type { Metadata } from "next"
export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
}
export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "EducationalOrganization",
        "name": "Harry Potter Academy",
        "alternateName": "Harry Potter Academy Uz",
        "description": "Bolalar va kattalar uchun zamonaviy o'quv markazi. Ingliz, rus, turk va koreys tillari, kimyo va biologiya fanlari.",
        "url": "https://harry-potter.uz",
        "logo": "https://harry-potter.uz/logo.png",
        "image": "https://harry-potter.uz/og-image.png",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Toshkent",
          "addressCountry": "UZ"
        },
        "telephone": "+998972393332",
        "priceRange": "$$",
        "openingHours": "Mo-Sa 09:00-20:00",
        "sameAs": [
          "https://www.facebook.com/HarryPotterAcademy",
          "https://www.instagram.com/HarryPotterAcademy"
        ]
      },
      {
        "@type": "ItemList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "item": {
              "@type": "Course",
              "name": "Ingliz tili kursi",
              "description": "CEFR va IELTS sertifikatlariga tayyorlov, Speaking Club bilan amaliyot.",
              "provider": { "@type": "EducationalOrganization", "name": "Harry Potter Academy" }
            }
          },
          {
            "@type": "ListItem",
            "position": 2,
            "item": {
              "@type": "Course",
              "name": "Rus tili kursi",
              "description": "Boshlangichdan advanced darajagacha, speaking club va sertifikat imtihonlariga tayyorlov.",
              "provider": { "@type": "EducationalOrganization", "name": "Harry Potter Academy" }
            }
          },
          {
            "@type": "ListItem",
            "position": 3,
            "item": {
              "@type": "Course",
              "name": "Kimyo va Biologiya",
              "description": "DTM va sertifikat imtihonlariga tayyorlov.",
              "provider": { "@type": "EducationalOrganization", "name": "Harry Potter Academy" }
            }
          }
        ]
      }
    ]
  };

  return (
    <main className="bg-background text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ScrollAnimations />
      <ParticleBurstCanvas />
      <Header />
      <Hero />
       <Features />
      <Courses />
      <Location />
      <CTA />
      <Footer />
    </main>
  )
}
