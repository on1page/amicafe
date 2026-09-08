import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// POST - Esegue l'aggregazione degli eventi analytics
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type = 'all' } = body

    const results: any = {}

    // Esegui aggregazione giornaliera
    if (type === 'all' || type === 'daily') {
      results.daily = await aggregateDaily()
    }

    // Esegui aggregazione settimanale
    if (type === 'all' || type === 'weekly') {
      results.weekly = await aggregateWeekly()
    }

    // Esegui aggregazione mensile
    if (type === 'all' || type === 'monthly') {
      results.monthly = await aggregateMonthly()
    }

    // Esegui aggregazione annuale
    if (type === 'all' || type === 'yearly') {
      results.yearly = await aggregateYearly()
    }

    // Pulisci eventi vecchi (più di 15 giorni)
    if (type === 'all') {
      await cleanupOldEvents()
    }

    return NextResponse.json({
      success: true,
      results
    })
  } catch (error) {
    console.error('Errore nell\'aggregazione analytics:', error)
    return NextResponse.json(
      { error: 'Errore nell\'aggregazione degli analytics' },
      { status: 500 }
    )
  }
}

// Aggregazione giornaliera - Eventi → AnalyticsDaily
async function aggregateDaily() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  // Recupera tutti gli eventi di ieri
  const events = await db.analyticsEvent.findMany({
    where: {
      timestamp: {
        gte: yesterday,
        lt: today
      }
    }
  })

  if (events.length === 0) {
    return { message: 'Nessun evento da aggregare per ieri' }
  }

  // Calcola le metriche
  const uniqueSessions = new Set(events.map(e => e.sessionId))
  const totalVisits = uniqueSessions.size
  const totalPageViews = events.filter(e => e.eventType === 'page_view').length

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

  return { daily, eventsProcessed: events.length }
}

// Aggregazione settimanale - AnalyticsDaily → AnalyticsWeekly
async function aggregateWeekly() {
  const today = new Date()
  const dayOfWeek = today.getDay() // 0 = domenica

  // Se non è domenica, non fare nulla
  if (dayOfWeek !== 0) {
    return { message: 'Oggi non è domenica, aggregazione settimanale saltata' }
  }

  const weekEnd = new Date(today)
  weekEnd.setHours(0, 0, 0, 0)

  const weekStart = new Date(weekEnd)
  weekStart.setDate(weekStart.getDate() - 6)

  // Recupera i dati giornalieri della settimana scorsa
  const dailyData = await db.analyticsDaily.findMany({
    where: {
      date: {
        gte: weekStart,
        lt: weekEnd
      }
    }
  })

  if (dailyData.length === 0) {
    return { message: 'Nessun dato giornaliero per la settimana scorsa' }
  }

  // Aggrega le metriche settimanali
  const totalVisits = dailyData.reduce((sum, d) => sum + d.totalVisits, 0)
  const uniqueVisitors = dailyData.reduce((sum, d) => sum + d.uniqueVisitors, 0)
  const avgDailyVisits = totalVisits / dailyData.length

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
    // Se visualizzato molte volte ma poche aggiunte al carrello
    if (data.views > 5) {
      conversionInsights.push({
        productId,
        views: data.views,
        avgDuration: data.avgDuration,
        conversionRate: conversionRate // Semplificato - in realtà dovrebbe essere per prodotto
      })
    }
  })

  // Price insights - badge colori
  const priceInsights: any = {}
  Object.entries(productViews).forEach(([productId, data]) => {
    if (data.views >= 10) {
      if (data.avgDuration > 30000) {
        // Alta visualizzazione + lunga durata ma bassa conversione = forse troppo caro
        priceInsights[productId] = 'red'
      } else if (data.avgDuration > 15000) {
        // Durata media = prezzo da rivedere
        priceInsights[productId] = 'yellow'
      } else {
        // Bassa visualizzazione o breve durata = prezzo ok (o poco interessante)
        priceInsights[productId] = 'green'
      }
    }
  })

  // Crea o aggiorna AnalyticsWeekly
  const weekly = await db.analyticsWeekly.upsert({
    where: { id: `week_${weekStart.getTime()}` },
    update: {},
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

// Aggregazione mensile - AnalyticsWeekly → AnalyticsMonthly
async function aggregateMonthly() {
  const today = new Date()
  const dayOfMonth = today.getDate()

  // Se non è l'ultimo giorno del mese, non fare nulla
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
  if (dayOfMonth !== lastDayOfMonth) {
    return { message: 'Oggi non è l\'ultimo del mese, aggregazione mensile saltata' }
  }

  const month = today.getMonth()
  const year = today.getFullYear()

  const monthString = `${year}-${String(month + 1).padStart(2, '0')}`

  // Recupera i dati settimanali del mese
  const weeklyData = await db.analyticsWeekly.findMany({
    where: {
      weekStartDate: {
        gte: new Date(year, month, 1),
        lt: new Date(year, month + 1, 1)
      }
    }
  })

  if (weeklyData.length === 0) {
    return { message: 'Nessun dato settimanale per questo mese' }
  }

  // Aggrega le metriche mensili
  const totalVisits = weeklyData.reduce((sum, w) => sum + w.totalVisits, 0)
  const uniqueVisitors = weeklyData.reduce((sum, w) => sum + w.uniqueVisitors, 0)
  const avgDailyVisits = totalVisits / lastDayOfMonth

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
  const lastMonth = new Date(year, month - 1, 1)
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
  let monthly
  const existingMonthly = await db.analyticsMonthly.findFirst({
    where: { month: monthString }
  })

  if (existingMonthly) {
    monthly = await db.analyticsMonthly.update({
      where: { id: existingMonthly.id },
      data: {
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
  } else {
    monthly = await db.analyticsMonthly.create({
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
    })
  }

  return { monthly, weeksProcessed: weeklyData.length }
}

// Aggregazione annuale - AnalyticsMonthly → AnalyticsYearly
async function aggregateYearly() {
  const today = new Date()

  // Se non è 31 dicembre, non fare nulla
  if (today.getMonth() !== 11 || today.getDate() !== 31) {
    return { message: 'Oggi non è il 31 dicembre, aggregazione annuale saltata' }
  }

  const year = today.getFullYear()

  // Recupera i dati mensili dell'anno
  const monthlyData = await db.analyticsMonthly.findMany({
    where: { year }
  })

  if (monthlyData.length === 0) {
    return { message: 'Nessun dato mensile per questo anno' }
  }

  // Aggrega le metriche annuali
  const totalVisits = monthlyData.reduce((sum, m) => sum + m.totalVisits, 0)
  const uniqueVisitors = monthlyData.reduce((sum, m) => sum + m.uniqueVisitors, 0)
  const avgMonthlyVisits = totalVisits / monthlyData.length

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
  let yearly
  const existingYearly = await db.analyticsYearly.findFirst({
    where: { year }
  })

  if (existingYearly) {
    yearly = await db.analyticsYearly.update({
      where: { id: existingYearly.id },
      data: {
        totalVisits,
        uniqueVisitors,
        avgMonthlyVisits,
        bestMonth,
        overallTrend,
        priceInsights: JSON.stringify(finalPriceInsights)
      }
    })
  } else {
    yearly = await db.analyticsYearly.create({
      year,
      totalVisits,
      uniqueVisitors,
      avgMonthlyVisits,
      bestMonth,
      overallTrend,
      priceInsights: JSON.stringify(finalPriceInsights)
    })
  }

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
