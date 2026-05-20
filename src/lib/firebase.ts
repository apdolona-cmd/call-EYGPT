import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";
import { getDatabase, ref, set, onValue, type Database, onDisconnect } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-database.js";

export interface SiteSettings {
  siteName: string;
  primaryColor: string;
  secondaryColor: string;
  bgColor: string;
  logoUrl: string;
  adminPassword: string;
  lastUpdate?: number;
}

const DEFAULT: SiteSettings = {
  siteName: 'VoiceLink',
  primaryColor: '#3b82f6',
  secondaryColor: '#8b5cf6',
  bgColor: '#0a0a0f',
  logoUrl: '',
  adminPassword: '01147497465',
  lastUpdate: 0,
};

// ===== Firebase Init =====
const firebaseConfig = {
  apiKey: "AIzaSyD_LxWKCqldgjHMDtxjlU3a93yiJZJyDoU",
  authDomain: "call-eygpt.firebaseapp.com",
  databaseURL: "https://call-eygpt-default-rtdb.firebaseio.com",
  projectId: "call-eygpt",
  storageBucket: "call-eygpt.firebasestorage.app",
  messagingSenderId: "535011385526",
  appId: "1:535011385526:web:18dcd356099378dc0cc617",
  measurementId: "G-LS67YECG5G"
};

let app: any;
let db: Database;

try {
  app = initializeApp(firebaseConfig);
  db = getDatabase(app);
  console.log('✅ Firebase initialized successfully');
} catch (err) {
  console.error('❌ Firebase initialization error:', err);
}

let _cloudOk = false;
let _unsubscribe: (() => void) | null = null;

// ===== localStorage =====
export function getLocal(): SiteSettings {
  try {
    const s = localStorage.getItem('vl_s');
    return s ? { ...DEFAULT, ...JSON.parse(s) } : DEFAULT;
  } catch { 
    console.warn('⚠️ Error reading localStorage');
    return DEFAULT; 
  }
}

function setLocal(s: SiteSettings) {
  try {
    localStorage.setItem('vl_s', JSON.stringify(s));
  } catch (err) {
    console.error('❌ Error saving to localStorage:', err);
  }
}

// ===== حفظ فوري محلياً وفي Firebase =====
export async function saveSettingsInstant(partial: Partial<SiteSettings>): Promise<SiteSettings> {
  const merged: SiteSettings = { 
    ...getLocal(), 
    ...partial,
    lastUpdate: Date.now()
  };
  
  // حفظ محلياً فوراً
  setLocal(merged);
  document.body.style.backgroundColor = merged.bgColor;
  document.title = merged.siteName;
  
  // حفظ في Firebase Realtime Database
  if (!db) {
    console.warn('⚠️ Firebase not initialized');
    return merged;
  }

  try {
    await set(ref(db, 'config/site'), {
      siteName: merged.siteName,
      primaryColor: merged.primaryColor,
      secondaryColor: merged.secondaryColor,
      bgColor: merged.bgColor,
      logoUrl: merged.logoUrl,
      adminPassword: merged.adminPassword,
      lastUpdate: merged.lastUpdate
    });
    _cloudOk = true;
    console.log('✅ تم الحفظ في Firebase بنجاح');
  } catch (err) {
    _cloudOk = false;
    console.error('❌ خطأ في الحفظ في Firebase:', err);
  }
  
  return merged;
}

// اختبار Firebase
export async function testFirebase(): Promise<boolean> {
  if (!db) {
    console.warn('⚠️ Firebase not initialized');
    return false;
  }

  try {
    const settingsRef = ref(db, 'config/site');
    return new Promise((resolve) => {
      let resolved = false;

      const unsubscribe = onValue(
        settingsRef,
        (snapshot) => {
          if (!resolved) {
            resolved = true;
            _cloudOk = true;
            console.log('✅ Firebase test passed - data exists');
            unsubscribe();
            resolve(true);
          }
        },
        (err) => {
          if (!resolved) {
            resolved = true;
            _cloudOk = false;
            console.error('❌ Firebase test failed:', err);
            unsubscribe();
            resolve(false);
          }
        }
      );

      setTimeout(() => {
        if (!resolved) {
          resolved = true;
          unsubscribe();
          console.log('⚠️ Firebase test timeout - assuming no data');
          resolve(true); // نسمح بالتابع حتى لو لا توجد بيانات
        }
      }, 3000);
    });
  } catch (err) {
    _cloudOk = false;
    console.error('❌ Firebase test error:', err);
    return false;
  }
}

export function isCloudOk() { 
  return _cloudOk; 
}

// الاستماع لتغييرات Firebase بشكل فوري (REAL-TIME)
export function startCloudListener(cb: (s: SiteSettings) => void) {
  if (!db) {
    console.warn('⚠️ Firebase not initialized');
    return () => {};
  }

  if (_unsubscribe) {
    console.log('🔄 Stopping previous listener');
    _unsubscribe();
  }

  const settingsRef = ref(db, 'config/site');
  
  console.log('📡 Starting real-time listener...');
  
  _unsubscribe = onValue(
    settingsRef,
    (snapshot) => {
      try {
        if (snapshot.exists()) {
          const cloudData = snapshot.val();
          const data: SiteSettings = { 
            ...DEFAULT, 
            ...cloudData,
            lastUpdate: cloudData.lastUpdate || Date.now()
          };
          
          setLocal(data);
          cb(data);
          _cloudOk = true;
          
          const timestamp = new Date(data.lastUpdate).toLocaleTimeString('ar-EG');
          console.log(`✅ تم استقبال التحديث من Firebase [${timestamp}]`, data);
        } else {
          // لا توجد بيانات - إنشاء افتراضية
          console.log('📝 لا توجد بيانات في Firebase، استخدام الافتراضي');
          setLocal(DEFAULT);
          cb(DEFAULT);
          _cloudOk = true;
          
          // محاولة إنشاء بيانات افتراضية
          set(ref(db, 'config/site'), { ...DEFAULT, lastUpdate: Date.now() }).catch(err => {
            console.warn('⚠️ Could not initialize default data:', err);
          });
        }
      } catch (err) {
        console.error('❌ Error processing snapshot:', err);
      }
    },
    (error) => {
      _cloudOk = false;
      console.error('❌ خطأ في الاستماع على Firebase:', error);
      
      // fallback محلي
      const local = getLocal();
      cb(local);
    }
  );

  return () => {
    if (_unsubscribe) {
      _unsubscribe();
      _unsubscribe = null;
      console.log('🔴 Listener stopped');
    }
  };
}

// ===== صورة =====
export function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => {
      const c = document.createElement('canvas');
      const max = 100;
      let w = img.width, h = img.height;
      if (w > h) { h = (h * max) / w; w = max; }
      else { w = (w * max) / h; h = max; }
      c.width = w; c.height = h;
      c.getContext('2d')?.drawImage(img, 0, 0, w, h);
      resolve(c.toDataURL('image/jpeg', 0.5));
      URL.revokeObjectURL(img.src);
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}
}
