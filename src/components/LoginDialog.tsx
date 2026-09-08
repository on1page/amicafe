'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface LoginDialogProps {
  onClose: () => void
  onLoginSuccess: () => void
}

export default function LoginDialog({ onClose, onLoginSuccess }: LoginDialogProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (response.ok) {
        localStorage.setItem('adminToken', data.token)
        localStorage.setItem('adminUser', JSON.stringify(data.user))
        onLoginSuccess()
      } else {
        setError(data.error || 'Login fallito')
        if (data.details) {
          console.error('Error details:', data.details)
          setError(`${data.error}: ${data.details}`)
        }
      }
    } catch (error) {
      console.error('Errore login:', error)
      setError('Errore di connessione. Verifica che il server sia attivo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Login Admin</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-gray-600 hover:text-gray-900"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <Label htmlFor="Email">Utente</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="username"
              required
            />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? 'Login in corso...' : 'Accedi'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Annulla
            </Button>
          </div>
        </form>

        <p className="text-sm text-gray-500 mt-4 text-center">
          
        </p>
      </div>
    </div>
  )
}
