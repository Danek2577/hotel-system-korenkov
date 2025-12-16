# 🏨 Hotel Management System

Полнофункциональная система управления отелем с современным стеком технологий.

## 🚀 Стек технологий

### Backend
- **Node.js** + **Express.js** - серверный фреймворк
- **MySQL** + **Sequelize ORM** - база данных
- **JWT** (jsonwebtoken) + **BCrypt** - аутентификация и хеширование паролей
- **Joi** - валидация данных
- **dotenv** - управление переменными окружения
- **CORS** - настройка CORS для фронтенда

### Frontend
- **Next.js 14** (Pages Router) + **TypeScript**
- **NextUI** + **Tailwind CSS** - UI компоненты и стилизация
- **MobX** + **mobx-react-lite** - управление состоянием
- **SWR** - кэширование и автоматическое обновление данных
- **Axios** - HTTP клиент
- **react-hook-form** - управление формами
- **react-hot-toast** - уведомления

## 📁 Структура проекта

```
hotel-system/
├── server/                      # Backend (Node.js + Express)
│   ├── controllers/             # HTTP контроллеры
│   │   ├── authController.js
│   │   ├── bookingController.js
│   │   └── roomController.js
│   ├── service/                 # Бизнес-логика (Singleton)
│   │   ├── userService.js
│   │   ├── roomService.js
│   │   └── bookingService.js
│   ├── models/                  # Sequelize модели
│   │   ├── UserModel.js
│   │   ├── RoomModel.js
│   │   ├── BookingModel.js
│   │   └── index.js
│   ├── routers/                 # Express роутеры
│   │   ├── authRouter.js
│   │   ├── roomRouter.js
│   │   ├── bookingRouter.js
│   │   └── index.js
│   ├── middleware/              # Middleware
│   │   ├── authJwt.js          # JWT авторизация
│   │   └── endHandler.js        # Обработка ответов
│   ├── utils/                   # Утилиты
│   │   ├── httpError.js
│   │   └── validation/          # Joi валидация
│   │       ├── validationScheme.js
│   │       └── validationUtility.js
│   ├── index.js                 # Точка входа сервера
│   └── package.json
│
├── client/                      # Frontend (Next.js)
│   ├── pages/                   # Next.js страницы
│   │   ├── lk/                  # Личный кабинет
│   │   │   ├── rooms/           # Управление номерами
│   │   │   └── bookings/        # Управление бронированиями
│   │   ├── login/               # Авторизация
│   │   └── registration/        # Регистрация
│   └── src/
│       ├── API/                 # Axios запросы
│       │   ├── index.ts         # Настройка Axios
│       │   └── privateAPI.ts    # API функции
│       ├── components/          # React компоненты
│       │   ├── module/          # Модули по сущностям
│       │   │   ├── room/        # Модуль номеров
│       │   │   │   ├── data/    # Функции данных
│       │   │   │   ├── domain/  # TypeScript типы
│       │   │   │   ├── hook/    # SWR хуки
│       │   │   │   └── ui/      # UI компоненты
│       │   │   └── booking/     # Модуль бронирований
│       │   └── ui/              # Переиспользуемые UI
│       ├── store/               # MobX сторы
│       │   └── AuthStore.ts
│       ├── hooks/               # Кастомные хуки
│       │   ├── useAuth.ts
│       │   └── useDebounce.ts
│       └── utils/               # Утилиты
│           └── dateUtils.ts
│
├── docker-compose.yml           # Docker конфигурация для MySQL
├── package.json                 # Workspace конфигурация
└── README.md
```

## 🗄️ База данных

### Таблицы

**users** - пользователи системы
- `id` (INT, PK, AUTO_INCREMENT)
- `email` (VARCHAR(255), UNIQUE, NOT NULL)
- `password_hash` (VARCHAR(255), NOT NULL)
- `name` (VARCHAR(100), NOT NULL)
- `role` (ENUM: 'ADMIN', 'MANAGER', NOT NULL, DEFAULT 'MANAGER')
- `date_add` (INT, NOT NULL) - UNIX timestamp
- `date_delete` (INT, NULL) - soft delete

**rooms** - номера отеля
- `id` (INT, PK, AUTO_INCREMENT)
- `name` (VARCHAR(100), NOT NULL)
- `category` (ENUM: 'STANDARD', 'LUXURY', 'SUITE', NOT NULL, DEFAULT 'STANDARD')
- `price` (DECIMAL(10,2), NOT NULL)
- `capacity` (INT, NOT NULL, DEFAULT 2)
- `status` (ENUM: 'AVAILABLE', 'BOOKED', 'MAINTENANCE', NOT NULL, DEFAULT 'AVAILABLE')
- `blocks` (JSON, DEFAULT [])
- `is_published` (BOOLEAN, NOT NULL, DEFAULT true)
- `date_add` (INT, NOT NULL)
- `date_edit` (INT, NULL)
- `date_delete` (INT, NULL) - soft delete

**bookings** - бронирования
- `id` (INT, PK, AUTO_INCREMENT)
- `room_id` (INT, FK → rooms.id, NOT NULL)
- `guest_name` (VARCHAR(200), NOT NULL)
- `guest_phone` (VARCHAR(20), NOT NULL)
- `date_start` (INT, NOT NULL) - UNIX timestamp
- `date_end` (INT, NOT NULL) - UNIX timestamp
- `total_price` (DECIMAL(10,2), NOT NULL)
- `status` (ENUM: 'CONFIRMED', 'CANCELLED', NOT NULL, DEFAULT 'CONFIRMED')
- `date_add` (INT, NOT NULL)
- `date_delete` (INT, NULL) - soft delete

### Особенности
- Все даты хранятся как UNIX timestamp (секунды)
- Soft delete через поле `date_delete` (NULL = не удалено)
- Автоматическая проверка коллизий бронирований (пересечение дат)
- Связи: `rooms.hasMany(bookings)`, `bookings.belongsTo(rooms)`

## 🔧 Установка и запуск

### 1. Клонирование репозитория

```bash
git clone <repository-url>
cd hotel-system
```

### 2. Настройка базы данных

#### Вариант A: Docker (рекомендуется)

```bash
docker-compose up -d
```

MySQL будет доступен на `localhost:3306`:
- Database: `hotel_system`
- User: `root`
- Password: `root`

#### Вариант B: Локальная MySQL

Создайте базу данных:
```sql
CREATE DATABASE hotel_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. Настройка Backend

```bash
cd server

# Создайте .env файл
cat > .env << EOF
DB_NAME=hotel_system
DB_USER=root
DB_PASSWORD=root
DB_HOST=localhost
DB_PORT=3306
JWT_SECRET=your_secret_key_here
NODE_ENV=development
PORT=5000
EOF

# Установите зависимости
npm install
```

### 4. Настройка Frontend

```bash
cd ../client

# Установите зависимости
npm install
```

**Примечание:** API URL захардкожен в `client/src/API/index.ts` как `http://localhost:5000/api/`

### 5. Запуск приложения

#### Вариант A: Запуск через workspace (оба сервера одновременно)

```bash
# В корне проекта
npm install
npm run dev
```

#### Вариант B: Запуск по отдельности

```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

Серверы будут доступны:
- Backend: `http://localhost:5000`
- Frontend: `http://localhost:3000`

## 📡 API Endpoints

Базовый URL: `http://localhost:5000/api`

### Авторизация (Auth)

| Method | Endpoint | Описание | Авторизация |
|--------|----------|----------|-------------|
| POST | `/auth/register` | Регистрация нового пользователя | Публичный |
| POST | `/auth/login` | Вход в систему | Публичный |
| GET | `/auth/check` | Проверка текущего пользователя | Требуется токен |
| GET | `/auth/users` | Список всех пользователей | Только ADMIN |

**Пример запроса регистрации:**
```json
POST /api/auth/register
{
  "email": "admin@example.com",
  "password": "password123",
  "name": "Администратор",
  "role": "ADMIN"
}
```

**Пример ответа:**
```json
{
  "message": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "admin@example.com",
      "name": "Администратор",
      "role": "ADMIN"
    }
  }
}
```

### Номера (Rooms)

| Method | Endpoint | Описание | Авторизация |
|--------|----------|----------|-------------|
| GET | `/rooms` | Публичный список номеров | Публичный |
| GET | `/rooms/:roomId` | Публичный номер | Публичный |
| GET | `/rooms/adm/list` | Список номеров с фильтрацией | ADMIN, MANAGER |
| GET | `/rooms/adm/:roomId` | Получение номера | ADMIN, MANAGER |
| POST | `/rooms/adm` | Создание номера | ADMIN, MANAGER |
| PUT | `/rooms/adm/:roomId` | Обновление номера | ADMIN, MANAGER |
| DELETE | `/rooms/adm/:roomId` | Удаление номера | Только ADMIN |

**Пример запроса с фильтрацией:**
```
GET /api/rooms/adm/list?status=AVAILABLE&sort_by=price&order=ASC&offset=0&limit=20
Authorization: Bearer <token>
```

**Query параметры для `/rooms/adm/list`:**
- `roomId` - фильтр по ID
- `name` - поиск по названию (substring)
- `category` - фильтр по категории (STANDARD, LUXURY, SUITE)
- `status` - фильтр по статусу (AVAILABLE, BOOKED, MAINTENANCE)
- `sort_by` - сортировка (price, name, id)
- `order` - порядок сортировки (ASC, DESC)
- `offset` - смещение для пагинации (по умолчанию 0)
- `limit` - количество записей (по умолчанию 20, максимум 100)

**Пример создания номера:**
```json
POST /api/rooms/adm
Authorization: Bearer <token>
{
  "name": "Люкс с видом на море",
  "category": "LUXURY",
  "price": 5000,
  "capacity": 2,
  "status": "AVAILABLE",
  "blocks": [],
  "is_published": true
}
```

### Бронирования (Bookings)

| Method | Endpoint | Описание | Авторизация |
|--------|----------|----------|-------------|
| GET | `/bookings/availability` | Проверка доступности номера | Публичный |
| GET | `/bookings/adm` | Список бронирований с фильтрацией | ADMIN, MANAGER |
| GET | `/bookings/adm/:bookingId` | Получение бронирования | ADMIN, MANAGER |
| POST | `/bookings/adm` | Создание бронирования | ADMIN, MANAGER |
| PUT | `/bookings/adm/:bookingId` | Обновление бронирования | ADMIN, MANAGER |
| PUT | `/bookings/adm/:bookingId/cancel` | Отмена бронирования | ADMIN, MANAGER |
| DELETE | `/bookings/adm/:bookingId` | Удаление бронирования | Только ADMIN |

**Пример проверки доступности:**
```
GET /api/bookings/availability?roomId=1&dateStart=1704067200&dateEnd=1704153600
```

**Query параметры для `/bookings/adm`:**
- `bookingId` - фильтр по ID
- `roomId` - фильтр по номеру
- `guest_name` - поиск по имени гостя (substring)
- `status` - фильтр по статусу (CONFIRMED, CANCELLED)
- `date_from` - фильтр по дате начала (UNIX timestamp)
- `date_to` - фильтр по дате окончания (UNIX timestamp)
- `active_at` - фильтр активных бронирований на указанную дату
- `offset` - смещение для пагинации
- `limit` - количество записей

**Пример создания бронирования:**
```json
POST /api/bookings/adm
Authorization: Bearer <token>
{
  "roomId": 1,
  "guest_name": "Иван Иванов",
  "guest_phone": "+79991234567",
  "date_start": 1704067200,
  "date_end": 1704153600
}
```

**Примечание:** Система автоматически:
- Проверяет коллизии дат (пересечение с существующими бронированиями)
- Рассчитывает итоговую цену (количество ночей × цена номера)
- Использует транзакции для атомарности операций

## 🔐 Авторизация

### JWT токены

- **Хранение:** Токен сохраняется в `localStorage` на клиенте
- **Формат:** `Bearer <token>` в заголовке `Authorization`
- **Время жизни:** 7 дней
- **Payload:** `{ id: number, role: 'ADMIN' | 'MANAGER' }`

### Роли

- **ADMIN** - полный доступ ко всем операциям
- **MANAGER** - доступ к управлению номерами и бронированиями (не может удалять номера)

### Пример использования в Postman

1. **Авторизация:**
```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "password123"
}
```

2. **Копируйте токен из ответа**

3. **Используйте токен в запросах:**
```
GET http://localhost:5000/api/rooms/adm/list
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 📝 Валидация

Все сообщения об ошибках на русском языке через Joi:

- `"Поле 'Электронная почта' обязательно для заполнения"`
- `"Цена должна быть положительным числом"`
- `"На выбранные даты номер уже занят"`
- `"Дата выезда должна быть позже даты заезда"`

Валидация происходит в контроллерах перед вызовом сервисов.

## 🛠 Разработка

### Архитектурные принципы

**Backend:**
- **3-Layer Architecture:** Controller → Service → Model
- **Singleton Services:** `module.exports = new Service()` для переиспользования
- **Транзакции Sequelize** для операций с несколькими записями
- **Middleware pattern:** `authJwt` для авторизации, `endHandler` для унифицированных ответов
- **Валидация через Joi** перед обработкой в сервисах

**Frontend:**
- **Модульная структура:** Каждая сущность в своей папке (`module/room`, `module/booking`)
- **SWR Hooks** вместо `useEffect` для data fetching с автоматическим кешированием
- **MobX Store** для глобального состояния (авторизация)
- **React Hook Form** для управления формами
- **TypeScript** для типобезопасности

### Нейминг

**Backend:**
- Сервисы: `roomService`, `bookingService`, `userService`
- Методы: `admCreate`, `admUpdate`, `admGet`, `admGetOne`, `admDelete`
- Контроллеры: `roomController`, `bookingController`, `authController`

**Frontend:**
- API функции: `fetchRoomsAdmGet`, `fetchBookingAdmCreate`
- Хуки: `useRoomsAdmGet`, `useBookingAdmGetOne`
- Data функции: `roomAdmCreate`, `bookingAdmUpdate`

### Переменные окружения

**Backend (.env):**
```env
DB_NAME=hotel_system
DB_USER=root
DB_PASSWORD=root
DB_HOST=localhost
DB_PORT=3306
JWT_SECRET=your_secret_key_here
NODE_ENV=development
PORT=5000
```

## 🧪 Тестирование API

### Примеры тестовых сценариев

1. **Создание номера с некорректной ценой:**
```
POST /api/rooms/adm
{
  "name": "Тест",
  "category": "STANDARD",
  "price": -100,
  "capacity": 2
}
```
Ожидается: `400 Bad Request` с сообщением "Цена должна быть положительным числом"

2. **Фильтрация и сортировка номеров:**
```
GET /api/rooms/adm/list?status=AVAILABLE&sort_by=price&order=ASC
```
Ожидается: JSON с массивом номеров, отсортированных по возрастанию цены

3. **Создание бронирования с коллизией дат:**
```
POST /api/bookings/adm
{
  "roomId": 1,
  "guest_name": "Тест",
  "guest_phone": "+79991234567",
  "date_start": 1704067200,
  "date_end": 1704153600
}
```
Если на эти даты номер уже занят, ожидается: `400 Bad Request` с сообщением "На выбранные даты номер уже занят"

## 📄 Лицензия

MIT
