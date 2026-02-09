import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Lora } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/context/AuthContext"
import { Toaster } from "@/components/ui/sonner"
const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })
const _lora = Lora({
  subsets: ["latin"],
  variable: "--font-serif",
})

export const metadata: Metadata = {
  metadataBase: new URL("https://harry-potter.uz"),
  alternates: {
    canonical: "/",
  },
  title: {
    default: "Harry Potter Academy - Zamonaviy O'quv Markazi",
    template: "%s | Harry Potter Academy",
  },
  description:
    "Harry Potter Academy — bolalar va kattalar uchun ingliz, rus, turk va koreys tillari, kimyo va biologiya fanlari bo'yicha samarali kurslar. Toshkentdagi eng yaxshi o'quv markazlaridan biri.",
  keywords: [
    "Harry Potter Academy",
    "Harry Potter Academy Uz",
    "Harry Potter Academy School",
    "o'quv markazi",
    "Toshkent o'quv markazi",
    "ingliz tili kursi",
    "rus tili kursi",
    "kimyo kursi",
    "biologiya kursi",
    "turk tili kursi",
    "koreys tili kursi",
    "IELTS tayyorlov",
    "CEFR sertifikat",
  ],
  icons: {
    icon: [
      {
        url: "/favicon-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/favicon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/favicon.ico",
      },
    ],
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "Harry Potter Academy - Zamonaviy O'quv Markazi",
    description:
      "Harry Potter Academy — bolalar va kattalar uchun sifatli ta'lim, xalqaro sertifikatlar va viza bo'yicha maslahatlar.",
    url: "https://harry-potter.uz",
    siteName: "Harry Potter Academy",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Harry Potter Academy - Bilim Sari Ishonchli Qadam",
      },
    ],
    locale: "uz_UZ",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Harry Potter Academy - Zamonaviy O'quv Markazi",
    description:
      "Harry Potter Academy — bolalar va kattalar uchun ingliz, rus, turk, koreys tillari, kimyo va biologiya fanlari bo‘yicha sifatli ta’lim. Sertifikatlar va viza bo‘yicha maslahat.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="uz" className={_lora.variable}>
      <body className={`font-sans antialiased`}>
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  )
}
