'use client';

import { useState } from 'react';
import PhraseComposer from '@/components/PhraseComposer';
import PhraseList from '@/components/PhraseList';

export default function DashboardClientInner() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="grid gap-4">
      <PhraseComposer onCreated={() => setRefreshKey((k) => k + 1)} />
      <PhraseList refreshKey={refreshKey} />
    </div>
  );
}
