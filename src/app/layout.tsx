import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AnalyticsProvider } from "@/components/AnalyticsProvider";
import CookieBanner from "@/components/CookieBanner";
import ThirdPartyScripts from "@/components/ThirdPartyScripts";
import ThemeInline from "@/components/ThemeInline";
import { db } from "@/lib/db";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  // Recupera le impostazioni SEO dal database
  const siteInfo = await db.siteInfo.findFirst();

  // Valori di default
  const defaultTitle = "Z.ai Code Scaffold - AI-Powered Development";
  const defaultDescription = "Modern Next.js scaffold optimized for AI-powered development with Z.ai. Built with TypeScript, Tailwind CSS, and shadcn/ui.";
  const defaultKeywords = ["Z.ai", "Next.js", "TypeScript", "Tailwind CSS", "shadcn/ui", "AI development", "React"];

  const title = siteInfo?.seoTitle || defaultTitle;
  const description = siteInfo?.seoDescription || defaultDescription;
  const keywords = siteInfo?.seoKeywords ? siteInfo.seoKeywords.split(',').map(k => k.trim()) : defaultKeywords;
  const ogTitle = siteInfo?.seoOgTitle || title;
  const ogDescription = siteInfo?.seoOgDescription || description;
  const ogImage = siteInfo?.seoOgImage || "https://z-cdn.chatglm.cn/z-ai/static/logo.svg";
  const twitterCard = siteInfo?.seoTwitterCard || "summary_large_image";
  const robots = siteInfo?.seoRobots || "index";

  const metadata: Metadata = {
    title,
    description,
    keywords,
    icons: siteInfo?.faviconUrl ? {
      icon: siteInfo.faviconUrl,
      shortcut: siteInfo.faviconUrl,
      apple: siteInfo.faviconUrl,
    } : {
      icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
    },
    robots: robots,
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      images: ogImage ? [{
        url: ogImage,
        width: 1200,
        height: 630,
        alt: title,
      }] : undefined,
      type: "website",
    },
    twitter: {
      card: twitterCard as "summary" | "summary_large_image",
      title: ogTitle,
      description: ogDescription,
      images: ogImage ? [ogImage] : undefined,
    },
  };

  // Aggiungi canonical URL se configurato
  if (siteInfo?.seoCanonical) {
    metadata.alternates = {
      canonical: siteInfo.seoCanonical,
    };
  }

  return metadata;
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeInline>
          <AnalyticsProvider>
            {children}
          </AnalyticsProvider>
        </ThemeInline>
        <ThirdPartyScripts />
        <CookieBanner />
        <Toaster />
      </body>
    </html>
  );
}
