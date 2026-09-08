'use client'

import { useState, useEffect } from 'react'
import { X, Utensils, MapPin, ImageIcon, Users, Building2, Calendar, BarChart3, LogOut, Menu as MenuIcon, Globe, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import AdminMenu from './AdminMenu'
import AdminFooter from './AdminFooter'
import AdminTheme from './AdminTheme'
import AdminUsers from './AdminUsers'
import AdminCompanyData from './AdminCompanyData'
import AdminReservations from './AdminReservations'
import AdminAnalytics from './AdminAnalytics'
import AdminSiteInfo from './AdminSiteInfo'
import AdminEventi from './AdminEventi'

interface AdminPanelProps {
  onClose: () => void
}

interface Permission {
  puoGestireMenu: boolean
  puoGestireFooter: boolean
  puoGestireTemi: boolean
  puoGestirePrenotazioni: boolean
  puoGestireDatiAzienda: boolean
  puoGestireProfili: boolean
  puoGestireAnalytics: boolean
  puoGestireSito: boolean
  puoGestireEventi: boolean
}

interface CurrentUser {
  id: string
  email: string
  nome: string
  cognome?: string | null
  ruolo: string
  permessi?: Permission | null
}

interface MenuItem {
  id: string
  label: string
  icon: React.ElementType
  permission: keyof Permission
}

const menuItems: MenuItem[] = [
  { id: 'menu', label: 'Menu', icon: Utensils, permission: 'puoGestireMenu' },
  { id: 'footer', label: 'Footer', icon: MapPin, permission: 'puoGestireFooter' },
  { id: 'theme', label: 'Temi', icon: ImageIcon, permission: 'puoGestireTemi' },
  { id: 'site', label: 'Sito', icon: Globe, permission: 'puoGestireSito' },
  { id: 'events', label: 'Eventi', icon: Sparkles, permission: 'puoGestireEventi' },
  { id: 'company', label: 'Dati Azienda', icon: Building2, permission: 'puoGestireDatiAzienda' },
  { id: 'reservations', label: 'Prenotazioni', icon: Calendar, permission: 'puoGestirePrenotazioni' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, permission: 'puoGestireAnalytics' },
  { id: 'users', label: 'Profili', icon: Users, permission: 'puoGestireProfili' },
]

export default function AdminPanel({ onClose }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState('menu')
  const [pendingCount, setPendingCount] = useState(0)
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    async function fetchUserData() {
      try {
        const token = localStorage.getItem('adminToken')
        if (!token) return

        const response = await fetch('/api/admin/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (response.ok) {
          const userData = await response.json()
          setCurrentUser(userData)
        }
      } catch (error) {
        console.error('Errore nel recupero dati utente:', error)
      }
    }

    async function fetchPendingCount() {
      try {
        const response = await fetch('/api/admin/reservations?stato=pending')
        if (response.ok) {
          const data = await response.json()
          setPendingCount(data.length)
        }
      } catch (error) {
        console.error('Errore nel recupero conteggio prenotazioni:', error)
      }
    }

    fetchUserData()
    fetchPendingCount()
  }, [])

  // Funzione helper per verificare se l'utente può vedere una sezione
  const canAccess = (permission: keyof Permission): boolean => {
    if (!currentUser) return false
    if (currentUser.ruolo === 'superadmin') return true
    return currentUser.permessi?.[permission] ?? false
  }

  // Filtra i menu in base ai permessi
  const visibleMenus = menuItems.filter(item => canAccess(item.permission))

  // Trova il primo menu visibile come default
  useEffect(() => {
    if (visibleMenus.length > 0 && !visibleMenus.find(m => m.id === activeTab)) {
      setActiveTab(visibleMenus[0].id) // eslint-disable-line react-hooks/set-state-in-effect
    }
  }, [visibleMenus.length]) // Usiamo solo la lunghezza per evitare loop infiniti quando cambia activeTab

  // Funzione per il logout
  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminUser')
    onClose()
    window.location.reload()
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'menu':
        return <AdminMenu />
      case 'footer':
        return <AdminFooter />
      case 'theme':
        return <AdminTheme />
      case 'site':
        return <AdminSiteInfo />
      case 'events':
        return <AdminEventi />
      case 'company':
        return <AdminCompanyData />
      case 'reservations':
        return <AdminReservations />
      case 'analytics':
        return <AdminAnalytics />
      case 'users':
        return <AdminUsers currentUser={currentUser} />
      default:
        return null
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header Mobile */}
        <div className="lg:hidden bg-gray-900 text-white px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <MenuIcon className="w-6 h-6" onClick={() => setSidebarOpen(!sidebarOpen)} />
            Admin Panel
          </h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white hover:bg-gray-800"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div
            className={cn(
              "bg-gray-900 text-white flex flex-col transition-all duration-300",
              sidebarOpen ? "w-64" : "w-0",
              "hidden lg:flex"
            )}
          >
            {/* Sidebar Header - Desktop */}
            <div className="p-6 border-b border-gray-800 hidden lg:block">
              <h1 className="text-xl font-bold">Admin Panel</h1>
              {currentUser && currentUser.ruolo !== 'superadmin' && (
                <p className="text-sm text-gray-400 mt-1">{currentUser.nome}</p>
              )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto p-4 space-y-2">
              {visibleMenus.map((item) => {
                const Icon = item.icon
                const isActive = activeTab === item.id

                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                      "hover:bg-gray-800 hover:text-white",
                      isActive
                        ? "bg-white text-gray-900 font-medium shadow-lg"
                        : "text-gray-300"
                    )}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.id === 'reservations' && pendingCount > 0 && (
                      <Badge
                        variant="destructive"
                        className="!min-w-[20px] !h-[20px] !px-1.5 !py-0 !text-[10px] !rounded-full !flex !items-center !justify-center !border-2 !border-white/20"
                      >
                        {pendingCount}
                      </Badge>
                    )}
                  </button>
                )
              })}
            </nav>

            {/* Footer Sidebar */}
            <div className="p-4 border-t border-gray-800">
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800"
              >
                <LogOut className="w-5 h-5 mr-3" />
                Logout
              </Button>
              <button
                onClick={onClose}
                className="w-full mt-2 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors flex items-center gap-3"
              >
                <X className="w-5 h-5 flex-shrink-0" />
                Chiudi
              </button>
            </div>
          </div>

          {/* Mobile Sidebar */}
          {sidebarOpen && (
            <div className="lg:hidden fixed inset-0 z-50 bg-gray-900 text-white flex flex-col">
              <div className="p-6 border-b border-gray-800 flex justify-between items-center">
                <h1 className="text-xl font-bold">Menu</h1>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarOpen(false)}
                  className="text-white hover:bg-gray-800"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <nav className="flex-1 overflow-y-auto p-4 space-y-2">
                {visibleMenus.map((item) => {
                  const Icon = item.icon
                  const isActive = activeTab === item.id

                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id)
                        setSidebarOpen(false)
                      }}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                        "hover:bg-gray-800 hover:text-white",
                        isActive
                          ? "bg-white text-gray-900 font-medium shadow-lg"
                          : "text-gray-300"
                      )}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <span className="flex-1 text-left">{item.label}</span>
                      {item.id === 'reservations' && pendingCount > 0 && (
                        <Badge
                          variant="destructive"
                          className="!min-w-[20px] !h-[20px] !px-1.5 !py-0 !text-[10px] !rounded-full !flex !items-center !justify-center !border-2 !border-white/20"
                        >
                          {pendingCount}
                        </Badge>
                      )}
                    </button>
                  )
                })}
              </nav>

              <div className="p-4 border-t border-gray-800">
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800"
                >
                  <LogOut className="w-5 h-5 mr-3" />
                  Logout
                </Button>
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
            {/* Header Desktop */}
            <div className="hidden lg:flex bg-white border-b px-6 py-4 justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {visibleMenus.find(m => m.id === activeTab)?.label || 'Admin'}
                </h2>
                {currentUser && (
                  <p className="text-sm text-gray-500 mt-1">
                    {currentUser.nome} {currentUser.cognome || ''} • {currentUser.ruolo === 'superadmin' ? 'Super Admin' : 'Admin'}
                  </p>
                )}
              </div>
              <Button variant="outline" onClick={onClose}>
                Chiudi
              </Button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
