# HPA (Harry Potter Academy) — Backend API Dokumentatsiyasi

> **Base URL:** `http://<server>/api/v1/`  
> **Auth:** JWT Bearer Token (barcha endpointlar `Authorization: Bearer <access_token>` talab qiladi, login bundan mustasno)  
> **Swagger UI:** `/swdoc/`  
> **ReDoc:** `/redoc/`

---

## Mundarija

1. [Autentifikatsiya (Login)](#1-autentifikatsiya-login)
2. [Exams — Imtihonlar](#2-exams--imtihonlar)
3. [Exam Results — Imtihon Natijalari](#3-exam-results--imtihon-natijalari)
4. [Messages — Telegram Xabarlar](#4-messages--telegram-xabarlar)
5. [Work Logs — Ish Hisobi](#5-work-logs--ish-hisobi)
6. [Model Sxemalari](#6-model-sxemalari)

---

## 1. Autentifikatsiya (Login)

### `POST /api/v1/login/`

Tizimga kirish — access va refresh token qaytaradi.

**Permission:** AllowAny (token shart emas)

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response `200 OK`:**
```json
{
  "tokens": {
    "access": "<JWT access token>",
    "refresh": "<JWT refresh token>"
  },
  "user": {
    "id": 1,
    "username": "admin",
    "role": "owner",
    "full_name": "Ali Valiyev"
  }
}
```

**Response `401 Unauthorized`:**
```json
{
  "detail": "Invalid credentials"
}
```

**Rollar:**
| Role | Tavsif |
|------|--------|
| `owner` | Admin — barcha amallarni bajarishi mumkin |
| `employee` | Xodim — o'qituvchi |
| `student` | O'quvchi |

---

---

## 2. Exams — Imtihonlar

**Base path:** `/api/v1/exams/`  
**Permission:** `IsAuthenticated`

---

### 2.1. Barcha Imtihonlar Ro'yxati

#### `GET /api/v1/exams/`

**Response `200 OK`:**
```json
[
  {
    "id": 1,
    "title": "Ingliz tili - 1-hafta imtihon",
    "code": "AB12CD",
    "subject": 2,
    "subject_name": "Ingliz tili",
    "description": "Birinchi hafta uchun test",
    "time_limit": 30,
    "is_published": true,
    "is_active": true,
    "date": "2026-02-20",
    "created_by": 1,
    "created_at": "2026-02-20T10:00:00Z",
    "questions_count": 20,
    "participants_count": 15
  }
]
```

---

### 2.2. Imtihon Yaratish

#### `POST /api/v1/exams/`

Yangi imtihon yaratish. Savollar va variantlar birgalikda yuboriladi.  
`code` maydoni avtomatik generatsiya qilinadi (6 ta belgi: harflar + raqamlar).

**Request Body:**
```json
{
  "title": "Ingliz tili - 1-hafta imtihon",
  "subject": 2,
  "description": "Birinchi hafta uchun test",
  "time_limit": 30,
  "is_published": false,
  "is_active": true,
  "date": "2026-02-20",
  "questions": [
    {
      "text": "What is the capital of England?",
      "type": "test",
      "order": 1,
      "options": [
        { "text": "London", "is_correct": true, "order": 1 },
        { "text": "Paris", "is_correct": false, "order": 2 },
        { "text": "Berlin", "is_correct": false, "order": 3 },
        { "text": "Madrid", "is_correct": false, "order": 4 }
      ]
    },
    {
      "text": "Describe yourself in 3 sentences.",
      "type": "written",
      "order": 2,
      "written_answer_sample": "I am ...",
      "options": []
    }
  ]
}
```

**Savol turlari (`type`):**
| Qiymat | Tavsif |
|--------|--------|
| `test` | Test (a,b,c,d) — `options` talab qilinadi |
| `written` | Yozma javob — `options` bo'sh bo'lishi mumkin |

**Response `201 Created`:** — To'liq imtihon ma'lumoti (savollar va variantlar bilan)

---

### 2.3. Imtihon Tafsilotlari

#### `GET /api/v1/exams/{id}/`

**Response `200 OK`:**
```json
{
  "id": 1,
  "title": "Ingliz tili - 1-hafta imtihon",
  "code": "AB12CD",
  "subject": 2,
  "description": "...",
  "time_limit": 30,
  "is_published": true,
  "is_active": true,
  "date": "2026-02-20",
  "created_by": 1,
  "created_at": "2026-02-20T10:00:00Z",
  "questions": [
    {
      "id": 1,
      "text": "What is the capital of England?",
      "type": "test",
      "order": 1,
      "written_answer_sample": null,
      "options": [
        { "id": 1, "text": "London", "is_correct": true, "order": 1 },
        { "id": 2, "text": "Paris", "is_correct": false, "order": 2 },
        { "id": 3, "text": "Berlin", "is_correct": false, "order": 3 },
        { "id": 4, "text": "Madrid", "is_correct": false, "order": 4 }
      ]
    }
  ]
}
```

---

### 2.4. Imtihonni Yangilash

#### `PUT /api/v1/exams/{id}/`
#### `PATCH /api/v1/exams/{id}/`

Yangilashda `questions` yuborilsa — eski savollar o'chirilib, yangilari yoziladi.

**Request Body:** — Yuqoridagi POST bilan bir xil format  
**Response `200 OK`:** — Yangilangan imtihon tafsilotlari

---

### 2.5. Imtihonni O'chirish

#### `DELETE /api/v1/exams/{id}/`

**Response `204 No Content`**

---

### 2.6. Imtihonni Kod Orqali Topish

#### `POST /api/v1/exams/enter-code/`

O'quvchi imtihon kodini kiritib, imtihon ma'lumotlarini oladi.

**Request Body:**
```json
{
  "code": "AB12CD"
}
```

**Response `200 OK`:**
```json
{
  "id": 1,
  "title": "Ingliz tili - 1-hafta imtihon",
  "code": "AB12CD",
  "subject": 2,
  "time_limit": 30,
  "is_published": true,
  "is_active": true,
  "questions": [ ... ]
}
```

**Response `404 Not Found`:** — Kod topilmasa

---

### 2.7. Imtihonni Nashr Etish

#### `POST /api/v1/exams/{id}/publish/`

Imtihon `is_published = True` ga o'tadi va o'quvchilar uchun ko'rinadi.

**Request Body:** Yo'q  
**Response `200 OK`:**
```json
{
  "status": "Test nashr etildi"
}
```

---

### 2.8. Nashrdan Olish

#### `POST /api/v1/exams/{id}/unpublish/`

Imtihon `is_published = False` ga o'tadi.

**Request Body:** Yo'q  
**Response `200 OK`:**
```json
{
  "status": "Test nashrdan olindi"
}
```

---

### 2.9. Imtihonni Nusxalash

#### `POST /api/v1/exams/{id}/copy/`

Imtihonning to'liq nusxasini yaratadi:
- Yangi unikal `code` generatsiya qilinadi
- Sarlavhaga `(Nusxa)` qo'shiladi
- `is_published = False` bo'ladi
- Barcha savollar va variantlar nusxalanadi

**Request Body:** Yo'q  
**Response `201 Created`:** — Yangi nusxa imtihon tafsilotlari (savollar bilan)

---

### 2.10. Imtihonni Topshirish (Submit)

#### `POST /api/v1/exams/{id}/submit/`

O'quvchi imtihonni topshiradi. Har bir savol uchun javob yuboriladi.

**Shartlar:**
- Imtihon `is_published = True` va `is_active = True` bo'lishi shart
- Bir o'quvchi bir imtihonni faqat **bir marta** topshira oladi

**Request Body:**
```json
{
  "answers": [
    {
      "question_id": 1,
      "option_id": 1
    },
    {
      "question_id": 2,
      "option_id": null,
      "written_answer": "I am a student from Tashkent..."
    }
  ]
}
```

**Javob Maydonlari:**
| Maydon | Tur | Tavsif |
|--------|-----|--------|
| `question_id` | int | Savol ID si |
| `option_id` | int \| null | Test savollar uchun tanlangan variant ID |
| `written_answer` | string \| null | Yozma savollar uchun matn |

**Response `200 OK`:**
```json
{
  "id": 5,
  "exam": 1,
  "exam_title": "Ingliz tili - 1-hafta imtihon",
  "student": 10,
  "score": 85.5,
  "correct_answers": 17,
  "total_questions": 20,
  "is_checked": false,
  "checked_by": null,
  "created_at": "2026-02-20T11:30:00Z",
  "answers": [
    {
      "id": 1,
      "exam_result": 5,
      "question": 1,
      "question_text": "What is the capital of England?",
      "option": 1,
      "option_text": "London",
      "written_answer": null,
      "is_correct": true
    },
    {
      "id": 2,
      "exam_result": 5,
      "question": 2,
      "question_text": "Describe yourself in 3 sentences.",
      "option": null,
      "option_text": null,
      "written_answer": "I am a student from Tashkent...",
      "is_correct": false
    }
  ]
}
```

**Response `400 Bad Request` — Imtihon faol emas:**
```json
{
  "error": "Ushbu test hozirda faol emas."
}
```

**Response `400 Bad Request` — Allaqachon topshirilgan:**
```json
{
  "error": "Siz bu testni allaqachon topshirgansiz."
}
```

---

### Scoring Logikasi

```
score (foiz) = (to'g'ri javoblar soni / jami savollar soni) × 100
```
- `test` turidagi savollar avtomatik tekshiriladi
- `written` turidagi savollar `is_correct = False` holda saqlanadi (o'qituvchi tekshiradi)

---

---

## 3. Exam Results — Imtihon Natijalari

**Base path:** `/api/v1/exam-results/`  
**Permission:** `IsAuthenticated`

> **Muhim:** O'quvchi faqat o'zining natijalarini ko'ra oladi. Owner/Employee barcha natijalarni ko'ra oladi.

---

### 3.1. Barcha Natijalar Ro'yxati

#### `GET /api/v1/exam-results/`

- **Owner / Employee:** Tizimda barcha natijalar
- **Student:** Faqat o'z natijalari

**Response `200 OK`:**
```json
[
  {
    "id": 5,
    "exam": 1,
    "student": 10,
    "score": 85.5,
    "correct_answers": 17,
    "total_questions": 20,
    "is_checked": false,
    "checked_by": null,
    "created_at": "2026-02-20T11:30:00Z"
  }
]
```

---

### 3.2. Natija Tafsilotlari

#### `GET /api/v1/exam-results/{id}/`

**Response `200 OK`:**
```json
{
  "id": 5,
  "exam": 1,
  "student": 10,
  "score": 85.5,
  "correct_answers": 17,
  "total_questions": 20,
  "is_checked": false,
  "checked_by": null,
  "created_at": "2026-02-20T11:30:00Z"
}
```

---

### 3.3. Natija Yaratish

#### `POST /api/v1/exam-results/`

**Request Body:**
```json
{
  "exam": 1,
  "student": 10,
  "score": 85.5,
  "correct_answers": 17,
  "total_questions": 20,
  "is_checked": false,
  "checked_by": null
}
```

**Response `201 Created`:** — Yaratilgan natija

> **Eslatma:** Odatda natijalar `submit` action orqali avtomatik yaratiladi. Bu endpoint to'g'ridan-to'g'ri yozish uchun.

---

### 3.4. Natijani Yangilash

#### `PUT /api/v1/exam-results/{id}/`
#### `PATCH /api/v1/exam-results/{id}/`

O'qituvchi yozma savollarni tekshirib, `is_checked = true`, `checked_by` ni to'ldirishi mumkin.

**Request Body (PATCH):**
```json
{
  "is_checked": true,
  "checked_by": 3,
  "score": 90.0,
  "correct_answers": 18
}
```

**Response `200 OK`:** — Yangilangan natija

---

### 3.5. Natijani O'chirish

#### `DELETE /api/v1/exam-results/{id}/`

**Response `204 No Content`**

---

### 3.6. Mening Natijalarim

#### `GET /api/v1/exam-results/my-results/`

Faqat login qilgan foydalanuvchining o'z natijalari.

**Response `200 OK`:**
```json
[
  {
    "id": 5,
    "exam": 1,
    "student": 10,
    "score": 85.5,
    "correct_answers": 17,
    "total_questions": 20,
    "is_checked": false,
    "checked_by": null,
    "created_at": "2026-02-20T11:30:00Z"
  }
]
```

---

---

## 4. Messages — Telegram Xabarlar

**Base path:** `/api/v1/messages/`  
**Permission:** `IsAuthenticated`

O'quvchilarga Telegram bot orqali xabar yuborish uchun ishlatiladi. Xabar yuborish Celery task orqali asinxron bajariladi.

---

### 4.1. Barcha Xabarlar Ro'yxati

#### `GET /api/v1/messages/`

Xabarlar `created_at` bo'yicha yangilaridan eskisiga tartiblanadi.

**Response `200 OK`:**
```json
[
  {
    "id": 1,
    "text": "Ertaga imtihon bor, tayyorlanib keling!",
    "recipients": [10, 11, 12],
    "sent_by": 3,
    "logs": [
      {
        "id": 1,
        "message": 1,
        "recipient": 10,
        "recipient_name": "Ali Valiyev",
        "status": "sent",
        "error": null,
        "sent_at": "2026-02-20T09:05:00Z"
      },
      {
        "id": 2,
        "message": 1,
        "recipient": 11,
        "recipient_name": "Vali Aliyev",
        "status": "failed",
        "error": "O'quvchining telegram_id si yo'q",
        "sent_at": null
      }
    ],
    "created_at": "2026-02-20T09:00:00Z"
  }
]
```

---

### 4.2. Xabar Yaratish va Yuborish

#### `POST /api/v1/messages/`

Yangi xabar yaratilishi bilan Celery orqali Telegram xabarlari yuboriladi.

**Request Body:**
```json
{
  "text": "Ertaga imtihon bor, tayyorlanib keling!",
  "recipient_ids": [10, 11, 12]
}
```

| Maydon | Tur | Tavsif |
|--------|-----|--------|
| `text` | string | Yuborilayotgan xabar matni (HTML format qo'llab-quvvatlanadi) |
| `recipient_ids` | int[] | Xabar yuboriladigan o'quvchilar ID lari ro'yxati |

> **Eslatma:** `recipient_ids` da faqat `role = "student"` bo'lgan foydalanuvchilar hisobga olinadi. Boshqa rollar filtrlanib tashlanadi.

**Response `201 Created`:**
```json
{
  "id": 1,
  "text": "Ertaga imtihon bor, tayyorlanib keling!",
  "recipients": [10, 11, 12],
  "sent_by": 3,
  "logs": [
    {
      "id": 1,
      "message": 1,
      "recipient": 10,
      "recipient_name": "Ali Valiyev",
      "status": "pending",
      "error": null,
      "sent_at": null
    }
  ],
  "created_at": "2026-02-20T09:00:00Z"
}
```

> **Celery jarayoni:** Xabar yaratilib saqlanishi bilan `send_telegram_message` Celery task ishga tushadi va har bir qabul qiluvchiга Telegram Bot API orqali xabar yuboradi. `logs` da har bir qabul qiluvchi uchun holat saqlanadi.

---

### 4.3. Xabar Tafsilotlari

#### `GET /api/v1/messages/{id}/`

**Response `200 OK`:** — Yuqoridagi ro'yxat elementi singari (logs bilan)

---

### 4.4. Xabarni Yangilash

#### `PUT /api/v1/messages/{id}/`
#### `PATCH /api/v1/messages/{id}/`

**Request Body:**
```json
{
  "text": "Yangilangan xabar matni"
}
```

**Response `200 OK`:** — Yangilangan xabar

---

### 4.5. Xabarni O'chirish

#### `DELETE /api/v1/messages/{id}/`

**Response `204 No Content`**

---

### MessageLog Status Holatlari

| Status | Tavsif |
|--------|--------|
| `pending` | Xabar navbatda, hali yuborilmagan |
| `sent` | Telegram orqali muvaffaqiyatli yuborildi |
| `failed` | Yuborishda xatolik yuz berdi (`error` maydoni sabab ko'rsatadi) |

### Xatolik sabablari (`error` maydoni):
| Xatolik | Sabab |
|---------|-------|
| `O'quvchining telegram_id si yo'q` | Foydalanuvchi profilida `telegram_id` yo'q |
| `TELEGRAM_BOT_TOKEN topilmadi` | Server `.env` da bot token sozlanmagan |
| Boshqa matn | Telegram API dan kelgan xatolik (maks. 500 belgi) |

---

---

## 5. Work Logs — Ish Hisobi

**Base path:** `/api/v1/work-logs/`  
**Permission:** `IsAuthenticated`  
**ViewSet turi:** `ReadOnlyModelViewSet` — faqat o'qish (GET) mumkin, yozish yo'q

---

### 5.1. Barcha Ish Jurnallari

#### `GET /api/v1/work-logs/`

**Response `200 OK`:**
```json
[
  {
    "id": 1,
    "employee": 3,
    "date": "2026-02-20",
    "status": true,
    "note": null,
    "created_at": "2026-02-20T08:00:00Z"
  },
  {
    "id": 2,
    "employee": 4,
    "date": "2026-02-20",
    "status": false,
    "note": null,
    "created_at": "2026-02-20T08:00:00Z"
  }
]
```

**`status` maydoni:**
| Qiymat | Ma'nosi |
|--------|---------|
| `true` | Xodim bugun ishga keldi |
| `false` | Xodim bugun ishga kelmadi |

---

### 5.2. Ish Jurnali Tafsilotlari

#### `GET /api/v1/work-logs/{id}/`

**Response `200 OK`:**
```json
{
  "id": 1,
  "employee": 3,
  "date": "2026-02-20",
  "status": true,
  "note": null,
  "created_at": "2026-02-20T08:00:00Z"
}
```

---

### WorkLog Ishlash Logikasi

WorkLog yozuvlari **avtomatik** yaratiladi va yangilanadi — to'g'ridan-to'g'ri API orqali yozish imkoni yo'q.

#### Avtomatik yangilanish (signal/helper)

Xodim (employee) attestatsiya (`Attendance`) yoki baho (`Score`) yozganda `log_employee_work()` funksiyasi chaqiriladi:

```
WorkLog.status = True  ←→  (bugun attendance yozgan) AND (bugun score bergan)
WorkLog.status = False ←→  ikkisidan biri ham yo'q
```

#### Kunlik Celery Task — `daily_worklog_initialization`

Har kuni barcha xodimlar uchun `status = False` holida WorkLog yozuvi yaratiladi (`get_or_create` orqali). Bu task Celery beat orqali har kuni ishga tushadi.

#### Qoida:
1. Ertalab Celery task barcha xodimlarga `False` holida yozuv ochadi
2. Xodim kun davomida ham davomat olib, ham baho bersa — `status = True` bo'ladi
3. Ikkalasidan biri bo'lmasa — `status = False` bo'lib qoladi

---

### Dashboard bilan Bog'liqligi

`GET /api/v1/dashboard/` endpointi WorkLog ma'lumotlaridan foydalanadi:

```json
{
  "attendance": {
    "employees_present_today": 5,
    "total_employees": 8
  }
}
```
Bu yerda `employees_present_today` — bugungi sana bo'yicha `status = True` bo'lgan WorkLog yozuvlari soni.

---

---

## 6. Model Sxemalari

### Exam

| Maydon | Tur | Tavsif |
|--------|-----|--------|
| `id` | int | Auto ID |
| `title` | string | Imtihon nomi |
| `code` | string (unique, 6 belgi) | Unikal imtihon kodi (avtogeneratsia) |
| `subject` | FK → Subject | Fan |
| `description` | text? | Tavsif |
| `time_limit` | int | Vaqt chegarasi (daqiqada), 0 = cheksiz |
| `is_published` | bool | `true` = o'quvchilar ko'ra oladi |
| `is_active` | bool | `true` = topshirish mumkin |
| `date` | date | Imtihon sanasi |
| `created_by` | FK → User | Yaratgan foydalanuvchi (auto) |
| `created_at` | datetime | Yaratilgan vaqt |

### Question

| Maydon | Tur | Tavsif |
|--------|-----|--------|
| `id` | int | Auto ID |
| `exam` | FK → Exam | Tegishli imtihon |
| `text` | text | Savol matni |
| `type` | enum: `test` / `written` | Savol turi |
| `written_answer_sample` | text? | Namunaviy to'g'ri javob (yozma savollar uchun) |
| `order` | int | Tartib raqami |
| `created_at` | datetime | Yaratilgan vaqt |

### Option

| Maydon | Tur | Tavsif |
|--------|-----|--------|
| `id` | int | Auto ID |
| `question` | FK → Question | Tegishli savol |
| `text` | string | Variant matni |
| `is_correct` | bool | To'g'ri javob belgisi |
| `order` | int | Tartib raqami |

### ExamResult

| Maydon | Tur | Tavsif |
|--------|-----|--------|
| `id` | int | Auto ID |
| `exam` | FK → Exam | Imtihon |
| `student` | FK → User | O'quvchi |
| `score` | float | Foiz natija (0–100) |
| `correct_answers` | int | To'g'ri javoblar soni |
| `total_questions` | int | Jami savollar soni |
| `is_checked` | bool | O'qituvchi tekshirdimi (yozma savollar uchun) |
| `checked_by` | FK → User? | Tekshirgan o'qituvchi |
| `created_at` | datetime | Topshirilgan vaqt |

> `unique_together`: (`exam`, `student`) — bir o'quvchi bir imtihonni bir marta topshira oladi

### ExamAnswer

| Maydon | Tur | Tavsif |
|--------|-----|--------|
| `id` | int | Auto ID |
| `exam_result` | FK → ExamResult | Tegishli natija |
| `question` | FK → Question | Savol |
| `option` | FK → Option? | Tanlangan variant (test uchun) |
| `written_answer` | text? | Yozma javob (written uchun) |
| `is_correct` | bool | To'g'rilik belgisi |

### WorkLog

| Maydon | Tur | Tavsif |
|--------|-----|--------|
| `id` | int | Auto ID |
| `employee` | FK → User | Xodim (role=employee) |
| `date` | date | Kun |
| `status` | bool | `true` = ishga keldi |
| `note` | text? | Izoh |
| `created_at` | datetime | Yozuv yaratilgan vaqt |

> `unique_together`: (`employee`, `date`) — bir xodim uchun bir kunda faqat bitta yozuv

### Message

| Maydon | Tur | Tavsif |
|--------|-----|--------|
| `id` | int | Auto ID |
| `text` | text | Xabar matni (HTML qo'llab-quvvatlanadi) |
| `recipients` | M2M → User | Qabul qiluvchi o'quvchilar |
| `sent_by` | FK → User | Yuborgan foydalanuvchi (auto) |
| `created_at` | datetime | Yaratilgan vaqt |

### MessageLog

| Maydon | Tur | Tavsif |
|--------|-----|--------|
| `id` | int | Auto ID |
| `message` | FK → Message | Tegishli xabar |
| `recipient` | FK → User | Qabul qiluvchi |
| `status` | enum: `pending`/`sent`/`failed` | Yuborish holati |
| `error` | text? | Xatolik sababi |
| `sent_at` | datetime? | Muvaffaqiyatli yuborilgan vaqt |

---

---

## Qisqacha URL Jadvali

### Exams (`/api/v1/exams/`)

| Method | URL | Tavsif |
|--------|-----|--------|
| `GET` | `/api/v1/exams/` | Barcha imtihonlar ro'yxati |
| `POST` | `/api/v1/exams/` | Yangi imtihon yaratish (savollar bilan) |
| `GET` | `/api/v1/exams/{id}/` | Imtihon tafsilotlari (savollar bilan) |
| `PUT` | `/api/v1/exams/{id}/` | Imtihonni to'liq yangilash |
| `PATCH` | `/api/v1/exams/{id}/` | Imtihonni qisman yangilash |
| `DELETE` | `/api/v1/exams/{id}/` | Imtihonni o'chirish |
| `POST` | `/api/v1/exams/enter-code/` | Kod orqali imtihon topish |
| `POST` | `/api/v1/exams/{id}/publish/` | Imtihonni nashr etish |
| `POST` | `/api/v1/exams/{id}/unpublish/` | Nashrdan olish |
| `POST` | `/api/v1/exams/{id}/copy/` | Imtihonni nusxalash |
| `POST` | `/api/v1/exams/{id}/submit/` | Imtihonni topshirish |

### Exam Results (`/api/v1/exam-results/`)

| Method | URL | Tavsif |
|--------|-----|--------|
| `GET` | `/api/v1/exam-results/` | Barcha natijalar (role bo'yicha filtr) |
| `POST` | `/api/v1/exam-results/` | Natija qo'lda yaratish |
| `GET` | `/api/v1/exam-results/{id}/` | Natija tafsilotlari |
| `PUT` | `/api/v1/exam-results/{id}/` | Natijani to'liq yangilash |
| `PATCH` | `/api/v1/exam-results/{id}/` | Natijani qisman yangilash (tekshirish) |
| `DELETE` | `/api/v1/exam-results/{id}/` | Natijani o'chirish |
| `GET` | `/api/v1/exam-results/my-results/` | Faqat o'z natijalari |

### Messages (`/api/v1/messages/`)

| Method | URL | Tavsif |
|--------|-----|--------|
| `GET` | `/api/v1/messages/` | Barcha xabarlar (logs bilan) |
| `POST` | `/api/v1/messages/` | Xabar yaratish + Telegram yuborish |
| `GET` | `/api/v1/messages/{id}/` | Xabar tafsilotlari |
| `PUT` | `/api/v1/messages/{id}/` | Xabarni to'liq yangilash |
| `PATCH` | `/api/v1/messages/{id}/` | Xabarni qisman yangilash |
| `DELETE` | `/api/v1/messages/{id}/` | Xabarni o'chirish |

### Work Logs (`/api/v1/work-logs/`)

| Method | URL | Tavsif |
|--------|-----|--------|
| `GET` | `/api/v1/work-logs/` | Barcha ish jurnallari |
| `GET` | `/api/v1/work-logs/{id}/` | Ish jurnali tafsilotlari |

> Work Logs faqat **o'qish** uchun. Yozish, yangilash, o'chirish mavjud emas.

---

*Dokumentatsiya yaratilgan: 2026-02-20 | HPA Backend v1.0*
