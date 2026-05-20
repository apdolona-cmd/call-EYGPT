import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";
import { getDatabase, ref, set, onValue, type Database } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-database.js";

export interface SiteSettings {
  siteName: string;
  primaryColor: string;
  secondaryColor: string;
  bgColor: string;
  logoUrl: string;
  adminPassword: string;
}

const DEFAULT: SiteSettings = {
  siteName: 'VoiceLink',
  primaryColor: '#3b82f6',
  secondaryColor: '#8b5cf6',
  bgColor: '#0a0a0f',
  logoUrl: '',
  adminPassword: '01147497465',
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

const app = initializeApp(firebaseConfig);
const db: Database = getDatabase(app);

let _cloudOk = false;

// ===== localStorage =====
export function getLocal(): SiteSettings {
  try {
    const s = localStorage.getItem('vl_s');
    return s ? { ...DEFAULT, ...JSON.parse(s) } : DEFAULT;
  } catch { return DEFAULT; }
}

function setLocal(s: SiteSettings) {
  localStorage.setItem('vl_s', JSON.stringify(s));
}

// ===== حفظ فوري محلياً وفي Firebase =====
export async function saveSettingsInstant(partial: Partial<SiteSettings>): Promise<SiteSettings> {
  const merged = { ...getLocal(), ...partial };
  setLocal(merged);
  document.body.style.backgroundColor = merged.bgColor;
  document.title = merged.siteName;
  
  // حفظ في Firebase Realtime Database
  try {
    await set(ref(db, 'config/site'), merged);
    _cloudOk = true;
    console.log('☁️ تم الحفظ في Firebase');
  } catch (err) {
    _cloudOk = false;
    console.error('❌ فشل الحفظ:', err);
  }
  
  return merged;
}

// اختبار Firebase
export async function testFirebase(): Promise<boolean> {
  try {
    // محاولة قراءة من قاعدة البيانات
    const settingsRef = ref(db, 'config/site');
    return new Promise((resolve) => {
      const unsubscribe = onValue(
        settingsRef,
        () => {
          _cloudOk = true;
          unsubscribe();
          resolve(true);
        },
        () => {
          _cloudOk = false;
          unsubscribe();
          resolve(false);
        }
      );
      setTimeout(() => {
        unsubscribe();
        resolve(_cloudOk);
      }, 5000);
    });
  } catch {
    _cloudOk = false;
    return false;
  }
}

export function isCloudOk() { return _cloudOk; }

// الاستماع لتغييرات Firebase بشكل فوري (REAL-TIME)
export function startCloudListener(cb: (s: SiteSettings) => void) {
  const settingsRef = ref(db, 'config/site');
  
  // استماع لأي تغييرات في الوقت الفعلي
  const unsubscribe = onValue(
    settingsRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = { ...DEFAULT, ...snapshot.val() };
        setLocal(data);
        cb(data);
        _cloudOk = true;
        console.log('📡 تم استقبال التحديث من Firebase');
      } else {
        console.log('لا توجد بيانات في Firebase، استخدام الافتراضي');
        setLocal(DEFAULT);
        cb(DEFAULT);
        _cloudOk = true;
      }
    },
    (error) => {
      _cloudOk = false;
      console.error('❌ خطأ في الاستماع:', error);
    }
  );

  return () => unsubscribe();
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
