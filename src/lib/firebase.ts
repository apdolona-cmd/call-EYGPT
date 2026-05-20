import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";
import { getDatabase, ref, set, onValue, type Database } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-database.js";

export interface SiteSettings {
  siteName: string;
  primaryColor: string;
  secondaryColor: string;
  bgColor: string;
  logoUrl: string;
  adminPassword: string;
  lastUpdate?: number;
  updatedBy?: string;
}

const DEFAULT: SiteSettings = {
  siteName: 'VoiceLink',
  primaryColor: '#3b82f6',
  secondaryColor: '#8b5cf6',
  bgColor: '#0a0a0f',
  logoUrl: '',
  adminPassword: '01147497465',
  lastUpdate: 0,
  updatedBy: 'system',
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
let isFirebaseReady = false;

try {
  app = initializeApp(firebaseConfig);
  db = getDatabase(app);
  isFirebaseReady = true;
  const timestamp = new Date().toLocaleTimeString('ar-EG');
  console.log(`%c✅ Firebase initialized [${timestamp}]`, 'color: green; font-weight: bold;');
  console.log('🗄️ Database URL:', firebaseConfig.databaseURL);
} catch (err) {
  console.error('%c❌ Firebase initialization error:', 'color: red; font-weight: bold;', err);
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
  if (!isFirebaseReady) {
    console.warn('%c⚠️ Firebase not ready yet', 'color: orange;');
  }

  const merged: SiteSettings = { 
    ...getLocal(), 
    ...partial,
    lastUpdate: Date.now(),
    updatedBy: 'admin'
  };
  
  // حفظ محلياً فوراً
  setLocal(merged);
  document.body.style.backgroundColor = merged.bgColor;
  document.title = merged.siteName;
  
  console.log('%c💾 Saving to Firebase...', 'color: blue; font-weight: bold;', merged);

  // حفظ في Firebase Realtime Database
  if (!db) {
    console.warn('%c⚠️ Firebase database not initialized', 'color: orange;');
    return merged;
  }

  try {
    // تأكد من الكتابة
    const dbRef = ref(db, 'config/site');
    await set(dbRef, {
      siteName: merged.siteName,
      primaryColor: merged.primaryColor,
      secondaryColor: merged.secondaryColor,
      bgColor: merged.bgColor,
      logoUrl: merged.logoUrl,
      adminPassword: merged.adminPassword,
      lastUpdate: merged.lastUpdate,
      updatedBy: merged.updatedBy,
      deviceId: getDeviceId()
    });
    
    const timestamp = new Date().toLocaleTimeString('ar-EG');
    console.log(`%c✅ Successfully saved to Firebase [${timestamp}]`, 'color: green; font-weight: bold;');
    console.log('📤 Saved data:', merged);
    _cloudOk = true;
  } catch (err) {
    _cloudOk = false;
    console.error('%c❌ Error saving to Firebase:', 'color: red; font-weight: bold;', err);
    console.log('📝 Fallback: Data saved locally');
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
  if (!isFirebaseReady || !db) {
    console.warn('%c⚠️ Firebase not ready, cannot start listener', 'color: orange;');
    // Fallback: استخدم البيانات المحلية
    const local = getLocal();
    cb(local);
    return () => {};
  }

  const settingsRef = ref(db, 'config/site');
  
  const timestamp = new Date().toLocaleTimeString('ar-EG');
  console.log(`%c📡 Starting real-time listener [${timestamp}]`, 'color: purple; font-weight: bold;');
  console.log('🎯 Listening to:', settingsRef.path);
  
  let isFirstLoad = true;
  
  const unsubscribe = onValue(
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
          
          const timestamp = new Date().toLocaleTimeString('ar-EG');
          const stage = isFirstLoad ? '📥 Initial' : '🔄 Updated';
          console.log(
            `%c✅ ${stage} [${timestamp}]`,
            'color: green; font-weight: bold;',
            data
          );
          console.log(`📍 Updated by: ${cloudData.updatedBy || 'unknown'}`);
          console.log(`⏱️ Last update: ${new Date(data.lastUpdate).toLocaleTimeString('ar-EG')}`);
          
          isFirstLoad = false;
        } else {
          // لا توجد بيانات - إنشاء افتراضية
          console.log('%c📝 No data in Firebase, using defaults', 'color: orange;');
          setLocal(DEFAULT);
          cb(DEFAULT);
          _cloudOk = true;
          
          // محاولة إنشاء بيانات افتراضية
          set(ref(db, 'config/site'), { ...DEFAULT, lastUpdate: Date.now(), updatedBy: 'init' }).catch(err => {
            console.warn('%c⚠️ Could not initialize default data:', 'color: orange;', err);
          });
        }
      } catch (err) {
        console.error('%c❌ Error processing snapshot:', 'color: red;', err);
      }
    },
    (error) => {
      _cloudOk = false;
      console.error('%c❌ Error in listener:', 'color: red; font-weight: bold;', error);
      console.log('%c⚠️ Falling back to local data', 'color: orange;');
      
      // fallback محلي
      const local = getLocal();
      cb(local);
    }
  );

  return () => {
    console.log('%c🔴 Listener stopped', 'color: red;');
    unsubscribe();
  };
}

// ===== Device ID =====
function getDeviceId(): string {
  const key = 'app_device_id';
  let id = localStorage.getItem(key);
  if (!id) {
    id = 'dev_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem(key, id);
  }
  return id;
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
