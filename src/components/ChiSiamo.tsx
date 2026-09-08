'use client'

interface ChiSiamoProps {
  title?: string
  content?: string
  image?: string
}

export default function ChiSiamo({
  title = "Chi Siamo",
  content = "Dal 1985, portiamo in tavola l'autentica tradizione culinaria italiana. La nostra passione per la cucina e l'amore per gli ingredienti freschi e di qualità si riflette in ogni piatto che prepariamo. Ogni giorno, il nostro chef seleziona personalmente i migliori prodotti locali per creare piatti che raccontano storie di gusto e tradizione.",
  image = "/images/chef.jpg"
}: ChiSiamoProps) {
  return (
    <section id="chi-siamo" className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Image */}
          <div className="relative">
            <img
              src={image}
              alt={title}
              className="w-full h-64 md:h-96 object-cover rounded-2xl shadow-2xl"
            />
            {/* STATISTICHE OVERLAY IMMAGINE (Commentato - rimuovere i commenti per riattivare)
            <div className="absolute -bottom-6 -right-6 bg-orange-600 text-white p-6 rounded-xl hidden md:block">
              <div className="text-4xl font-bold">10+</div>
              <div className="text-sm">Anni di Tradizione</div>
            </div>
            */}
          </div>

          {/* Content */}
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              {title}
            </h2>
            <p className="text-gray-700 text-lg leading-relaxed">
              {content}
            </p>

            {/* STATISTICHE (Commentato - rimuovere i commenti per riattivare)
            <div className="grid grid-cols-3 gap-4 mt-8">
              <div className="text-center p-4 bg-orange-50 rounded-xl">
                <div className="text-2xl md:text-3xl font-bold text-orange-600 mb-1">20</div>
                <div className="text-xs md:text-sm text-gray-600">Piatti Unici</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-xl">
                <div className="text-2xl md:text-3xl font-bold text-orange-600 mb-1">100%</div>
                <div className="text-xs md:text-sm text-gray-600">Clienti Soddisfatti</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-xl">
                <div className="text-2xl md:text-3xl font-bold text-orange-600 mb-1">3</div>
                <div className="text-xs md:text-sm text-gray-600">Chef Esperti</div>
              </div>
            </div>
            */}
          </div>
        </div>
      </div>
    </section>
  )
}
