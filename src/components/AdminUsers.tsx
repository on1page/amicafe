'use client'

import { useState, useEffect } from 'react'
import { Save, Plus, Trash2, Pencil, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

interface Permission {
  id: string
  puoGestireMenu: boolean
  puoGestireFooter: boolean
  puoGestireTemi: boolean
  puoGestirePrenotazioni: boolean
  puoGestireDatiAzienda: boolean
  puoGestireProfili: boolean
  puoGestireAnalytics: boolean
  puoGestireSito: boolean
}

interface User {
  id: string
  email: string
  nome: string
  cognome?: string | null
  ruolo: string
  permessi?: Permission | null
  createdAt: string
}

interface CurrentUser {
  id: string
  email: string
  ruolo: string
}

interface AdminUsersProps {
  currentUser?: CurrentUser | null
}

export default function AdminUsers({ currentUser }: AdminUsersProps = {}) {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  // User form
  const [userForm, setUserForm] = useState({
    id: '',
    email: '',
    nome: '',
    cognome: '',
    password: '',
    ruolo: 'admin',
    permessi: {
      puoGestireMenu: true,
      puoGestireFooter: true,
      puoGestireTemi: true,
      puoGestirePrenotazioni: true,
      puoGestireDatiAzienda: true,
      puoGestireProfili: false,
      puoGestireAnalytics: false,
      puoGestireSito: true
    }
  })
  const [showUserDialog, setShowUserDialog] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  async function fetchUsers() {
    setLoading(true)
    try {
      const response = await fetch('/admin/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      }
    } catch (error) {
      console.error('Errore nel recupero utenti:', error)
    } finally {
      setLoading(false)
    }
  }

  async function saveUser() {
    const url = userForm.id
      ? `/admin/users/${userForm.id}`
      : '/admin/users'
    const method = userForm.id ? 'PUT' : 'POST'

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userForm)
      })

      if (response.ok) {
        setShowUserDialog(false)
        resetUserForm()
        fetchUsers()
        alert('Utente salvato con successo!')
      } else {
        const errorData = await response.json()
        alert(`Errore nel salvataggio dell'utente:\n\n${errorData.error || 'Errore sconosciuto'}\n\n${errorData.details || ''}`)
      }
    } catch (error) {
      console.error('Errore salvataggio utente:', error)
      alert('Errore di connessione. Riprova.')
    }
  }

  async function deleteUser(id: string) {
    if (!confirm('Sei sicuro di voler eliminare questo utente? Questa azione è irreversibile.')) return

    try {
      const response = await fetch(`/admin/users/${id}`, { method: 'DELETE' })
      if (response.ok) {
        fetchUsers()
        alert('Utente eliminato con successo!')
      } else {
        alert('Errore nell\'eliminazione dell\'utente')
      }
    } catch (error) {
      console.error('Errore eliminazione utente:', error)
      alert('Errore nell\'eliminazione dell\'utente')
    }
  }

  function editUser(user: User) {
    setUserForm({
      id: user.id,
      email: user.email,
      nome: user.nome,
      cognome: user.cognome || '',
      password: '',
      ruolo: user.ruolo,
      permessi: user.permessi || {
        puoGestireMenu: true,
        puoGestireFooter: true,
        puoGestireTemi: true,
        puoGestirePrenotazioni: true,
        puoGestireDatiAzienda: true,
        puoGestireProfili: false,
        puoGestireAnalytics: false,
        puoGestireSito: true
      }
    })
    setShowUserDialog(true)
  }

  function resetUserForm() {
    setUserForm({
      id: '',
      email: '',
      nome: '',
      cognome: '',
      password: '',
      ruolo: 'admin',
      permessi: {
        puoGestireMenu: true,
        puoGestireFooter: true,
        puoGestireTemi: true,
        puoGestirePrenotazioni: true,
        puoGestireDatiAzienda: true,
        puoGestireProfili: false,
        puoGestireAnalytics: false,
        puoGestireSito: true
      }
    })
  }

  if (loading) {
    return <div className="text-center py-8">Caricamento...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Shield className="w-6 h-6" />
          Gestione Profili e Permessi
        </h2>
        {currentUser?.ruolo === 'superadmin' && (
          <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
            <DialogTrigger asChild>
              <Button onClick={resetUserForm}>
                <Plus className="w-4 h-4 mr-2" />
                Nuovo Utente
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {userForm.id ? 'Modifica Utente' : 'Nuovo Utente'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Nome *</Label>
                    <Input
                      value={userForm.nome}
                      onChange={(e) => setUserForm({ ...userForm, nome: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Cognome</Label>
                    <Input
                      value={userForm.cognome}
                      onChange={(e) => setUserForm({ ...userForm, cognome: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    value={userForm.email}
                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Password {userForm.id ? '(lascia vuoto per non cambiare)' : '*'}</Label>
                  <Input
                    type="password"
                    value={userForm.password}
                    onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                  />
                </div>
                {currentUser?.ruolo === 'superadmin' && (
                  <div>
                    <Label>Ruolo</Label>
                    <select
                      className="w-full p-2 border rounded"
                      value={userForm.ruolo}
                      onChange={(e) => setUserForm({ ...userForm, ruolo: e.target.value })}
                    >
                      <option value="admin">Admin</option>
                      <option value="superadmin">Super Admin</option>
                    </select>
                  </div>
                )}

                {currentUser?.ruolo === 'superadmin' && (
                  <div className="border-t pt-4">
                    <Label className="text-base font-semibold mb-3 block">Permessi</Label>
                    <div className="space-y-3">
                      <label className="flex items-center gap-3 p-3 border rounded hover:bg-gray-50 cursor-pointer">
                        <Checkbox
                          checked={userForm.permessi.puoGestireMenu}
                          onCheckedChange={(checked) =>
                            setUserForm({
                              ...userForm,
                              permessi: { ...userForm.permessi, puoGestireMenu: checked as boolean }
                            })
                          }
                        />
                        <div>
                          <div className="font-medium">Gestione Menu</div>
                          <div className="text-sm text-gray-500">Può creare, modificare ed eliminare categorie e articoli</div>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 p-3 border rounded hover:bg-gray-50 cursor-pointer">
                        <Checkbox
                          checked={userForm.permessi.puoGestireFooter}
                          onCheckedChange={(checked) =>
                            setUserForm({
                              ...userForm,
                              permessi: { ...userForm.permessi, puoGestireFooter: checked as boolean }
                            })
                          }
                        />
                        <div>
                          <div className="font-medium">Gestione Footer</div>
                          <div className="text-sm text-gray-500">Può modificare indirizzo, orari, social e delivery</div>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 p-3 border rounded hover:bg-gray-50 cursor-pointer">
                        <Checkbox
                          checked={userForm.permessi.puoGestireTemi}
                          onCheckedChange={(checked) =>
                            setUserForm({
                              ...userForm,
                              permessi: { ...userForm.permessi, puoGestireTemi: checked as boolean }
                            })
                          }
                        />
                        <div>
                          <div className="font-medium">Gestione Temi & Immagini</div>
                          <div className="text-sm text-gray-500">Può modificare nome, testi, logo e immagini del sito</div>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 p-3 border rounded hover:bg-gray-50 cursor-pointer">
                        <Checkbox
                          checked={userForm.permessi.puoGestirePrenotazioni}
                          onCheckedChange={(checked) =>
                            setUserForm({
                              ...userForm,
                              permessi: { ...userForm.permessi, puoGestirePrenotazioni: checked as boolean }
                            })
                          }
                        />
                        <div>
                          <div className="font-medium">Gestione Prenotazioni</div>
                          <div className="text-sm text-gray-500">Può visualizzare, confermare e cancellare prenotazioni tavoli</div>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 p-3 border rounded hover:bg-gray-50 cursor-pointer">
                        <Checkbox
                          checked={userForm.permessi.puoGestireDatiAzienda}
                          onCheckedChange={(checked) =>
                            setUserForm({
                              ...userForm,
                              permessi: { ...userForm.permessi, puoGestireDatiAzienda: checked as boolean }
                            })
                          }
                        />
                        <div>
                          <div className="font-medium">Gestione Dati Azienda</div>
                          <div className="text-sm text-gray-500">Può modificare ragione sociale, P.IVA e policy aziendali</div>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 p-3 border rounded hover:bg-gray-50 cursor-pointer">
                        <Checkbox
                          checked={userForm.permessi.puoGestireProfili}
                          onCheckedChange={(checked) =>
                            setUserForm({
                              ...userForm,
                              permessi: { ...userForm.permessi, puoGestireProfili: checked as boolean }
                            })
                          }
                        />
                        <div>
                          <div className="font-medium">Gestione Profili</div>
                          <div className="text-sm text-gray-500">Può creare, modificare ed eliminare utenti e permessi</div>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 p-3 border rounded hover:bg-gray-50 cursor-pointer">
                        <Checkbox
                          checked={userForm.permessi.puoGestireAnalytics}
                          onCheckedChange={(checked) =>
                            setUserForm({
                              ...userForm,
                              permessi: { ...userForm.permessi, puoGestireAnalytics: checked as boolean }
                            })
                          }
                        />
                        <div>
                          <div className="font-medium">Gestione Analytics</div>
                          <div className="text-sm text-gray-500">Può visualizzare le statistiche di utilizzo del sito</div>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 p-3 border rounded hover:bg-gray-50 cursor-pointer">
                        <Checkbox
                          checked={userForm.permessi.puoGestireSito}
                          onCheckedChange={(checked) =>
                            setUserForm({
                              ...userForm,
                              permessi: { ...userForm.permessi, puoGestireSito: checked as boolean }
                            })
                          }
                        />
                        <div>
                          <div className="font-medium">Gestione Sito</div>
                          <div className="text-sm text-gray-500">Può modificare le impostazioni del sito, SEO e meta tag</div>
                        </div>
                      </label>
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-4">
                  <Button onClick={saveUser}>
                    <Save className="w-4 h-4 mr-2" />
                    Salva Utente
                  </Button>
                  <Button variant="outline" onClick={() => setShowUserDialog(false)}>
                    Annulla
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Utente</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Ruolo</TableHead>
              <TableHead>Permessi</TableHead>
              <TableHead>Creato il</TableHead>
              <TableHead>Azioni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{user.nome} {user.cognome || ''}</div>
                  </div>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge variant={user.ruolo === 'superadmin' ? 'default' : 'secondary'}>
                    {user.ruolo === 'superadmin' ? 'Super Admin' : 'Admin'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {user.permessi?.puoGestireMenu && <Badge variant="outline" className="text-xs">Menu</Badge>}
                    {user.permessi?.puoGestireFooter && <Badge variant="outline" className="text-xs">Footer</Badge>}
                    {user.permessi?.puoGestireTemi && <Badge variant="outline" className="text-xs">Temi</Badge>}
                    {user.permessi?.puoGestirePrenotazioni && <Badge variant="outline" className="text-xs">Prenotazioni</Badge>}
                    {user.permessi?.puoGestireDatiAzienda && <Badge variant="outline" className="text-xs">Dati Azienda</Badge>}
                    {user.permessi?.puoGestireProfili && <Badge variant="outline" className="text-xs">Profili</Badge>}
                    {user.permessi?.puoGestireAnalytics && <Badge variant="outline" className="text-xs">Analytics</Badge>}
                    {user.permessi?.puoGestireSito && <Badge variant="outline" className="text-xs">Sito</Badge>}
                  </div>
                </TableCell>
                <TableCell>
                  {new Date(user.createdAt).toLocaleDateString('it-IT')}
                </TableCell>
                <TableCell>
                  {currentUser?.ruolo === 'superadmin' && (
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" onClick={() => editUser(user)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => deleteUser(user.id)}>
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <h3 className="font-semibold text-orange-900 mb-2">📋 Informazioni sui Permessi</h3>
        <ul className="text-sm text-orange-800 space-y-1">
          <li>• <strong>Super Admin:</strong> Ha accesso completo a tutte le funzionalità, indipendentemente dai permessi</li>
          <li>• <strong>Admin:</strong> I permessi sono definiti dalle checkbox nella scheda utente</li>
          <li>• Revocando un permesso, l'utente non potrà più accedere alla relativa sezione dell'admin</li>
          <li>• È possibile creare più admin con permessi diversi per distribuire le responsabilità</li>
        </ul>
      </div>
    </div>
  )
}
