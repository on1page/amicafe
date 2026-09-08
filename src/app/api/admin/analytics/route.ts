import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Recupera i dati analytics per la dashboard admin
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'monthly' // daily, weekly, monthly
    const days = searchParams.get('days') ? parseInt(searchParams.get('days')!) : 30

    if (period === 'daily') {
      return await getDailyData(days)
    } else if (period === 'weekly') {
      return await getWeeklyData()
    } else {
      return await getMonthlyData()
    }
  } catch (error) {
    console.error('Errore nel recupero analytics:', error)
    return NextResponse.json(
      { error: 'Errore nel recupero degli analytics' },
      { status: 500 }
    )
  }
}

// Dati giornalieri
async function getDailyData(days: number) {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const dailyEvents = await db.analyticsEvent.findMany({
    where: {
      timestamp: {
        gte: startDate
      }
    },
    orderBy: { timestamp: 'asc' },
    select: { timestamp: true, ipHash: true }
  })

  // Raggruppa per giorno
  const dailyMap = new Map<string, { visits: number; uniqueVisitors: Set<string> }>()

  dailyEvents.forEach(event => {
    const dateKey = event.timestamp.toISOString().split('T')[0]
    if (!dailyMap.has(dateKey)) {
      dailyMap.set(dateKey, { visits: 0, uniqueVisitors: new Set() })
    }
    const dayData = dailyMap.get(dateKey)!
    dayData.visits++
    if (event.ipHash) {
      dayData.uniqueVisitors.add(event.ipHash)
    }
  })

  // Converti in array
  const dailyData = Array.from(dailyMap.entries()).map(([date, data]) => ({
    date,
    visits: data.visits,
    uniqueVisitors: data.uniqueVisitors.size
  }))

  // Calcola totali
  const totalVisits = dailyData.reduce((sum, d) => sum + d.visits, 0)
  const allUniqueVisitors = new Set(dailyEvents.map(e => e.ipHash).filter(Boolean))

  return NextResponse.json({
    period: 'daily',
    summary: {
      totalVisits,
      uniqueVisitors: allUniqueVisitors.size,
      avgDailyVisits: Math.round(totalVisits / days),
      bestDay: null,
      overallTrend: 'in crescita'
    },
    chartData: dailyData
  })
}

// Dati settimanali (ultime 12 settimane)
async function getWeeklyData() {
  const weeks: Array<{ weekStart: string; weekEnd: string; visits: number; uniqueVisitors: number }> = []
  const currentWeekStart = getWeekStart(new Date())

  for (let i = 0; i < 12; i++) {
    const weekEnd = new Date(currentWeekStart)
    weekEnd.setDate(weekEnd.getDate() + 6)

    const weekEvents = await db.analyticsEvent.findMany({
      where: {
        timestamp: {
          gte: new Date(currentWeekStart),
          lt: new Date(weekEnd.getTime() + 24 * 60 * 60 * 1000)
        }
      },
      select: { ipHash: true }
    })

    const uniqueVisitors = new Set(weekEvents.map(e => e.ipHash).filter(Boolean)).size
    const visits = weekEvents.length

    weeks.push({
      weekStart: currentWeekStart.toISOString().split('T')[0],
      weekEnd: weekEnd.toISOString().split('T')[0],
      visits,
      uniqueVisitors
    })

    // Vai alla settimana precedente
    currentWeekStart.setDate(currentWeekStart.getDate() - 7)
  }

  weeks.reverse()

  const totalVisits = weeks.reduce((sum, w) => sum + w.visits, 0)
  const allUniqueVisitors = new Set()

  // Calcola visitatori unici unici tra tutte le settimane
  for (const week of weeks) {
    const weekEvents = await db.analyticsEvent.findMany({
      where: {
        timestamp: {
          gte: new Date(week.weekStart),
          lt: new Date(new Date(week.weekEnd).getTime() + 24 * 60 * 60 * 1000)
        }
      },
      select: { ipHash: true }
    })
    weekEvents.forEach(e => {
      if (e.ipHash) allUniqueVisitors.add(e.ipHash)
    })
  }

  return NextResponse.json({
    period: 'weekly',
    summary: {
      totalVisits,
      uniqueVisitors: allUniqueVisitors.size,
      avgDailyVisits: Math.round(totalVisits / (weeks.length * 7)),
      bestDay: null,
      overallTrend: 'in crescita'
    },
    chartData: weeks.map(w => ({
      date: `W${formatWeekNumber(w.weekStart)}`,
      visits: w.visits,
      uniqueVisitors: w.uniqueVisitors
    }))
  })
}

// Dati mensili (ultimi 12 mesi)
async function getMonthlyData() {
  const months: Array<{ month: string; year: number; visits: number; uniqueVisitors: number }> = []
  const currentDate = new Date()

  for (let i = 0; i < 12; i++) {
    const month = currentDate.getMonth()
    const year = currentDate.getFullYear()

    const monthStart = new Date(year, month, 1)
    const monthEnd = new Date(year, month + 1, 0, 23, 59, 59)

    const monthEvents = await db.analyticsEvent.findMany({
      where: {
        timestamp: {
          gte: monthStart,
          lte: monthEnd
        }
      },
      select: { ipHash: true }
    })

    const uniqueVisitors = new Set(monthEvents.map(e => e.ipHash).filter(Boolean)).size
    const visits = monthEvents.length

    const monthNames = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic']
    months.push({
      month: monthNames[month],
      year,
      visits,
      uniqueVisitors
    })

    // Vai al mese precedente
    currentDate.setMonth(month - 1)
  }

  months.reverse()

  const totalVisits = months.reduce((sum, m) => sum + m.visits, 0)

  return NextResponse.json({
    period: 'monthly',
    summary: {
      totalVisits,
      uniqueVisitors: months.reduce((sum, m) => sum + m.uniqueVisitors, 0), // Semplificato
      avgDailyVisits: Math.round(totalVisits / (months.length * 30)),
      bestDay: null,
      overallTrend: 'in crescita'
    },
    chartData: months.map(m => ({
      date: `${m.month} ${m.year}`,
      visits: m.visits,
      uniqueVisitors: m.uniqueVisitors
    }))
  })
}

// Funzione helper per ottenere l'inizio della settimana (lunedì)
function getWeekStart(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Adjust when day is Sunday
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

// Formatta numero settimana
function formatWeekNumber(dateStr: string): string {
  const date = new Date(dateStr)
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1)
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7).toString()
}
