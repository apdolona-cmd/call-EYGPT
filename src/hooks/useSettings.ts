import { useState, useEffect } from 'react';
import { SiteSettings, getLocal, startCloudListener } from '../lib/firebase';

export function useSettings() {
  const [settings, setSettings] = useState<SiteSettings>(getLocal);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const s = getLocal();
      document.body.style.backgroundColor = s.bgColor;
      document.title = s.siteName;

      console.log('🎯 useSettings mounted, starting listener');

      const stop = startCloudListener((newS) => {
        console.log('🔄 useSettings: received update', newS);
        setSettings(newS);
        document.body.style.backgroundColor = newS.bgColor;
        document.title = newS.siteName;
      });

      setIsReady(true);

      return () => {
        console.log('🎯 useSettings unmounting, stopping listener');
        stop();
      };
    } catch (err) {
      console.error('❌ useSettings error:', err);
      setIsReady(true);
    }
  }, []);

  return { settings, loading: !isReady };
}
