'use client'

import { useState, useEffect } from 'react'
import {
  Users,
  Eye,
  TrendingUp,
  ArrowUp,
  Minus,
  Loader2,
  RefreshCw
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts'

interface AnalyticsData {
  period: string
  summary: {
    totalVisits: number
    uniqueVisitors: number
    avgDailyVisits: number
    bestDay: string | null
    overallTrend: string
  }
  chartData: Array<{
    date: string
    visits: number
    uniqueVisitors: number
  }>
}

export default function AdminAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [aggregating, setAggregating] = useState(false)
  const [period, setPeriod] = useState('monthly')
  const [days, setDays] = useState(30)

  useEffect(() => {
    fetchData()
  }, [period, days])

  async function fetchData() {
    setLoading(true)
    try {
      const url = `/api/admin/analytics?period=${period}&days=${days}`
      const response = await fetch(url)
      if (response.ok) {
        const result = await response.json()
        setData(result)
      }
    } catch (error) {
      console.error('Errore nel recupero analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  async function forceAggregation() {
    setAggregating(true)
    try {
      const response = await fetch('/api/admin/analytics/aggregate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ type: period, force: true })
      })

      if (response.ok) {
        const result = await response.json()
        alert(result.message || 'Aggregazione completata!')
        fetchData()
      } else {
        const error = await response.json()
        alert(`Errore: ${error.error}`)
      }
    } catch (error) {
      console.error('Errore nell\'aggregazione:', error)
      alert('Errore nell\'aggregazione dei dati')
    } finally {
      setAggregating(false)
    }
  }

  function getTrendIcon(trend: string) {
    if (trend === 'in crescita') return <ArrowUp className="w-4 h-4 text-green-600" />
    return <Minus className="w-4 h-4 text-gray-500" />
  }

  function formatPeriodLabel(date: string): string {
    if (period === 'daily') {
      const d = new Date(date)
      return d.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' })
    }
    return date
  }

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    )
  }

  const chartConfig = {
    visits: { label: 'Visite' },
    uniqueVisitors: { label: 'Visitatori Unici' }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
          <h2 className="text-2xl font-bold">Analytics</h2>
          <p className="text-sm text-gray-500 mt-1">
            Statistiche delle visite al sito
          </p>
        </div>
        <div className="flex flex-col md:flex-row gap-4">
          <Button
            onClick={forceAggregation}
            disabled={aggregating}
            variant="outline"
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${aggregating ? 'animate-spin' : ''}`} />
            {aggregating ? 'Aggiornamento...' : 'Aggiorna'}
          </Button>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Periodo:</label>
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Giornaliero</SelectItem>
                  <SelectItem value="weekly">Settimanale</SelectItem>
                  <SelectItem value="monthly">Mensile</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {period === 'daily' && (
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Giorni:</label>
                <Select value={days.toString()} onValueChange={(v) => setDays(parseInt(v))}>
                  <SelectTrigger className="w-[100px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7</SelectItem>
                    <SelectItem value="14">14</SelectItem>
                    <SelectItem value="30">30</SelectItem>
                    <SelectItem value="60">60</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Card statistiche riassuntive */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Visite Totali */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Visite Totali {period === 'daily' ? `(ultimi ${days} giorni)` : period === 'weekly' ? '(ultime 12 settimane)' : '(ultimi 12 mesi)'}
            </CardTitle>
            <Eye className="w-5 h-5 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.summary.totalVisits.toLocaleString()}</div>
          </CardContent>
        </Card>

        {/* Visitatori Unici */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Visitatori Unici</CardTitle>
            <Users className="w-5 h-5 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.summary.uniqueVisitors.toLocaleString()}</div>
          </CardContent>
        </Card>

        {/* Media */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Media</CardTitle>
            <TrendingUp className="w-5 h-5 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(data.summary.avgDailyVisits).toLocaleString()}</div>
            <div className="text-sm text-gray-500 mt-1">
              visite al giorno
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grafico a barre */}
      <Card>
        <CardHeader>
          <CardTitle>
            Andamento {period === 'daily' ? 'Giornaliero' : period === 'weekly' ? 'Settimanale' : 'Mensile'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="min-h-[350px]">
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.chartData}>
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) => formatPeriodLabel(value as string)}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="visits" name="Visite" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>

      {/* Tabella dettagliata */}
      <Card>
        <CardHeader>
          <CardTitle>Dettaglio</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-2">
                  {period === 'daily' ? 'Data' : period === 'weekly' ? 'Settimana' : 'Mese'}
                </th>
                <th className="text-right py-3 px-2">Visite</th>
                <th className="text-right py-3 px-2">Visitatori Unici</th>
              </tr>
            </thead>
            <tbody>
              {data.chartData.map((item, index) => (
                <tr key={index} className="border-b border-gray-100">
                  <td className="py-3 px-2 font-medium">{formatPeriodLabel(item.date)}</td>
                  <td className="text-right py-3 px-2">{item.visits.toLocaleString()}</td>
                  <td className="text-right py-3 px-2">{item.uniqueVisitors.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Info note */}
      <div className="text-sm text-gray-500 space-y-1">
        <p>ℹ️ I dati sono aggiornati automaticamente ad ogni visita.</p>
        <p>📊 Le visite vengono registrate in modo anonimo senza memorizzare dati personali.</p>
      </div>
    </div>
  )
}
