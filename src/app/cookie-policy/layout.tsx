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
    title: "Cookie Policy | " + (siteInfo?.nomeLocale || "Ristorante"),
    description: "Informativa sull'utilizzo dei cookie nel nostro sito web. Scopri come utilizziamo i cookie tecnici, analitici e di marketing.",
    keywords: ["cookie policy", "privacy", "cookie", "gdpr", "informatica", "tracciamento"],
    openGraph: {
      title: "Cookie Policy | " + (siteInfo?.nomeLocale || "Ristorante"),
      description: "La nostra politica sull'utilizzo dei cookie",
      url: `${baseUrl}/cookie-policy`,
      type: "website",
    },
    twitter: {
      card: "summary",
      title: "Cookie Policy",
    },
    alternates: {
      canonical: `${baseUrl}/cookie-policy`,
    },
    robots: "index, follow",
  };
}

export default function CookiePolicyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}