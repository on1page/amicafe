'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, Settings, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ReservationDialog from './ReservationDialog'

interface HeaderProps {
  siteName: string
  logoUrl?: string
  onAdminClick?: () => void
  isLoggedIn?: boolean
  onLogout?: () => void
  prenotazioniAttive?: boolean
}

export default function Header({ siteName, logoUrl, onAdminClick, isLoggedIn, onLogout, prenotazioniAttive = true }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showReservationDialog, setShowReservationDialog] = useState(false)

  const menuItems = [
    { name: 'Home', href: '#home' },
    { name: 'Chi Siamo', href: '#chi-siamo' },
    { name: 'Menu', href: '/menu' },
    { name: 'Eventi', href: '#eventi' },
    { name: 'Specialità', href: '#specialita' },
    { name: 'Contatti', href: '#contatti' }
  ]

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            {logoUrl ? (
              <img src={logoUrl} alt={siteName} className="h-10 md:h-12 w-auto" />
            ) : (
              <div className="h-10 md:h-12 w-10 md:w-12 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xl">{siteName[0]}</span>
              </div>
            )}
            <span className="text-lg md:text-xl font-bold text-gray-900">
              {siteName}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-gray-700 hover:text-primary transition-colors font-medium"
              >
                {item.name}
              </Link>
            ))}
            {prenotazioniAttive && (
              <Button
                className="bg-primary hover:bg-primary/90"
                onClick={() => setShowReservationDialog(true)}
              >
                Prenota Tavolo
              </Button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              className="p-2 rounded-lg hover:bg-gray-100"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-3">
              {menuItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-gray-700 hover:text-primary transition-colors font-medium py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              {prenotazioniAttive && (
                <Button
                  className="bg-primary hover:bg-primary/90 w-full mt-2"
                  onClick={() => setShowReservationDialog(true)}
                >
                  Prenota Tavolo
                </Button>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Reservation Dialog */}
      {showReservationDialog && (
        <ReservationDialog onClose={() => setShowReservationDialog(false)} />
      )}
    </header>
  )
}