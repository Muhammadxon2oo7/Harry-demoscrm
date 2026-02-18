# Harry Potter Academy (HPA) - To'liq Backend API Dokumentatsiyasi

> **Versiya**: v1.0  
> **Tayyorlangan sana**: 18 Fevral, 2026  
> **Base URL**: `https://api.harry-potter.uz/api/v1/`  
> **Mock Test API Base URL**: `https://api.harry-potter.uz/api/v1/mock/`

---

## 📋 Mundarija

1. [Kirish (Introduction)](#kirish)
2. [Authentication (Autentifikatsiya)](#authentication)
3. [Accounts App API](#accounts-app-api)
   - [Login](#1-login)
   - [Dashboard](#2-dashboard)
   - [Subjects (Fanlar)](#3-subjects-fanlar)
   - [Groups (Guruhlar)](#4-groups-guruhlar)
   - [Users Management](#5-users-management)
   - [Attendance (Davomat)](#6-attendance-davomat)
   - [Scores (Baholar)](#7-scores-baholar)
   - [Homework (Uyga vazifa)](#8-homework-uyga-vazifa)
   - [Payments (To'lovlar)](#9-payments-tolovlar)
   - [Expenses (Chiqimlar)](#10-expenses-chiqimlar)
   - [Exams (Imtihonlar)](#11-exams-imtihonlar)
   - [Exam Results](#12-exam-results)
   - [Work Logs (Ish hisoboti)](#13-work-logs)
4. [Mock Test App API](#mock-test-app-api)
5. [Database Models](#database-models)
6. [Permissions & Roles](#permissions--roles)
7. [Error Handling](#error-handling)
8. [Appendix](#appendix)

---

## Kirish

Harry Potter Academy (HPA) backend loyihasi Django va Django REST Framework asosida qurilgan. Loyihada ikki asosiy app mavjud:

1. **accounts** - Foydalanuvchilar, guruhlar, davomat, baholar va moliyaviy boshqaruv
2. **mock** - IELTS mock testlar tizimi

### Texnologiyalar:
- **Django**: 5.2.7
- **Django REST Framework**: 3.16.1
- **PostgreSQL**: Database
- **JWT Authentication**: Simple JWT 5.5.1
- **Celery**: 5.5.3 (async tasks)
- **Redis**: Cache va Celery broker
- **Swagger/ReDoc**: API dokumentatsiya

---

## Authentication

### JWT Token Based Authentication

Barcha API endpointlar (login dan tashqari) autentifikatsiya talab qiladi.

#### Token olish:

**Endpoint**: `POST /api/v1/login/`

**Request Body**:
```json
{
  "username": "john_doe",
  "password": "password123"
}
```

**Success Response (200 OK)**:
```json
{
  "tokens": {
    "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "user": {
    "id": 1,
    "username": "john_doe",
    "role": "student",
    "full_name": "John Doe"
  }
}
```

#### Token ishlatish:

Har bir API so'rovida quyidagi header yuborilishi kerak:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Token muddati:
- **Access Token**: 1 kun
- **Refresh Token**: 3 kun

---

## Accounts App API

---

### 1. Login

#### `POST /login/`

Tizimga kirish.

**Permission**: `AllowAny` (Ruxsatsiz)

**Request**:
```json
{
  "username": "student123",
  "password": "mypassword"
}
```

**Response (200)**:
```json
{
  "tokens": {
    "access": "eyJ...",
    "refresh": "eyJ..."
  },
  "user": {
    "id": 5,
    "username": "student123",
    "role": "student",
    "full_name": "Ali Valiyev"
  }
}
```

**Error (401)**:
```json
{
  "detail": "Invalid credentials"
}
```

---

### 2. Dashboard

#### `GET /dashboard/`

Umumiy statistika (moliya, davomat).

**Permission**: `IsAuthenticated`

**Response (200)**:
```json
{
  "finance": {
    "income": 25000000,
    "expense": 8000000,
    "profit": 17000000
  },
  "attendance": {
    "employees_present_today": 7,
    "total_employees": 10
  }
}
```

---

### 3. Subjects (Fanlar)

#### `GET /subjects/`

Barcha fanlarni olish.

**Permission**: `IsAuthenticated`

**Response (200)**:
```json
[
  {
    "id": 1,
    "name": "Ingliz tili",
    "created_at": "2025-01-15T10:00:00Z"
  },
  {
    "id": 2,
    "name": "Matematika",
    "created_at": "2025-01-20T11:30:00Z"
  }
]
```

#### `POST /subjects/`

Yangi fan qo'shish.

**Permission**: `IsAuthenticated`

**Request**:
```json
{
  "name": "Fizika"
}
```

**Response (201)**:
```json
{
  "id": 3,
  "name": "Fizika",
  "created_at": "2026-02-18T09:00:00Z"
}
```

#### `GET /subjects/{id}/`

Bitta fanni olish.

#### `PUT /subjects/{id}/`

Fanni yangilash.

#### `PATCH /subjects/{id}/`

Qisman yangilash.

#### `DELETE /subjects/{id}/`

Fanni o'chirish.

---

### 4. Groups (Guruhlar)

#### `GET /groups/`

Barcha guruhlarni olish.

**Permission**: `IsAuthenticated`

**Response (200)**:
```json
[
  {
    "id": 1,
    "name": "IELTS 6.0 - A1",
    "description": "Beginner level",
    "subject": 1,
    "subject_name": "Ingliz tili",
    "is_active": true,
    "days": "Mon,Wed,Fri",
    "start_time": "14:00:00",
    "end_time": "15:30:00",
    "students_count": 15,
    "homework_count": 8,
    "group_total_score": 125.5,
    "created_at": "2025-01-10T08:00:00Z"
  }
]
```

**Annotated fields**:
- `students_count`: Guruhdagi o'quvchilar soni
- `homework_count`: Guruh uchun berilgan uy vazifalar soni
- `group_total_score`: Guruhning umumiy bali (scores yig'indisi / 10)
- `subject_name`: Fan nomi

#### `POST /groups/`

Yangi guruh yaratish.

**Request**:
```json
{
  "name": "IELTS 7.0 - Advanced",
  "description": "Advanced level group",
  "subject": 1,
  "is_active": true,
  "days": "Tue,Thu",
  "start_time": "16:00:00",
  "end_time": "17:30:00"
}
```

**Response (201)**:
```json
{
  "id": 2,
  "name": "IELTS 7.0 - Advanced",
  "description": "Advanced level group",
  "subject": 1,
  "subject_name": "Ingliz tili",
  "is_active": true,
  "days": "Tue,Thu",
  "start_time": "16:00:00",
  "end_time": "17:30:00",
  "students_count": 0,
  "homework_count": 0,
  "group_total_score": 0,
  "created_at": "2026-02-18T10:00:00Z"
}
```

#### `GET /groups/{id}/`

Bitta guruhni olish.

#### `PUT /groups/{id}/`

Guruhni to'liq yangilash.

#### `PATCH /groups/{id}/`

Guruhni qisman yangilash.

#### `DELETE /groups/{id}/`

Guruhni o'chirish.

---

### 5. Users Management

Tizimda 3 xil foydalanuvchi turi mavjud:
1. **Owner** (Ega/Admin)
2. **Employee** (Xodim/O'qituvchi)
3. **Student** (O'quvchi)

---

#### 5.1 Owners (Egalar)

##### `GET /owners/`

Barcha egallarni olish.

**Permission**: `IsAuthenticated + IsOwnerPermission`

**Response**:
```json
[
  {
    "id": 1,
    "username": "admin_user",
    "first_name": "Oybek",
    "last_name": "Roziev",
    "phone": "+998901234567",
    "telegram_id": "123456789",
    "role": "owner",
    "is_active": true,
    "is_staff": true,
    "is_superuser": true,
    "last_login": "2026-02-18T08:00:00Z",
    "date_joined": "2025-01-01T00:00:00Z",
    "created_at": "2025-01-01T00:00:00Z"
  }
]
```

##### `POST /owners/`

Yangi owner qo'shish.

**Request**:
```json
{
  "username": "new_admin",
  "password": "securepass123",
  "first_name": "Test",
  "last_name": "Admin",
  "phone": "+998991234567"
}
```

**Validation**:
- `username` kamida 6 belgi
- `password` kamida 8 belgi

**Response (201)**:
```json
{
  "id": 2,
  "username": "new_admin",
  "first_name": "Test",
  "last_name": "Admin",
  "phone": "+998991234567",
  "telegram_id": null,
  "role": "owner",
  "is_active": true,
  "is_staff": true,
  "is_superuser": true,
  "created_at": "2026-02-18T11:00:00Z"
}
```

##### `PUT/PATCH /owners/{id}/`

Ownerni yangilash (parolni o'zgartirish ham mumkin).

##### `DELETE /owners/{id}/`

Ownerni o'chirish.

---

#### 5.2 Workers (Xodimlar)

##### `GET /workers/`

Barcha xodimlarni olish.

**Permission**: `IsAuthenticated + IsOwnerPermission`

**Response**:
```json
[
  {
    "id": 3,
    "username": "teacher_john",
    "first_name": "John",
    "last_name": "Smith",
    "phone": "+998901112233",
    "telegram_id": null,
    "role": "employee",
    "is_active": true,
    "is_staff": true,
    "is_superuser": false,
    "last_login": "2026-02-18T07:30:00Z",
    "created_at": "2025-02-01T09:00:00Z"
  }
]
```

##### `POST /workers/`

Yangi xodim qo'shish.

**Request**:
```json
{
  "username": "teacher_sara",
  "password": "password123",
  "first_name": "Sara",
  "last_name": "Johnson",
  "phone": "+998903334455"
}
```

**Validation**:
- `username` kamida 6 belgi
- `password` kamida 8 belgi

**Response (201)**: Owner response ga o'xshash, `role: "employee"`

##### `PUT/PATCH /workers/{id}/`

Xodimni yangilash.

##### `DELETE /workers/{id}/`

Xodimni o'chirish.

---

#### 5.3 Students (O'quvchilar)

##### `GET /students/`

Barcha o'quvchilarni olish.

**Permission**: `IsAuthenticated`

**Query Params**:
- `group_id` (optional): Guruh bo'yicha filtrlash

**Example**: `GET /students/?group_id=1`

**Response**:
```json
[
  {
    "id": 10,
    "username": "student_ali",
    "first_name": "Ali",
    "last_name": "Valiyev",
    "phone": "+998905556677",
    "parent_phone": "+998907778899",
    "telegram_id": "987654321",
    "role": "student",
    "is_active": true,
    "group": {
      "id": 1,
      "name": "IELTS 6.0 - A1"
    },
    "all_score": 135.5,
    "created_at": "2025-03-01T10:00:00Z"
  }
]
```

**Annotated fields**:
- `all_score`: O'quvchining umumiy bali (barcha scorelari yig'indisi)
- `group`: Object ko'rinishida guruh ma'lumotlari

##### `POST /students/`

Yangi o'quvchi qo'shish.

**Request**:
```json
{
  "username": "student_bob",
  "password": "password123",
  "first_name": "Bob",
  "last_name": "Brown",
  "phone": "+998906667788",
  "parent_phone": "+998909998877",
  "group": 1
}
```

**Validation**:
- `username` kamida 6 belgi
- `password` kamida 8 belgi
- `group` active bo'lishi kerak

**Response (201)**:
```json
{
  "id": 11,
  "username": "student_bob",
  "first_name": "Bob",
  "last_name": "Brown",
  "phone": "+998906667788",
  "parent_phone": "+998909998877",
  "telegram_id": null,
  "role": "student",
  "is_active": true,
  "group": {
    "id": 1,
    "name": "IELTS 6.0 - A1"
  },
  "all_score": 0,
  "created_at": "2026-02-18T12:00:00Z"
}
```

##### `GET /students/{id}/`

Bitta o'quvchini olish.

##### `PUT/PATCH /students/{id}/`

O'quvchini yangilash.

##### `DELETE /students/{id}/`

O'quvchini o'chirish.

---

### 6. Attendance (Davomat)

#### `GET /attendance/`

Barcha davomat yozuvlarini olish.

**Permission**: `IsAuthenticated`

**Response**:
```json
[
  {
    "id": 1,
    "student": {
      "id": 10,
      "first_name": "Ali",
      "last_name": "Valiyev",
      "username": "student_ali"
    },
    "group": {
      "id": 1,
      "name": "IELTS 6.0 - A1"
    },
    "status": "keldi",
    "date": "2026-02-18",
    "time": "14:05:30",
    "marked_by": 3,
    "created_at": "2026-02-18T14:05:30Z",
    "updated_at": "2026-02-18T14:05:30Z"
  }
]
```

**Status options**:
- `keldi` - Keldi
- `kechikdi` - Kechikib keldi
- `kelmadi` - Kelmadi

#### `POST /attendance/`

Yakka davomat qo'shish.

**Request**:
```json
{
  "student": 10,
  "group": 1,
  "status": "keldi"
}
```

**Response (201)**: Yuqoridagi response formatidagi ob'ekt

#### `POST /attendance/bulk_create/`

Guruh uchun barcha o'quvchilarni bir vaqtda "kelmadi" deb belgilash.

**Request**:
```json
{
  "group_id": 1
}
```

**Logic**:
1. Bugungi sana uchun guruhning barcha o'quvchilari uchun davomat yaratiladi (agar mavjud bo'lmasa)
2. Default status: `kelmadi`
3. Agar allaqachon bugungi sana uchun davomat mavjud bo'lsa, mavjud yozuvlar qaytariladi

**Business Rules** (owner emas bo'lsa):
- Bugungi kun guruhning dars kuni bo'lishi kerak (`days` field)
- Hozirgi vaqt dars vaqtidan ±15 daqiqa ichida bo'lishi kerak

**Response (200)**:
```json
[
  {
    "id": 1,
    "student": {...},
    "group": {...},
    "status": "kelmadi",
    "date": "2026-02-18",
    ...
  },
  ...
]
```

**Error Examples**:
```json
{
  "error": "Bugun guruhning dars kuni emas. (Mon,Wed,Fri)"
}
```

```json
{
  "error": "Dars vaqti emas. (14:00:00-15:30:00)"
}
```

#### `PATCH /attendance/{id}/`

Davomat statusini yangilash.

**Request**:
```json
{
  "status": "keldi"
}
```

#### `DELETE /attendance/{id}/`

Davomat yozuvini o'chirish.

---

### 7. Scores (Baholar)

#### `GET /scores/`

Barcha baholarni olish.

**Permission**: `IsAuthenticated`

**Response**:
```json
[
  {
    "id": 1,
    "student": {
      "id": 10,
      "first_name": "Ali",
      "last_name": "Valiyev",
      "username": "student_ali"
    },
    "group": {
      "id": 1,
      "name": "IELTS 6.0 - A1"
    },
    "score": 85,
    "date": "2026-02-18",
    "given_by": {
      "id": 3,
      "first_name": "John",
      "last_name": "Smith"
    },
    "created_at": "2026-02-18T15:00:00Z",
    "updated_at": "2026-02-18T15:00:00Z"
  }
]
```

#### `POST /scores/`

Baho berish.

**Request**:
```json
{
  "student": 10,
  "group": 1,
  "score": 85
}
```

**Validation**:
- `student` role="student" bo'lishi kerak
- `group` active bo'lishi kerak

**Response (201)**: Yuqoridagi response formatidagi ob'ekt

**Note**: `given_by` avtomatik ravishda request.user ga o'rnatiladi

#### `GET /scores/{id}/`

Bitta bahoni olish.

#### `PUT/PATCH /scores/{id}/`

Bahoni yangilash.

#### `DELETE /scores/{id}/`

Bahoni o'chirish.

---

### 8. Homework (Uyga vazifa)

#### `GET /homework/`

Barcha uy vazifalarni olish.

**Permission**: `IsAuthenticated`

**Response**:
```json
[
  {
    "id": 1,
    "group": 1,
    "created_by": 3,
    "text": "Exercise 5 - Pages 45-50",
    "file": "http://api.harry-potter.uz/media/homework/file123.pdf",
    "created_at": "2026-02-17T10:00:00Z",
    "updated_at": "2026-02-17T10:00:00Z"
  }
]
```

#### `POST /homework/`

Uy vazifa berish.

**Content-Type**: `multipart/form-data`

**Request (Form Data)**:
```
group: 1
text: "Exercise 5 - Pages 45-50"
file: [FILE]
```

**Validation**:
- `file` yoki `text` dan kamida bittasi bo'lishi shart
- `group` active bo'lishi kerak

**Response (201)**:
```json
{
  "id": 1,
  "group": 1,
  "created_by": 3,
  "text": "Exercise 5 - Pages 45-50",
  "file": "http://api.harry-potter.uz/media/homework/file123.pdf",
  "created_at": "2026-02-18T16:00:00Z",
  "updated_at": "2026-02-18T16:00:00Z"
}
```

#### `GET /homework/my-homework/`

Mening uy vazifalarim (faqat student uchun).

**Permission**: `IsAuthenticated` + `role=student`

**Response**: O'z guruhining uy vazifalarini qaytaradi

**Error (403)**:
```json
{
  "detail": "Not a student"
}
```

#### `GET /homework/{id}/`

Bitta uy vazifani olish.

#### `PUT/PATCH /homework/{id}/`

Uy vazifani yangilash.

#### `DELETE /homework/{id}/`

Uy vazifani o'chirish.

---

### 9. Payments (To'lovlar)

#### `GET /payments/`

Barcha to'lovlarni olish.

**Permission**: `IsAuthenticated`

**Response**:
```json
[
  {
    "id": 1,
    "student": {
      "id": 10,
      "first_name": "Ali",
      "last_name": "Valiyev",
      "username": "student_ali"
    },
    "group": 1,
    "months_paid": 2,
    "amount": "1000000.00",
    "received_by": {
      "id": 1,
      "first_name": "Oybek",
      "last_name": "Roziev",
      "username": "admin_user"
    },
    "months": [
      {
        "id": 1,
        "year": 2026,
        "month": 2,
        "month_name": "Fevral"
      },
      {
        "id": 2,
        "year": 2026,
        "month": 3,
        "month_name": "Mart"
      }
    ],
    "created_at": "2026-02-18T09:00:00Z"
  }
]
```

#### `POST /payments/`

To'lov qabul qilish.

**Request**:
```json
{
  "student": 10,
  "group": 1,
  "amount": 1000000,
  "months": [
    {
      "year": 2026,
      "month": 2
    },
    {
      "year": 2026,
      "month": 3
    }
  ]
}
```

**Logic**:
- `months_paid` avtomatik ravishda `months` array uzunligi bo'yicha hisoblanadi
- `received_by` avtomatik ravishda request.user ga o'rnatiladi

**Response (201)**: Yuqoridagi response formatidagi ob'ekt

#### `GET /payments/my-payments/`

Mening to'lovlarim (faqat student uchun).

**Permission**: `IsAuthenticated`

**Response**: O'z to'lovlarini qaytaradi

#### `GET /payments/{id}/`

Bitta to'lovni olish.

#### `PUT/PATCH /payments/{id}/`

To'lovni yangilash.

**Request**:
```json
{
  "amount": 1200000,
  "months": [
    {
      "year": 2026,
      "month": 2
    },
    {
      "year": 2026,
      "month": 3
    },
    {
      "year": 2026,
      "month": 4
    }
  ]
}
```

**Logic**: Eski `months` o'chiriladi va yangi `months` yaratiladi

#### `DELETE /payments/{id}/`

To'lovni o'chirish.

---

### 10. Expenses (Chiqimlar)

#### `GET /expenses/`

Barcha chiqimlarni olish.

**Permission**: `IsAuthenticated`

**Response**:
```json
[
  {
    "id": 1,
    "recipient": "Landlord",
    "recipient_user": null,
    "amount": "2000000.00",
    "reason": "Ofis ijarasi",
    "created_at": "2026-02-01T10:00:00Z"
  },
  {
    "id": 2,
    "recipient": null,
    "recipient_user": 3,
    "amount": "3000000.00",
    "reason": "Oylik maosh",
    "created_at": "2026-02-05T11:00:00Z"
  }
]
```

#### `POST /expenses/`

Chiqim qo'shish.

**Request**:
```json
{
  "recipient": "Office Supplies Store",
  "recipient_user": null,
  "amount": 500000,
  "reason": "Ofis jihozlari"
}
```

**Note**: 
- `recipient`: Agar tashqi odam/tashkilot bo'lsa
- `recipient_user`: Agar ichki xodim bo'lsa (ID)

**Response (201)**:
```json
{
  "id": 3,
  "recipient": "Office Supplies Store",
  "recipient_user": null,
  "amount": "500000.00",
  "reason": "Ofis jihozlari",
  "created_at": "2026-02-18T14:00:00Z"
}
```

#### `GET /expenses/{id}/`

Bitta chiqimni olish.

#### `PUT/PATCH /expenses/{id}/`

Chiqimni yangilash.

#### `DELETE /expenses/{id}/`

Chiqimni o'chirish.

---

### 11. Exams (Imtihonlar)

#### `GET /exams/`

Barcha imtihonlarni olish.

**Permission**: `IsAuthenticated`

**Response**:
```json
[
  {
    "id": 1,
    "subject": 1,
    "name": "Weekly Test #1",
    "code": "WT2601",
    "date": "2026-02-20",
    "created_by": 3,
    "created_at": "2026-02-15T10:00:00Z"
  }
]
```

#### `POST /exams/`

Yangi imtihon yaratish.

**Request**:
```json
{
  "subject": 1,
  "name": "Weekly Test #2",
  "code": "WT2602",
  "date": "2026-02-27"
}
```

**Note**: `created_by` avtomatik request.user ga o'rnatiladi

**Response (201)**: Yuqoridagi response formatidagi ob'ekt

#### `POST /exams/enter-code/`

Imtihon kodini kiritish (student uchun).

**Request**:
```json
{
  "code": "WT2601"
}
```

**Response (200)**:
```json
{
  "id": 1,
  "subject": 1,
  "name": "Weekly Test #1",
  "code": "WT2601",
  "date": "2026-02-20",
  "created_by": 3,
  "created_at": "2026-02-15T10:00:00Z"
}
```

**Error (404)**:
```json
{
  "detail": "Not found."
}
```

#### `GET /exams/{id}/`

Bitta imtihonni olish.

#### `PUT/PATCH /exams/{id}/`

Imtihonni yangilash.

#### `DELETE /exams/{id}/`

Imtihonni o'chirish.

---

### 12. Exam Results

#### `GET /exam-results/`

Imtihon natijalarini olish.

**Permission**: `IsAuthenticated`

**Logic**: 
- Agar `role=student` bo'lsa, faqat o'z natijalarini ko'radi
- Boshqalar barcha natijalarni ko'radi

**Response**:
```json
[
  {
    "id": 1,
    "exam": 1,
    "student": 10,
    "score": 8.5,
    "correct_answers": 34,
    "total_questions": 40,
    "is_checked": true,
    "checked_by": 3,
    "created_at": "2026-02-20T16:00:00Z"
  }
]
```

#### `POST /exam-results/`

Imtihon natijasini saqlash.

**Request**:
```json
{
  "exam": 1,
  "student": 10,
  "score": 8.5,
  "correct_answers": 34,
  "total_questions": 40,
  "is_checked": true,
  "checked_by": 3
}
```

#### `GET /exam-results/my-results/`

Mening natijalarim (faqat student uchun).

**Permission**: `IsAuthenticated`

**Response**: O'z exam resultlarini qaytaradi

#### `GET /exam-results/{id}/`

Bitta natijani olish.

#### `PUT/PATCH /exam-results/{id}/`

Natijani yangilash.

#### `DELETE /exam-results/{id}/`

Natijani o'chirish.

---

### 13. Work Logs

#### `GET /work-logs/`

Xodimlarning ish hisobotini ko'rish.

**Permission**: `IsAuthenticated`

**Response**:
```json
[
  {
    "id": 1,
    "employee": 3,
    "date": "2026-02-18",
    "status": true,
    "note": "",
    "created_at": "2026-02-18T08:00:00Z"
  }
]
```

**Note**: 
- `status: true` - Ishga keldi
- `status: false` - Kelmadi
- Bu model **ReadOnly** - faqat GET qilish mumkin
- Work log avtomatik yaratiladi xodim biror action bajarganida (davomat, baho, homework)

---

## Mock Test App API

Mock test tizimi IELTS formatidagi testlarni boshqarish uchun mo'ljallangan.

### Base URL: `/api/v1/mock/`

---

### 1. Tests Management

#### `POST /tests/create/`

Yangi test yaratish (Reading, Writing, Listening sectionlari bilan).

**Permission**: `IsAuthenticated + IsWorkerPermission`

**Content-Type**: `multipart/form-data`

**Request**:
```json
{
  "title": "IELTS Practice Test #5",
  "reading": {
    "file": [FILE],
    "duration": 60,
    "question_count": 40
  },
  "writing": {
    "file": [FILE],
    "duration": 60,
    "question_count": 2
  },
  "listening": {
    "audio_file": [AUDIO_FILE],
    "question_file": [FILE],
    "duration": 30,
    "question_count": 40
  }
}
```

**Fields**:
- `title`: Test nomi
- `reading.file`: Reading qismining PDF fayli
- `reading.duration`: Davomiylik (daqiqalarda)
- `reading.question_count`: Savollar soni
- `writing.file`: Writing task fayli
- `writing.duration`: Davomiylik
- `writing.question_count`: Tasklar soni (1 yoki 2)
- `listening.audio_file`: Audio fayl
- `listening.question_file`: Listening savollari PDF
- `listening.duration`: Davomiylik
- `listening.question_count`: Savollar soni

**Response (201)**:
```json
{
  "id": "uuid-here",
  "title": "IELTS Practice Test #5",
  "code": "ABC123",
  "created_by": 3,
  "reading": {
    "id": 1,
    "file": "http://api.harry-potter.uz/media/tests/reading/file.pdf",
    "duration": 60,
    "question_count": 40,
    "created_at": "2026-02-18T10:00:00Z"
  },
  "writing": {...},
  "listening": {...},
  "created_at": "2026-02-18T10:00:00Z",
  "updated_at": "2026-02-18T10:00:00Z"
}
```

**Note**: Test yaratilganda avtomatik ravishda 6 ta belgilik unique `code` generatsiya qilinadi.

#### `GET /tests/`

Barcha testlarni olish.

**Permission**: `IsAuthenticated`

**Response**: Array of tests

#### `GET /tests/{uuid}/`

Bitta testni olish.

#### `DELETE /tests/{uuid}/`

Testni o'chirish.

**Permission**: `IsAuthenticated + IsWorkerPermission`

---

### 2. Test Sessions

#### `POST /session/start/`

Test sessionini boshlash.

**Permission**: `IsAuthenticated`

**Request**:
```json
{
  "test": "uuid-of-test",
  "code": "ABC123"
}
```

**Validation**:
- Test kodi to'g'ri bo'lishi kerak
- User uchun shu test bo'yicha active session mavjud bo'lmasligi kerak

**Response (201)**:
```json
{
  "id": "session-uuid",
  "user": {
    "id": 10,
    "first_name": "Ali",
    "last_name": "Valiyev",
    "group": {
      "id": 1,
      "name": "IELTS 6.0 - A1"
    }
  },
  "test": "uuid-of-test",
  "listening": {
    "id": 1,
    "audio_file": "http://api.harry-potter.uz/media/.../audio.mp3",
    "question_file": "http://api.harry-potter.uz/media/.../questions.pdf",
    "duration": 30,
    "question_count": 40
  },
  "started_at": "2026-02-18T14:00:00Z",
  "ended_at": null,
  "is_completed": false,
  "is_finished": false
}
```

**Logic**: 
- Celery task ishga tushadi: `test.test_duration` sekunddan keyin sessionni avtomatik yakunlaydi
- `test_duration` = (reading.duration + writing.duration + listening.duration + 5) * 60 sekund

#### `GET /session/me/`

Mening test sessionlarim.

**Permission**: `IsAuthenticated`

**Response**:
```json
[
  {
    "id": "session-uuid",
    "user": {...},
    "test": null,
    "started_at": "2026-02-18T14:00:00Z",
    "ended_at": "2026-02-18T16:35:00Z",
    "is_completed": true,
    "is_finished": true,
    "score": {
      "id": 1,
      "listening": 7.5,
      "reading": 8.0,
      "writing": 6.5,
      "speaking": 7.0,
      "score": 7.5,
      "created_by": {
        "id": 3,
        "first_name": "John",
        "last_name": "Smith"
      }
    }
  }
]
```

**Note**: 
- `test` field faqat `is_completed=True` bo'lganda to'liq ma'lumot qaytaradi
- `score` field faqat `is_finished=True` bo'lganda mavjud

#### `GET /session/reading/{session_id}/`

Session uchun Reading qismini olish.

**Permission**: `IsAuthenticated` (faqat sessionning egasi)

**Response**:
```json
{
  "id": 1,
  "file": "http://api.harry-potter.uz/media/tests/reading/test5.pdf",
  "duration": 60,
  "question_count": 40,
  "created_at": "2026-02-18T10:00:00Z",
  "updated_at": "2026-02-18T10:00:00Z"
}
```

#### `GET /session/writing/{session_id}/`

Session uchun Writing qismini olish.

**Permission**: `IsAuthenticated` (faqat sessionning egasi)

#### `POST /session/{uuid}/finish/`

Sessionni yakunlash.

**Permission**: `IsAuthenticated` (faqat sessionning egasi)

**Response (200)**:
```json
{
  "id": "session-uuid",
  "is_completed": true,
  "ended_at": "2026-02-18T16:30:00Z",
  ...
}
```

**Errors**:
- **404**: Session topilmadi
- **403**: Bu session sizga tegishli emas
- **400**: Session allaqachon yakunlangan

---

### 3. Submit Answers

#### `POST /answers/reading/`

Reading javoblarini yuborish.

**Permission**: `IsAuthenticated` (faqat sessionning egasi)

**Request**:
```json
{
  "session": "session-uuid",
  "answers": {
    "1": "A",
    "2": "B",
    "3": "C",
    ...
    "40": "D"
  }
}
```

**Response (201)**:
```json
{
  "id": 1,
  "session": "session-uuid",
  "answers": {...},
  "created_at": "2026-02-18T15:00:00Z",
  "updated_at": "2026-02-18T15:00:00Z"
}
```

#### `POST /answers/writing/`

Writing javoblarini yuborish.

**Permission**: `IsAuthenticated` (faqat sessionning egasi)

**Request**:
```json
{
  "session": "session-uuid",
  "task_number": 1,
  "text": "My essay text here..."
}
```

**Validation**: `task_number` faqat 1 yoki 2 bo'lishi mumkin

**Response (201)**:
```json
{
  "id": 1,
  "session": "session-uuid",
  "task_number": 1,
  "text": "My essay text here...",
  "teacher_comment": null,
  "created_at": "2026-02-18T15:30:00Z",
  "updated_at": "2026-02-18T15:30:00Z"
}
```

**Note**: Task 2 uchun yana bir marta chaqirish kerak `task_number: 2` bilan

#### `POST /answers/listening/`

Listening javoblarini yuborish.

**Permission**: `IsAuthenticated` (faqat sessionning egasi)

**Request**:
```json
{
  "session": "session-uuid",
  "answers": {
    "1": "library",
    "2": "Tuesday",
    ...
    "40": "conclusion"
  }
}
```

**Response (201)**:
```json
{
  "id": 1,
  "session": "session-uuid",
  "answers": {...},
  "created_at": "2026-02-18T14:30:00Z",
  "updated_at": "2026-02-18T14:30:00Z"
}
```

---

### 4. Grading (Baholash)

#### `POST /score/create/`

Test uchun baho berish.

**Permission**: `IsAuthenticated + IsWorkerPermission`

**Request**:
```json
{
  "session": "session-uuid",
  "listening": 7.5,
  "reading": 8.0,
  "writing": 6.5,
  "speaking": 7.0
}
```

**Validation**: 
- Har bir section uchun maksimal bal: 9.0

**Logic**:
- Umumiy ball avtomatik hisoblanadi: `(L + R + W + S) / 4`
- IELTS rounding qoidalari qo'llaniladi (utils.ielts_round)
- Session `is_finished=True` ga o'rnatiladi

**Response (201)**:
```json
{
  "id": 1,
  "session": "session-uuid",
  "listening": 7.5,
  "reading": 8.0,
  "writing": 6.5,
  "speaking": 7.0,
  "score": 7.5,
  "created_by": 3,
  "created_at": "2026-02-18T17:00:00Z",
  "updated_at": "2026-02-18T17:00:00Z"
}
```

**IELTS Rounding Logic**:
```
decimal < 0.25 → round down (7.24 → 7.0)
0.25 ≤ decimal < 0.75 → round to .5 (7.4 → 7.5)
decimal ≥ 0.75 → round up (7.8 → 8.0)
```

#### `PATCH /score/{id}/update/`

Bahoni yangilash.

**Permission**: `IsAuthenticated + IsWorkerPermission`

**Request**:
```json
{
  "writing": 7.0
}
```

**Response (200)**: Updated score object

#### `GET /score/me/`

Mening test baholarim.

**Permission**: `IsAuthenticated`

**Response**:
```json
[
  {
    "id": 1,
    "session": "session-uuid",
    "listening": 7.5,
    "reading": 8.0,
    "writing": 6.5,
    "speaking": 7.0,
    "score": 7.5,
    "created_by": 3,
    "created_at": "2026-02-18T17:00:00Z"
  }
]
```

---

### 5. View Answers (Javoblarni ko'rish)

#### `GET /session/{session_id}/answers/`

Bitta session uchun barcha javoblarni olish.

**Permission**: `IsAuthenticated + IsWorkerPermission`

**Response**:
```json
{
  "session": {
    "id": "session-uuid",
    "user": {...},
    "test": {...},
    "started_at": "2026-02-18T14:00:00Z",
    "ended_at": "2026-02-18T16:35:00Z",
    "is_completed": true,
    "is_finished": true
  },
  "reading_answer": {
    "id": 1,
    "session": "session-uuid",
    "answers": {...}
  },
  "listening_answer": {
    "id": 1,
    "session": "session-uuid",
    "answers": {...}
  },
  "writing_answers": [
    {
      "id": 1,
      "session": "session-uuid",
      "task_number": 1,
      "text": "Essay text...",
      "teacher_comment": null
    },
    {
      "id": 2,
      "session": "session-uuid",
      "task_number": 2,
      "text": "Essay text 2...",
      "teacher_comment": null
    }
  ]
}
```

#### `GET /session/answers/`

Barcha test sessionlarning javoblari (faqat completed).

**Permission**: `IsAuthenticated + IsWorkerPermission`

**Response**: Array of the above format

---

## Database Models

### Accounts App Models

#### CustomUser
```python
{
  "id": Integer,
  "username": String (unique),
  "password": String (hashed),
  "first_name": String,
  "last_name": String,
  "role": Enum ["owner", "employee", "student"],
  "phone": String,
  "parent_phone": String (student uchun),
  "telegram_id": String,
  "group": ForeignKey(Group),
  "is_active": Boolean,
  "is_staff": Boolean,
  "is_superuser": Boolean,
  "last_login": DateTime,
  "date_joined": DateTime,
  "created_at": DateTime
}
```

**Properties**:
- `me_score`: O'quvchining umumiy bali
- `user_rating`: Guruh ichida o'rni

#### Subject
```python
{
  "id": Integer,
  "name": String (unique),
  "created_at": DateTime
}
```

#### Group
```python
{
  "id": Integer,
  "name": String,
  "description": String,
  "subject": ForeignKey(Subject),
  "is_active": Boolean,
  "days": String,  # "Mon,Wed,Fri"
  "start_time": Time,
  "end_time": Time,
  "created_at": DateTime
}
```

**Properties**:
- `group_total_score`: Guruhning umumiy bali / 10

#### Attendance
```python
{
  "id": Integer,
  "student": ForeignKey(CustomUser),
  "group": ForeignKey(Group),
  "status": Enum ["keldi", "kechikdi", "kelmadi"],
  "date": Date,
  "time": Time,
  "marked_by": ForeignKey(CustomUser),
  "created_at": DateTime,
  "updated_at": DateTime
}
```

#### Score
```python
{
  "id": Integer,
  "student": ForeignKey(CustomUser),
  "group": ForeignKey(Group),
  "score": Integer,
  "date": Date,
  "given_by": ForeignKey(CustomUser),
  "created_at": DateTime,
  "updated_at": DateTime
}
```

#### HomeWork
```python
{
  "id": Integer,
  "group": ForeignKey(Group),
  "created_by": ForeignKey(CustomUser),
  "text": Text,
  "file": File,
  "created_at": DateTime,
  "updated_at": DateTime
}
```

#### Payment
```python
{
  "id": Integer,
  "student": ForeignKey(CustomUser),
  "group": ForeignKey(Group),
  "months_paid": Integer,
  "amount": Decimal,
  "received_by": ForeignKey(CustomUser),
  "created_at": DateTime
}
```

#### PaymentMonth
```python
{
  "id": Integer,
  "payment": ForeignKey(Payment),
  "year": Integer,
  "month": Integer,  # 1-12
}
```

**Unique together**: (`payment`, `year`, `month`)

#### Expense
```python
{
  "id": Integer,
  "recipient": String,
  "recipient_user": ForeignKey(CustomUser),
  "amount": Decimal,
  "reason": String,
  "created_at": DateTime
}
```

#### Exam
```python
{
  "id": Integer,
  "subject": ForeignKey(Subject),
  "name": String,
  "code": String (unique),
  "date": Date,
  "created_by": ForeignKey(CustomUser),
  "created_at": DateTime
}
```

#### ExamResult
```python
{
  "id": Integer,
  "exam": ForeignKey(Exam),
  "student": ForeignKey(CustomUser),
  "score": Float,
  "correct_answers": Integer,
  "total_questions": Integer,
  "is_checked": Boolean,
  "checked_by": ForeignKey(CustomUser),
  "created_at": DateTime
}
```

**Unique together**: (`exam`, `student`)

#### WorkLog
```python
{
  "id": Integer,
  "employee": ForeignKey(CustomUser),
  "date": Date,
  "status": Boolean,  # True = keldi
  "note": Text,
  "created_at": DateTime
}
```

**Unique together**: (`employee`, `date`)

---

### Mock App Models

#### Test
```python
{
  "id": UUID,
  "title": String,
  "code": String (unique, 6 chars),
  "created_by": ForeignKey(CustomUser),
  "created_at": DateTime,
  "updated_at": DateTime
}
```

**Properties**:
- `test_duration`: Total test duration in seconds

#### ReadingSection
```python
{
  "id": Integer,
  "test": OneToOne(Test),
  "file": File,
  "duration": Integer,  # minutes
  "question_count": Integer,
  "created_at": DateTime,
  "updated_at": DateTime
}
```

#### WritingSection
```python
{
  "id": Integer,
  "test": OneToOne(Test),
  "file": File,
  "duration": Integer,
  "question_count": Integer,
  "created_at": DateTime,
  "updated_at": DateTime
}
```

#### ListeningSection
```python
{
  "id": Integer,
  "test": OneToOne(Test),
  "audio_file": File,
  "question_file": File,
  "duration": Integer,
  "question_count": Integer,
  "created_at": DateTime,
  "updated_at": DateTime
}
```

#### TestSession
```python
{
  "id": UUID,
  "user": ForeignKey(CustomUser),
  "test": ForeignKey(Test),
  "started_at": DateTime,
  "ended_at": DateTime,
  "is_completed": Boolean,  # User yakunladi
  "is_finished": Boolean    # Baholandi
}
```

#### ReadingAnswer
```python
{
  "id": Integer,
  "session": OneToOne(TestSession),
  "answers": JSON,
  "created_at": DateTime,
  "updated_at": DateTime
}
```

#### WritingAnswer
```python
{
  "id": Integer,
  "session": ForeignKey(TestSession),
  "task_number": Integer,  # 1 or 2
  "text": Text,
  "teacher_comment": Text,
  "created_at": DateTime,
  "updated_at": DateTime
}
```

**Unique together**: (`session`, `task_number`)

#### ListeningAnswer
```python
{
  "id": Integer,
  "session": OneToOne(TestSession),
  "answers": JSON,
  "created_at": DateTime,
  "updated_at": DateTime
}
```

#### MockScore
```python
{
  "id": Integer,
  "session": OneToOne(TestSession),
  "created_by": ForeignKey(CustomUser),
  "listening": Float,
  "reading": Float,
  "writing": Float,
  "speaking": Float,
  "created_at": DateTime,
  "updated_at": DateTime
}
```

**Properties**:
- `total_score`: Average of all 4 sections with IELTS rounding

---

## Permissions & Roles

### Roles

1. **owner** (Ega/Admin)
   - Barcha huquqlarga ega
   - `is_staff=True`, `is_superuser=True`
   - Owners va Workers yaratish/o'zgartirish/o'chirish mumkin

2. **employee** (Xodim/O'qituvchi)
   - `is_staff=True`, `is_superuser=False`
   - Students, Attendance, Scores, Homework boshqarish
   - Mock testlar yaratish va baholash
   - WorkLog avtomatik yaratiladi

3. **student** (O'quvchi)
   - `is_staff=False`, `is_superuser=False`
   - Faqat o'z ma'lumotlarini ko'rish
   - Mock testlarda qatnashish

### Permission Classes

#### IsOwnerPermission
```python
# Faqat owner lar uchun
# Owners va Workers management da ishlatiladi
```

#### IsWorkerPermission
```python
# Owner yoki Employee uchun
# Mock test management da ishlatiladi
```

#### IsAuthenticated
```python
# Django REST Framework default
# Barcha endpoint larda ishlatiladi (login dan tashqari)
```

---

## Error Handling

### Standard HTTP Status Codes

- **200 OK**: Muvaffaqiyatli GET, PUT, PATCH
- **201 Created**: Muvaffaqiyatli POST
- **204 No Content**: Muvaffaqiyatli DELETE
- **400 Bad Request**: Validatsiya xatolik
- **401 Unauthorized**: Token yo'q yoki noto'g'ri
- **403 Forbidden**: Ruxsat yo'q
- **404 Not Found**: Resurs topilmadi
- **500 Internal Server Error**: Server xatolik

### Error Response Format

#### Validation Error (400)
```json
{
  "field_name": [
    "Error message 1",
    "Error message 2"
  ]
}
```

**Example**:
```json
{
  "username": [
    "Username must be at least 6 characters long"
  ],
  "password": [
    "Password must be at least 8 characters long"
  ]
}
```

#### Generic Error
```json
{
  "detail": "Error message"
}
```

**Examples**:
```json
{
  "detail": "Invalid credentials"
}
```

```json
{
  "detail": "You do not have permission to perform this action."
}
```

```json
{
  "detail": "Not found."
}
```

---

## Appendix

### A. Environment Variables

`.env` fayl kerak bo'lgan o'zgaruvchilar:

```env
SECRET_KEY=your-secret-key-here
DEBUG=False

DB_NAME=hpa_database
DB_USER=postgres
DB_PASSWORD=your-db-password
DB_HOST=localhost
DB_PORT=5432
```

### B. Settings Highlights

```python
# Time Zone
TIME_ZONE = 'Asia/Tashkent'

# JWT Settings
ACCESS_TOKEN_LIFETIME = 1 day
REFRESH_TOKEN_LIFETIME = 3 days

# CORS
CORS_ALLOW_ALL_ORIGINS = True

# File Upload
DATA_UPLOAD_MAX_MEMORY_SIZE = 314572800  # ~300MB
FILE_UPLOAD_MAX_MEMORY_SIZE = 314572800

# Celery (Redis)
CELERY_BROKER_URL = "redis://127.0.0.1:6379/0"
```

### C. API Endpoints Summary

#### Accounts App
```
POST   /api/v1/login/
GET    /api/v1/dashboard/

CRUD   /api/v1/subjects/
CRUD   /api/v1/groups/
CRUD   /api/v1/owners/
CRUD   /api/v1/workers/
CRUD   /api/v1/students/
       GET /api/v1/students/?group_id={id}

CRUD   /api/v1/attendance/
       POST /api/v1/attendance/bulk_create/

CRUD   /api/v1/scores/

CRUD   /api/v1/homework/
       GET /api/v1/homework/my-homework/

CRUD   /api/v1/payments/
       GET /api/v1/payments/my-payments/

CRUD   /api/v1/expenses/

CRUD   /api/v1/exams/
       POST /api/v1/exams/enter-code/

CRUD   /api/v1/exam-results/
       GET /api/v1/exam-results/my-results/

GET    /api/v1/work-logs/
```

#### Mock App
```
POST   /api/v1/mock/tests/create/
GET    /api/v1/mock/tests/
GET    /api/v1/mock/tests/{uuid}/
DELETE /api/v1/mock/tests/{uuid}/

POST   /api/v1/mock/session/start/
GET    /api/v1/mock/session/me/
GET    /api/v1/mock/session/reading/{session_id}/
GET    /api/v1/mock/session/writing/{session_id}/
POST   /api/v1/mock/session/{uuid}/finish/
GET    /api/v1/mock/session/{session_id}/answers/
GET    /api/v1/mock/session/answers/

POST   /api/v1/mock/answers/reading/
POST   /api/v1/mock/answers/writing/
POST   /api/v1/mock/answers/listening/

POST   /api/v1/mock/score/create/
GET    /api/v1/mock/score/me/
PATCH  /api/v1/mock/score/{id}/update/
```

### D. Swagger Documentation

Backend loyihada Swagger UI va ReDoc mavjud:

- **Swagger UI**: `https://api.harry-potter.uz/swdoc/`
- **ReDoc**: `https://api.harry-potter.uz/redoc/`

### E. Common Use Cases

#### 1. Yangi o'quvchi qo'shish va guruhga biriktirish
```
1. POST /api/v1/students/
   {
     "username": "new_student",
     "password": "password123",
     "first_name": "John",
     "last_name": "Doe",
     "phone": "+998901234567",
     "group": 1
   }
```

#### 2. Davomat belgilash (guruh uchun)
```
1. POST /api/v1/attendance/bulk_create/
   {"group_id": 1}
   
2. PATCH /api/v1/attendance/{id}/
   {"status": "keldi"}
```

#### 3. To'lov qabul qilish
```
POST /api/v1/payments/
{
  "student": 10,
  "group": 1,
  "amount": 1000000,
  "months": [
    {"year": 2026, "month": 2},
    {"year": 2026, "month": 3}
  ]
}
```

#### 4. Mock test yaratish va session boshlash
```
1. POST /api/v1/mock/tests/create/
   [multipart form data with files]
   
2. POST /api/v1/mock/session/start/
   {
     "test": "test-uuid",
     "code": "ABC123"
   }
   
3. POST /api/v1/mock/answers/reading/
   {"session": "session-uuid", "answers": {...}}
   
4. POST /api/v1/mock/session/{uuid}/finish/
   
5. POST /api/v1/mock/score/create/
   {
     "session": "session-uuid",
     "listening": 7.5,
     "reading": 8.0,
     "writing": 6.5,
     "speaking": 7.0
   }
```

### F. Notes for Frontend Developers

1. **Authorization Header**: Barcha requestlarda `Authorization: Bearer {token}` headerini yuboring

2. **File Uploads**: `multipart/form-data` Content-Type ishlatilishi kerak
   - Homework yaratishda
   - Mock test yaratishda

3. **Date Formats**: 
   - Input: `YYYY-MM-DD`, `DD.MM.YYYY`, `DD/MM/YYYY`
   - Output: `YYYY-MM-DD`

4. **Time Format**: `HH:MM:SS` (24-hour format)

5. **DateTime Format**: ISO 8601: `YYYY-MM-DDTHH:MM:SSZ`

6. **UUID Fields**: Test va TestSession larda UUID ishlatilgan

7. **Pagination**: Default pagination yo'q, barcha natijalar bir requestda qaytariladi

8. **Filtering**: Ayrim endpointlarda query params orqali filtrlash mumkin
   - Students: `?group_id=1`
   - Work Logs: `?employee=1&date=2026-02-18`

9. **Nested Objects**: Response larda ba'zi fieldlar nested object sifatida qaytariladi (student, group, given_by, received_by)

10. **Media Files**: 
    - Base URL: `https://api.harry-potter.uz/media/`
    - Response da to'liq URL qaytariladi

11. **CORS**: Barcha originlarga ruxsat berilgan (development uchun)

---

## Changelog

**v1.0 - 2026-02-18**
- Initial complete documentation
- Accounts app: Auth, Users, Groups, Attendance, Scores, Homework, Payments, Expenses, Exams, WorkLogs
- Mock app: Tests, Sessions, Answers, Grading
- Full API reference with examples
- Database models documentation
- Permissions and roles documentation

---

## Contact & Support

**Developer**: Oybek Roziev  
**Email**: oybekrozievich@gmail.com  
**GitHub**: https://github.com/rozievich/mea  
**License**: © 2025 MEA. All rights reserved.

---

**End of Documentation**
