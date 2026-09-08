'use client'

import { useEffect, useState } from 'react'
import SimpleLoading from './SimpleLoading'

interface ThemeColors {
  primaryColor: string
  primaryForeground: string
}

interface ThemeProviderProps {
  children: React.ReactNode
}

export default function ThemeProvider({ children }: ThemeProviderProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [theme, setTheme] = useState<ThemeColors>({
    primaryColor: '#ea580c',
    primaryForeground: '#ffffff'
  })

  useEffect(() => {
    async function loadTheme() {
      try {
        const response = await fetch('/api/admin/site-info')
        if (response.ok) {
          const data = await response.json()
          setTheme({
            primaryColor: data.primaryColor || '#ea580c',
            primaryForeground: data.primaryForeground || '#ffffff'
          })
        }
      } catch (error) {
        console.error('Errore nel caricamento del tema:', error)
      } finally {
        // Aggiungi un piccolo delay per evitare il flash
        setTimeout(() => {
          setIsLoading(false)
        }, 500)
      }
    }

    loadTheme()
  }, [])

  // Imposta le variabili CSS
  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--primary', theme.primaryColor)
    root.style.setProperty('--primary-foreground', theme.primaryForeground)
  }, [theme])

  if (isLoading) {
    return <SimpleLoading />
  }

  return <>{children}</>
}
