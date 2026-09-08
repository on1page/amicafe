import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { createHash } from 'crypto'

// POST - Forza l'aggregazione dei dati analytics
export async function POST(request: NextRequest) {
  console.log('=== Aggregazione Analytics iniziata ===')
  try {
    let body = {}
    try {
      const text = await request.text()
      if (text.trim()) {
        body = JSON.parse(text)
      }
    } catch (e) {
      console.log('Body vuoto o non valido, uso defaults')
    }

    const { type = 'all', force = false } = body
    console.log('Tipo aggregazione:', type, 'Force:', force)

    const results: any = {}

    // Esegui aggregazione giornaliera
    if (type === 'all' || type === 'daily') {
      console.log('Iniziando aggregazione giornaliera...')
      try {
        results.daily = await aggregateDaily(force)
        console.log('Aggregazione giornaliera completata:', results.daily)
      } catch (error: any) {
        console.error('Errore in aggregazione giornaliera:', error)
        results.daily = { error: error?.message || 'Errore sconosciuto' }
      }
    }

    // Esegui aggregazione settimanale
    if (type === 'all' || type === 'weekly') {
      console.log('Iniziando aggregazione settimanale...')
      try {
        results.weekly = await aggregateWeekly(force)
        console.log('Aggregazione settimanale completata:', results.weekly)
      } catch (error: any) {
        console.error('Errore in aggregazione settimanale:', error)
        results.weekly = { error: error?.message || 'Errore sconosciuto' }
      }
    }

    // Esegui aggregazione mensile
    if (type === 'all' || type === 'monthly') {
      console.log('Iniziando aggregazione mensile...')
      try {
        results.monthly = await aggregateMonthly(force)
        console.log('Aggregazione mensile completata:', results.monthly)
      } catch (error: any) {
        console.error('Errore in aggregazione mensile:', error)
        results.monthly = { error: error?.message || 'Errore sconosciuto' }
      }
    }

    // Esegui aggregazione annuale
    if (type === 'all' || type === 'yearly') {
      console.log('Iniziando aggregazione annuale...')
      try {
        results.yearly = await aggregateYearly(force)
        console.log('Aggregazione annuale completata:', results.yearly)
      } catch (error: any) {
        console.error('Errore in aggregazione annuale:', error)
        results.yearly = { error: error?.message || 'Errore sconosciuto' }
      }
    }

    // Pulisci eventi vecchi (più di 15 giorni)
    if (type === 'all') {
      try {
        const cleanup = await cleanupOldEvents()
        console.log('Cleanup completato:', cleanup)
        results.cleanup = cleanup
      } catch (error: any) {
        console.error('Errore in cleanup:', error)
        results.cleanup = { error: error?.message || 'Errore sconosciuto' }
      }
    }

    console.log('=== Aggregazione Analytics completata ===', results)
    return NextResponse.json({
      success: true,
      message: 'Aggregazione completata con successo',
      results
    })
  } catch (error: any) {
    console.error('=== Errore nell\'aggregazione ===', error)
    console.error('Stack trace:', error?.stack)
    return NextResponse.json(
      { error: error?.message || 'Errore nell\'aggregazione dei dati', stack: error?.stack },
      { status: 500 }
    )
  }
}

// Aggregazione giornaliera - Eventi to AnalyticsDaily
async function aggregateDaily(force = false) {
  console.log('--- aggregateDaily iniziato ---')
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  console.log('Yesterday:', yesterday.toISOString(), 'Today:', today.toISOString())

  try {
    // Recupera tutti gli eventi di ieri
    const events = await db.analyticsEvent.findMany({
      where: {
        timestamp: {
          gte: yesterday,
          lt: today
        }
      }
    })

    console.log('Eventi trovati:', events.length)

    if (events.length === 0) {
      console.log('Nessun evento da aggregare per ieri')
      return { message: 'Nessun evento da aggregare per ieri' }
    }

    // Calcola le metriche
    const uniqueSessions = new Set(events.map(e => e.sessionId))
    const totalVisits = uniqueSessions.size
    const totalPageViews = events.filter(e => e.eventType === 'page_view').length

    console.log('Total visits:', totalVisits, 'Page views:', totalPageViews)

    // Page views per URL
    const pageViews: Record<string, number> = {}
    events.filter(e => e.eventType === 'page_view').forEach(e => {
      pageViews[e.pageUrl] = (pageViews[e.pageUrl] || 0) + 1
    })

    // Durata media sessione (in secondi)
    const pageViewEvents = events.filter(e => e.eventType === 'page_view' && e.duration)
    const avgSessionDuration = pageViewEvents.length > 0
      ? Math.round(pageViewEvents.reduce((sum, e) => sum + (e.duration || 0), 0) / pageViewEvents.length / 1000)
      : 0

    // Breakdown orario
    const hourlyBreakdown: Record<number, number> = {}
    events.forEach(e => {
      const hour = e.timestamp.getHours()
      hourlyBreakdown[hour] = (hourlyBreakdown[hour] || 0) + 1
    })

    // Top pages
    const topPages = Object.entries(pageViews)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([page, views]) => ({ page, views }))

    // Product views
    const productViews: Record<string, { views: number; totalDuration: number }> = {}
    events.filter(e => e.eventType === 'product_view').forEach(e => {
      if (!e.productId) return
      if (!productViews[e.productId]) {
        productViews[e.productId] = { views: 0, totalDuration: 0 }
      }
      productViews[e.productId].views++
      if (e.duration) {
        productViews[e.productId].totalDuration += e.duration
      }
    })

    const productViewsFormatted = Object.entries(productViews).reduce((acc, [id, data]) => {
      acc[id] = {
        views: data.views,
        avgDuration: data.views > 0 ? Math.round(data.totalDuration / data.views) : 0
      }
      return acc
    }, {} as Record<string, any>)

    // Conversion data
    const conversionData = {
      viewed: events.filter(e => e.eventType === 'product_view').length,
      cart: events.filter(e => e.eventType === 'add_to_cart').length
    }

    console.log('Upserting AnalyticsDaily...')
    // Crea o aggiorna AnalyticsDaily
    const daily = await db.analyticsDaily.upsert({
      where: { date: yesterday },
      update: {
        totalVisits,
        uniqueVisitors: totalVisits,
        pageViews: JSON.stringify(pageViews),
        avgSessionDuration,
        hourlyBreakdown: JSON.stringify(hourlyBreakdown),
        topPages: JSON.stringify(topPages),
        productViews: JSON.stringify(productViewsFormatted),
        conversionData: JSON.stringify(conversionData)
      },
      create: {
        date: yesterday,
        totalVisits,
        uniqueVisitors: totalVisits,
        pageViews: JSON.stringify(pageViews),
        avgSessionDuration,
        hourlyBreakdown: JSON.stringify(hourlyBreakdown),
        topPages: JSON.stringify(topPages),
        productViews: JSON.stringify(productViewsFormatted),
        conversionData: JSON.stringify(conversionData)
      }
    })

    console.log('--- aggregateDaily completato ---')
    return { daily, eventsProcessed: events.length }
  } catch (error: any) {
    console.error('Errore in aggregateDaily:', error)
    console.error('Stack:', error?.stack)
    throw error
  }
}

// Aggregazione settimanale - AnalyticsDaily to AnalyticsWeekly
async function aggregateWeekly(force = false) {
  let weekStart: Date
  let weekEnd: Date

  if (!force) {
    // Non forzato: usa la settimana corrente
    const today = new Date()
    const dayOfWeek = today.getDay() // 0 = domenica

    // Se non è domenica, non fare nulla
    if (dayOfWeek !== 0) {
      return { message: 'Oggi non è domenica, aggregazione settimanale saltata' }
    }

    weekEnd = new Date(today)
    weekEnd.setHours(0, 0, 0, 0)

    weekStart = new Date(weekEnd)
    weekStart.setDate(weekStart.getDate() - 6)
  } else {
    // Forzato: trova l'ultimo dato giornaliero e aggrega la sua settimana
    const lastDaily = await db.analyticsDaily.findFirst({
      orderBy: { date: 'desc' }
    })

    if (!lastDaily) {
      return { message: 'Nessun dato giornaliero disponibile', daysProcessed: 0 }
    }

    const lastDailyDate = new Date(lastDaily.date)
    const dayOfWeek = lastDailyDate.getDay() // 0 = domenica

    // Calcola la fine della settimana (domenica)
    weekEnd = new Date(lastDailyDate)
    weekEnd.setDate(lastDailyDate.getDate() + (7 - dayOfWeek))
    weekEnd.setHours(0, 0, 0, 0)

    // Calcola l'inizio della settimana (domenica precedente)
    weekStart = new Date(weekEnd)
    weekStart.setDate(weekStart.getDate() - 6)

    console.log('Aggregazione settimanale forzata: basata sull\'ultimo dato giornaliero del', lastDailyDate.toISOString())
  }

  console.log('Aggregazione settimanale: dal', weekStart.toISOString(), 'al', weekEnd.toISOString())

  // Recupera i dati giornalieri della settimana
  const dailyData = await db.analyticsDaily.findMany({
    where: {
      date: {
        gte: weekStart,
        lt: weekEnd
      }
    },
    orderBy: { date: 'asc' }
  })

  if (dailyData.length === 0) {
    console.log('Nessun dato giornaliero per questa settimana, creando record con valori 0')

    // Crea record settimanale con tutti valori a 0
    const weekly = await db.analyticsWeekly.upsert({
      where: { id: `week_${weekStart.getTime()}` },
      update: {
        weekStartDate: weekStart,
        weekEndDate: weekEnd,
        totalVisits: 0,
        uniqueVisitors: 0,
        avgDailyVisits: 0,
        bestDayOfWeek: null,
        bestHourOfDay: null,
        topProducts: '[]',
        conversionInsights: '[]',
        priceInsights: '{}'
      },
      create: {
        id: `week_${weekStart.getTime()}`,
        weekStartDate: weekStart,
        weekEndDate: weekEnd,
        totalVisits: 0,
        uniqueVisitors: 0,
        avgDailyVisits: 0,
        bestDayOfWeek: null,
        bestHourOfDay: null,
        topProducts: '[]',
        conversionInsights: '[]',
        priceInsights: '{}'
      }
    })

    return { weekly, daysProcessed: 0 }
  }

  console.log('Dati giornalieri trovati:', dailyData.length, 'su 7 giorni della settimana')

  // Aggrega le metriche settimanali
  const totalVisits = dailyData.reduce((sum, d) => sum + d.totalVisits, 0)
  const uniqueVisitors = dailyData.reduce((sum, d) => sum + d.uniqueVisitors, 0)

  // Calcola la media giornaliera su 7 giorni (anche se alcuni hanno 0)
  const avgDailyVisits = totalVisits / 7

  console.log(`Visite totali: ${totalVisits}, Media giornaliera: ${avgDailyVisits.toFixed(2)}`)

  // Trova il giorno migliore della settimana
  const dayNames = ['domenica', 'lunedi', 'martedi', 'mercoledi', 'giovedi', 'venerdi', 'sabato']
  const visitsByDay: Record<number, number> = {}
  dailyData.forEach(d => {
    const dayOfWeek = d.date.getDay()
    visitsByDay[dayOfWeek] = (visitsByDay[dayOfWeek] || 0) + d.totalVisits
  })

  const bestDayIndex = Object.entries(visitsByDay).sort(([, a], [, b]) => b - a)[0]?.[0]
  const bestDayOfWeek = bestDayIndex !== undefined ? dayNames[parseInt(bestDayIndex)] : null

  // Trova l'ora migliore della settimana
  const hourlyData: Record<number, number> = {}
  dailyData.forEach(d => {
    const hourly = JSON.parse(d.hourlyBreakdown || '{}')
    Object.entries(hourly).forEach(([hour, count]) => {
      hourlyData[parseInt(hour)] = (hourlyData[parseInt(hour)] || 0) + (count as number)
    })
  })

  const bestHourOfDay = Object.entries(hourlyData).sort(([, a], [, b]) => b - a)[0]?.[0]

  // Top prodotti della settimana
  const productViews: Record<string, { views: number; avgDuration: number }> = {}
  dailyData.forEach(d => {
    const products = JSON.parse(d.productViews || '{}')
    Object.entries(products).forEach(([id, data]: [string, any]) => {
      if (!productViews[id]) {
        productViews[id] = { views: 0, avgDuration: 0 }
      }
      productViews[id].views += data.views
      productViews[id].avgDuration += data.avgDuration
    })
  })

  // Calcola la media delle durate
  Object.keys(productViews).forEach(id => {
    productViews[id].avgDuration = Math.round(productViews[id].avgDuration / dailyData.length)
  })

  const topProducts = Object.entries(productViews)
    .sort(([, a], [, b]) => b.views - a.views)
    .slice(0, 10)

  // Conversion insights
  const conversionData = dailyData.map(d => JSON.parse(d.conversionData || '{}'))
  const totalViewed = conversionData.reduce((sum, d) => sum + (d.viewed || 0), 0)
  const totalCart = conversionData.reduce((sum, d) => sum + (d.cart || 0), 0)
  const conversionRate = totalViewed > 0 ? (totalCart / totalViewed) * 100 : 0

  // Prodotti con alta visualizzazione ma bassa conversione (troppo cari?)
  const conversionInsights: any[] = []
  Object.entries(productViews).forEach(([productId, data]) => {
    if (data.views > 5) {
      conversionInsights.push({
        productId,
        views: data.views,
        avgDuration: data.avgDuration,
        conversionRate: conversionRate
      })
    }
  })

  // Price insights - badge colori
  const priceInsights: any = {}
  Object.entries(productViews).forEach(([productId, data]) => {
    if (data.views >= 10) {
      if (data.avgDuration > 30000) {
        priceInsights[productId] = 'red'
      } else if (data.avgDuration > 15000) {
        priceInsights[productId] = 'yellow'
      } else {
        priceInsights[productId] = 'green'
      }
    }
  })

  // Crea o aggiorna AnalyticsWeekly
  const weekly = await db.analyticsWeekly.upsert({
    where: { id: `week_${weekStart.getTime()}` },
    update: {
      weekStartDate: weekStart,
      weekEndDate: weekEnd,
      totalVisits,
      uniqueVisitors,
      avgDailyVisits,
      bestDayOfWeek,
      bestHourOfDay: bestHourOfDay ? parseInt(bestHourOfDay) : null,
      topProducts: JSON.stringify(topProducts),
      conversionInsights: JSON.stringify(conversionInsights),
      priceInsights: JSON.stringify(priceInsights)
    },
    create: {
      id: `week_${weekStart.getTime()}`,
      weekStartDate: weekStart,
      weekEndDate: weekEnd,
      totalVisits,
      uniqueVisitors,
      avgDailyVisits,
      bestDayOfWeek,
      bestHourOfDay: bestHourOfDay ? parseInt(bestHourOfDay) : null,
      topProducts: JSON.stringify(topProducts),
      conversionInsights: JSON.stringify(conversionInsights),
      priceInsights: JSON.stringify(priceInsights)
    }
  })

  return { weekly, daysProcessed: dailyData.length }
}

// Aggregazione mensile - AnalyticsWeekly to AnalyticsMonthly
async function aggregateMonthly(force = false) {
  let month: number
  let year: number

  if (!force) {
    // Non forzato: usa il mese corrente
    const today = new Date()
    const dayOfMonth = today.getDate()

    // Se non è l'ultimo giorno del mese, non fare nulla
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
    if (dayOfMonth !== lastDayOfMonth) {
      return { message: 'Oggi non è l\'ultimo del mese, aggregazione mensile saltata' }
    }

    month = today.getMonth()
    year = today.getFullYear()
  } else {
    // Forzato: trova l'ultimo dato settimanale e aggrega il suo mese
    const lastWeekly = await db.analyticsWeekly.findFirst({
      orderBy: { weekStartDate: 'desc' }
    })

    if (!lastWeekly) {
      return { message: 'Nessun dato settimanale disponibile', weeksProcessed: 0 }
    }

    const lastWeeklyDate = new Date(lastWeekly.weekStartDate)
    month = lastWeeklyDate.getMonth()
    year = lastWeeklyDate.getFullYear()

    console.log('Aggregazione mensile forzata: basata sull\'ultimo dato settimanale del', lastWeeklyDate.toISOString())
  }

  const monthString = `${year}-${String(month + 1).padStart(2, '0')}`
  console.log('Aggregazione mensile:', monthString, 'Force:', force)

  // Calcola il numero di giorni nel mese
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  // Recupera i dati settimanali del mese
  const weeklyData = await db.analyticsWeekly.findMany({
    where: {
      weekStartDate: {
        gte: new Date(year, month, 1),
        lt: new Date(year, month + 1, 1)
      }
    },
    orderBy: { weekStartDate: 'asc' }
  })

  if (weeklyData.length === 0) {
    console.log('Nessun dato settimanale per questo mese, creando record con valori 0')

    // Crea record mensile con tutti valori a 0
    const monthly = await db.analyticsMonthly.upsert({
      where: { month: monthString },
      update: {
        totalVisits: 0,
        uniqueVisitors: 0,
        avgDailyVisits: 0,
        bestDayOfWeek: null,
        bestHourOfDay: null,
        avgWeeklyVisits: 0,
        growthRate: 0,
        priceInsights: '{}'
      },
      create: {
        month: monthString,
        year,
        totalVisits: 0,
        uniqueVisitors: 0,
        avgDailyVisits: 0,
        bestDayOfWeek: null,
        bestHourOfDay: null,
        avgWeeklyVisits: 0,
        growthRate: 0,
        priceInsights: '{}'
      }
    })

    return { monthly, weeksProcessed: 0 }
  }

  console.log('Dati settimanali trovati:', weeklyData.length, 'nel mese')

  // Aggrega le metriche mensili
  const totalVisits = weeklyData.reduce((sum, w) => sum + w.totalVisits, 0)
  const uniqueVisitors = weeklyData.reduce((sum, w) => sum + w.uniqueVisitors, 0)

  // Calcola la media giornaliera sui giorni del mese (anche se alcune settimane hanno 0)
  const avgDailyVisits = totalVisits / daysInMonth

  console.log(`Visite totali: ${totalVisits}, Media giornaliera: ${avgDailyVisits.toFixed(2)}`)

  // Best day of week (più frequente nei dati settimanali)
  const dayCounts: Record<string, number> = {}
  weeklyData.forEach(w => {
    if (w.bestDayOfWeek) {
      dayCounts[w.bestDayOfWeek] = (dayCounts[w.bestDayOfWeek] || 0) + 1
    }
  })
  const bestDayOfWeek = Object.entries(dayCounts).sort(([, a], [, b]) => b - a)[0]?.[0] || null

  // Best hour of day (media)
  const hours = weeklyData.map(w => w.bestHourOfDay).filter((h): h is number => h !== null)
  const bestHourOfDay = hours.length > 0
    ? Math.round(hours.reduce((sum, h) => sum + h, 0) / hours.length)
    : null

  const avgWeeklyVisits = totalVisits / weeklyData.length

  // Growth rate rispetto al mese precedente
  const lastMonthData = await db.analyticsMonthly.findFirst({
    where: { month: `${year}-${String(month).padStart(2, '0')}` }
  })

  const growthRate = lastMonthData && lastMonthData.totalVisits > 0
    ? ((totalVisits - lastMonthData.totalVisits) / lastMonthData.totalVisits) * 100
    : 0

  // Aggrega insights prodotti
  const allPriceInsights: Record<string, string[]> = {}
  weeklyData.forEach(w => {
    const insights = JSON.parse(w.priceInsights || '{}')
    Object.entries(insights).forEach(([productId, color]) => {
      if (!allPriceInsights[productId]) {
        allPriceInsights[productId] = []
      }
      allPriceInsights[productId].push(color as string)
    })
  })

  // Determina il colore finale per ogni prodotto (più frequente)
  const finalPriceInsights: Record<string, string> = {}
  Object.entries(allPriceInsights).forEach(([productId, colors]) => {
    const redCount = colors.filter(c => c === 'red').length
    const yellowCount = colors.filter(c => c === 'yellow').length
    const greenCount = colors.filter(c => c === 'green').length

    if (redCount >= yellowCount && redCount >= greenCount) {
      finalPriceInsights[productId] = 'red'
    } else if (yellowCount >= greenCount) {
      finalPriceInsights[productId] = 'yellow'
    } else {
      finalPriceInsights[productId] = 'green'
    }
  })

  // Crea o aggiorna AnalyticsMonthly
  const monthly = await db.analyticsMonthly.upsert({
    where: { month: monthString },
    update: {
      totalVisits,
      uniqueVisitors,
      avgDailyVisits,
      bestDayOfWeek,
      bestHourOfDay,
      avgWeeklyVisits,
      growthRate,
      priceInsights: JSON.stringify(finalPriceInsights)
    },
    create: {
      month: monthString,
      year,
      totalVisits,
      uniqueVisitors,
      avgDailyVisits,
      bestDayOfWeek,
      bestHourOfDay,
      avgWeeklyVisits,
      growthRate,
      priceInsights: JSON.stringify(finalPriceInsights)
    }
  })

  return { monthly, weeksProcessed: weeklyData.length }
}

// Aggregazione annuale - AnalyticsMonthly to AnalyticsYearly
async function aggregateYearly(force = false) {
  let year: number

  if (!force) {
    // Non forzato: usa l'anno corrente
    const today = new Date()

    // Se non è 31 dicembre, non fare nulla
    if (today.getMonth() !== 11 || today.getDate() !== 31) {
      return { message: 'Oggi non è il 31 dicembre, aggregazione annuale saltata' }
    }

    year = today.getFullYear()
  } else {
    // Forzato: trova l'ultimo dato mensile e aggrega il suo anno
    const lastMonthly = await db.analyticsMonthly.findFirst({
      orderBy: [{ year: 'desc' }, { month: 'desc' }]
    })

    if (!lastMonthly) {
      return { message: 'Nessun dato mensile disponibile', monthsProcessed: 0 }
    }

    year = lastMonthly.year
    console.log('Aggregazione annuale forzata: basata sull\'ultimo dato mensile dell\'anno', year)
  }

  console.log('Aggregazione annuale:', year, 'Force:', force)

  // Recupera i dati mensili dell'anno
  const monthlyData = await db.analyticsMonthly.findMany({
    where: { year },
    orderBy: { month: 'asc' }
  })

  if (monthlyData.length === 0) {
    console.log('Nessun dato mensile per questo anno, creando record con valori 0')

    // Crea record annuale con tutti valori a 0
    const yearly = await db.analyticsYearly.upsert({
      where: { year },
      update: {
        totalVisits: 0,
        uniqueVisitors: 0,
        avgMonthlyVisits: 0,
        bestMonth: null,
        overallTrend: 'stabile',
        priceInsights: '{}'
      },
      create: {
        year,
        totalVisits: 0,
        uniqueVisitors: 0,
        avgMonthlyVisits: 0,
        bestMonth: null,
        overallTrend: 'stabile',
        priceInsights: '{}'
      }
    })

    return { yearly, monthsProcessed: 0 }
  }

  console.log('Dati mensili trovati:', monthlyData.length, 'su 12 mesi dell\'anno')

  // Aggrega le metriche annuali
  const totalVisits = monthlyData.reduce((sum, m) => sum + m.totalVisits, 0)
  const uniqueVisitors = monthlyData.reduce((sum, m) => sum + m.uniqueVisitors, 0)

  // Calcola la media mensile su 12 mesi (anche se alcuni hanno 0)
  const avgMonthlyVisits = totalVisits / 12

  console.log(`Visite totali: ${totalVisits}, Media mensile: ${avgMonthlyVisits.toFixed(2)}`)

  // Best month
  const monthVisits = monthlyData.map(m => ({ month: m.month, visits: m.totalVisits }))
  const bestMonth = monthVisits.sort((a, b) => b.visits - a.visits)[0]?.month || null

  // Overall trend
  const firstHalf = monthlyData.slice(0, 6).reduce((sum, m) => sum + m.totalVisits, 0)
  const secondHalf = monthlyData.slice(6).reduce((sum, m) => sum + m.totalVisits, 0)

  let overallTrend: string = 'stabile'
  if (secondHalf > firstHalf * 1.1) {
    overallTrend = 'in_crescita'
  } else if (secondHalf < firstHalf * 0.9) {
    overallTrend = 'in_calo'
  }

  // Aggrega price insights annuali
  const allPriceInsights: Record<string, string[]> = {}
  monthlyData.forEach(m => {
    const insights = JSON.parse(m.priceInsights || '{}')
    Object.entries(insights).forEach(([productId, color]) => {
      if (!allPriceInsights[productId]) {
        allPriceInsights[productId] = []
      }
      allPriceInsights[productId].push(color as string)
    })
  })

  const finalPriceInsights: Record<string, string> = {}
  Object.entries(allPriceInsights).forEach(([productId, colors]) => {
    const redCount = colors.filter(c => c === 'red').length
    const yellowCount = colors.filter(c => c === 'yellow').length
    const greenCount = colors.filter(c => c === 'green').length

    if (redCount >= yellowCount && redCount >= greenCount) {
      finalPriceInsights[productId] = 'red'
    } else if (yellowCount >= greenCount) {
      finalPriceInsights[productId] = 'yellow'
    } else {
      finalPriceInsights[productId] = 'green'
    }
  })

  // Crea o aggiorna AnalyticsYearly
  const yearly = await db.analyticsYearly.upsert({
    where: { year },
    update: {
      totalVisits,
      uniqueVisitors,
      avgMonthlyVisits,
      bestMonth,
      overallTrend,
      priceInsights: JSON.stringify(finalPriceInsights)
    },
    create: {
      year,
      totalVisits,
      uniqueVisitors,
      avgMonthlyVisits,
      bestMonth,
      overallTrend,
      priceInsights: JSON.stringify(finalPriceInsights)
    }
  })

  return { yearly, monthsProcessed: monthlyData.length }
}

// Pulizia eventi vecchi (più di 15 giorni)
async function cleanupOldEvents() {
  const fifteenDaysAgo = new Date()
  fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15)

  const result = await db.analyticsEvent.deleteMany({
    where: {
      timestamp: {
        lt: fifteenDaysAgo
      }
    }
  })

  return { deletedEvents: result.count }
}