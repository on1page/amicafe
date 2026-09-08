'use client';

import { useEffect, useState } from 'react';
import AdSenseBanner from './AdSenseBanner';

export default function AdSenseHorizontal() {
  const [slotId, setSlotId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSlotId = async () => {
      try {
        const response = await fetch('/api/company-data');
        if (!response.ok) return;

        const data = await response.json();
        setSlotId(data.adSenseSlotHorizontal);
      } catch (error) {
        console.error('Errore nel fetch dello slot orizzontale:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSlotId();
  }, []);

  if (loading) {
    return <div className="w-full h-[90px] flex items-center justify-center bg-gray-100 animate-pulse" />;
  }

  if (!slotId) {
    return null;
  }

  return <AdSenseBanner adSlotId={slotId} adFormat="horizontal" />;
}