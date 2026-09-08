import React from "react";
import { db } from "@/lib/db";

interface ThemeInlineProps {
  children: React.ReactNode;
}

export default async function ThemeInline({ children }: ThemeInlineProps) {
  // Recupera i colori del tema dal database (server-side)
  let siteInfo;
  try {
    siteInfo = await db.siteInfo.findFirst() as any;
  } catch (error) {
    console.warn('Database not available during build, using default theme');
    siteInfo = null;
  }

  const primaryColor = siteInfo?.primaryColor || '#ea580c';
  const primaryForeground = siteInfo?.primaryForeground || '#ffffff';

  // Precarica le immagini critical
  const criticalImages = [
    siteInfo?.heroImageUrl,
    siteInfo?.logoUrl,
    siteInfo?.chiSiamoImageUrl,
  ].filter(Boolean) as string[];

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            :root {
              --primary: ${primaryColor};
              --primary-foreground: ${primaryForeground};
            }
          `,
        }}
      />
      {criticalImages.map((url) => (
        <link
          key={url}
          rel="preload"
          as="image"
          href={url}
        />
      ))}
      {children}
    </>
  );
}