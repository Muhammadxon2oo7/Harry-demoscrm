# HPA (Harry-Potter Academy) — Frontend API Documentation

> **Base URL:** `https://www.harry-potter.uz`  
> **API Prefix:** `/api/v1/`  
> **Swagger UI:** `/swdoc/` | **ReDoc:** `/redoc/`  
> **Authentication:** JWT (Bearer Token)  
> **Timezone:** Asia/Tashkent  

---

## Mundarija

1. [Autentifikatsiya](#1-autentifikatsiya)
2. [Rollar va Ruxsatlar](#2-rollar-va-ruxsatlar)
3. [Fanlar (Subjects)](#3-fanlar-subjects)
4. [Guruhlar (Groups)](#4-guruhlar-groups)
5. [Adminlar (Owners)](#5-adminlar-owners)
6. [Xodimlar (Workers)](#6-xodimlar-workers)
7. [O'quvchilar (Students)](#7-oquvchilar-students)
8. [Davomat (Attendance)](#8-davomat-attendance)
9. [Ballar (Scores)](#9-ballar-scores)
10. [Vazifalar (Homework)](#10-vazifalar-homework)
11. [To'lovlar (Payments)](#11-tolovlar-payments)
12. [Chiqimlar (Expenses)](#12-chiqimlar-expenses)
13. [Imtihonlar (Exams)](#13-imtihonlar-exams)
14. [Imtihon Natijalari (Exam Results)](#14-imtihon-natijalari-exam-results)
15. [Ish Hisobi (Work Logs)](#15-ish-hisobi-work-logs)
16. [Dashboard / Statistika](#16-dashboard--statistika)
17. [Telegram Xabarlar (Messages)](#17-telegram-xabarlar-messages)
18. [Mock Test (IELTS)](#18-mock-test-ielts)
    - [Testlar](#181-testlar)
    - [Test Sessiyasi](#182-test-sessiyasi)
    - [Javoblar](#183-javoblar)
    - [Natijalar (Scores)](#184-natijalar-scores)
19. [Umumiy Xato Javoblari](#19-umumiy-xato-javoblari)

---

## 1. Autentifikatsiya

### Token olish (Login)

Barcha himoyalangan endpointlar uchun **Authorization** headerida Bearer token yuborish kerak:

```
Authorization: Bearer <access_token>
```

**Access Token** 1 kun, **Refresh Token** 3 kun amal qiladi.

---

### `POST /api/v1/login/`

Foydalanuvchi hisobiga kirish.

**Permission:** Hamma (AllowAny)

#### Request Body

```json
{
  "username": "admin123",
  "password": "secret123"
}
```

| Field      | Type   | Required | Description         |
|------------|--------|----------|---------------------|
| `username` | string | ✅       | Foydalanuvchi nomi  |
| `password` | string | ✅       | Parol (min 8 belgi) |

#### Response `200 OK`

```json
{
  "tokens": {
    "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "user": {
    "id": 1,
    "username": "admin123",
    "role": "owner",
    "full_name": "John Doe"
  }
}
```

> **Muhim:** JWT tokenning `role` field-i tokenning o'zida ham kodlanganki, frontendda `decode` qilib ishlatish mumkin.

#### Response `401 Unauthorized`

```json
{
  "detail": "Invalid credentials"
}
```

---

## 2. Rollar va Ruxsatlar

| Rol        | Qiymat     | Huquqlar                                           |
|------------|------------|----------------------------------------------------|
| Owner/Admin | `owner`   | Hamma amallarni bajarish (CRUD)                    |
| Xodim      | `employee` | Ko'rish + davomat/ball/vazifa yaratish             |
| O'quvchi   | `student`  | Faqat o'z ma'lumotlarini ko'rish                   |

### Permission Qoidalari

- `IsOwnerPermission` — faqat `role == "owner"`
- `IsWorkerPermission` — o'qish (GET) uchun hamma, yozish uchun `owner` yoki `employee`
- `IsAuthenticated` — login bo'lgan barcha foydalanuvchilar

---

## 3. Fanlar (Subjects)

Base URL: `/api/v1/subjects/`

### `GET /api/v1/subjects/`

Barcha fanlar ro'yxati.

**Permission:** IsAuthenticated

#### Response `200 OK`

```json
[
  {
    "id": 1,
    "name": "IELTS",
    "created_at": "2025-01-15T10:30:00+05:00"
  },
  {
    "id": 2,
    "name": "SAT",
    "created_at": "2025-01-16T08:00:00+05:00"
  }
]
```

---

### `POST /api/v1/subjects/`

Yangi fan yaratish.

**Permission:** IsAuthenticated

#### Request Body

```json
{
  "name": "IELTS"
}
```

#### Response `201 Created`

```json
{
  "id": 1,
  "name": "IELTS",
  "created_at": "2025-01-15T10:30:00+05:00"
}
```

---

### `GET /api/v1/subjects/{id}/`

Bitta fanni ko'rish.

#### Response `200 OK`

```json
{
  "id": 1,
  "name": "IELTS",
  "created_at": "2025-01-15T10:30:00+05:00"
}
```

---

### `PUT/PATCH /api/v1/subjects/{id}/`

Fanni yangilash.

#### Request Body

```json
{
  "name": "IELTS (Updated)"
}
```

---

### `DELETE /api/v1/subjects/{id}/`

Fanni o'chirish.

**Response:** `204 No Content`

---

## 4. Guruhlar (Groups)

Base URL: `/api/v1/groups/`

### `GET /api/v1/groups/`

Barcha guruhlar ro'yxati.

**Permission:** IsAuthenticated

#### Response `200 OK`

```json
[
  {
    "id": 1,
    "name": "IELTS-A1",
    "description": "Asosiy guruh",
    "subject": 1,
    "subject_name": "IELTS",
    "is_active": true,
    "days": "Mon,Wed,Fri",
    "start_time": "09:00:00",
    "end_time": "11:00:00",
    "created_at": "2025-01-15T10:30:00+05:00",
    "group_total_score": 1250,
    "students_count": 12,
    "homework_count": 5
  }
]
```

---

### `POST /api/v1/groups/`

Yangi guruh yaratish.

**Permission:** IsAuthenticated

#### Request Body

```json
{
  "name": "IELTS-A1",
  "description": "Asosiy guruh",
  "subject": 1,
  "is_active": true,
  "days": "Mon,Wed,Fri",
  "start_time": "09:00:00",
  "end_time": "11:00:00"
}
```

| Field        | Type    | Required | Description                              |
|--------------|---------|----------|------------------------------------------|
| `name`       | string  | ✅       | Guruh nomi (max 30 belgi)                |
| `subject`    | integer | ✅       | Fan ID                                   |
| `description`| string  | ❌       | Tavsif                                   |
| `is_active`  | boolean | ❌       | Default: `true`                          |
| `days`       | string  | ❌       | `"Mon,Wed,Fri"` formatida                |
| `start_time` | time    | ❌       | `"HH:MM:SS"` formatida                  |
| `end_time`   | time    | ❌       | `"HH:MM:SS"` formatida                  |

#### Response `201 Created`

```json
{
  "id": 1,
  "name": "IELTS-A1",
  "subject": 1,
  "subject_name": "IELTS",
  "is_active": true,
  "days": "Mon,Wed,Fri",
  "start_time": "09:00:00",
  "end_time": "11:00:00",
  "created_at": "2025-01-15T10:30:00+05:00",
  "group_total_score": 0,
  "students_count": 0,
  "homework_count": 0
}
```

---

### `GET /api/v1/groups/{id}/`

Bitta guruhni ko'rish.

---

### `PUT/PATCH /api/v1/groups/{id}/`

Guruhni yangilash.

---

### `DELETE /api/v1/groups/{id}/`

Guruhni o'chirish. **Response:** `204 No Content`

---

### `GET /api/v1/groups/rating/`

Barcha faol guruhlarni umumiy ball bo'yicha reytingda ko'rish.

**Permission:** IsAuthenticated

#### Response `200 OK`

```json
[
  {
    "id": 1,
    "name": "IELTS-A1",
    "subject_name": "IELTS",
    "total_score": 3500,
    "rank": 1,
    "students_count": 15
  },
  {
    "id": 2,
    "name": "SAT-B2",
    "subject_name": "SAT",
    "total_score": 2800,
    "rank": 2,
    "students_count": 10
  }
]
```

---

## 5. Adminlar (Owners)

Base URL: `/api/v1/owners/`

**Permission:** IsAuthenticated + IsOwnerPermission (faqat `owner` ro'li)

### `GET /api/v1/owners/`

Barcha adminlar ro'yxati.

#### Response `200 OK`

```json
[
  {
    "id": 1,
    "username": "superadmin",
    "first_name": "John",
    "last_name": "Doe",
    "phone": "+998901234567",
    "telegram_id": "123456789",
    "role": "owner",
    "created_at": "2025-01-01T00:00:00+05:00"
  }
]
```

---

### `POST /api/v1/owners/`

Yangi admin yaratish.

#### Request Body

```json
{
  "username": "admin001",
  "password": "secure1234",
  "first_name": "Ali",
  "last_name": "Valiyev",
  "phone": "+998901234567",
  "telegram_id": "987654321"
}
```

| Field        | Type   | Required | Validation                         |
|--------------|--------|----------|------------------------------------|
| `username`   | string | ✅       | Min 6 belgi                        |
| `password`   | string | ✅       | Min 8 belgi (write_only)           |
| `first_name` | string | ❌       | —                                  |
| `last_name`  | string | ❌       | —                                  |
| `phone`      | string | ❌       | —                                  |
| `telegram_id`| string | ❌       | —                                  |

#### Response `201 Created`

```json
{
  "id": 5,
  "username": "admin001",
  "first_name": "Ali",
  "last_name": "Valiyev",
  "phone": "+998901234567",
  "telegram_id": "987654321",
  "role": "owner",
  "is_staff": true,
  "is_superuser": true,
  "created_at": "2025-02-19T12:00:00+05:00"
}
```

---

### `GET /api/v1/owners/{id}/`

Bitta adminni ko'rish.

---

### `PUT/PATCH /api/v1/owners/{id}/`

Adminni yangilash. Parol o'zgartirish uchun `password` maydoni kiritiladi.

---

### `DELETE /api/v1/owners/{id}/`

Adminni o'chirish. **Response:** `204 No Content`

---

## 6. Xodimlar (Workers)

Base URL: `/api/v1/workers/`

**Permission:** IsAuthenticated + IsOwnerPermission

### `GET /api/v1/workers/`

Barcha xodimlar ro'yxati.

#### Response `200 OK`

```json
[
  {
    "id": 3,
    "username": "teacher01",
    "first_name": "Bobur",
    "last_name": "Toshmatov",
    "phone": "+998991234567",
    "telegram_id": null,
    "role": "employee",
    "is_staff": true,
    "is_superuser": false,
    "created_at": "2025-01-10T09:00:00+05:00"
  }
]
```

---

### `POST /api/v1/workers/`

Yangi xodim yaratish.

#### Request Body

```json
{
  "username": "teacher01",
  "password": "mypassword1",
  "first_name": "Bobur",
  "last_name": "Toshmatov",
  "phone": "+998991234567"
}
```

| Field        | Type   | Required | Validation               |
|--------------|--------|----------|--------------------------|
| `username`   | string | ✅       | Min 6 belgi              |
| `password`   | string | ✅       | Min 8 belgi (write_only) |
| `first_name` | string | ❌       | —                        |
| `last_name`  | string | ❌       | —                        |
| `phone`      | string | ❌       | —                        |
| `telegram_id`| string | ❌       | —                        |

#### Response `201 Created`

```json
{
  "id": 3,
  "username": "teacher01",
  "first_name": "Bobur",
  "last_name": "Toshmatov",
  "phone": "+998991234567",
  "role": "employee",
  "is_staff": true,
  "is_superuser": false,
  "created_at": "..."
}
```

---

### `GET /api/v1/workers/{id}/`

Bitta xodimni ko'rish.

---

### `PUT/PATCH /api/v1/workers/{id}/`

Xodimni yangilash.

---

### `DELETE /api/v1/workers/{id}/`

Xodimni o'chirish. **Response:** `204 No Content`

---

## 7. O'quvchilar (Students)

Base URL: `/api/v1/students/`

**Permission:** IsAuthenticated

### `GET /api/v1/students/`

Barcha o'quvchilar ro'yxati.

**Query Params:**

| Param      | Type    | Description                     |
|------------|---------|---------------------------------|
| `group_id` | integer | Guruh bo'yicha filter (optional) |

#### Response `200 OK`

```json
[
  {
    "id": 10,
    "username": "student001",
    "first_name": "Jasur",
    "last_name": "Qodirov",
    "phone": "+998900000001",
    "parent_phone": "+998900000002",
    "telegram_id": null,
    "role": "student",
    "group": {
      "id": 1,
      "name": "IELTS-A1"
    },
    "all_score": 250,
    "created_at": "2025-01-20T08:00:00+05:00"
  }
]
```

---

### `POST /api/v1/students/`

Yangi o'quvchi yaratish.

#### Request Body

```json
{
  "username": "student001",
  "password": "qwerty123",
  "first_name": "Jasur",
  "last_name": "Qodirov",
  "phone": "+998900000001",
  "parent_phone": "+998900000002",
  "telegram_id": "111222333",
  "group": 1
}
```

| Field          | Type    | Required | Validation                                |
|----------------|---------|----------|-------------------------------------------|
| `username`     | string  | ✅       | Min 6 belgi                               |
| `password`     | string  | ✅       | Min 8 belgi (write_only)                  |
| `first_name`   | string  | ❌       | —                                         |
| `last_name`    | string  | ❌       | —                                         |
| `phone`        | string  | ❌       | —                                         |
| `parent_phone` | string  | ❌       | —                                         |
| `telegram_id`  | string  | ❌       | —                                         |
| `group`        | integer | ❌       | Faqat `is_active=true` bo'lgan guruh ID   |

#### Response `201 Created`

```json
{
  "id": 10,
  "username": "student001",
  "first_name": "Jasur",
  "last_name": "Qodirov",
  "phone": "+998900000001",
  "parent_phone": "+998900000002",
  "telegram_id": "111222333",
  "role": "student",
  "group": {
    "id": 1,
    "name": "IELTS-A1"
  },
  "all_score": 0,
  "created_at": "..."
}
```

---

### `GET /api/v1/students/{id}/`

Bitta o'quvchini ko'rish.

---

### `PUT/PATCH /api/v1/students/{id}/`

O'quvchini yangilash.

---

### `DELETE /api/v1/students/{id}/`

O'quvchini o'chirish. **Response:** `204 No Content`

---

### `GET /api/v1/students/rating/?group_id={group_id}`

Guruh ichidagi o'quvchilarni ball bo'yicha reyting tartibida ko'rish.

**Permission:** IsAuthenticated

**Query Params:**

| Param      | Type    | Required | Description |
|------------|---------|----------|-------------|
| `group_id` | integer | ✅       | Guruh ID    |

#### Response `200 OK`

```json
[
  {
    "id": 10,
    "username": "student001",
    "first_name": "Jasur",
    "last_name": "Qodirov",
    "total_score": 320,
    "rank": 1,
    "group_name": "IELTS-A1"
  },
  {
    "id": 11,
    "username": "student002",
    "first_name": "Dilnoza",
    "last_name": "Yusupova",
    "total_score": 290,
    "rank": 2,
    "group_name": "IELTS-A1"
  }
]
```

#### Response `400 Bad Request` (group_id yo'q)

```json
{
  "error": "group_id parametri kerak."
}
```

---

## 8. Davomat (Attendance)

Base URL: `/api/v1/attendance/`

**Permission:** IsAuthenticated

### `GET /api/v1/attendance/`

Barcha davomat yozuvlari.

#### Response `200 OK`

```json
[
  {
    "id": 1,
    "student": {
      "id": 10,
      "first_name": "Jasur",
      "last_name": "Qodirov",
      "username": "student001"
    },
    "group": {
      "id": 1,
      "name": "IELTS-A1"
    },
    "status": "keldi",
    "date": "2025-02-19",
    "time": "09:05:00",
    "created_at": "2025-02-19T09:05:00+05:00",
    "updated_at": "2025-02-19T09:05:00+05:00"
  }
]
```

---

### `POST /api/v1/attendance/`

Bitta davomat yozuvi yaratish.

#### Request Body

```json
{
  "student": 10,
  "group": 1,
  "status": "keldi"
}
```

| Field     | Type    | Required | Choices                           |
|-----------|---------|----------|-----------------------------------|
| `student` | integer | ✅       | O'quvchi (student) ID             |
| `group`   | integer | ✅       | Aktiv guruh ID                    |
| `status`  | string  | ✅       | `keldi`, `kechikdi`, `kelmadi`    |

> `marked_by` avtomatik ravishda so'rov yuborgan foydalanuvchiga o'rnatiladi.

#### Response `201 Created`

```json
{
  "id": 1,
  "student": {
    "id": 10,
    "first_name": "Jasur",
    "last_name": "Qodirov",
    "username": "student001"
  },
  "group": {
    "id": 1,
    "name": "IELTS-A1"
  },
  "status": "keldi",
  "date": "2025-02-19",
  "time": "09:05:00",
  "created_at": "2025-02-19T09:05:00+05:00",
  "updated_at": "2025-02-19T09:05:00+05:00"
}
```

---

### `POST /api/v1/attendance/bulk_create/`

Guruhning barcha o'quvchilari uchun bir vaqtda davomat yaratish.

> Agar bugungi davomat allaqachon mavjud bo'lsa — mavjud yozuvlar qaytariladi.  
> `employee` roli uchun dars kuni va dars vaqtini tekshiradi.  
> `owner` roli bu cheklovlardan ozod.

#### Request Body

```json
{
  "group_id": 1
}
```

#### Response `200 OK` (allaqachon mavjud bo'lsa)

```json
[
  {
    "id": 5,
    "student": {
      "id": 10,
      "first_name": "Jasur",
      "last_name": "Qodirov",
      "username": "student001"
    },
    "group": {"id": 1, "name": "IELTS-A1"},
    "status": "kelmadi",
    "date": "2025-02-19",
    "time": "09:00:00"
  }
]
```

#### Response `400 Bad Request` (dars kuni emas)

```json
{
  "error": "Bugun guruhning dars kuni emas. (Mon,Wed,Fri)"
}
```

#### Response `400 Bad Request` (dars vaqti emas)

```json
{
  "error": "Dars vaqti emas. (09:00:00-11:00:00)"
}
```

---

### `GET /api/v1/attendance/{id}/`

Bitta davomat yozuvini ko'rish.

---

### `PUT/PATCH /api/v1/attendance/{id}/`

Davomat statusini yangilash (masalan: `kelmadi` → `keldi`).

---

### `DELETE /api/v1/attendance/{id}/`

Davomat yozuvini o'chirish. **Response:** `204 No Content`

---

## 9. Ballar (Scores)

Base URL: `/api/v1/scores/`

**Permission:** IsAuthenticated

### `GET /api/v1/scores/`

Barcha ball yozuvlari.

#### Response `200 OK`

```json
[
  {
    "id": 1,
    "student": {
      "id": 10,
      "first_name": "Jasur",
      "last_name": "Qodirov",
      "username": "student001"
    },
    "group": {
      "id": 1,
      "name": "IELTS-A1"
    },
    "score": 85,
    "date": "2025-02-19",
    "given_by": {
      "id": 3,
      "first_name": "Bobur",
      "last_name": "Toshmatov"
    },
    "created_at": "2025-02-19T10:00:00+05:00"
  }
]
```

---

### `POST /api/v1/scores/`

Yangi ball berish.

#### Request Body

```json
{
  "student": 10,
  "group": 1,
  "score": 85
}
```

| Field     | Type    | Required | Validation              |
|-----------|---------|----------|-------------------------|
| `student` | integer | ✅       | `role=student` bo'lishi |
| `group`   | integer | ✅       | Aktiv guruh ID          |
| `score`   | integer | ✅       | 0 — 100 oralig'ida      |

> `given_by` avtomatik ravishda so'rov yuborgan foydalanuvchiga o'rnatiladi.

#### Response `201 Created`

```json
{
  "id": 1,
  "student": {
    "id": 10,
    "first_name": "Jasur",
    "last_name": "Qodirov",
    "username": "student001"
  },
  "group": {"id": 1, "name": "IELTS-A1"},
  "score": 85,
  "date": "2025-02-19",
  "given_by": {
    "id": 3,
    "first_name": "Bobur",
    "last_name": "Toshmatov"
  },
  "created_at": "2025-02-19T10:00:00+05:00"
}
```

---

### `GET /api/v1/scores/{id}/`

Bitta ball yozuvini ko'rish.

---

### `PUT/PATCH /api/v1/scores/{id}/`

Ball yozuvini yangilash.

---

### `DELETE /api/v1/scores/{id}/`

Ball yozuvini o'chirish. **Response:** `204 No Content`

---

## 10. Vazifalar (Homework)

Base URL: `/api/v1/homework/`

**Permission:** IsAuthenticated

### `GET /api/v1/homework/`

Barcha vazifalar ro'yxati.

#### Response `200 OK`

```json
[
  {
    "id": 1,
    "group": 1,
    "text": "Listening section bö'yicha mashq qiling",
    "file": "http://example.com/media/homework/task1.pdf",
    "created_at": "2025-02-18T15:00:00+05:00",
    "updated_at": "2025-02-18T15:00:00+05:00"
  }
]
```

---

### `POST /api/v1/homework/`

Yangi vazifa yaratish. **Fayl yoki matn kiritilishi shart.**

#### Request Body (multipart/form-data yoki JSON)

```json
{
  "group": 1,
  "text": "Listening section bo'yicha mashq qiling"
}
```

yoki fayl bilan:

```
Content-Type: multipart/form-data

group=1
file=<file>
```

| Field   | Type    | Required | Description                    |
|---------|---------|----------|--------------------------------|
| `group` | integer | ✅       | Aktiv guruh ID                 |
| `text`  | string  | ❌*      | Vazifa matni                   |
| `file`  | file    | ❌*      | Fayl (`text` yoki `file` shart)|

> `text` va `file` — ikkalasidan kamida bittasi kiritilishi **shart**.  
> `created_by` avtomatik o'rnatiladi.

#### Response `201 Created`

```json
{
  "id": 1,
  "group": 1,
  "text": "Listening section bo'yicha mashq qiling",
  "file": null,
  "created_at": "2025-02-19T11:00:00+05:00",
  "updated_at": "2025-02-19T11:00:00+05:00"
}
```

---

### `GET /api/v1/homework/{id}/`

Bitta vazifani ko'rish.

---

### `PUT/PATCH /api/v1/homework/{id}/`

Vazifani yangilash.

---

### `DELETE /api/v1/homework/{id}/`

Vazifani o'chirish. **Response:** `204 No Content`

---

### `GET /api/v1/homework/my-homework/`

O'quvchining o'z guruhidagi vazifalarini ko'rish (faqat `student` roli).

**Permission:** IsAuthenticated (faqat student)

#### Response `200 OK`

```json
[
  {
    "id": 1,
    "group": 1,
    "text": "Listening section bo'yicha mashq qiling",
    "file": null,
    "created_at": "2025-02-18T15:00:00+05:00",
    "updated_at": "2025-02-18T15:00:00+05:00"
  }
]
```

#### Response `403 Forbidden` (student emas)

```json
{
  "detail": "Not a student"
}
```

---

## 11. To'lovlar (Payments)

Base URL: `/api/v1/payments/`

**Permission:** IsAuthenticated

### `GET /api/v1/payments/`

Barcha to'lovlar ro'yxati.

#### Response `200 OK`

```json
[
  {
    "id": 1,
    "student": {
      "id": 10,
      "first_name": "Jasur",
      "last_name": "Qodirov",
      "username": "student001"
    },
    "group": 1,
    "months_paid": 2,
    "amount": "600000.00",
    "received_by": {
      "id": 1,
      "first_name": "John",
      "last_name": "Doe",
      "username": "admin123"
    },
    "months": [
      {"id": 1, "year": 2025, "month": 1, "month_name": "Yanvar"},
      {"id": 2, "year": 2025, "month": 2, "month_name": "Fevral"}
    ],
    "created_at": "2025-02-01T10:00:00+05:00"
  }
]
```

---

### `POST /api/v1/payments/`

Yangi to'lov qo'shish.

#### Request Body

```json
{
  "student": 10,
  "group": 1,
  "amount": "600000.00",
  "months": [
    {"year": 2025, "month": 1},
    {"year": 2025, "month": 2}
  ]
}
```

| Field     | Type    | Required | Description                           |
|-----------|---------|----------|---------------------------------------|
| `student` | integer | ✅       | `role=student` bo'lgan foydalanuvchi  |
| `group`   | integer | ✅       | Guruh ID                              |
| `amount`  | decimal | ✅       | To'lov miqdori                        |
| `months`  | array   | ❌       | To'langan oylar ro'yxati              |

> `months_paid` — `months` array uzunligidan avtomatik hisoblanadi.  
> `received_by` — avtomatik o'rnatiladi.

#### Response `201 Created`

```json
{
  "id": 1,
  "student": {"id": 10, "first_name": "Jasur", "last_name": "Qodirov", "username": "student001"},
  "group": 1,
  "months_paid": 2,
  "amount": "600000.00",
  "received_by": {"id": 1, "first_name": "John", "last_name": "Doe", "username": "admin123"},
  "months": [
    {"id": 1, "year": 2025, "month": 1, "month_name": "Yanvar"},
    {"id": 2, "year": 2025, "month": 2, "month_name": "Fevral"}
  ],
  "created_at": "2025-02-01T10:00:00+05:00"
}
```

---

### `GET /api/v1/payments/{id}/`

Bitta to'lovni ko'rish.

---

### `PUT/PATCH /api/v1/payments/{id}/`

To'lovni yangilash. `months` berilsa, eskisi o'chirib yangisi yoziladi.

---

### `DELETE /api/v1/payments/{id}/`

To'lovni o'chirish. **Response:** `204 No Content`

---

### `GET /api/v1/payments/my-payments/`

Joriy foydalanuvchining o'z to'lovlarini ko'rish.

**Permission:** IsAuthenticated

#### Response `200 OK`

```json
[
  {
    "id": 3,
    "student": {"id": 10, "first_name": "Jasur", "last_name": "Qodirov", "username": "student001"},
    "group": 1,
    "months_paid": 1,
    "amount": "300000.00",
    "months": [{"id": 3, "year": 2025, "month": 3, "month_name": "Mart"}],
    "created_at": "..."
  }
]
```

---

## 12. Chiqimlar (Expenses)

Base URL: `/api/v1/expenses/`

**Permission:** IsAuthenticated

### `GET /api/v1/expenses/`

Barcha chiqimlar ro'yxati.

#### Response `200 OK`

```json
[
  {
    "id": 1,
    "recipient": "IjaraChiqimi",
    "recipient_user": null,
    "amount": "1500000.00",
    "reason": "Ijara",
    "created_at": "2025-02-01T09:00:00+05:00"
  }
]
```

---

### `POST /api/v1/expenses/`

Yangi chiqim qo'shish.

#### Request Body

```json
{
  "recipient": "Maosh",
  "recipient_user": 3,
  "amount": "2000000.00",
  "reason": "Fevral uchun maosh"
}
```

| Field            | Type    | Required | Description                     |
|------------------|---------|----------|---------------------------------|
| `recipient`      | string  | ❌       | Kimga/Nimaga (max 255 belgi)    |
| `recipient_user` | integer | ❌       | Xodim ID (agar xodimga bo'lsa) |
| `amount`         | decimal | ✅       | Miqdor                          |
| `reason`         | string  | ✅       | Sabab (Maosh, Ijara, etc.)      |

#### Response `201 Created`

```json
{
  "id": 2,
  "recipient": "Maosh",
  "recipient_user": 3,
  "amount": "2000000.00",
  "reason": "Fevral uchun maosh",
  "created_at": "2025-02-19T12:00:00+05:00"
}
```

---

### `GET /api/v1/expenses/{id}/`

Bitta chiqimni ko'rish.

---

### `PUT/PATCH /api/v1/expenses/{id}/`

Chiqimni yangilash.

---

### `DELETE /api/v1/expenses/{id}/`

Chiqimni o'chirish. **Response:** `204 No Content`

---

## 13. Imtihonlar (Exams)

Base URL: `/api/v1/exams/`

**Permission:** IsAuthenticated

### `GET /api/v1/exams/`

Barcha imtihonlar ro'yxati.

#### Response `200 OK`

```json
[
  {
    "id": 1,
    "subject": 1,
    "subject_name": "IELTS",
    "title": "IELTS Grammar Test #1",
    "code": "ABC123",
    "description": "Grammatika bo'yicha haftalik test",
    "time_limit": 30,
    "is_published": true,
    "is_active": true,
    "date": "2025-02-19",
    "questions_count": 20,
    "participants_count": 15,
    "created_at": "2025-02-15T10:00:00+05:00"
  }
]
```

---

### `POST /api/v1/exams/`

Yangi imtihon yaratish (savollar bilan birga).

> `code` avtomatik 6 ta belgi bilan generatsiya qilinadi.

#### Request Body

```json
{
  "subject": 1,
  "title": "IELTS Grammar Test #1",
  "description": "Grammatika bo'yicha haftalik test",
  "time_limit": 30,
  "is_published": false,
  "date": "2025-02-20",
  "questions": [
    {
      "text": "Which sentence is correct?",
      "type": "test",
      "order": 1,
      "options": [
        {"text": "She go to school.", "is_correct": false, "order": 1},
        {"text": "She goes to school.", "is_correct": true, "order": 2},
        {"text": "She going to school.", "is_correct": false, "order": 3},
        {"text": "She gone to school.", "is_correct": false, "order": 4}
      ]
    },
    {
      "text": "Describe the importance of reading.",
      "type": "written",
      "order": 2,
      "written_answer_sample": "Reading improves vocabulary and comprehension..."
    }
  ]
}
```

| Field          | Type    | Required | Description                     |
|----------------|---------|----------|---------------------------------|
| `subject`      | integer | ✅       | Fan ID                          |
| `title`        | string  | ✅       | Imtihon nomi                    |
| `description`  | string  | ❌       | Tavsif                          |
| `time_limit`   | integer | ❌       | Vaqt (daqiqa), default: 0       |
| `is_published` | boolean | ❌       | Default: `false`                |
| `date`         | date    | ❌       | Default: bugungi sana           |
| `questions`    | array   | ❌       | Savollar ro'yxati               |

**Savol (`question`) tuzilmasi:**

| Field                    | Type   | Required | Description                       |
|--------------------------|--------|----------|-----------------------------------|
| `text`                   | string | ✅       | Savol matni                       |
| `type`                   | string | ✅       | `test` yoki `written`             |
| `order`                  | int    | ❌       | Tartib raqami                     |
| `options`                | array  | ❌       | Faqat `type=test` uchun           |
| `written_answer_sample`  | string | ❌       | Faqat `type=written` uchun        |

**Variant (`option`) tuzilmasi:**

| Field        | Type    | Required | Description       |
|--------------|---------|----------|-------------------|
| `text`       | string  | ✅       | Javob varianti    |
| `is_correct` | boolean | ✅       | To'g'ri javob     |
| `order`      | int     | ❌       | Tartib raqami     |

#### Response `201 Created`

```json
{
  "id": 1,
  "code": "XA7K2P",
  "title": "IELTS Grammar Test #1",
  "subject": 1,
  "description": "Grammatika bo'yicha haftalik test",
  "time_limit": 30,
  "is_published": false,
  "is_active": true,
  "date": "2025-02-20",
  "questions": [
    {
      "id": 1,
      "text": "Which sentence is correct?",
      "type": "test",
      "order": 1,
      "options": [
        {"id": 1, "text": "She go to school.", "is_correct": false},
        {"id": 2, "text": "She goes to school.", "is_correct": true},
        {"id": 3, "text": "She going to school.", "is_correct": false},
        {"id": 4, "text": "She gone to school.", "is_correct": false}
      ]
    }
  ],
  "created_at": "2025-02-19T10:00:00+05:00"
}
```

---

### `GET /api/v1/exams/{id}/`

Bitta imtihon barcha savollar bilan.

---

### `PUT/PATCH /api/v1/exams/{id}/`

Imtihonni yangilash. `questions` berilsa, eskisi o'chirib yangisi yoziladi.

---

### `DELETE /api/v1/exams/{id}/`

Imtihonni o'chirish. **Response:** `204 No Content`

---

### `POST /api/v1/exams/enter-code/`

Imtihon kodini kiritib imtihon ma'lumotlarini olish.

#### Request Body

```json
{
  "code": "XA7K2P"
}
```

#### Response `200 OK`

```json
{
  "id": 1,
  "code": "XA7K2P",
  "title": "IELTS Grammar Test #1",
  "questions": [ ... ]
}
```

---

### `POST /api/v1/exams/{id}/publish/`

Imtihonni nashr etish.

**Permission:** IsAuthenticated

#### Response `200 OK`

```json
{
  "status": "Test nashr etildi"
}
```

---

### `POST /api/v1/exams/{id}/unpublish/`

Imtihonni nashrdan olish.

#### Response `200 OK`

```json
{
  "status": "Test nashrdan olindi"
}
```

---

### `POST /api/v1/exams/{id}/copy/`

Imtihonning nusxasini olish. Yangi `code` generatsiya qilinadi, `is_published=false`.

#### Response `200 OK`

```json
{
  "id": 2,
  "code": "ZB9M1Q",
  "title": "IELTS Grammar Test #1 (Nusxa)",
  "is_published": false,
  ...
}
```

---

### `POST /api/v1/exams/{id}/submit/`

O'quvchi imtihon javoblarini yuborish.

> Imtihon `is_published=true` va `is_active=true` bo'lishi shart.

#### Request Body

```json
{
  "answers": [
    {
      "question_id": 1,
      "option_id": 2
    },
    {
      "question_id": 2,
      "written_answer": "Reading improves vocabulary and comprehension skills."
    }
  ]
}
```

| Field            | Type    | Required | Description                                  |
|------------------|---------|----------|----------------------------------------------|
| `question_id`    | integer | ✅       | Savol ID                                     |
| `option_id`      | integer | ❌       | Variant ID (faqat `type=test` uchun)         |
| `written_answer` | string  | ❌       | Yozma javob (faqat `type=written` uchun)     |

#### Response `201 Created`

```json
{
  "id": 5,
  "exam": 1,
  "exam_title": "IELTS Grammar Test #1",
  "student": 10,
  "score": 80.0,
  "correct_answers": 16,
  "total_questions": 20,
  "is_checked": false,
  "checked_by": null,
  "answers": [
    {
      "id": 1,
      "question": 1,
      "question_text": "Which sentence is correct?",
      "option": 2,
      "option_text": "She goes to school.",
      "written_answer": null,
      "is_correct": true
    }
  ],
  "created_at": "2025-02-19T15:00:00+05:00"
}
```

---

## 14. Imtihon Natijalari (Exam Results)

Base URL: `/api/v1/exam-results/`

**Permission:** IsAuthenticated

> O'quvchilar faqat o'z natijalarini ko'radi. Admin/xodimlar barchani ko'radi.

### `GET /api/v1/exam-results/`

Barcha imtihon natijalari.

#### Response `200 OK`

```json
[
  {
    "id": 5,
    "exam": 1,
    "student": 10,
    "score": 80.0,
    "correct_answers": 16,
    "total_questions": 20,
    "is_checked": false,
    "checked_by": null,
    "created_at": "2025-02-19T15:00:00+05:00"
  }
]
```

---

### `GET /api/v1/exam-results/my-results/`

Joriy foydalanuvchining barcha imtihon natijalari.

#### Response `200 OK`

```json
[
  {
    "id": 5,
    "exam": 1,
    "student": 10,
    "score": 80.0,
    "correct_answers": 16,
    "total_questions": 20,
    "is_checked": true,
    "checked_by": 3,
    "created_at": "..."
  }
]
```

---

### `PUT/PATCH /api/v1/exam-results/{id}/`

Imtihon natijasini yangilash (masalan, `is_checked=true`).

---

### `DELETE /api/v1/exam-results/{id}/`

Imtihon natijasini o'chirish. **Response:** `204 No Content`

---

## 15. Ish Hisobi (Work Logs)

Base URL: `/api/v1/work-logs/`

**Permission:** IsAuthenticated

> **Read-only** endpoint. Yozuvlar xodimlar amal bajarganida avtomatik yaratiladi (davomat, ball, vazifa qo'shganda).

### `GET /api/v1/work-logs/`

Barcha xodimlar ish hisoblari.

#### Response `200 OK`

```json
[
  {
    "id": 1,
    "employee": 3,
    "date": "2025-02-19",
    "status": true,
    "note": null,
    "created_at": "2025-02-19T09:00:00+05:00"
  }
]
```

| Field      | Type    | Description                        |
|------------|---------|------------------------------------|
| `employee` | integer | Xodim ID                           |
| `date`     | date    | Sana                               |
| `status`   | boolean | `true` — ishga keldi               |
| `note`     | string  | Izoh (optional)                    |

---

### `GET /api/v1/work-logs/{id}/`

Bitta ish hisob yozuvini ko'rish.

---

## 16. Dashboard / Statistika

### `GET /api/v1/dashboard/`

Markazning umumiy moliyaviy va davomat statistikasi.

**Permission:** IsAuthenticated

#### Response `200 OK`

```json
{
  "finance": {
    "income": "15000000.00",
    "expense": "5000000.00",
    "profit": "10000000.00"
  },
  "attendance": {
    "employees_present_today": 4,
    "total_employees": 5
  }
}
```

| Field                       | Type    | Description                     |
|-----------------------------|---------|---------------------------------|
| `finance.income`            | decimal | Jami kirim (barcha to'lovlar)   |
| `finance.expense`           | decimal | Jami chiqim                     |
| `finance.profit`            | decimal | Foyda (kirim - chiqim)          |
| `attendance.employees_present_today` | int | Bugun kelgan xodimlar soni  |
| `attendance.total_employees`| int     | Jami xodimlar soni              |

---

## 17. Telegram Xabarlar (Messages)

Base URL: `/api/v1/messages/`

**Permission:** IsAuthenticated

> Xabar yaratilganda Celery orqali qabul qiluvchilarning Telegram-ga xabar yuboriladi.

### `GET /api/v1/messages/`

Barcha yuborilgan xabarlar (yangilaridan eskisiga tartiblangan).

#### Response `200 OK`

```json
[
  {
    "id": 1,
    "text": "Ertaga dars yo'q!",
    "recipients": [10, 11, 12],
    "created_at": "2025-02-19T16:00:00+05:00",
    "logs": [
      {
        "id": 1,
        "message": 1,
        "recipient": 10,
        "recipient_name": "Jasur Qodirov",
        "status": "sent",
        "error": null,
        "sent_at": "2025-02-19T16:00:30+05:00"
      },
      {
        "id": 2,
        "message": 1,
        "recipient": 11,
        "recipient_name": "Dilnoza Yusupova",
        "status": "failed",
        "error": "Telegram ID topilmadi",
        "sent_at": null
      }
    ]
  }
]
```

---

### `POST /api/v1/messages/`

Yangi xabar yuborish.

#### Request Body

```json
{
  "text": "Ertaga dars yo'q!",
  "recipient_ids": [10, 11, 12]
}
```

| Field           | Type         | Required | Description                        |
|-----------------|--------------|----------|------------------------------------|
| `text`          | string       | ✅       | Xabar matni                        |
| `recipient_ids` | array[int]   | ✅       | O'quvchilar ID ro'yxati            |

> Faqat `role=student` bo'lgan foydalanuvchilarga xabar yuboriladi.  
> `sent_by` avtomatik o'rnatiladi.

#### Response `201 Created`

```json
{
  "id": 2,
  "text": "Ertaga dars yo'q!",
  "recipients": [10, 11, 12],
  "created_at": "2025-02-19T16:00:00+05:00",
  "logs": []
}
```

**Log Statuses:**

| Qiymat    | Ma'no                     |
|-----------|---------------------------|
| `pending` | Kutilmoqda (yuborilmagan) |
| `sent`    | Muvaffaqiyatli yuborildi  |
| `failed`  | Xatolik yuz berdi         |

---

### `GET /api/v1/messages/{id}/`

Bitta xabarni ko'rish.

---

### `DELETE /api/v1/messages/{id}/`

Xabarni o'chirish. **Response:** `204 No Content`

---

## 18. Mock Test (IELTS)

Base URL: `/api/v1/mock/`

IELTS Mock Test bo'limi — Reading, Writing, Listening bo'limlaridan iborat to'liq imtihon sessiyasini boshqarish uchun.

---

### 18.1 Testlar

#### `GET /api/v1/mock/tests/`

Barcha testlar ro'yxati.

**Permission:** IsAuthenticated

#### Response `200 OK`

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "IELTS Mock Test #1",
    "code": "MK1001",
    "created_by": {
      "first_name": "Bobur",
      "last_name": "Toshmatov"
    },
    "reading": {
      "id": 1,
      "file": "http://example.com/media/tests/reading/test1.pdf",
      "duration": 60,
      "question_count": 40,
      "created_at": "2025-01-10T00:00:00+05:00",
      "updated_at": "2025-01-10T00:00:00+05:00"
    },
    "writing": {
      "id": 1,
      "file": "http://example.com/media/tests/writing/task1.pdf",
      "duration": 60,
      "question_count": 2,
      "created_at": "...",
      "updated_at": "..."
    },
    "listening": {
      "id": 1,
      "audio_file": "http://example.com/media/mock_tests/listening/audio/audio1.mp3",
      "question_file": "http://example.com/media/mock_tests/listening/questions/q1.pdf",
      "duration": 30,
      "question_count": 40,
      "created_at": "...",
      "updated_at": "..."
    },
    "created_at": "2025-01-10T00:00:00+05:00",
    "updated_at": "2025-01-10T00:00:00+05:00"
  }
]
```

---

#### `POST /api/v1/mock/tests/create/`

Yangi test yaratish (Reading + Writing + Listening bo'limlari bilan birga).

**Permission:** IsAuthenticated + IsWorkerPermission (owner yoki employee)

**Content-Type:** `multipart/form-data`

#### Request Body

```
title: IELTS Mock Test #1

reading[file]: <PDF fayl>
reading[duration]: 60
reading[question_count]: 40

writing[file]: <PDF fayl>
writing[duration]: 60
writing[question_count]: 2

listening[audio_file]: <MP3 fayl>
listening[question_file]: <PDF fayl>
listening[duration]: 30
listening[question_count]: 40
```

> JSON formatida (nested):

```json
{
  "title": "IELTS Mock Test #1",
  "reading": {
    "file": "<binary>",
    "duration": 60,
    "question_count": 40
  },
  "writing": {
    "file": "<binary>",
    "duration": 60,
    "question_count": 2
  },
  "listening": {
    "audio_file": "<binary>",
    "question_file": "<binary>",
    "duration": 30,
    "question_count": 40
  }
}
```

| Field                       | Type    | Required | Description                 |
|-----------------------------|---------|----------|-----------------------------|
| `title`                     | string  | ✅       | Test nomi                   |
| `reading.file`              | file    | ✅       | Reading PDF fayl            |
| `reading.duration`          | integer | ✅       | Vaqt (daqiqa)               |
| `reading.question_count`    | integer | ✅       | Savollar soni               |
| `writing.file`              | file    | ✅       | Writing PDF fayl            |
| `writing.duration`          | integer | ✅       | Vaqt (daqiqa)               |
| `writing.question_count`    | integer | ✅       | Savollar soni               |
| `listening.audio_file`      | file    | ✅       | Listening audio (MP3)       |
| `listening.question_file`   | file    | ✅       | Savollar PDF fayli          |
| `listening.duration`        | integer | ✅       | Vaqt (daqiqa)               |
| `listening.question_count`  | integer | ✅       | Savollar soni               |

> `code` avtomatik 6 ta belgi bilan generatsiya qilinadi.  
> `created_by` avtomatik o'rnatiladi.

#### Response `201 Created`

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "IELTS Mock Test #1",
  "code": "MK1001",
  "reading": { ... },
  "writing": { ... },
  "listening": { ... },
  "created_at": "...",
  "updated_at": "..."
}
```

---

#### `GET /api/v1/mock/tests/{uuid}/`

Bitta testni ko'rish.

**Permission:** IsAuthenticated + IsWorkerPermission

---

#### `DELETE /api/v1/mock/tests/{uuid}/`

Testni o'chirish. **Response:** `204 No Content`

**Permission:** IsAuthenticated + IsWorkerPermission

---

### 18.2 Test Sessiyasi

#### `POST /api/v1/mock/session/start/`

Test sessiyasini boshlash.

**Permission:** IsAuthenticated

> Har bir foydalanuvchi bir test uchun faqat bitta aktiv sessiyaga ega bo'lishi mumkin.  
> Sessiya boshlanganda Celery task ishga tushadi — test_duration o'tganida sessiya avtomatik yakunlanadi.

#### Request Body

```json
{
  "test": "550e8400-e29b-41d4-a716-446655440000",
  "code": "MK1001"
}
```

| Field  | Type   | Required | Description         |
|--------|--------|----------|---------------------|
| `test` | UUID   | ✅       | Test UUID           |
| `code` | string | ✅       | Test kodi (6 belgi) |

#### Response `201 Created`

```json
{
  "id": "7b3f4e2a-1c5d-4a8b-9e3f-2d6a1b4c5e7f",
  "user": {
    "id": 10,
    "first_name": "Jasur",
    "last_name": "Qodirov",
    "group": {
      "id": 1,
      "name": "IELTS-A1"
    }
  },
  "test": "550e8400-e29b-41d4-a716-446655440000",
  "started_at": "2025-02-19T10:00:00+05:00",
  "ended_at": null,
  "is_completed": false,
  "is_finished": false,
  "listening": {
    "id": 1,
    "audio_file": "http://example.com/media/mock_tests/listening/audio/audio1.mp3",
    "question_file": "http://example.com/media/mock_tests/listening/questions/q1.pdf",
    "duration": 30,
    "question_count": 40
  }
}
```

#### Response `400 Bad Request` (kod noto'g'ri)

```json
{
  "detail": "Test kodi noto'g'ri."
}
```

#### Response `400 Bad Request` (aktiv sessiya mavjud)

```json
{
  "detail": "Sizda bu test uchun aktiv session mavjud."
}
```

---

#### `GET /api/v1/mock/session/me/`

Joriy foydalanuvchining barcha sessiyalari.

**Permission:** IsAuthenticated

#### Response `200 OK`

```json
[
  {
    "id": "7b3f4e2a-...",
    "user": {
      "id": 10,
      "first_name": "Jasur",
      "last_name": "Qodirov",
      "group": {"id": 1, "name": "IELTS-A1"}
    },
    "test": null,
    "started_at": "2025-02-19T10:00:00+05:00",
    "ended_at": "2025-02-19T12:30:00+05:00",
    "is_completed": true,
    "is_finished": true,
    "score": {
      "id": 1,
      "listening": 7.5,
      "reading": 8.0,
      "writing": 7.0,
      "speaking": 7.5,
      "score": 7.5,
      "created_by": {
        "id": 3,
        "first_name": "Bobur",
        "last_name": "Toshmatov"
      }
    }
  }
]
```

> `test` maydoni faqat `is_completed=true` bo'lganda to'liq test ma'lumotlarini qaytaradi, aks holda `null`.

---

#### `GET /api/v1/mock/session/reading/{session_id}/`

Sessiyaning Reading bo'limini ko'rish.

**Permission:** IsAuthenticated (faqat sessiya egasi)

#### Response `200 OK`

```json
{
  "id": 1,
  "file": "http://example.com/media/tests/reading/test1.pdf",
  "duration": 60,
  "question_count": 40,
  "created_at": "...",
  "updated_at": "..."
}
```

---

#### `GET /api/v1/mock/session/writing/{session_id}/`

Sessiyaning Writing bo'limini ko'rish.

**Permission:** IsAuthenticated (faqat sessiya egasi)

#### Response `200 OK`

```json
{
  "id": 1,
  "file": "http://example.com/media/tests/writing/task1.pdf",
  "duration": 60,
  "question_count": 2,
  "created_at": "...",
  "updated_at": "..."
}
```

---

#### `POST /api/v1/mock/session/{uuid}/finish/`

Test sessiyasini yakunlash.

**Permission:** IsAuthenticated (faqat sessiya egasi)

> Sessiya allaqachon yakunlangan bo'lsa xato qaytariladi.

#### Response `200 OK`

```json
{
  "id": "7b3f4e2a-...",
  "user": { ... },
  "test": { ... },
  "started_at": "2025-02-19T10:00:00+05:00",
  "ended_at": "2025-02-19T12:30:00+05:00",
  "is_completed": true,
  "is_finished": false
}
```

#### Response `400 Bad Request` (allaqachon yakunlangan)

```json
{
  "detail": "Bu session allaqachon yakunlangan."
}
```

---

#### `GET /api/v1/mock/session/{session_id}/answers/`

Bitta sessiyaning barcha javoblarini ko'rish.

**Permission:** IsAuthenticated + IsWorkerPermission

#### Response `200 OK`

```json
{
  "session": {
    "id": "7b3f4e2a-...",
    "user": { ... },
    "test": { ... },
    "is_completed": true,
    "is_finished": false
  },
  "reading_answer": {
    "id": 1,
    "session": "7b3f4e2a-...",
    "answers": {"1": "A", "2": "B", "3": "carbon dioxide"},
    "created_at": "..."
  },
  "listening_answer": {
    "id": 1,
    "session": "7b3f4e2a-...",
    "answers": {"1": "C", "2": "D"},
    "created_at": "..."
  },
  "writing_answers": [
    {
      "id": 1,
      "session": "7b3f4e2a-...",
      "task_number": 1,
      "text": "The chart shows that...",
      "teacher_comment": null
    },
    {
      "id": 2,
      "session": "7b3f4e2a-...",
      "task_number": 2,
      "text": "In my opinion...",
      "teacher_comment": null
    }
  ]
}
```

---

#### `GET /api/v1/mock/session/answers/`

Barcha yakunlangan sessiyalarning javoblari.

**Permission:** IsAuthenticated + IsWorkerPermission

#### Response `200 OK`

```json
[
  {
    "session": { ... },
    "reading_answer": { ... },
    "listening_answer": { ... },
    "writing_answers": [ ... ]
  }
]
```

---

### 18.3 Javoblar

#### `POST /api/v1/mock/answers/reading/`

Reading javoblarini yuborish.

**Permission:** IsAuthenticated (faqat sessiya egasi)

#### Request Body

```json
{
  "session": "7b3f4e2a-1c5d-4a8b-9e3f-2d6a1b4c5e7f",
  "answers": {
    "1": "A",
    "2": "carbon dioxide",
    "3": "TRUE",
    "4": "NOT GIVEN"
  }
}
```

| Field     | Type   | Required | Description                                     |
|-----------|--------|----------|-------------------------------------------------|
| `session` | UUID   | ✅       | Sessiya UUID                                    |
| `answers` | object | ✅       | JSON: `{"savol_raqami": "javob"}` formatda     |

> Har bir sessiya uchun faqat **bitta** Reading javobi bo'lishi mumkin (OneToOne).

#### Response `201 Created`

```json
{
  "id": 1,
  "session": "7b3f4e2a-...",
  "answers": {
    "1": "A",
    "2": "carbon dioxide",
    "3": "TRUE",
    "4": "NOT GIVEN"
  },
  "created_at": "2025-02-19T10:30:00+05:00",
  "updated_at": "2025-02-19T10:30:00+05:00"
}
```

---

#### `POST /api/v1/mock/answers/writing/`

Writing javobini yuborish (Task 1 yoki Task 2 alohida).

**Permission:** IsAuthenticated (faqat sessiya egasi)

#### Request Body

```json
{
  "session": "7b3f4e2a-1c5d-4a8b-9e3f-2d6a1b4c5e7f",
  "task_number": 1,
  "text": "The pie chart illustrates the distribution of water usage..."
}
```

| Field         | Type    | Required | Validation                     |
|---------------|---------|----------|--------------------------------|
| `session`     | UUID    | ✅       | Sessiya UUID                   |
| `task_number` | integer | ✅       | Faqat `1` yoki `2`             |
| `text`        | string  | ❌       | Yozma javob matni              |

> Bitta sessiyada har bir `task_number` uchun faqat bitta yozma javob bo'lishi mumkin.

#### Response `201 Created`

```json
{
  "id": 1,
  "session": "7b3f4e2a-...",
  "task_number": 1,
  "text": "The pie chart illustrates...",
  "teacher_comment": null,
  "created_at": "2025-02-19T11:00:00+05:00",
  "updated_at": "2025-02-19T11:00:00+05:00"
}
```

---

#### `POST /api/v1/mock/answers/listening/`

Listening javoblarini yuborish.

**Permission:** IsAuthenticated (faqat sessiya egasi)

#### Request Body

```json
{
  "session": "7b3f4e2a-1c5d-4a8b-9e3f-2d6a1b4c5e7f",
  "answers": {
    "1": "C",
    "2": "accommodation",
    "3": "B",
    "4": "Thursday"
  }
}
```

> Har bir sessiya uchun faqat **bitta** Listening javobi bo'lishi mumkin (OneToOne).

#### Response `201 Created`

```json
{
  "id": 1,
  "session": "7b3f4e2a-...",
  "answers": {
    "1": "C",
    "2": "accommodation",
    "3": "B",
    "4": "Thursday"
  },
  "created_at": "...",
  "updated_at": "..."
}
```

---

### 18.4 Natijalar (Scores)

#### `POST /api/v1/mock/score/create/`

Test sessiyasiga IELTS bali qo'yish.

**Permission:** IsAuthenticated + IsWorkerPermission

> Ball qo'yilgandan so'ng sessiyaning `is_finished=true` bo'ladi.

#### Request Body

```json
{
  "session": "7b3f4e2a-1c5d-4a8b-9e3f-2d6a1b4c5e7f",
  "listening": 7.5,
  "reading": 8.0,
  "writing": 7.0,
  "speaking": 6.5
}
```

| Field       | Type  | Required | Validation      |
|-------------|-------|----------|-----------------|
| `session`   | UUID  | ✅       | Sessiya UUID    |
| `listening` | float | ✅       | 0.0 — 9.0       |
| `reading`   | float | ✅       | 0.0 — 9.0       |
| `writing`   | float | ✅       | 0.0 — 9.0       |
| `speaking`  | float | ✅       | 0.0 — 9.0       |

> `created_by` avtomatik o'rnatiladi.  
> `score` (umumiy ball) backend tomonidan IELTS qoidasi bo'yicha hisoblanadi.

#### Response `201 Created`

```json
{
  "id": 1,
  "session": "7b3f4e2a-...",
  "listening": 7.5,
  "reading": 8.0,
  "writing": 7.0,
  "speaking": 6.5,
  "score": 7.5,
  "created_at": "2025-02-19T14:00:00+05:00",
  "updated_at": "2025-02-19T14:00:00+05:00"
}
```

---

#### `PATCH /api/v1/mock/score/{id}/update/`

Mavjud IELTS balini yangilash.

**Permission:** IsAuthenticated + IsWorkerPermission

#### Request Body (partial)

```json
{
  "writing": 7.5,
  "speaking": 7.0
}
```

#### Response `200 OK`

```json
{
  "id": 1,
  "session": "7b3f4e2a-...",
  "listening": 7.5,
  "reading": 8.0,
  "writing": 7.5,
  "speaking": 7.0,
  "score": 7.5,
  "created_at": "...",
  "updated_at": "2025-02-19T15:00:00+05:00"
}
```

---

#### `GET /api/v1/mock/score/me/`

Joriy foydalanuvchining barcha IELTS natijalari.

**Permission:** IsAuthenticated

#### Response `200 OK`

```json
[
  {
    "id": 1,
    "session": "7b3f4e2a-...",
    "listening": 7.5,
    "reading": 8.0,
    "writing": 7.0,
    "speaking": 6.5,
    "score": 7.5,
    "created_at": "..."
  }
]
```

---

## 19. Umumiy Xato Javoblari

| HTTP Status | Sabab                                    | Misol Response                                    |
|-------------|------------------------------------------|---------------------------------------------------|
| `400`       | Noto'g'ri so'rov ma'lumotlari            | `{"field": ["This field is required."]}`          |
| `401`       | Token yo'q yoki noto'g'ri               | `{"detail": "Authentication credentials were not provided."}` |
| `403`       | Ruxsat yo'q                              | `{"detail": "You do not have permission to perform this action."}` |
| `404`       | Ob'ekt topilmadi                         | `{"detail": "Not found."}`                        |
| `405`       | Metod ruxsat etilmagan                   | `{"detail": "Method \"DELETE\" not allowed."}`    |

---

## Qo'shimcha Ma'lumotlar

### Fayl Yuklash

- Maksimal fayl hajmi: **300 MB** (`DATA_UPLOAD_MAX_MEMORY_SIZE`)
- Rasm/hujjat URL'lari to'liq absolut URL formatida qaytariladi: `http://example.com/media/...`

### Token Yangilash

JWT tokeni eskirganda (1 kundan keyin) refresh token orqali yangi access token olish:

```
POST /api/token/refresh/
Content-Type: application/json

{
  "refresh": "<refresh_token>"
}
```

> Response: `{"access": "<yangi_access_token>"}`

### Vaqt Formati

Barcha vaqtlar **ISO 8601** formatida, **Asia/Tashkent** (UTC+5) zone bilan qaytariladi:

```
2025-02-19T10:30:00+05:00
```

### CORS

Frontend har qanday origindan so'rov yuborishi mumkin (`CORS_ALLOW_ALL_ORIGINS = True`). Credentials ham qo'llab-quvvatlanadi.

---

*© 2025 MEA (Harry-Potter Academy). API v1.0 — Barcha huquqlar himoyalangan.*
