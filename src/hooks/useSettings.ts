import { useState, useEffect } from 'react';
import { SiteSettings, getLocal, startCloudListener } from '../lib/firebase';

export function useSettings() {
  const [settings, setSettings] = useState<SiteSettings>(getLocal);

  useEffect(() => {
    const s = getLocal();
    document.body.style.backgroundColor = s.bgColor;
    document.title = s.siteName;

    const stop = startCloudListener((newS) => {
      setSettings(newS);
      document.body.style.backgroundColor = newS.bgColor;
      document.title = newS.siteName;
    });

    return stop;
  }, []);

  return { settings, loading: false };
}
