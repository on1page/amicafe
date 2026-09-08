'use client'

import { ThemeProvider } from './ThemeProvider'
import { ReactNode, useEffect, useState } from 'react'

interface ThemeWrapperProps {
  children: ReactNode
  primaryColor: string
}

export default function ThemeWrapper({ children, primaryColor: initialColor }: ThemeWrapperProps) {
  const [primaryColor, setPrimaryColor] = useState(initialColor)

  useEffect(() => {
    // Recupera il colore attuale dal database
    async function fetchCurrentColor() {
      try {
        console.log('🎨 ThemeWrapper: recupero colore dal database...')
        const response = await fetch('/api/admin/site-info')
        if (response.ok) {
          const siteInfo = await response.json()
          if (siteInfo.primaryColor) {
            console.log('🎨 ThemeWrapper: colore recuperato dal database:', siteInfo.primaryColor)
            setPrimaryColor(siteInfo.primaryColor)
          } else {
            console.log('🎨 ThemeWrapper: primaryColor non trovato nel database, uso default:', initialColor)
          }
        }
      } catch (error) {
        console.error('🎨 Errore nel recupero del colore:', error)
      }
    }

    fetchCurrentColor()
  }, [])

  return (
    <ThemeProvider initialColor={primaryColor}>
      {children}
    </ThemeProvider>
  )
}
