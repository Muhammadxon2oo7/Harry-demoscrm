'use client'

import { useState, useEffect } from 'react'

export default function Location() {
  const [isMapLoaded, setIsMapLoaded] = useState(false)

  useEffect(() => {
    setIsMapLoaded(true)
  }, [])

  return (
    <section className="py-20 px-6 bg-gradient-to-b from-background to-secondary/30">
      <div className="max-w-7xl px-6 mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-6">Bizning Manzilimiz</h2>
          <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
            Buxoro shaharida joylashgan o'quv markazimizga tashrif buyuring
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Map Container */}
          <div className={`relative overflow-hidden rounded-2xl shadow-2xl transform transition-all duration-1000 h-full ${
            isMapLoaded ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
          }`}>
            <div className="relative w-full h-96 md:h-full min-h-96">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d583.6752082046929!2d64.42730173182073!3d39.767027931198136!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMznCsDQ2JzAyLjIiTiA2NMKwMjUnMzkuMyJF!5e0!3m2!1sru!2s!4v1768719554119!5m2!1sru!2s"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0"
              />
            </div>
            <div className="absolute top-4 right-4 bg-white/90 px-4 py-2 rounded-lg shadow-lg backdrop-blur-sm">
              <p className="text-sm font-semibold text-foreground">📍 Buxoro</p>
            </div>
          </div>

          {/* Address & Details */}
          <div className="space-y-8">
            {/* Address Card */}
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-8 rounded-2xl border border-primary/20 backdrop-blur-sm hover:border-primary/40 transition-all duration-300">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">📍</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-3">Bizning Manzilimiz</h3>
                  <p className="text-foreground/80 leading-relaxed text-lg font-medium">
                    Buxoro shahar, Eski Sum
                  </p>
                  <p className="text-foreground/70 leading-relaxed mt-2">
                    Ziraat bankdan o'tib PIPLS ni yonida
                  </p>
                  <p className="text-primary font-bold text-lg mt-3">
                    "HARRY POTTER" o'quv markazi (podvalda)
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Card */}
            <div className="bg-gradient-to-br from-accent/100 to-accent/10 p-8 rounded-2xl border border-accent/20 backdrop-blur-sm hover:border-accent/40 transition-all duration-300">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">📞</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-2">Bizga Qo'ng'iroq Qiling</h3>
                  <p className="text-foreground/70 mb-3">Har kuni 09:00 dan 18:00 gacha</p>
                  <a
                    href="tel:+998972393332"
                    className="text-2xl font-bold text-primary hover:text-primary/80 transition-colors"
                  >
                    +998 97 239 33 32
                  </a>
                </div>
              </div>
            </div>

            {/* Visit Card */}
            <div className="bg-gradient-to-br from-emerald-400 to-emerald-600 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="space-y-4 text-white">
                <h3 className="text-xl font-bold">Bizga qo'shiling !</h3>
                <p className="text-white/90 leading-relaxed">
                  Bizning markazni ziyorat qiling va zamonavoy ta'lim tizimini o'z ko'zingiz bilan ko'ring.
                </p>
                <button  className="w-full bg-white/20 hover:bg-white/30 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 border border-white/30">
                   <a href="https://www.google.com/maps?q=39.767265,64.427592" target="_blank" rel="noopener noreferrer">
                   Joyni Ko'rish
                    </a> 
                </button>
              </div>
            </div>
          </div>
        </div>

       
      </div>
    </section>
  )
}
