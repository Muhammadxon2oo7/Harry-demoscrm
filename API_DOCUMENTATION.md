# HPA (Harry-Potter Academy) — Toʻliq API Dokumentatsiyasi

> **Base URL:** `https://www.harry-potter.uz`  
> **API Version:** `v1.0`  
> **Authentication:** JWT Bearer Token  
> **Content-Type:** `application/json`

---

## Mundarija

1. [Umumiy Ma'lumot](#1-umumiy-malumot)
2. [Autentifikatsiya](#2-autentifikatsiya)
3. [Ruxsatlar (Permissions)](#3-ruxsatlar-permissions)
4. [Foydalanuvchilar (Accounts)](#4-foydalanuvchilar-accounts)
   - 4.1 [Login](#41-login)
   - 4.2 [Dashboard / Statistika](#42-dashboard--statistika)
   - 4.3 [Owner (Admin) CRUD](#43-owner-admin-crud)
   - 4.4 [Worker (Xodim) CRUD](#44-worker-xodim-crud)
   - 4.5 [Student (O'quvchi) CRUD](#45-student-oquvchi-crud)
   - 4.6 [O'quvchilar Reytingi](#46-oquvchilar-reytingi)
   - 4.7 [Telegram Xabarlar (Messages)](#47-telegram-xabarlar-messages)
   - 4.8 [Xabar Loglari (Message Logs)](#48-xabar-loglari-message-logs)
5. [Ta'lim (Education)](#5-talim-education)
   - 5.1 [Fanlar (Subjects)](#51-fanlar-subjects)
   - 5.2 [Guruhlar (Groups)](#52-guruhlar-groups)
   - 5.3 [Guruhlar Reytingi](#53-guruhlar-reytingi)
   - 5.4 [Davomat (Attendance)](#54-davomat-attendance)
   - 5.5 [Ommaviy Davomat (Bulk Attendance)](#55-ommaviy-davomat-bulk-attendance)
   - 5.6 [Ballar (Scores)](#56-ballar-scores)
   - 5.7 [Uyga Vazifa (Homework)](#57-uyga-vazifa-homework)
   - 5.8 [O'quvchi Uyga Vazifalari](#58-oquvchi-uyga-vazifalari)
   - 5.9 [O'qituvchi Dars Loglari (TeacherLog)](#59-oqituvchi-dars-loglari-teacherlog)
6. [Imtihonlar (Exams)](#6-imtihonlar-exams)
   - 6.1 [Imtihon CRUD](#61-imtihon-crud)
   - 6.2 [Imtihonni Nashr Etish / Bekor Qilish](#62-imtihonni-nashr-etish--bekor-qilish)
   - 6.3 [Imtihon Nusxalash](#63-imtihon-nusxalash)
   - 6.4 [Kod orqali Imtihon Topish](#64-kod-orqali-imtihon-topish)
   - 6.5 [Imtihon Topshirish (Submit)](#65-imtihon-topshirish-submit)
   - 6.6 [Imtihon Natijalarini Baholash (Grade)](#66-imtihon-natijalarini-baholash-grade)
   - 6.7 [Imtihon Natijalari (Exam Results)](#67-imtihon-natijalari-exam-results)
   - 6.8 [Mening Natijalarim](#68-mening-natijalarim)
7. [Moliya (Finance)](#7-moliya-finance)
   - 7.1 [To'lovlar (Payments)](#71-tolovlar-payments)
   - 7.2 [Mening To'lovlarim](#72-mening-tolovlarim)
   - 7.3 [Xarajatlar (Expenses)](#73-xarajatlar-expenses)
8. [Ma'lumot Modellari](#8-malumot-modellari)
9. [Xato Kodlari](#9-xato-kodlari)
10. [Muhit O'zgaruvchilari (.env)](#10-muhit-ozgaruvchilari-env)

---

## 1. Umumiy Ma'lumot

### Loyiha haqida
**HPA** — Harry-Potter Academy o'quv markazi uchun yaratilgan Django REST Framework asosidagi backend API. Toshkentda joylashgan ta'lim muassasasini boshqarish uchun mo'ljallangan.

### Texnologiyalar
| Texnologiya | Versiya |
|---|---|
| Django | 5.2.7 |
| Django REST Framework | 3.16.1 |
| SimpleJWT | 5.5.1 |
| Celery | 5.5.3 |
| Redis | broker va result backend sifatida |
| PostgreSQL / SQLite | Ma'lumotlar bazasi |

### API Bazaviy URL Manzillar
```
Swagger UI:  GET /swdoc/
ReDoc:       GET /redoc/
Accounts:    /api/v1/accounts/
Education:   /api/v1/education/
Exams:       /api/v1/exams/
Finance:     /api/v1/finance/
```

> ⚠️ **Django Admin Panel** (`/admin/`) `config/urls.py` da ro'yxatdan **o'tkazilmagan** — admin panelga brauzer orqali kirish imkoni **yo'q**. Faqat API orqali boshqarish mumkin.

### JWT Token Konfiguratsiyasi
| Parametr | Qiymat |
|---|---|
| Access token muddati | 1 kun |
| Refresh token muddati | 3 kun |
| Algorithm | HS256 |
| Last login yangilanishi | Ha (avtomatik) |

---

## 2. Autentifikatsiya

Barcha himoyalangan endpointlar uchun `Authorization` headerida JWT token yuborish kerak:

```http
Authorization: Bearer <access_token>
```

### Token olish
`POST /api/v1/accounts/login/` endpointiga username va password yuboring.

### Token yangilash

> ⚠️ **Muhim:** `config/urls.py` da `token/refresh/` endpoint **alohida ro'yxatdan o'tkazilmagan**. Joriy holatda SimpleJWT ning standart refresh URL si ulanmagan.  
> **Token muddati tugasa** — foydalanuvchi qayta `POST /api/v1/accounts/login/` ga so'rov yuborishi kerak.

Agar kelajakda backend da `token/refresh/` qo'shilsa:
```http
POST /api/v1/accounts/token/refresh/
Content-Type: application/json

{
  "refresh": "<refresh_token>"
}
```

**Response `200 OK`:**
```json
{
  "access": "<yangi_access_token>"
}
```

---

## 3. Ruxsatlar (Permissions)

| Ruxsat nomi | Tavsif |
|---|---|
| `IsOwnerPermission` | Faqat `role = "owner"` bo'lgan foydalanuvchilar kirishi mumkin (ob'ekt darajasida ham tekshiriladi) |
| `IsWorkerPermission` | `GET/HEAD/OPTIONS` so'rovlar **autentifikatsiyasiz ham** o'tadi (SAFE_METHODS uchun `return True`); `POST/PUT/PATCH/DELETE` faqat `role = "owner"` yoki `role = "employee"` |
| `IsAuthenticated` | Faqat tizimga kirgan foydalanuvchilar |
| `AllowAny` | Hamma kirishi mumkin (autentifikatsiya talab qilinmaydi) |

### Rollar tizimi
| Role | Display nomi | Huquqlar |
|---|---|---|
| `owner` | Admin | Barcha operatsiyalar |
| `employee` | Xodim | O'quvchilar, davomat, ball, uyga vazifa, xabar va boshqa operatsiyalar |
| `student` | O'quvchi | O'z ma'lumotlarini ko'rish, imtihon topshirish |

---

## 4. Foydalanuvchilar (Accounts)

**Base URL:** `/api/v1/accounts/`

---

### 4.1 Login

```http
POST /api/v1/accounts/login/
```

**Ruxsat:** Hammaga ochiq (`AllowAny`)

**Request Body:**
```json
{
  "username": "string (min 1 belgi)",
  "password": "string (min 1 belgi)"
}
```

**Response `200 OK`:**
```json
{
  "tokens": {
    "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "user": {
    "id": 1,
    "username": "admin_user",
    "role": "owner",
    "full_name": "Ali Valiyev"
  }
}
```

> ⚠️ JWT tokenning `payload` qismida `role` field ham mavjud.

**Response `401 Unauthorized`:**
```json
{
  "detail": "Invalid credentials"
}
```

**Response `400 Bad Request`:**
```json
{
  "non_field_errors": ["Username va Password kiritish majburiy!"]
}
```

---

### 4.2 Dashboard / Statistika

```http
GET /api/v1/accounts/dashboard/
```

**Ruxsat:** `IsAuthenticated` + `IsOwnerPermission`

**Response `200 OK`:**
```json
{
  "students": {
    "total": 120
  },
  "workers": {
    "total": 8
  },
  "groups": {
    "total": 15
  },
  "payments": {
    "total": 45000000,
    "this_month": 8500000
  },
  "cashouts": {
    "total": 12000000,
    "this_month": 2000000
  }
}
```

> `students.total` — faqat **active guruhlardagi** o'quvchilar soni.  
> `payments.this_month` va `cashouts.this_month` — joriy oy (toshkent vaqt zonasi).

---

### 4.3 Owner (Admin) CRUD

**Base URL:** `/api/v1/accounts/owners/`  
**Ruxsat:** `IsAuthenticated` + `IsOwnerPermission`

#### Barcha ownerlarni ko'rish
```http
GET /api/v1/accounts/owners/
```

**Response `200 OK`:**
```json
[
  {
    "id": 1,
    "username": "superadmin",
    "first_name": "Ali",
    "last_name": "Valiyev",
    "phone": "+998901234567",
    "telegram_id": "123456789",
    "role": "owner",
    "is_active": true,
    "is_staff": true,
    "is_superuser": true,
    "last_login": "2026-02-20T10:00:00+05:00",
    "created_at": "2025-01-01T00:00:00+05:00",
    "date_joined": "2025-01-01T00:00:00+05:00"
  }
]
```

> **Eslatma:** `parent_phone`, `group`, `groups`, `user_permissions` fieldlari ownerda yo'q.

#### Yangi owner yaratish
```http
POST /api/v1/accounts/owners/
```

**Request Body:**
```json
{
  "username": "yangi_admin",
  "password": "qattiqParol123",
  "first_name": "Sardor",
  "last_name": "Toshmatov",
  "phone": "+998901234567",
  "telegram_id": "987654321"
}
```

> - `username` kamida **6** belgi  
> - `password` kamida **8** belgi  
> - `role` avtomatik `"owner"` bo'ladi, `is_staff=true`, `is_superuser=true`

**Response `201 Created`:** Yaratilgan owner ob'ekti.

#### Bitta ownerni ko'rish
```http
GET /api/v1/accounts/owners/{id}/
```

#### Ownerni yangilash
```http
PUT /api/v1/accounts/owners/{id}/
PATCH /api/v1/accounts/owners/{id}/
```

> `password` o'zgartirilsa, kamida **8** belgi bo'lishi kerak.

#### Ownerni o'chirish
```http
DELETE /api/v1/accounts/owners/{id}/
```

**Response `204 No Content`**

---

### 4.4 Worker (Xodim) CRUD

**Base URL:** `/api/v1/accounts/workers/`  
**Ruxsat:** `IsAuthenticated` + `IsOwnerPermission`

#### Barcha workerlarni ko'rish
```http
GET /api/v1/accounts/workers/
```

**Response `200 OK`:**
```json
[
  {
    "id": 5,
    "username": "teacher01",
    "first_name": "Jasur",
    "last_name": "Rahimov",
    "phone": "+998911234567",
    "telegram_id": "55512345",
    "role": "employee",
    "is_active": true,
    "is_staff": true,
    "is_superuser": false,
    "last_login": "2026-02-21T08:30:00+05:00",
    "created_at": "2025-03-01T00:00:00+05:00",
    "date_joined": "2025-03-01T00:00:00+05:00"
  }
]
```

#### Yangi worker yaratish
```http
POST /api/v1/accounts/workers/
```

**Request Body:**
```json
{
  "username": "yangi_teacher",
  "password": "parol12345",
  "first_name": "Aziz",
  "last_name": "Karimov",
  "phone": "+998901112233",
  "telegram_id": "111222333"
}
```

> - `role` avtomatik `"employee"` bo'ladi, `is_staff=true`

**Response `201 Created`:** Yaratilgan worker ob'ekti.

#### Workerni ko'rish / Yangilash / O'chirish
```http
GET    /api/v1/accounts/workers/{id}/
PUT    /api/v1/accounts/workers/{id}/
PATCH  /api/v1/accounts/workers/{id}/
DELETE /api/v1/accounts/workers/{id}/
```

---

### 4.5 Student (O'quvchi) CRUD

**Base URL:** `/api/v1/accounts/students/`  
**Ruxsat:** `IsAuthenticated`

#### Barcha o'quvchilarni ko'rish
```http
GET /api/v1/accounts/students/
```

**Query Parametrlar:**
| Parametr | Tur | Tavsif |
|---|---|---|
| `group_id` | integer | Guruh ID si bo'yicha filtrlash |

**Misol:**
```http
GET /api/v1/accounts/students/?group_id=3
```

**Response `200 OK`:**
```json
[
  {
    "id": 12,
    "username": "student01",
    "first_name": "Bobur",
    "last_name": "Ergashev",
    "phone": "+998909876543",
    "parent_phone": "+998901111111",
    "telegram_id": "444555666",
    "role": "student",
    "is_active": true,
    "is_staff": false,
    "is_superuser": false,
    "last_login": "2026-02-20T15:00:00+05:00",
    "created_at": "2025-09-01T00:00:00+05:00",
    "date_joined": "2025-09-01T00:00:00+05:00",
    "all_score": 450,
    "group": {
      "id": 3,
      "name": "Python B guruh"
    }
  }
]
```

> `all_score` — o'quvchining **barcha ballari yig'indisi**.

#### Yangi o'quvchi yaratish
```http
POST /api/v1/accounts/students/
```

**Request Body:**
```json
{
  "username": "yangi_student",
  "password": "parol12345",
  "first_name": "Sherzod",
  "last_name": "Umarov",
  "phone": "+998931234567",
  "parent_phone": "+998907654321",
  "telegram_id": "777888999",
  "group": 3
}
```

> - `role` avtomatik `"student"` bo'ladi  
> - `group` — faqat `is_active=true` bo'lgan guruh qabul qilinadi

**Response `201 Created`:** Yaratilgan student ob'ekti.

#### O'quvchini ko'rish / Yangilash / O'chirish
```http
GET    /api/v1/accounts/students/{id}/
PUT    /api/v1/accounts/students/{id}/
PATCH  /api/v1/accounts/students/{id}/
DELETE /api/v1/accounts/students/{id}/
```

---

### 4.6 O'quvchilar Reytingi

```http
GET /api/v1/accounts/students/rating/
```

**Ruxsat:** `IsAuthenticated`

**Query Parametrlar:**
| Parametr | Tur | Majburiy | Tavsif |
|---|---|---|---|
| `group_id` | integer | Ha | Guruh ID si |

**Misol:**
```http
GET /api/v1/accounts/students/rating/?group_id=3
```

**Response `200 OK`:**
```json
[
  {
    "id": 12,
    "username": "student01",
    "first_name": "Bobur",
    "last_name": "Ergashev",
    "total_score": 850,
    "rank": 1,
    "group_name": "Python B guruh"
  },
  {
    "id": 15,
    "username": "student02",
    "first_name": "Zafar",
    "last_name": "Ortiqov",
    "total_score": 700,
    "rank": 2,
    "group_name": "Python B guruh"
  }
]
```

> O'quvchilar `total_score` bo'yicha **kamayish tartibida** saralanadi. Teng ball bo'lsa, `created_at` bo'yicha saralanadi.

**Response `400 Bad Request`:**
```json
{
  "error": "group_id parametri kerak."
}
```

---

### 4.7 Telegram Xabarlar (Messages)

**Base URL:** `/api/v1/accounts/messages/`  
**Ruxsat:** `IsAuthenticated` + `IsWorkerPermission`

#### Barcha xabarlarni ko'rish
```http
GET /api/v1/accounts/messages/
```

**Response `200 OK`:**
```json
[
  {
    "id": 1,
    "text": "Bugun dars bo'lmaydi!",
    "recipient_ids": [],
    "recipients": [12, 15, 18],
    "logs": [
      {
        "id": 1,
        "recipient": 12,
        "recipient_name": "Bobur Ergashev",
        "status": "sent",
        "error": null,
        "sent_at": "2026-02-20T10:05:00+05:00",
        "is_completed": false,
        "updated_at": "2026-02-20T10:05:00+05:00",
        "message": 1
      }
    ],
    "created_at": "2026-02-20T10:00:00+05:00"
  }
]
```

#### Yangi xabar yuborish
```http
POST /api/v1/accounts/messages/
```

**Request Body:**
```json
{
  "text": "Ertaga dars vaqti o'zgartirildi!",
  "recipient_ids": [12, 15, 18, 20]
}
```

> - `sent_by` avtomatik joriy foydalanuvchi  
> - Faqat `role="student"` bo'lgan foydalanuvchilar qabul qiluvchi bo'la oladi  
> - Xabar yuborilgach Celery orqali asinxron `send_telegram_message` vazifasi ishga tushadi  
> - Har bir qabul qiluvchi uchun `MessageLog` yaratiladi

**Response `201 Created`:**
```json
{
  "id": 2,
  "text": "Ertaga dars vaqti o'zgartirildi!",
  "recipients": [12, 15, 18, 20],
  "logs": [...],
  "created_at": "2026-02-21T09:00:00+05:00"
}
```

#### Xabarni ko'rish / Yangilash / O'chirish
```http
GET    /api/v1/accounts/messages/{id}/
PUT    /api/v1/accounts/messages/{id}/
PATCH  /api/v1/accounts/messages/{id}/
DELETE /api/v1/accounts/messages/{id}/
```

---

### 4.8 Xabar Loglari (Message Logs)

```http
GET /api/v1/accounts/message/logs/{message_id}/
```

**Ruxsat:** `IsAuthenticated` + `IsWorkerPermission`

**Path Parameters:**
| Parametr | Tur | Tavsif |
|---|---|---|
| `message_id` | integer | Xabar ID si |

**Response `200 OK`:**
```json
[
  {
    "id": 1,
    "recipient": 12,
    "recipient_name": "Bobur Ergashev",
    "status": "sent",
    "error": null,
    "sent_at": "2026-02-20T10:05:30+05:00",
    "is_completed": false,
    "updated_at": "2026-02-20T10:05:30+05:00",
    "message": 1
  },
  {
    "id": 2,
    "recipient": 15,
    "recipient_name": "Zafar Ortiqov",
    "status": "failed",
    "error": "O'quvchining telegram_id si yo'q",
    "sent_at": null,
    "is_completed": false,
    "updated_at": "2026-02-20T10:05:31+05:00",
    "message": 1
  }
]
```

**MessageLog `status` qiymatlari:**
| Qiymat | Ma'nosi |
|---|---|
| `pending` | Kutilmoqda |
| `sent` | Muvaffaqiyatli yuborildi |
| `failed` | Xatolik yuz berdi |

---

## 5. Ta'lim (Education)

**Base URL:** `/api/v1/education/`

---

### 5.1 Fanlar (Subjects)

**Base URL:** `/api/v1/education/subjects/`  
**Ruxsat:** `IsAuthenticated` + `IsWorkerPermission`

#### Barcha fanlarni ko'rish
```http
GET /api/v1/education/subjects/
```

**Response `200 OK`:**
```json
[
  {
    "id": 1,
    "name": "Python dasturlash",
    "created_at": "2025-01-05T00:00:00+05:00"
  },
  {
    "id": 2,
    "name": "Web dizayn",
    "created_at": "2025-01-05T00:00:00+05:00"
  }
]
```

#### Yangi fan yaratish
```http
POST /api/v1/education/subjects/
```

**Request Body:**
```json
{
  "name": "Java dasturlash"
}
```

> `name` unikal bo'lishi kerak.

**Response `201 Created`:**
```json
{
  "id": 3,
  "name": "Java dasturlash",
  "created_at": "2026-02-21T10:00:00+05:00"
}
```

#### Fanni ko'rish / Yangilash / O'chirish
```http
GET    /api/v1/education/subjects/{id}/
PUT    /api/v1/education/subjects/{id}/
PATCH  /api/v1/education/subjects/{id}/
DELETE /api/v1/education/subjects/{id}/
```

---

### 5.2 Guruhlar (Groups)

**Base URL:** `/api/v1/education/groups/`  
**Ruxsat:** `IsAuthenticated` + `IsWorkerPermission`

#### Barcha guruhlarni ko'rish
```http
GET /api/v1/education/groups/
```

**Response `200 OK`:**
```json
[
  {
    "id": 3,
    "name": "Python B guruh",
    "description": "Kechki Python kursi",
    "subject": 1,
    "subject_name": "Python dasturlash",
    "teacher": 5,
    "teacher_name": "Jasur Rahimov",
    "is_active": true,
    "days": "Mon,Wed,Fri",
    "start_time": "18:00:00",
    "end_time": "20:00:00",
    "created_at": "2025-09-01T00:00:00+05:00",
    "group_total_score": 12500,
    "students_count": 15,
    "homework_count": 30
  }
]
```

**Qo'shimcha fieldlar:**
| Field | Tavsif |
|---|---|
| `group_total_score` | Guruhdagi barcha o'quvchilarning umumiy bali |
| `students_count` | Guruhdagi o'quvchilar soni |
| `homework_count` | Guruhga berilgan uyga vazifalar soni |
| `subject_name` | Fan nomi (string) |
| `teacher_name` | O'qituvchi to'liq ismi |

#### Yangi guruh yaratish
```http
POST /api/v1/education/groups/
```

**Request Body:**
```json
{
  "name": "Python A guruh",
  "description": "Ertalabki Python kursi",
  "subject": 1,
  "teacher": 5,
  "is_active": true,
  "days": "Tue,Thu,Sat",
  "start_time": "09:00:00",
  "end_time": "11:00:00"
}
```

**Response `201 Created`:** Yaratilgan guruh ob'ekti.

#### Guruhni ko'rish / Yangilash / O'chirish
```http
GET    /api/v1/education/groups/{id}/
PUT    /api/v1/education/groups/{id}/
PATCH  /api/v1/education/groups/{id}/
DELETE /api/v1/education/groups/{id}/
```

---

### 5.3 Guruhlar Reytingi

```http
GET /api/v1/education/groups/rating/
```

**Ruxsat:** `IsAuthenticated` + `IsWorkerPermission`

**Response `200 OK`:**
```json
[
  {
    "id": 3,
    "name": "Python B guruh",
    "subject_name": "Python dasturlash",
    "total_score": 12500,
    "rank": 1,
    "students_count": 15
  },
  {
    "id": 4,
    "name": "Python A guruh",
    "subject_name": "Python dasturlash",
    "total_score": 10200,
    "rank": 2,
    "students_count": 12
  }
]
```

> Faqat `is_active=true` guruhlar qaytariladi. `total_score` bo'yicha kamayish tartibida.

---

### 5.4 Davomat (Attendance)

**Base URL:** `/api/v1/education/attendance/`  
**Ruxsat:** `IsAuthenticated` + `IsWorkerPermission`

#### Barcha davomatlarni ko'rish
```http
GET /api/v1/education/attendance/
```

**Response `200 OK`:**
```json
[
  {
    "id": 1,
    "student": {
      "id": 12,
      "first_name": "Bobur",
      "last_name": "Ergashev",
      "username": "student01"
    },
    "group": {
      "id": 3,
      "name": "Python B guruh"
    },
    "status": "keldi",
    "date": "2026-02-21",
    "time": "18:05:00",
    "marked_by": 5,
    "created_at": "2026-02-21T18:05:00+05:00",
    "updated_at": "2026-02-21T18:05:00+05:00"
  }
]
```

**Davomat `status` qiymatlari:**
| Qiymat | Ma'nosi |
|---|---|
| `keldi` | Keldi |
| `kechikdi` | Kechikib keldi |
| `kelmadi` | Kelmadi |

#### Davomat belgilash (bitta)
```http
POST /api/v1/education/attendance/
```

**Request Body:**
```json
{
  "student": 12,
  "group": 3,
  "status": "keldi"
}
```

> - `marked_by` avtomatik joriy foydalanuvchi  
> - Faqat `role="student"` foydalanuvchi `student` sifatida qabul qilinadi  
> - Faqat `is_active=true` guruh qabul qilinadi  
> - Davomat belgilanganda, agar foydalanuvchi `employee` bo'lsa, `TeacherLog` avtomatik yangilanadi (signal orqali)

**Response `201 Created`:** Yaratilgan davomat ob'ekti.

#### Davomatni ko'rish / Yangilash / O'chirish
```http
GET    /api/v1/education/attendance/{id}/
PUT    /api/v1/education/attendance/{id}/
PATCH  /api/v1/education/attendance/{id}/
DELETE /api/v1/education/attendance/{id}/
```

---

### 5.5 Ommaviy Davomat (Bulk Attendance)

```http
POST /api/v1/education/attendance/bulk_create/
```

**Ruxsat:** `IsAuthenticated` + `IsWorkerPermission`

**Request Body:**
```json
{
  "group_id": 3
}
```

> **Shart va tekshirishlar:**  
> 1. `group_id` majburiy  
> 2. `owner` bo'lmagan foydalanuvchi uchun qo'shimcha tekshirishlar:  
>    - Bugun guruhning **dars kuni** bo'lishi kerak. `Group.days` field quyidagi 3 harfli inglizcha qisqartmalar, vergul bilan ajratilgan holda bo'lishi kerak:  
>      `Sun` (Yakshanba), `Mon` (Dushanba), `Tue` (Seshanba), `Wed` (Chorshanba), `Thu` (Payshanba), `Fri` (Juma), `Sat` (Shanba)  
>      Misol: `"Mon,Wed,Fri"` yoki `"Tue,Thu,Sat"`  
>    - Joriy vaqt dars vaqtidan **±15 daqiqa** ichida bo'lishi kerak (`start_time - 15 daq` dan `end_time + 15 daq` gacha)  
>    - Agar guruhda `days` yoki `start_time/end_time` belgilanmagan bo'lsa — vaqt tekshiruvi o'tkazib yuboriladi  
> 3. Agar bugun allaqachon davomat belgilangan bo'lsa, mavjud yozuvlar qaytariladi (takrorlanmaydi)

**Response `200 OK`** (allaqachon mavjud davomat qaytariladi):
```json
[
  {
    "id": 1,
    "student": {"id": 12, "first_name": "Bobur", "last_name": "Ergashev", "username": "student01"},
    "group": {"id": 3, "name": "Python B guruh"},
    "status": "kelmadi",
    "date": "2026-02-21",
    "time": "18:00:00",
    "marked_by": 5,
    "created_at": "...",
    "updated_at": "..."
  }
]
```

> Dastlab barcha o'quvchilar **`kelmadi`** statusida yaratiladi. Keyin har birini alohida `PATCH` orqali yangilash mumkin.

**Response `400 Bad Request`:**
```json
{
  "error": "Bugun guruhning dars kuni emas. (Mon,Wed,Fri)"
}
```
```json
{
  "error": "Dars vaqti emas. (18:00:00-20:00:00)"
}
```

---

### 5.6 Ballar (Scores)

**Base URL:** `/api/v1/education/scores/`  
**Ruxsat:** `IsAuthenticated` + `IsWorkerPermission`

#### Barcha ballarni ko'rish
```http
GET /api/v1/education/scores/
```

**Response `200 OK`:**
```json
[
  {
    "id": 1,
    "student": {
      "id": 12,
      "first_name": "Bobur",
      "last_name": "Ergashev",
      "username": "student01"
    },
    "group": {
      "id": 3,
      "name": "Python B guruh"
    },
    "score": 85,
    "date": "2026-02-21",
    "given_by": {
      "id": 5,
      "first_name": "Jasur",
      "last_name": "Rahimov"
    },
    "created_at": "2026-02-21T18:30:00+05:00",
    "updated_at": "2026-02-21T18:30:00+05:00"
  }
]
```

#### Yangi ball berish
```http
POST /api/v1/education/scores/
```

**Request Body:**
```json
{
  "student": 12,
  "group": 3,
  "score": 85
}
```

> - `score`: 0 dan 100 gacha (`MaxValueValidator(100)`)  
> - `given_by` avtomatik joriy foydalanuvchi  
> - Faqat `is_active=true` guruh  
> - Ball berilganda, agar foydalanuvchi `employee` bo'lsa, `TeacherLog` avtomatik yangilanadi

**Response `201 Created`:** Yaratilgan ball ob'ekti.

#### Balni ko'rish / Yangilash / O'chirish
```http
GET    /api/v1/education/scores/{id}/
PUT    /api/v1/education/scores/{id}/
PATCH  /api/v1/education/scores/{id}/
DELETE /api/v1/education/scores/{id}/
```

---

### 5.7 Uyga Vazifa (Homework)

**Base URL:** `/api/v1/education/homework/`  
**Ruxsat:** `IsAuthenticated` + `IsWorkerPermission`

#### Barcha uyga vazifalarni ko'rish
```http
GET /api/v1/education/homework/
```

**Response `200 OK`:**
```json
[
  {
    "id": 1,
    "group": 3,
    "created_by": 5,
    "text": "1-10 mashqlarni bajaring",
    "file": "http://example.com/media/homework/file.pdf",
    "created_at": "2026-02-20T18:00:00+05:00",
    "updated_at": "2026-02-20T18:00:00+05:00"
  }
]
```

#### Yangi uyga vazifa qo'shish
```http
POST /api/v1/education/homework/
Content-Type: multipart/form-data
```

**Request Body (form-data):**
| Field | Tur | Tavsif |
|---|---|---|
| `group` | integer | Guruh ID si (majburiy) |
| `text` | string | Vazifa matni (ixtiyoriy, agar `file` yo'q bo'lsa majburiy) |
| `file` | file | Fayl yuklash (ixtiyoriy, agar `text` yo'q bo'lsa majburiy) |

> `text` yoki `file` — ikkalasidan kamida bittasi bo'lishi kerak.  
> `created_by` avtomatik joriy foydalanuvchi.

**Response `201 Created`:** Yaratilgan uyga vazifa ob'ekti.

#### Uyga vazifani ko'rish / Yangilash / O'chirish
```http
GET    /api/v1/education/homework/{id}/
PUT    /api/v1/education/homework/{id}/
PATCH  /api/v1/education/homework/{id}/
DELETE /api/v1/education/homework/{id}/
```

---

### 5.8 O'quvchi Uyga Vazifalari

```http
GET /api/v1/education/homework/my-homework/
```

**Ruxsat:** `IsAuthenticated` (faqat `role="student"`)

**Response `200 OK`:**
```json
[
  {
    "id": 1,
    "group": 3,
    "created_by": 5,
    "text": "1-10 mashqlarni bajaring",
    "file": null,
    "created_at": "2026-02-20T18:00:00+05:00",
    "updated_at": "2026-02-20T18:00:00+05:00"
  }
]
```

> O'quvchining **o'z guruhiga** tegishli uyga vazifalar qaytariladi.  
> Agar o'quvchining guruhi yo'q bo'lsa — bo'sh array `[]` qaytariladi.

**Response `403 Forbidden`** (student bo'lmagan foydalanuvchi):
```json
{
  "detail": "Not a student"
}
```

---

### 5.9 O'qituvchi Dars Loglari (TeacherLog)

**Base URL:** `/api/v1/education/teacher-logs/`  
**Ruxsat:** `IsAuthenticated` + `IsWorkerPermission`

> **Eslatma:** TeacherLog faqat `GET` (o'qish) operatsiyalarini qo'llab-quvvatlaydi. Yozuvlar avtomatik ravishda **signal** orqali yaratiladi: davomat yoki ball belgilanganida `process_teacher_activity` servisi chaqiriladi.

#### Barcha loglarni ko'rish
```http
GET /api/v1/education/teacher-logs/
```

**Query Parametrlar:**
| Parametr | Tur | Tavsif |
|---|---|---|
| `teacher_id` | integer | O'qituvchi ID si bo'yicha filter |
| `group_id` | integer | Guruh ID si bo'yicha filter |
| `date_from` | date (YYYY-MM-DD) | Boshlang'ich sana |
| `date_to` | date (YYYY-MM-DD) | Tugash sana |
| `status` | string | Status bo'yicha filter (`dars_otdi`, `dars_otmadi`, `orin_bosdi`) |

**Response `200 OK`:**
```json
[
  {
    "id": 1,
    "teacher": {
      "id": 5,
      "username": "teacher01",
      "first_name": "Jasur",
      "last_name": "Rahimov",
      "role": "employee"
    },
    "group": 3,
    "group_name": "Python B guruh",
    "group_subject": "Python dasturlash",
    "date": "2026-02-21",
    "status": "dars_otdi",
    "status_display": "Dars o'tdi",
    "replaced_for": null,
    "replaced_for_name": null,
    "created_at": "2026-02-21T18:30:00+05:00",
    "updated_at": "2026-02-21T18:30:00+05:00"
  }
]
```

**TeacherLog `status` qiymatlari:**
| Qiymat | Ma'nosi |
|---|---|
| `dars_otdi` | Dars o'tdi |
| `dars_otmadi` | Dars o'tmadi |
| `orin_bosdi` | O'rin bosdi (boshqa o'qituvchi o'rnida dars o'tdi) |

#### Bitta logni ko'rish
```http
GET /api/v1/education/teacher-logs/{id}/
```

#### Mening Loglarim
```http
GET /api/v1/education/teacher-logs/my-logs/
```

> Joriy autentifikatsiyalangan o'qituvchining dars loglari. Sahifalash qo'llab-quvvatlanadi.

**Response:** Sahifalangan log ro'yxati.

#### Guruh Loglari
```http
GET /api/v1/education/teacher-logs/group-logs/?group_id=3
```

**Query Parametrlar:**
| Parametr | Tur | Majburiy | Tavsif |
|---|---|---|---|
| `group_id` | integer | Ha | Guruh ID si |

**Response `400 Bad Request`:**
```json
{
  "error": "group_id parametri kerak"
}
```

#### Statistika
```http
GET /api/v1/education/teacher-logs/stat/
```

**Query Parametrlar:**
| Parametr | Tur | Tavsif |
|---|---|---|
| `teacher_id` | integer | O'qituvchi ID si (ixtiyoriy) |
| `date_from` | date | Boshlang'ich sana (ixtiyoriy) |
| `date_to` | date | Tugash sana (ixtiyoriy) |

**Response `200 OK`:**
```json
{
  "total_lessons": 45,
  "dars_otdi": 40,
  "dars_otmadi": 3,
  "orin_bosdi": 2,
  "efficiency": 88.89
}
```

> `efficiency` — o'qituvchining dars o'tish foizi (`dars_otdi / total * 100`).

---

## 6. Imtihonlar (Exams)

**Base URL:** `/api/v1/exams/`

---

### 6.1 Imtihon CRUD

**Base URL:** `/api/v1/exams/exams/`  
**Ruxsat:** `IsWorkerPermission` (LIST/DETAIL uchun authenticated user, CREATE/UPDATE/DELETE uchun `owner` yoki `employee`)

#### Barcha imtihonlarni ko'rish
```http
GET /api/v1/exams/exams/
```

**Response `200 OK`:**
```json
[
  {
    "id": 1,
    "subject": 1,
    "subject_name": "Python dasturlash",
    "title": "Python 1-modul imtihoni",
    "code": "PY2025AB",
    "description": "1-modul uchun yozma imtihon",
    "time_limit": 3600,
    "is_published": true,
    "date": "2026-02-21",
    "created_at": "2026-02-01T10:00:00+05:00",
    "questions_count": 20,
    "participants_count": 15
  }
]
```

#### Yangi imtihon yaratish (savollar bilan)
```http
POST /api/v1/exams/exams/
```

**Request Body:**
```json
{
  "subject": 1,
  "title": "Python 2-modul imtihoni",
  "description": "2-modul uchun test imtihoni",
  "time_limit": 1800,
  "date": "2026-03-01",
  "questions": [
    {
      "text": "Python necha yilda yaratilgan?",
      "type": "test",
      "score": 5,
      "order": 1,
      "options": [
        {"text": "1989", "order": 1},
        {"text": "1991", "order": 2},
        {"text": "1995", "order": 3},
        {"text": "2001", "order": 4}
      ]
    },
    {
      "text": "Django frameworkni tushuntiring",
      "type": "written",
      "score": 20,
      "order": 2,
      "options": []
    }
  ]
}
```

> - `code` avtomatik 8 belgili unikal kod generatsiya qilinadi  
> - `created_by` avtomatik joriy foydalanuvchi  
> - `is_published` default `false`  
> - `time_limit` soniyada (0 = chegarasiz)

**Savol (`Question`) `type` qiymatlari:**
| Qiymat | Ma'nosi |
|---|---|
| `test` | Test savoli (a,b,c,d variantlari) |
| `written` | Yozma savol |

> ⚠️ **Diqqat:** `QuestionSerializer` faqat `['id', 'text', 'type', 'score', 'order', 'options']` fieldlarini qabul qiladi. `written_answer_sample` field serializer da **yo'q**, shuning uchun API orqali yuborilsa e'tiborga olinmaydi. Bu field faqat model darajasida mavjud.

**Response `201 Created`:** Yaratilgan imtihon ob'ekti (savollar bilan).

#### Imtihon detali (savollar bilan)
```http
GET /api/v1/exams/exams/{id}/
```

**Response `200 OK`:**
```json
{
  "id": 1,
  "subject": 1,
  "title": "Python 1-modul imtihoni",
  "code": "PY2025AB",
  "description": "...",
  "time_limit": 3600,
  "is_published": true,
  "date": "2026-02-21",
  "created_at": "2026-02-01T10:00:00+05:00",
  "questions": [
    {
      "id": 1,
      "text": "Python necha yilda yaratilgan?",
      "type": "test",
      "score": 5,
      "order": 1,
      "options": [
        {"id": 1, "text": "1989", "order": 1},
        {"id": 2, "text": "1991", "order": 2},
        {"id": 3, "text": "1995", "order": 3},
        {"id": 4, "text": "2001", "order": 4}
      ]
    }
  ]
}
```

#### Imtihonni yangilash
```http
PUT   /api/v1/exams/exams/{id}/
PATCH /api/v1/exams/exams/{id}/
```

> `questions` ro'yxati yuborilsa, barcha eski savollar **o'chirilib**, yangisi yoziladi.

#### Imtihonni o'chirish
```http
DELETE /api/v1/exams/exams/{id}/
```

---

### 6.2 Imtihonni Nashr Etish / Bekor Qilish

#### Nashr etish
```http
POST /api/v1/exams/exams/{id}/publish/
```

**Ruxsat:** `IsWorkerPermission`

**Response `200 OK`:**
```json
{
  "status": "Test nashr etildi"
}
```

#### Nashrdan olish
```http
POST /api/v1/exams/exams/{id}/unpublish/
```

**Response `200 OK`:**
```json
{
  "status": "Test nashrdan olindi"
}
```

---

### 6.3 Imtihon Nusxalash

```http
POST /api/v1/exams/exams/{id}/copy/
```

**Ruxsat:** `IsWorkerPermission`

> Imtihon to'liq nusxalanadi (barcha savollar va variantlar bilan). Yangi imtihon:  
> - Nomi: `{Asl nom} (Nusxa)`  
> - Yangi unikal `code` generatsiya qilinadi  
> - `is_published = false`

**Response `200 OK`:** Nusxa qilingan imtihon ob'ekti (savollar bilan).

---

### 6.4 Kod orqali Imtihon Topish

```http
POST /api/v1/exams/exams/enter-code/
```

**Ruxsat:** `IsWorkerPermission`

> ⚠️ **Muhim:** `ExamViewSet` da `permission_classes = [IsWorkerPermission]` o'rnatilgan. `IsWorkerPermission` POST so'rovlar uchun `role in ['owner', 'employee']` tekshiruvi qiladi. **Shuning uchun `student` rolida bu endpointga so'rov yuborilsa `403 Forbidden` qaytadi.** Bu backend dagi permission konfiguratsiya muammosi.

**Request Body:**
```json
{
  "code": "PY2025AB"
}
```

**Response `200 OK`:** Imtihon ob'ekti (savollar bilan, lekin **to'g'ri javobsiz**).

**Response `404 Not Found`:**
```json
{
  "error": "Test x nog'i mavjud emas"
}
```

**Response `400 Bad Request`:**
```json
{
  "error": "Code is required"
}
```

---

### 6.5 Imtihon Topshirish (Submit)

```http
POST /api/v1/exams/exams/{id}/submit/
```

**Ruxsat:** `IsWorkerPermission` (ExamViewSet dan meros)

> ⚠️ **Muhim backend muammosi:** `ExamViewSet` `IsWorkerPermission` ishlatadi. POST metodlar uchun faqat `owner` va `employee` ruxsati bor. Logika bo'yicha `student` topshirishi kerak bo'lsa ham, joriy holda **`student` bu endpointga murojaat qilsa `403 Forbidden`** qaytaradi. Frontend uchun shu holatni hisobga olish kerak yoki backendda bu action uchun alohida permission belgilash kerak.

**Request Body:**
```json
{
  "answers": [
    {
      "question_id": 1,
      "option_id": 2
    },
    {
      "question_id": 2,
      "written_answer": "Django - bu Python asosidagi MVT arxitekturasiga asoslangan web framework..."
    }
  ]
}
```

**Qoidalar:**
- Imtihon `is_published=true` bo'lishi kerak
- Bir o'quvchi bir imtihonni faqat **bir marta** topshira oladi
- Test savoli uchun `option_id`, yozma savol uchun `written_answer` yuborish kerak
- Barcha javoblar `earned_score=0` bilan saqlanadi — o'qituvchi keyinchalik baholaydi

**Response `200 OK`:**
```json
{
  "id": 10,
  "exam": 1,
  "student": 12,
  "score": 0.0,
  "correct_answers": 0,
  "total_questions": 20,
  "is_checked": false,
  "checked_by": null,
  "created_at": "2026-02-21T14:00:00+05:00",
  "answers": [
    {
      "id": 1,
      "question": 1,
      "question_text": "Python necha yilda yaratilgan?",
      "option": 2,
      "option_text": "1991",
      "written_answer": null,
      "earned_score": 0.0,
      "comment": null
    }
  ]
}
```

**Response `400 Bad Request`:**
```json
{
  "error": "Siz bu testni allaqachon topshirgansiz."
}
```

---

### 6.6 Imtihon Natijalarini Baholash (Grade)

```http
POST /api/v1/exams/exam-results/{id}/grade/
```

**Ruxsat:** `IsAuthenticated` + (`owner` yoki `employee` role)

**Request Body:**
```json
{
  "grades": [
    {
      "answer_id": 1,
      "earned_score": 5.0,
      "comment": "To'g'ri javob"
    },
    {
      "answer_id": 2,
      "earned_score": 15.0,
      "comment": "Yaxshi tushuntirilgan, lekin misol etishmayapti"
    }
  ]
}
```

> **Hisoblash logikasi:**  
> 1. Har bir javobning `earned_score` yangilanadi  
> 2. Umumiy `score` = `(jami earned_score / jami mumkin ball) * 100`  
> 3. `correct_answers` = `earned_score >= question.score` bo'lgan javoblar soni  
> 4. `is_checked = true`, `checked_by` = joriy foydalanuvchi

**Response `200 OK`:** Baholangan natija ob'ekti (barcha javoblar bilan).

**Response `403 Forbidden`:**
```json
{
  "detail": "Ruxsat berilmagan."
}
```

---

### 6.7 Imtihon Natijalari (Exam Results)

**Base URL:** `/api/v1/exams/exam-results/`  
**Ruxsat:** `IsAuthenticated`

> - `student` rolida bo'lgan foydalanuvchilar faqat o'zlarining **`is_checked=true`** natijalarini ko'ra oladi  
> - `owner` va `employee` barcha natijalarni ko'ra oladi

#### Barcha natijalarni ko'rish
```http
GET /api/v1/exams/exam-results/
```

**Response `200 OK`:**
```json
[
  {
    "id": 10,
    "exam": 1,
    "student": 12,
    "score": 87.5,
    "correct_answers": 17,
    "total_questions": 20,
    "is_checked": true,
    "checked_by": 5,
    "created_at": "2026-02-21T14:00:00+05:00"
  }
]
```

#### Bitta natijani ko'rish
```http
GET /api/v1/exams/exam-results/{id}/
```

#### Natijani yangilash
```http
PUT   /api/v1/exams/exam-results/{id}/
PATCH /api/v1/exams/exam-results/{id}/
```

> `score`, `correct_answers`, `is_checked`, `checked_by` fieldlari `read_only` — bu endpointlar orqali o'zgartirilmaydi. Baholash uchun faqat `/grade/` endpointi ishlatiladi.

#### Natijani o'chirish
```http
DELETE /api/v1/exams/exam-results/{id}/
```

**Response `204 No Content`**

---

### 6.8 Mening Natijalarim

```http
GET /api/v1/exams/exam-results/my-results/
```

**Ruxsat:** `IsAuthenticated`

> Joriy foydalanuvchining barcha imtihon natijalari (tekshirilgan va tekshirilmaganlar).

**Response `200 OK`:**
```json
[
  {
    "id": 10,
    "exam": 1,
    "student": 12,
    "score": 87.5,
    "correct_answers": 17,
    "total_questions": 20,
    "is_checked": true,
    "checked_by": 5,
    "created_at": "2026-02-21T14:00:00+05:00"
  }
]
```

---

## 7. Moliya (Finance)

**Base URL:** `/api/v1/finance/`

---

### 7.1 To'lovlar (Payments)

**Base URL:** `/api/v1/finance/payments/`  
**Ruxsat:** `IsAuthenticated`

#### Barcha to'lovlarni ko'rish
```http
GET /api/v1/finance/payments/
```

**Response `200 OK`:**
```json
[
  {
    "id": 1,
    "student": {
      "id": 12,
      "first_name": "Bobur",
      "last_name": "Ergashev",
      "username": "student01"
    },
    "group": 3,
    "months_paid": 2,
    "amount": "800000.00",
    "received_by": {
      "id": 5,
      "first_name": "Jasur",
      "last_name": "Rahimov",
      "username": "teacher01",
      "role": "employee"
    },
    "created_at": "2026-02-01T10:00:00+05:00",
    "months": [
      {
        "id": 1,
        "year": 2026,
        "month": 1,
        "month_name": "Yanvar"
      },
      {
        "id": 2,
        "year": 2026,
        "month": 2,
        "month_name": "Fevral"
      }
    ]
  }
]
```

#### Yangi to'lov qabul qilish
```http
POST /api/v1/finance/payments/
```

**Request Body:**
```json
{
  "student": 12,
  "group": 3,
  "amount": "800000.00",
  "months": [
    {"year": 2026, "month": 1},
    {"year": 2026, "month": 2}
  ]
}
```

> - `received_by` avtomatik joriy foydalanuvchi  
> - `months_paid` avtomatik `months` ro'yxati uzunligiga teng  
> - Har bir `(payment, year, month)` kombinatsiyasi unikal bo'lishi kerak

**Response `201 Created`:** Yaratilgan to'lov ob'ekti.

#### To'lovni ko'rish / Yangilash / O'chirish
```http
GET    /api/v1/finance/payments/{id}/
PUT    /api/v1/finance/payments/{id}/
PATCH  /api/v1/finance/payments/{id}/
DELETE /api/v1/finance/payments/{id}/
```

> `PUT/PATCH` da `months` yuborilsa, eski oylar o'chirilib yangilari yoziladi.

---

### 7.2 Mening To'lovlarim

```http
GET /api/v1/finance/payments/my-payments/
```

**Ruxsat:** `IsAuthenticated`

> O'quvchi o'zining barcha to'lovlarini ko'rishi uchun.

**Response `200 OK`:** O'quvchiga tegishli to'lovlar ro'yxati.

---

### 7.3 Xarajatlar (Expenses)

**Base URL:** `/api/v1/finance/expenses/`  
**Ruxsat:** `IsAuthenticated`

#### Barcha xarajatlarni ko'rish
```http
GET /api/v1/finance/expenses/
```

**Response `200 OK`:**
```json
[
  {
    "id": 1,
    "recipient": "Ijara - Yunusobod filiali",
    "recipient_user": {
      "id": 5,
      "username": "teacher01",
      "first_name": "Jasur",
      "last_name": "Rahimov",
      "role": "employee"
    },
    "amount": 2000000,
    "reason": "Ijara",
    "created_at": "2026-02-01T09:00:00+05:00"
  }
]
```

#### Yangi xarajat qo'shish
```http
POST /api/v1/finance/expenses/
```

**Request Body:**
```json
{
  "recipient": "O'qituvchi Jasur maoshi",
  "amount": 3000000,
  "reason": "Maosh"
}
```

> - `recipient_user` avtomatik joriy foydalanuvchi (xarajatni kim yozganini belgilaydi)  
> - `recipient` — ixtiyoriy matn (kimga/nimaga)  
> - `amount` musbat butun son

**Response `201 Created`:** Yaratilgan xarajat ob'ekti.

#### Xarajatni ko'rish / Yangilash / O'chirish
```http
GET    /api/v1/finance/expenses/{id}/
PUT    /api/v1/finance/expenses/{id}/
PATCH  /api/v1/finance/expenses/{id}/
DELETE /api/v1/finance/expenses/{id}/
```

---

## 8. Ma'lumot Modellari

### CustomUser (Foydalanuvchi)
| Field | Tur | Tavsif |
|---|---|---|
| `id` | integer | Birlamchi kalit |
| `username` | string | Foydalanuvchi nomi (unikal, min 6 belgi) |
| `password` | string | Parol (min 8 belgi, faqat yozish) |
| `first_name` | string | Ism |
| `last_name` | string | Familiya |
| `role` | string | `owner`, `employee`, `student` |
| `phone` | string | Telefon raqami |
| `parent_phone` | string | Ota-ona telefoni (faqat student) |
| `telegram_id` | string | Telegram ID |
| `group` | FK | Guruh (faqat student) |
| `is_active` | boolean | Faol/nofarol |
| `is_staff` | boolean | Admin panelga kirish |
| `is_superuser` | boolean | Superadmin |
| `created_at` | datetime | Yaratilgan vaqt |
| `date_joined` | datetime | Qo'shilgan vaqt |

### Group (Guruh)
| Field | Tur | Tavsif |
|---|---|---|
| `id` | integer | Birlamchi kalit |
| `name` | string | Guruh nomi |
| `description` | string | Tavsif |
| `subject` | FK | Fan |
| `teacher` | FK | Asosiy o'qituvchi |
| `is_active` | boolean | Faol/nofarol |
| `days` | string | Dars kunlari (`Mon,Wed,Fri`) |
| `start_time` | time | Boshlanish vaqti |
| `end_time` | time | Tugash vaqti |

### Attendance (Davomat)
| Field | Tur | Tavsif |
|---|---|---|
| `id` | integer | Birlamchi kalit |
| `student` | FK | O'quvchi |
| `group` | FK | Guruh |
| `status` | string | `keldi`, `kechikdi`, `kelmadi` |
| `date` | date | Sana (auto) |
| `time` | time | Vaqt (auto) |
| `marked_by` | FK | Kim belgilagan |

### Score (Ball)
| Field | Tur | Tavsif |
|---|---|---|
| `id` | integer | Birlamchi kalit |
| `student` | FK | O'quvchi |
| `group` | FK | Guruh |
| `score` | integer | Ball (0-100) |
| `date` | date | Sana (auto) |
| `given_by` | FK | Kim bergan |

### Exam (Imtihon)
| Field | Tur | Tavsif |
|---|---|---|
| `id` | integer | Birlamchi kalit |
| `subject` | FK | Fan |
| `title` | string | Imtihon nomi |
| `code` | string | Unikal kod (8 belgi) |
| `description` | text | Tavsif |
| `time_limit` | integer | Vaqt chegarasi (soniya, 0=chegarasiz) |
| `is_published` | boolean | Nashr etilgan/etilmagan |
| `date` | date | Imtihon sanasi |
| `created_by` | FK | Yaratgan foydalanuvchi |

### ExamResult (Imtihon Natijasi)
| Field | Tur | Tavsif |
|---|---|---|
| `id` | integer | Birlamchi kalit |
| `exam` | FK | Imtihon |
| `student` | FK | O'quvchi |
| `score` | float | Foizda ball (0-100) |
| `correct_answers` | integer | To'g'ri javoblar soni |
| `total_questions` | integer | Jami savollar soni |
| `is_checked` | boolean | Baholangan/baholanmagan |
| `checked_by` | FK | Kim baholagan |

### Payment (To'lov)
| Field | Tur | Tavsif |
|---|---|---|
| `id` | integer | Birlamchi kalit |
| `student` | FK | O'quvchi |
| `group` | FK | Guruh |
| `months_paid` | integer | To'langan oylar soni (auto) |
| `amount` | decimal | Miqdor |
| `received_by` | FK | Kim qabul qilgan |
| `months` | array | To'langan oylar ro'yxati |

### Expense (Xarajat)
| Field | Tur | Tavsif |
|---|---|---|
| `id` | integer | Birlamchi kalit |
| `recipient` | string | Kimga/nimaga |
| `recipient_user` | FK | Agar xodim bo'lsa |
| `amount` | integer | Miqdor (so'm) |
| `reason` | string | Sabab (Maosh, Ijara, va h.k.) |

---

## 9. Xato Kodlari

| HTTP Kodi | Ma'nosi | Sabab |
|---|---|---|
| `200 OK` | Muvaffaqiyatli | GET, PUT, PATCH, POST (ayrim) |
| `201 Created` | Yaratildi | POST |
| `204 No Content` | O'chirildi | DELETE |
| `400 Bad Request` | Noto'g'ri so'rov | Validatsiya xatosi |
| `401 Unauthorized` | Autentifikatsiya kerak | Token yo'q yoki noto'g'ri |
| `403 Forbidden` | Ruxsat yo'q | Role yetarli emas |
| `404 Not Found` | Topilmadi | ID noto'g'ri |
| `405 Method Not Allowed` | Metod ruxsat etilmagan | Noto'g'ri HTTP metod |

**Xato response formati:**
```json
{
  "detail": "Xato haqida ma'lumot"
}
```
yoki validatsiya xatosi:
```json
{
  "field_name": ["Xato tavsifi"],
  "non_field_errors": ["Umumiy xato"]
}
```

---

## 10. Muhit O'zgaruvchilari (.env)

```env
# Django
SECRET_KEY=your_very_secret_key_here
DEBUG=True

# PostgreSQL (ixtiyoriy, default SQLite)
DB_NAME=hpa_db
DB_USER=postgres
DB_PASSWORD=your_db_password
DB_HOST=localhost
DB_PORT=5432

# Telegram Bot
TELEGRAM_BOT_TOKEN=1234567890:AAF-your-bot-token-here

# Redis (Celery uchun)
# Default: redis://127.0.0.1:6379/0
```

---

## Tezkor Yo'riqnoma (Frontend uchun)

### Autentifikatsiya oqimi
```
1. POST /api/v1/accounts/login/  →  access + refresh token
2. Barcha so'rovlarda: Authorization: Bearer <access_token>
3. Token muddati tugasa: POST /api/v1/accounts/token/refresh/
```

### Rolga qarab foydalanish
```
owner   → Barcha API endpointlariga to'liq kirish
employee → O'quvchi CRUD yo'q (faqat o'qish), boshqa barcha operatsiyalar
student  → Faqat o'z ma'lumotlari: /my-homework/, /my-results/, /my-payments/
            va /students/rating/?group_id=X
```

### Tipik oqim (O'qituvchi uchun)
```
1. Login → token olish
2. GET /api/v1/education/groups/ → guruhlar ro'yxati
3. POST /api/v1/education/attendance/bulk_create/ → {group_id: X} → davomat yaratish
4. PATCH /api/v1/education/attendance/{id}/ → har birining statusini yangilash
5. POST /api/v1/education/scores/ → ball berish
6. POST /api/v1/accounts/messages/ → telegram xabar yuborish
```

### Tipik oqim (O'quvchi uchun)
```
1. Login → token olish
2. GET /api/v1/accounts/students/rating/?group_id=X → reyting
3. GET /api/v1/education/homework/my-homework/ → uyga vazifalar
4. GET /api/v1/exams/exam-results/my-results/ → natijalarni ko'rish
5. GET /api/v1/finance/payments/my-payments/ → to'lovlarni ko'rish
```

> ⚠️ **Joriy holat:** `enter-code` va `submit` endpointlari `ExamViewSet` da `IsWorkerPermission` bilan himoyalangan (POST metodlar). Student bu endpointlardan foydalana olmaydi. Frontend da imtihon topshirish funksiyasi ishlashi uchun backendda exam submit va enter-code action lari uchun alohida permission (`IsAuthenticated`) qo'yilishi kerak.

---

> **Swagger UI:** `https://www.harry-potter.uz/swdoc/`  
> **ReDoc:** `https://www.harry-potter.uz/redoc/`  
> **Aloqa:** oybekrozievich@gmail.com  
> **© 2025 MEA. Barcha huquqlar himoyalangan.**
