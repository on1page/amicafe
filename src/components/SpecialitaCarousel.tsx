'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import Image from 'next/image';

interface Articolo {
  id: string;
  nome: string;
  descrizione: string | null;
  prezzo: number;
  prezzoPromozionale: number | null;
  scadenzaPromo: Date | null;
  eSurgelato: boolean;
  eBestChoice: boolean;
  attivo: boolean;
  immagineUrl: string | null;
  immagineAiGenerata: boolean;
  createdAt: Date;
  updatedAt: Date;
  categoriaId?: string;
}

export default function SpecialitaCarousel() {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [articoli, setArticoli] = useState<Articolo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArticoli();
  }, []);

  const fetchArticoli = async () => {
    try {
      const response = await fetch('/api/articoli');
      if (!response.ok) {
        throw new Error('Errore nel caricamento degli articoli');
      }
      const data = await response.json();
      setArticoli(data);
    } catch (error) {
      console.error('Errore:', error);
    } finally {
      setLoading(false);
    }
  };

  const goToPrevious = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setActiveIndex((prev) => (prev === 0 ? articoli.length - 1 : prev - 1));
    setTimeout(() => setIsAnimating(false), 500);
  };

  const goToNext = () => {
    if (isAnimating || articoli.length === 0) return;
    setIsAnimating(true);
    setActiveIndex((prev) => (prev === articoli.length - 1 ? 0 : prev + 1));
    setTimeout(() => setIsAnimating(false), 500);
  };

  const goToSlide = (index: number) => {
    if (isAnimating || articoli.length === 0) return;
    setIsAnimating(true);
    setActiveIndex(index);
    setTimeout(() => setIsAnimating(false), 500);
  };

  const getItemClass = (index: number) => {
    if (articoli.length === 0) return 'before-all';
    const diff = (index - activeIndex + articoli.length) % articoli.length;

    if (diff === 0) return 'active';
    if (diff === 1 || (activeIndex === articoli.length - 1 && index === 0)) return 'after';
    if (diff === articoli.length - 1) return 'before';
    if (diff === 2 || (activeIndex >= articoli.length - 2 && index <= 1)) return 'after-all';
    return 'before-all';
  };

  const prezzoDaMostrare = (articolo: Articolo) => {
    if (articolo.prezzoPromozionale && articolo.scadenzaPromo) {
      const scadenza = new Date(articolo.scadenzaPromo);
      if (scadenza > new Date()) {
        return articolo.prezzoPromozionale;
      }
    }
    return articolo.prezzo;
  };

  const ePromo = (articolo: Articolo) => {
    return !!(articolo.prezzoPromozionale && articolo.scadenzaPromo && new Date(articolo.scadenzaPromo) > new Date());
  };

  const handleArticoloClick = (articoloId: string) => {
    // La pagina menu usa il parametro URL ?articolo= invece dell'anchor #
    router.push(`/menu?articolo=${articoloId}`);
  };

  return (
    <div id="specialita" className="specialita-carousel w-full max-w-6xl mx-auto py-12 px-4 scroll-mt-20">
      <style jsx>{`
        .carousel-container {
          position: relative;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 500px;
          overflow: hidden;
          perspective: 1000px;
        }

        @media (max-width: 768px) {
          .carousel-container {
            height: 420px;
          }
        }

        @media (max-width: 480px) {
          .carousel-container {
            height: 380px;
          }
        }

        .carousel-content {
          position: relative;
          width: 100%;
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .step-content-item {
          position: absolute;
          width: 320px;
          height: 450px;
          transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
          transform-style: preserve-3d;
        }

        @media (max-width: 768px) {
          .step-content-item {
            width: 260px;
            height: 380px;
          }
        }

        @media (max-width: 480px) {
          .step-content-item {
            width: 220px;
            height: 340px;
          }
        }

        .step-content-item.active {
          z-index: 3;
          transform: translateX(0) scale(1);
          opacity: 1;
        }

        .step-content-item.before {
          z-index: 2;
          transform: translateX(-120%) scale(0.8);
          opacity: 0.7;
          filter: blur(2px);
        }

        .step-content-item.after {
          z-index: 2;
          transform: translateX(120%) scale(0.8);
          opacity: 0.7;
          filter: blur(2px);
        }

        .step-content-item.before-all,
        .step-content-item.after-all {
          z-index: 1;
          transform: translateX(0) scale(0.6);
          opacity: 0;
          filter: blur(4px);
        }

        .card-content {
          width: 100%;
          height: 100%;
          background: white;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
          transition: all 0.5s ease;
          cursor: pointer;
        }

        .card-content:hover {
          transform: translateY(-5px);
        }

        .step-content-item.active .card-content {
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
        }

        .card-image {
          position: relative;
          width: 100%;
          height: 60%;
          overflow: hidden;
        }

        .card-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }

        .step-content-item.active .card-image img {
          transform: scale(1.1);
        }

        .badges {
          position: absolute;
          top: 12px;
          left: 12px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          z-index: 2;
        }

        .badge {
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .badge-best-choice {
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          color: white;
        }

        .badge-promo {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: white;
        }

        .card-info {
          padding: 16px;
          height: 40%;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .card-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 4px;
          line-height: 1.3;
        }

        .card-description {
          font-size: 0.85rem;
          color: #666;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: auto;
        }

        .card-price {
          font-size: 1.5rem;
          font-weight: 800;
          color: #059669;
        }

        .nav-button {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: white;
          border: none;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          z-index: 10;
        }

        .nav-button:hover {
          transform: translateY(-50%) scale(1.1);
          box-shadow: 0 6px 30px rgba(0, 0, 0, 0.2);
        }

        .nav-button:active {
          transform: translateY(-50%) scale(0.95);
        }

        .nav-button-prev {
          left: 20px;
        }

        .nav-button-next {
          right: 20px;
        }

        @media (max-width: 768px) {
          .nav-button-prev {
            left: 10px;
          }

          .nav-button-next {
            right: 10px;
          }

          .nav-button {
            width: 42px;
            height: 42px;
          }
        }

        @media (max-width: 480px) {
          .nav-button-prev {
            left: 5px;
          }

          .nav-button-next {
            right: 5px;
          }

          .nav-button {
            width: 38px;
            height: 38px;
          }
        }

        .indicators {
          display: flex;
          justify-content: center;
          gap: 10px;
          margin-top: 24px;
        }

        .indicator {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #d1d5db;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .indicator:hover {
          background: #9ca3af;
        }

        .indicator.active {
          width: 30px;
          border-radius: 5px;
          background: #059669;
        }

        .carousel-title {
          text-align: center;
          font-size: 2rem;
          font-weight: 800;
          color: #1a1a1a;
          margin-bottom: 8px;
        }

        .carousel-subtitle {
          text-align: center;
          font-size: 1rem;
          color: #666;
          margin-bottom: 32px;
        }

        @media (max-width: 768px) {
          .carousel-title {
            font-size: 1.5rem;
          }

          .carousel-subtitle {
            font-size: 0.9rem;
          }
        }
      `}</style>

      <h2 className="carousel-title">Le Nostre Specialità</h2>
      <p className="carousel-subtitle">Clicca su un piatto per vedere i dettagli nel menu</p>

      {loading ? (
        <div className="carousel-container">
          <div className="flex items-center justify-center">
            <Loader2 className="w-12 h-12 animate-spin text-amber-600" />
          </div>
        </div>
      ) : (
        <>
          <div className="carousel-container">
            <button
              className="nav-button nav-button-prev"
              onClick={goToPrevious}
              aria-label="Precedente"
            >
              <ChevronLeft size={24} />
            </button>

            <div className="carousel-content">
              {articoli.map((articolo, index) => (
                <div
                  key={articolo.id}
                  className={`step-content-item ${getItemClass(index)}`}
                  onClick={() => handleArticoloClick(articolo.id)}
                >
                  <div className="card-content">
                    <div className="card-image">
                      {articolo.eBestChoice && (
                        <div className="badges">
                          <span className="badge badge-best-choice">Best Choice</span>
                        </div>
                      )}
                      {ePromo(articolo) && (
                        <div className="badges">
                          <span className="badge badge-promo">Promo</span>
                        </div>
                      )}
                      <Image
                        src={articolo.immagineUrl || 'https://images.unsplash.com/photo-1544025162-d76690b67f01?w=800&h=600&fit=crop'}
                        alt={articolo.nome}
                        fill
                        sizes="(max-width: 768px) 260px, 320px"
                        priority={index === activeIndex}
                      />
                    </div>
                    <div className="card-info">
                      <div>
                        <h3 className="card-title">{articolo.nome}</h3>
                        <p className="card-description">{articolo.descrizione}</p>
                      </div>
                      <div className="card-footer">
                        <span className="card-price">€{prezzoDaMostrare(articolo).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              className="nav-button nav-button-next"
              onClick={goToNext}
              aria-label="Successivo"
            >
              <ChevronRight size={24} />
            </button>
          </div>

          <div className="indicators">
            {articoli.map((_, index) => (
              <button
                key={index}
                className={`indicator ${index === activeIndex ? 'active' : ''}`}
                onClick={() => goToSlide(index)}
                aria-label={`Vai alla slide ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}