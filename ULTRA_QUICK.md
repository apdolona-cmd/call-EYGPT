# 🎯 دليل فوري (30 ثانية)

## ✋ توقف! اقرأ هذا أولاً:

### المشكلة:
التغييرات لا تظهر على أجهزة أخرى ❌

### الحل:
تفعيل real-time sync عبر Firebase ✅

---

## 🚀 الخطوات:

### 1. افتح الرابط:
https://console.firebase.google.com/project/call-eygpt/database/rules

### 2. استبدل الكود (انسخ هذا):
```json
{
  "rules": {
    ".read": true,
    ".write": true,
    "config": {
      ".read": true,
      ".write": true,
      "site": {
        ".read": true,
        ".write": true
      }
    }
  }
}
```

### 3. اضغط: Publish ✅

### 4. شغّل:
```bash
npm run dev
```

### 5. اختبر على جهازين! 🎉

---

## ✅ اكتمل!

**المزامنة الآن فورية تماماً!** ⚡

---

**تحتاج مساعدة؟** اقرأ:
- [START_HERE.md](START_HERE.md)
- [QUICK_FIX.md](QUICK_FIX.md)
- [FAQ.md](FAQ.md)

**يلا نبدأ! 🚀**
