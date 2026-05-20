# إعداد Firebase للتطبيق

## ⚠️ المشكلة الرئيسية: قواعد الأمان غير مفعلة

السبب: قواعد **Realtime Database** تمنع الكتابة افتراضياً.

---

## ✅ الحل: تعديل قواعد Realtime Database

### الخطوات:

1. اذهب إلى: https://console.firebase.google.com/project/call-eygpt/database/rules

2. ستجد قواعس حالية مثل:
```
{
  "rules": {
    ".read": false,
    ".write": false
  }
}
```

3. **استبدل بهذا الكود:**
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
        ".write": true,
        ".validate": "newData.hasChildren(['siteName', 'primaryColor', 'secondaryColor', 'bgColor', 'logoUrl', 'adminPassword'])"
      }
    }
  }
}
```

4. اضغط **Publish**

5. ستظهر رسالة تحذير - اضغط **I understand, publish these rules** ✅

---

## ✅ التحقق من النتيجة

بعد النشر ستجد علامة خضراء ✅ على أيقونة Realtime Database

---

## الخطوة الثانية: تعديل قواعس Firestore (اختياري - للصور فقط)

1. افتح: https://console.firebase.google.com/project/call-eygpt/firestore/rules

2. ضع هذا الكود:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

3. اضغط **Publish**

---

## ✅ الخطوة الثالثة: Storage Rules (اختياري - لرفع الصور)

1. افتح: https://console.firebase.google.com/project/call-eygpt/storage/rules

2. ضع هذا الكود:
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if true;
    }
  }
}
```

3. اضغط **Publish**

---

## 📋 ملخص ما يجب عمله:

- ☑️ **Realtime Database Rules** - **مهم جداً!** ⭐
- ☑️ Firestore Rules - اختياري
- ☑️ Storage Rules - اختياري

---

## 🔐 ملاحظة أمان مهمة

⚠️ هذه القواعس **للتطوير والاختبار فقط** وتسمح للجميع بالقراءة والكتابة!

للإنتاج (Production)، استخدم:
- Firebase Authentication
- تقييد الوصول للمسؤولين فقط

---

## 🛡️ كلمة سر الأدمن:
`01147497465`

للدخول: اضغط على أيقونة الدرع 🛡️ في أعلى يسار الشاشة

