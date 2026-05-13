# Boshlang'ich Jadvallar Strukturasi (ERD)

Loyihaniz uchun qabul qilingan asosiy ERD strukturasi va xavfsizlik modeli (Supabase/PostgreSQL) bo'yicha hujjat.

## 1. Umumiy Qoidalar (Best Practices)
Barcha jadvallar uchun majburiy ustunlar kiritildi:
- `id`: `UUID PRIMARY KEY` tartibida generatsiya qilinadi (`gen_random_uuid()`).
- `tenant_id`: Multi-tenant tizimni qo'llab-quvvatlash uchun. RLS (Row-Level Security) da har bir foydalanuvchi faqat o'z `tenant_id`siga tegishli ma'lumotlarni ko'rishini ta'minlaydi.
- `metadata` (Yoki `settings` / `preferences`): `JSONB` formatida belgilanib, relatsion bo'lmagan, tez o'zgaruvchan qatorlar (biznes parametrlar) uchun ishlatiladi.
- Audit va Soft Delete: `created_at`, `updated_at`, `deleted_at`, `created_by`, `updated_by` kabi maydonlar kiritildi.
- Performance (Indexlar): Ko'p qidiriladigan `tenant_id`, `email`, va `transaction_date` lari indekssalandi (B-Tree).

## 2. ERD (Mermaid)

```mermaid
erDiagram
    TENANT ||--o{ USER_PROFILE : has
    TENANT ||--o{ CUSTOMER : has
    TENANT ||--o{ TRANSACTION : has

    USER_PROFILE ||--o{ CUSTOMER : "creates/updates"
    USER_PROFILE ||--o{ TRANSACTION : "creates/updates"

    TENANT {
        UUID id PK
        VARCHAR name
        VARCHAR domain UK
        JSONB settings
        BOOLEAN is_active
        TIMESTAMP created_at
        TIMESTAMP updated_at
        TIMESTAMP deleted_at
    }

    USER_PROFILE {
        UUID id PK
        UUID auth_user_id UK "Supabase Auth"
        UUID tenant_id FK
        VARCHAR email UK
        VARCHAR full_name
        VARCHAR role
        JSONB preferences
        TIMESTAMP created_at
        TIMESTAMP updated_at
        TIMESTAMP deleted_at
    }

    CUSTOMER {
        UUID id PK
        UUID tenant_id FK
        VARCHAR type "individual | company"
        VARCHAR name
        VARCHAR phone
        JSONB metadata
        TIMESTAMP created_at
        TIMESTAMP updated_at
        TIMESTAMP deleted_at
    }

    TRANSACTION {
        UUID id PK
        UUID tenant_id FK
        VARCHAR type "income | expense"
        NUMERIC amount
        TIMESTAMP transaction_date
        JSONB metadata
        TIMESTAMP created_at
        TIMESTAMP updated_at
        TIMESTAMP deleted_at
    }
```

## 3. Fayllar ro'yxati
- `/tools/database_helper.sql`: Avtomat `updated_at` triggerini taminlash uchun yordamchi saqlangan-protseduralar funksiyasi (Function/Trigger). 
- `/supabase/migrations/00000_initial_schema.sql`: Jadvallar, constraint'lar va Row-Level Security (RLS) xavfsizlik siyosati o'rnatish skriptlari jamlangan SQL fayl.
