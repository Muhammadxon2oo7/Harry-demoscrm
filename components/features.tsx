import Image from "next/image"

export default function Features() {
  const features = [
    {
      img:'/teacher.png',
      title: "Tajribali Ustozlar",
      description: "Chet elda o'rganib, xalqaro sertifikatga ega ustozlar",
    },
    {
      img:'/certificate.png',
      title: "Sertifikat",
      description: "Kurs yakunida rasmiy sertifikat beriladi",
    },
    {
      img:'/visa.png',
      title: "Viza Yordami",
      description: "Chet elga o'qish uchun viza orishida maslahat",
    },
    {
      img:'/modern-tech.png',
      title: "Zamonaviy Usullar",
      description: "Eng yangi o'quv texnologiyalari va metodlari",
    },
    {
      img:'/goal.png',
      title: "Natijaga Yo'naltirilgan",
      description: "Har bir o'quvchi uchun individual dars rejasi",
    },
    {
      img:'/time.png',
      title: "Qulay Vaqt",
      description: "Ertalab, tushlik va kechqurun gruppalari mavjud",
    },
  ]

  return (
    <section id="features" className="py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-6">Bizning Takliflar</h2>
          <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
            Zamonaviy o'quv markazi bo'lib har bir talaba uchun eng yaxshi sharoitlarni yaratamiz
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <div key={i} className="flex gap-4 group">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-primary-foreground font-bold text-lg group-hover:scale-110 transition-transform duration-300">
                <Image src={feature.img} alt={`Harry Potter Academy xizmati: ${feature.title}`} width={64} height={64} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-foreground/70">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
