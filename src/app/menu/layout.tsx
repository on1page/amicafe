import type { Metadata } from "next";
import { db } from "@/lib/db";

export async function generateMetadata(): Promise<Metadata> {
  let siteInfo;
  try {
    siteInfo = await db.siteInfo.findFirst();
  } catch (error) {
    console.warn('Database not available during build, using default metadata');
    siteInfo = null;
  }

  const baseUrl = siteInfo?.seoCanonical || process.env.NEXT_PUBLIC_SITE_URL || 'https://localhost:3000';

  return {
    title: "Il Nostro Menu | " + (siteInfo?.nomeLocale || "Ristorante"),
    description: "Scopri il nostro menù con piatti tradizionali della cucina italiana, preparati con ingredienti freschi e di qualità. Antipasti, primi, secondi, dolci e specialità.",
    keywords: ["menu", "piatti", "cucina italiana", "antipasti", "primi", "secondi", "dolci", "specialità", "ristorante"],
    openGraph: {
      title: "Il Nostro Menu | " + (siteInfo?.nomeLocale || "Ristorante"),
      description: "Esplora il nostro menù con i piatti più amati della tradizione italiana",
      url: `${baseUrl}/menu`,
      images: siteInfo?.heroImageUrl ? [{
        url: siteInfo.heroImageUrl,
        width: 1200,
        height: 630,
        alt: "Menu del ristorante",
      }] : undefined,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "Il Nostro Menu | " + (siteInfo?.nomeLocale || "Ristorante"),
      description: "Scopri i nostri piatti della cucina italiana",
    },
    alternates: {
      canonical: `${baseUrl}/menu`,
    },
  };
}

export default function MenuLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}