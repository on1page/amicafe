import { MetadataRoute } from 'next'
import { db } from '@/lib/db'

// Frequenza di aggiornamento per ogni tipo di pagina
const CHANGE_FREQUENCIES: Record<string, 'daily' | 'weekly' | 'monthly' | 'yearly'> = {
  '/': 'weekly',
  '/menu': 'daily',
  '/cookie-policy': 'monthly',
  '/privacy-policy': 'monthly',
}

// Priorità per ogni pagina (0.0 - 1.0)
const PRIORITIES: Record<string, number> = {
  '/': 1.0,
  '/menu': 0.9,
  '/cookie-policy': 0.3,
  '/privacy-policy': 0.3,
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Recupera l'URL di base dal database
  let siteInfo
  try {
    siteInfo = await db.siteInfo.findFirst({
      select: {
        seoCanonical: true,
        updatedAt: true,
      },
    })
  } catch (error) {
    console.warn('Database not available during build, using fallback values for sitemap')
    siteInfo = null
  }

  // Usa l'URL canonico configurato o fallback su localhost
  const baseUrl = siteInfo?.seoCanonical
    ? siteInfo.seoCanonical.replace(/\/$/, '')
    : 'https://localhost:3000'

  // Recupera la data di aggiornamento più recente
  const lastModified = siteInfo?.updatedAt || new Date()

  // Definisci le pagine statiche del sito
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: lastModified,
      changeFrequency: CHANGE_FREQUENCIES['/'],
      priority: PRIORITIES['/'],
    },
    {
      url: `${baseUrl}/menu`,
      lastModified: lastModified,
      changeFrequency: CHANGE_FREQUENCIES['/menu'],
      priority: PRIORITIES['/menu'],
    },
    {
      url: `${baseUrl}/cookie-policy`,
      lastModified: lastModified,
      changeFrequency: CHANGE_FREQUENCIES['/cookie-policy'],
      priority: PRIORITIES['/cookie-policy'],
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: lastModified,
      changeFrequency: CHANGE_FREQUENCIES['/privacy-policy'],
      priority: PRIORITIES['/privacy-policy'],
    },
  ]

  return staticPages
}