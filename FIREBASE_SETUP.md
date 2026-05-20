# إعداد Firebase للتطبيق

## المشكلة: لوحة التحكم لا تحفظ التغييرات

السبب: قواعد الأمان في Firebase Firestore تمنع الكتابة افتراضياً.

## الحل: تحديث قواعد Firestore

### الخطوات:

1. اذهب إلى Firebase Console: https://console.firebase.google.com/

2. اختر مشروعك: **call-eygpt**

3. من القائمة الجانبية، اختر **Firestore Database**

4. اضغط على تاب **Rules**

5. استبدل القواعد الموجودة بهذه:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // السماح بقراءة وكتابة الإعدادات
    match /settings/{document} {
      allow read, write: if true;
    }
    
    // السماح بقراءة وكتابة بيانات المستخدمين
    match /users/{userId} {
      allow read, write: if true;
    }
  }
}
```

6. اضغط **Publish**

---

## إعداد Storage (لرفع الشعار):

1. من القائمة الجانبية، اختر **Storage**

2. اضغط **Get Started** إذا لم يكن مفعلاً

3. اذهب إلى تاب **Rules**

4. استبدل القواعد بهذه:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /logos/{allPaths=**} {
      allow read, write: if true;
    }
  }
}
```

5. اضغط **Publish**

---

## ملاحظات مهمة:

⚠️ هذه القواعد للتطوير فقط وتسمح للجميع بالقراءة والكتابة.

للإنتاج، يُفضل تقييد الوصول:
- استخدام Firebase Authentication
- تحديد من يمكنه الكتابة (الأدمن فقط)

---

## كلمة سر الأدمن:
`01147497465`

للدخول: اضغط على أيقونة الدرع 🛡️ في أعلى يسار الشاشة
