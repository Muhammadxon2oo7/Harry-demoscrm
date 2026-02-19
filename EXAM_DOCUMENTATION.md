# EXAM (Imtihon) API Dokumentatsiyasi

Base URL: `http://your-domain.com/api/v1/`

> Barcha endpointlar uchun `Authorization: Bearer <access_token>` header talab qilinadi (login endpointidan tashqari).

---

## Mundarija

1. [Login (Token olish)](#1-login)
2. [Exam (Imtihon) Modeli](#2-exam-modeli)
3. [Exam API Endpointlari](#3-exam-api-endpointlari)
   - [Barcha examlarni ko'rish (LIST)](#31-barcha-examlarni-korish)
   - [Yangi exam yaratish (CREATE)](#32-yangi-exam-yaratish)
   - [Exam detail ko'rish (RETRIEVE)](#33-exam-detail-korish)
   - [Exam yangilash (UPDATE)](#34-exam-yangilash)
   - [Exam o'chirish (DELETE)](#35-exam-ochirish)
   - [Exam kodi orqali kirish (ENTER-CODE)](#36-exam-kodi-orqali-kirish)
   - [Examni nashr qilish (PUBLISH)](#37-examni-nashr-qilish)
   - [Examni nashrdan olish (UNPUBLISH)](#38-examni-nashrdan-olish)
   - [Examni nusxalash (COPY)](#39-examni-nusxalash)
   - [Exam javoblarini topshirish (SUBMIT)](#310-exam-javoblarini-topshirish)
4. [ExamResult API Endpointlari](#4-examresult-api-endpointlari)
   - [Barcha natijalarni ko'rish (LIST)](#41-barcha-natijalarni-korish)
   - [Natija detail (RETRIEVE)](#42-natija-detail)
   - [Mening natijalarim (MY-RESULTS)](#43-mening-natijalarim)
5. [Model Tuzilmalari](#5-model-tuzilmalari)
6. [Xatolik Javoblari](#6-xatolik-javoblari)

---

## 1. Login

**Endpoint:** `POST /api/v1/login/`

Token olish uchun foydalaniladi.

### Request Body

```json
{
    "username": "admin123",
    "password": "password123"
}
```

### Response `200 OK`

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

### Response `401 Unauthorized`

```json
{
    "detail": "Invalid credentials"
}
```

> Access token `Authorization: Bearer <access_token>` ko'rinishida keyingi barcha so'rovlarga qo'shib yuboriladi.

---

## 2. Exam Modeli

### Exam (Imtihon)

| Field          | Turi              | Tavsif                                              |
|----------------|-------------------|-----------------------------------------------------|
| `id`           | integer           | Unikal identifikator (auto)                         |
| `title`        | string (255)      | Imtihon nomi                                        |
| `code`         | string (20)       | Unikal kod (auto-generate, 6 ta belgi)              |
| `subject`      | integer (FK)      | Fan ID si                                           |
| `subject_name` | string (read)     | Fan nomi (faqat o'qish uchun)                       |
| `description`  | string (nullable) | Tavsif                                              |
| `time_limit`   | integer           | Vaqt chegarasi (daqiqada), 0 = cheksiz              |
| `is_published` | boolean           | Nashr holati (default: `false`)                     |
| `is_active`    | boolean           | Faollik holati (default: `true`)                    |
| `date`         | date              | Imtihon sanasi                                      |
| `created_by`   | auto (user)       | Yaratgan foydalanuvchi (auto token orqali)          |
| `created_at`   | datetime (read)   | Yaratilgan vaqt                                     |
| `questions_count`    | integer (read) | Savollar soni (annotated)                      |
| `participants_count` | integer (read) | Qatnashchilar soni (annotated)                 |

### Question (Savol)

| Field                   | Turi                        | Tavsif                                      |
|-------------------------|-----------------------------|---------------------------------------------|
| `id`                    | integer                     | Unikal identifikator                        |
| `exam`                  | integer (FK)                | Exam ID si                                  |
| `text`                  | string                      | Savol matni                                 |
| `type`                  | string (`test` / `written`) | Savol turi                                  |
| `written_answer_sample` | string (nullable)           | Yozma savol uchun namuna javob              |
| `order`                 | integer                     | Tartib raqami                               |
| `options`               | array                       | Javob variantlari (faqat `test` turi uchun) |

### Option (Javob varianti)

| Field        | Turi    | Tavsif                                |
|--------------|---------|---------------------------------------|
| `id`         | integer | Unikal identifikator                  |
| `question`   | integer | Savol ID si                           |
| `text`       | string  | Javob matni                           |
| `is_correct` | boolean | To'g'ri javob ekanligini belgilaydi   |
| `order`      | integer | Tartib raqami                         |

### ExamResult (Natija)

| Field             | Turi          | Tavsif                                        |
|-------------------|---------------|-----------------------------------------------|
| `id`              | integer       | Unikal identifikator                          |
| `exam`            | integer (FK)  | Exam ID si                                    |
| `exam_title`      | string (read) | Exam nomi (faqat detail serializer'da)        |
| `student`         | integer (FK)  | O'quvchi ID si                                |
| `score`           | float         | Ball (foizda, 0–100)                          |
| `correct_answers` | integer       | To'g'ri javoblar soni                         |
| `total_questions` | integer       | Jami savollar soni                            |
| `is_checked`      | boolean       | O'qituvchi tomonidan tekshirilganmi           |
| `checked_by`      | integer (FK)  | Tekshirgan foydalanuvchi (nullable)           |
| `created_at`      | datetime      | Topshirilgan vaqt                             |
| `answers`         | array         | Barcha javoblar (faqat submit response'da)    |

### ExamAnswer (Javob)

| Field            | Turi          | Tavsif                                   |
|------------------|---------------|------------------------------------------|
| `id`             | integer       | Unikal identifikator                     |
| `exam_result`    | integer (FK)  | ExamResult ID si                         |
| `question`       | integer (FK)  | Savol ID si                              |
| `question_text`  | string (read) | Savol matni                              |
| `option`         | integer (FK)  | Tanlangan variant (test savollar uchun)  |
| `option_text`    | string (read) | Tanlangan variant matni                  |
| `written_answer` | string        | Yozma javob (written savollar uchun)     |
| `is_correct`     | boolean       | Javob to'g'riligini belgilaydi           |

---

## 3. Exam API Endpointlari

### 3.1 Barcha Examlarni Ko'rish

**`GET /api/v1/exams/`**

Barcha imtihonlar ro'yxatini qaytaradi. `questions_count` va `participants_count` ham keladi.

#### Response `200 OK`

```json
[
    {
        "id": 1,
        "title": "1-Haftalik Imtihon",
        "code": "ABC123",
        "subject": 2,
        "subject_name": "IELTS",
        "description": "Reading va Listening bo'limlari",
        "time_limit": 60,
        "is_published": true,
        "is_active": true,
        "date": "2026-02-19",
        "created_by": 1,
        "created_at": "2026-02-10T08:00:00Z",
        "questions_count": 20,
        "participants_count": 15
    },
    ...
]
```

---

### 3.2 Yangi Exam Yaratish

**`POST /api/v1/exams/`**

Yangi imtihon yaratadi. Savollar va javob variantlari bir vaqtda yuboriladi.

> `code` maydoni avtomatik generatsiya qilinadi (6 ta belgi: harflar + raqamlar).

#### Request Body

```json
{
    "title": "2-Haftalik Imtihon",
    "subject": 2,
    "description": "Grammar va Vocabulary",
    "time_limit": 45,
    "date": "2026-02-25",
    "questions": [
        {
            "text": "What is the meaning of 'eloquent'?",
            "type": "test",
            "order": 1,
            "options": [
                { "text": "Clumsy", "is_correct": false, "order": 1 },
                { "text": "Well-spoken", "is_correct": true, "order": 2 },
                { "text": "Silent", "is_correct": false, "order": 3 },
                { "text": "Angry", "is_correct": false, "order": 4 }
            ]
        },
        {
            "text": "Correct this sentence: 'He don't like apples'",
            "type": "written",
            "order": 2,
            "written_answer_sample": "He doesn't like apples.",
            "options": []
        }
    ]
}
```

#### Response `201 Created`

```json
{
    "id": 2,
    "title": "2-Haftalik Imtihon",
    "code": "XY7K2P",
    "subject": 2,
    "description": "Grammar va Vocabulary",
    "time_limit": 45,
    "is_published": false,
    "is_active": true,
    "date": "2026-02-25",
    "created_at": "2026-02-19T10:30:00Z",
    "questions": [
        {
            "id": 1,
            "text": "What is the meaning of 'eloquent'?",
            "type": "test",
            "order": 1,
            "written_answer_sample": null,
            "options": [
                { "id": 1, "text": "Clumsy", "is_correct": false, "order": 1 },
                { "id": 2, "text": "Well-spoken", "is_correct": true, "order": 2 },
                { "id": 3, "text": "Silent", "is_correct": false, "order": 3 },
                { "id": 4, "text": "Angry", "is_correct": false, "order": 4 }
            ]
        },
        {
            "id": 2,
            "text": "Correct this sentence: 'He don't like apples'",
            "type": "written",
            "order": 2,
            "written_answer_sample": "He doesn't like apples.",
            "options": []
        }
    ]
}
```

---

### 3.3 Exam Detail Ko'rish

**`GET /api/v1/exams/{id}/`**

Bitta imtihonning barcha mа'lumotlarini, jumladan savollar va javob variantlarini qaytaradi.

#### Response `200 OK`

```json
{
    "id": 1,
    "title": "1-Haftalik Imtihon",
    "code": "ABC123",
    "subject": 2,
    "description": "Reading va Listening",
    "time_limit": 60,
    "is_published": true,
    "is_active": true,
    "date": "2026-02-19",
    "created_at": "2026-02-10T08:00:00Z",
    "questions": [
        {
            "id": 1,
            "text": "What is the meaning of 'eloquent'?",
            "type": "test",
            "order": 1,
            "written_answer_sample": null,
            "options": [
                { "id": 1, "text": "Clumsy", "is_correct": false, "order": 1 },
                { "id": 2, "text": "Well-spoken", "is_correct": true, "order": 2 },
                { "id": 3, "text": "Silent", "is_correct": false, "order": 3 },
                { "id": 4, "text": "Angry", "is_correct": false, "order": 4 }
            ]
        }
    ]
}
```

---

### 3.4 Exam Yangilash

**`PUT /api/v1/exams/{id}/`** — To'liq yangilash  
**`PATCH /api/v1/exams/{id}/`** — Qisman yangilash

> Savollar yuborilsa, eski savollar **o'chirilib** yangilari saqlanadi.

#### Request Body (PATCH — faqat o'zgaradigan maydonlar)

```json
{
    "title": "1-Haftalik Imtihon (Yangilangan)",
    "time_limit": 90,
    "questions": [
        {
            "text": "Choose the correct form of the verb.",
            "type": "test",
            "order": 1,
            "options": [
                { "text": "He go", "is_correct": false, "order": 1 },
                { "text": "He goes", "is_correct": true, "order": 2 },
                { "text": "He going", "is_correct": false, "order": 3 },
                { "text": "He gone", "is_correct": false, "order": 4 }
            ]
        }
    ]
}
```

#### Response `200 OK`

```json
{
    "id": 1,
    "title": "1-Haftalik Imtihon (Yangilangan)",
    "code": "ABC123",
    "time_limit": 90,
    "is_published": false,
    "questions": [
        {
            "id": 10,
            "text": "Choose the correct form of the verb.",
            "type": "test",
            "order": 1,
            "written_answer_sample": null,
            "options": [
                { "id": 21, "text": "He go", "is_correct": false, "order": 1 },
                { "id": 22, "text": "He goes", "is_correct": true, "order": 2 },
                { "id": 23, "text": "He going", "is_correct": false, "order": 3 },
                { "id": 24, "text": "He gone", "is_correct": false, "order": 4 }
            ]
        }
    ]
}
```

---

### 3.5 Exam O'chirish

**`DELETE /api/v1/exams/{id}/`**

#### Response `204 No Content`

---

### 3.6 Exam Kodi Orqali Kirish

**`POST /api/v1/exams/enter-code/`**

O'quvchi exam kodini kiritib, imtihon ma'lumotlarini oladi. Asosiy holat: o'quvchi boshqa qurilmadan yoki telegram orqali kod oladi va shu kod bilan test topshiradi.

#### Request Body

```json
{
    "code": "ABC123"
}
```

#### Response `200 OK`

```json
{
    "id": 1,
    "title": "1-Haftalik Imtihon",
    "code": "ABC123",
    "subject": 2,
    "description": "Reading va Listening",
    "time_limit": 60,
    "is_published": true,
    "is_active": true,
    "date": "2026-02-19",
    "created_at": "2026-02-10T08:00:00Z",
    "questions": [
        {
            "id": 1,
            "text": "What is the meaning of 'eloquent'?",
            "type": "test",
            "order": 1,
            "written_answer_sample": null,
            "options": [
                { "id": 1, "text": "Clumsy", "is_correct": false },
                { "id": 2, "text": "Well-spoken", "is_correct": true },
                { "id": 3, "text": "Silent", "is_correct": false },
                { "id": 4, "text": "Angry", "is_correct": false }
            ]
        }
    ]
}
```

#### Response `404 Not Found` (kod noto'g'ri bo'lsa)

```json
{
    "detail": "Not found."
}
```

---

### 3.7 Examni Nashr Qilish

**`POST /api/v1/exams/{id}/publish/`**

Imtihonni nashr etadi (`is_published = true`). Faqat nashr etilgan imtihonga o'quvchilar javob topshira oladi.

#### Request Body

Yo'q (bo'sh body yuborish kifoya)

#### Response `200 OK`

```json
{
    "status": "Test nashr etildi"
}
```

---

### 3.8 Examni Nashrdan Olish

**`POST /api/v1/exams/{id}/unpublish/`**

Imtihonni nashrdan olib tashlaydi (`is_published = false`).

#### Request Body

Yo'q (bo'sh body yuborish kifoya)

#### Response `200 OK`

```json
{
    "status": "Test nashrdan olindi"
}
```

---

### 3.9 Examni Nusxalash

**`POST /api/v1/exams/{id}/copy/`**

Imtihonning to'liq nusxasini yaratadi (savollar va variantlar bilan birga). Yangi nusxa:
- Nomi: `{asl_nom} (Nusxa)`
- `is_published = false`
- Yangi unikal kod avtomatik generatsiya qilinadi

#### Request Body

Yo'q

#### Response `201 Created`

```json
{
    "id": 5,
    "title": "1-Haftalik Imtihon (Nusxa)",
    "code": "MN9X3T",
    "subject": 2,
    "description": "Reading va Listening",
    "time_limit": 60,
    "is_published": false,
    "is_active": true,
    "date": "2026-02-19",
    "created_at": "2026-02-19T11:00:00Z",
    "questions": [
        {
            "id": 20,
            "text": "What is the meaning of 'eloquent'?",
            "type": "test",
            "order": 1,
            "written_answer_sample": null,
            "options": [
                { "id": 40, "text": "Clumsy", "is_correct": false, "order": 1 },
                { "id": 41, "text": "Well-spoken", "is_correct": true, "order": 2 },
                { "id": 42, "text": "Silent", "is_correct": false, "order": 3 },
                { "id": 43, "text": "Angry", "is_correct": false, "order": 4 }
            ]
        }
    ]
}
```

---

### 3.10 Exam Javoblarini Topshirish

**`POST /api/v1/exams/{id}/submit/`**

O'quvchi imtihon javoblarini topshiradi. Har bir savol uchun javob yuboriladi:
- **Test savollar uchun:** `option_id` yuboriladi
- **Yozma savollar uchun:** `written_answer` yuboriladi

> Imtihon `is_published = true` va `is_active = true` bo'lishi shart.  
> Bir o'quvchi bir imtihonni **faqat bir marta** topshira oladi (`unique_together` chegarasi bor).

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
            "option_id": 7
        },
        {
            "question_id": 3,
            "written_answer": "He doesn't like apples."
        },
        {
            "question_id": 4,
            "option_id": null,
            "written_answer": null
        }
    ]
}
```

#### Response `200 OK`

```json
{
    "id": 10,
    "exam": 1,
    "exam_title": "1-Haftalik Imtihon",
    "student": 5,
    "score": 75.0,
    "correct_answers": 15,
    "total_questions": 20,
    "is_checked": false,
    "checked_by": null,
    "created_at": "2026-02-19T14:30:00Z",
    "answers": [
        {
            "id": 101,
            "exam_result": 10,
            "question": 1,
            "question_text": "What is the meaning of 'eloquent'?",
            "option": 2,
            "option_text": "Well-spoken",
            "written_answer": null,
            "is_correct": true
        },
        {
            "id": 102,
            "exam_result": 10,
            "question": 3,
            "question_text": "Correct this sentence: 'He don't like apples'",
            "option": null,
            "option_text": null,
            "written_answer": "He doesn't like apples.",
            "is_correct": false
        }
    ]
}
```

#### Response `400 Bad Request` — Imtihon faol emas

```json
{
    "error": "Ushbu test hozirda faol emas."
}
```

---

## 4. ExamResult API Endpointlari

### 4.1 Barcha Natijalarni Ko'rish

**`GET /api/v1/exam-results/`**

- **Owner/Employee** → Barcha natijalarni ko'radi
- **Student** → Faqat o'z natijalarini ko'radi (avtomatik filtrlanadi)

#### Response `200 OK`

```json
[
    {
        "id": 10,
        "exam": 1,
        "student": 5,
        "score": 75.0,
        "correct_answers": 15,
        "total_questions": 20,
        "is_checked": false,
        "checked_by": null,
        "created_at": "2026-02-19T14:30:00Z"
    },
    ...
]
```

---

### 4.2 Natija Detail

**`GET /api/v1/exam-results/{id}/`**

#### Response `200 OK`

```json
{
    "id": 10,
    "exam": 1,
    "student": 5,
    "score": 75.0,
    "correct_answers": 15,
    "total_questions": 20,
    "is_checked": true,
    "checked_by": 2,
    "created_at": "2026-02-19T14:30:00Z"
}
```

---

### 4.3 Mening Natijalarim

**`GET /api/v1/exam-results/my-results/`**

Faqat so'rov yuborgan foydalanuvchining barcha natijalarini qaytaradi.

#### Response `200 OK`

```json
[
    {
        "id": 10,
        "exam": 1,
        "student": 5,
        "score": 75.0,
        "correct_answers": 15,
        "total_questions": 20,
        "is_checked": false,
        "checked_by": null,
        "created_at": "2026-02-19T14:30:00Z"
    },
    {
        "id": 11,
        "exam": 3,
        "student": 5,
        "score": 90.0,
        "correct_answers": 18,
        "total_questions": 20,
        "is_checked": true,
        "checked_by": 2,
        "created_at": "2026-02-15T10:00:00Z"
    }
]
```

---

### 4.4 Natijani O'chirish / Yangilash

**`PUT /api/v1/exam-results/{id}/`**  
**`PATCH /api/v1/exam-results/{id}/`**  
**`DELETE /api/v1/exam-results/{id}/`**

Natijani tekshirish uchun `is_checked` va `checked_by` maydonlari yangilanadi:

#### PATCH Request Body

```json
{
    "is_checked": true,
    "checked_by": 2
}
```

#### Response `200 OK`

```json
{
    "id": 10,
    "exam": 1,
    "student": 5,
    "score": 75.0,
    "correct_answers": 15,
    "total_questions": 20,
    "is_checked": true,
    "checked_by": 2,
    "created_at": "2026-02-19T14:30:00Z"
}
```

---

## 5. Model Tuzilmalari

### Savol Turlari (`Question.type`)

| Qiymat    | Ma'nosi                              |
|-----------|--------------------------------------|
| `test`    | Test (to'g'ri variant tanlanadi)     |
| `written` | Yozma javob (matn yoziladi)          |

### Foydalanuvchi Rollari

| Qiymat     | Ma'nosi                       |
|------------|-------------------------------|
| `owner`    | Ega / Admin                   |
| `employee` | Xodim / O'qituvchi            |
| `student`  | O'quvchi                      |

---

## 6. Xatolik Javoblari

| Status kodi | Tavsif                                                          |
|-------------|-----------------------------------------------------------------|
| `400`       | Noto'g'ri so'rov ma'lumotlari (validatsiya xatosi)             |
| `401`       | Autentifikatsiya talab qilinadi yoki token noto'g'ri            |
| `403`       | Ruxsat yo'q                                                     |
| `404`       | Resurs topilmadi                                                |
| `500`       | Server ichki xatosi                                             |

### Namuna xatoliklar

#### 400 — Validatsiya xatosi

```json
{
    "answers": [
        {
            "question_id": ["This field is required."]
        }
    ]
}
```

#### 401 — Autentifikatsiya xatosi

```json
{
    "detail": "Given token not valid for any token type",
    "code": "token_not_valid"
}
```

#### 404 — Topilmadi

```json
{
    "detail": "Not found."
}
```

---

## Umumiy Exam Oqimi (Flow)

```
1. O'qituvchi/Owner imtihon yaratadi    POST /api/v1/exams/
2. Savollar va variantlar qo'shiladi    (yaratishda birga yuboriladi)
3. Imtihon nashr etiladi               POST /api/v1/exams/{id}/publish/
4. O'quvchi kodini kiradi               POST /api/v1/exams/enter-code/
5. O'quvchi javoblarini topshiradi      POST /api/v1/exams/{id}/submit/
6. Natijalar ko'riladi                  GET  /api/v1/exam-results/
7. O'qituvchi yozma javoblarni tekshirib
   natijani belgilaydi                  PATCH /api/v1/exam-results/{id}/
```

---

*Dokumentatsiya: HPA (Harry-Potter Academy) Backend — Exam moduli*
