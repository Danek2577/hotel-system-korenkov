## 2.3.1. Структура серверной части (Backend)

Серверная часть организована по принципу Singleton-сервисов. Это означает, что для каждой сущности создается один экземпляр сервиса, который экспортируется и переиспользуется во всем приложении.

### Модели (Models) — `server/models/`

Классы, наследуемые от `sequelize.Model`. Они описывают структуру таблиц и типы данных.

**UserModel.js**: Описывает таблицу `users`.
- Поля: `id`, `email` (уникальный), `password_hash`, `name`, `role` (ENUM: 'ADMIN', 'MANAGER'), `date_add`, `date_delete` (soft delete)

**RoomModel.js**: Описывает таблицу `rooms`.
- Поля: `id`, `name`, `category` (ENUM: 'STANDARD', 'LUXURY', 'SUITE'), `price` (DECIMAL), `capacity`, `status` (ENUM: 'AVAILABLE', 'BOOKED', 'MAINTENANCE'), `blocks` (JSON), `is_published`, `date_add`, `date_edit`, `date_delete` (soft delete)
- Связи: `hasMany` с BookingModel через `room_id`

**BookingModel.js**: Описывает таблицу `bookings` и связь `belongsTo` с номером.
- Поля: `id`, `room_id` (FK), `guest_name`, `guest_phone`, `date_start` (UNIX timestamp), `date_end` (UNIX timestamp), `total_price` (DECIMAL), `status` (ENUM: 'CONFIRMED', 'CANCELLED'), `date_add`, `date_delete` (soft delete)
- Связи: `belongsTo` RoomModel через `room_id`

### Сервисы (Services) — `server/service/`

Содержат чистую бизнес-логику. Методы сервисов не зависят от HTTP-запросов.

**UserService** (экспортируется как `new UserService()`):
- `authRegister({ email, password, name, role })`: Регистрация нового пользователя с проверкой уникальности email, хешированием пароля, генерацией JWT токена
- `authLogin({ email, password })`: Авторизация пользователя с проверкой пароля через bcrypt, генерацией JWT токена
- `authCheck({ userId })`: Получение информации о текущем пользователе по ID
- `admGet({ offset, limit })`: Получение списка всех пользователей с пагинацией (Admin)

**RoomService** (экспортируется как `new RoomService()`):
- `admCreate({ name, category, price, capacity, status, blocks, is_published })`: Создание номера с использованием транзакции
- `admUpdate({ roomId, name, category, price, capacity, status, blocks, is_published })`: Обновление номера с проверкой существования, использованием транзакции и блокировкой записи
- `admGet({ roomId, name, category, status, offset, limit, sort_by, order })`: Получение списка номеров с фильтрацией, пагинацией и сортировкой (Admin)
- `admGetOne(roomId)`: Получение одного номера с активными бронированиями (Admin)
- `roomPublicGet({ offset, limit, category })`: Получение списка опубликованных номеров для гостевой части с фильтрацией по категории
- `roomPublicGetOne(roomId)`: Получение одного опубликованного номера для гостевой части
- `admDelete(roomId)`: Мягкое удаление номера с проверкой активных бронирований, использованием транзакции

**BookingService** (экспортируется как `new BookingService()`):
- `admCreate({ roomId, guest_name, guest_phone, date_start, date_end })`: Создание бронирования с проверкой существования номера, проверкой статуса номера, алгоритмом проверки пересечения дат, расчетом итоговой цены (количество ночей × цена), использованием транзакции
- `admUpdate({ bookingId, guest_name, guest_phone, date_start, date_end, status })`: Обновление бронирования с проверкой коллизий дат при изменении, пересчетом цены при изменении дат, использованием транзакции
- `admGet({ bookingId, roomId, guest_name, status, date_from, date_to, active_at, offset, limit })`: Получение списка бронирований с фильтрацией по различным параметрам, пагинацией, включением информации о номере
- `admGetOne(bookingId)`: Получение одного бронирования с информацией о номере (Admin)
- `admCancel(bookingId)`: Отмена бронирования (изменение статуса на 'CANCELLED')
- `admDelete(bookingId)`: Мягкое удаление бронирования
- `bookingAvailabilityGet({ roomId, dateStart, dateEnd, excludeBookingId })`: Проверка доступности номера на указанный период с возвратом информации о конфликтующих бронированиях

### Контроллеры (Controllers) — `server/controllers/`

Отвечают за обработку HTTP-запросов, валидацию входных данных и вызов методов сервисов.

**AuthController**:
- `register`: Принимает `req.body`, валидирует через `authRegister`, вызывает `UserService.authRegister`, возвращает токен и пользователя
- `login`: Принимает `req.body`, валидирует через `authLogin`, вызывает `UserService.authLogin`, возвращает токен и пользователя
- `check`: Принимает `userId` из `req.body` (после JWT middleware), вызывает `UserService.authCheck`, возвращает информацию о пользователе
- `admGet`: Принимает `req.query`, валидирует через `authAdmGet`, вызывает `UserService.admGet`, возвращает список пользователей (Admin)

**RoomController**:
- `admCreate`: Принимает `req.body`, валидирует через `roomCreate`, вызывает `RoomService.admCreate`, возвращает ID созданного номера
- `admUpdate`: Принимает `req.body` и `req.params.roomId`, валидирует через `roomUpdate`, вызывает `RoomService.admUpdate`, возвращает успешный результат
- `admGet`: Принимает `req.query`, валидирует через `roomAdmGet`, вызывает `RoomService.admGet`, возвращает список номеров с пагинацией
- `admGetOne`: Принимает `req.params.roomId`, валидирует через `roomAdmGetOne`, вызывает `RoomService.admGetOne`, возвращает номер
- `admDelete`: Принимает `req.params.roomId`, валидирует через `roomAdmGetOne`, вызывает `RoomService.admDelete`, возвращает успешный результат
- `roomPublicGet`: Принимает `req.query` (offset, limit, category), вызывает `RoomService.roomPublicGet`, возвращает список опубликованных номеров
- `roomPublicGetOne`: Принимает `req.params.roomId`, вызывает `RoomService.roomPublicGetOne`, возвращает опубликованный номер

**BookingController**:
- `admCreate`: Принимает `req.body`, валидирует через `bookingCreate`, вызывает `BookingService.admCreate`, возвращает ID созданного бронирования
- `admUpdate`: Принимает `req.body` и `req.params.bookingId`, валидирует через `bookingUpdate`, вызывает `BookingService.admUpdate`, возвращает успешный результат
- `admGet`: Принимает `req.query`, валидирует через `bookingAdmGet`, вызывает `BookingService.admGet`, возвращает список бронирований с пагинацией
- `admGetOne`: Принимает `req.params.bookingId`, валидирует через `bookingAdmGetOne`, вызывает `BookingService.admGetOne`, возвращает бронирование
- `admCancel`: Принимает `req.params.bookingId`, валидирует через `bookingCancel`, вызывает `BookingService.admCancel`, возвращает успешный результат
- `admDelete`: Принимает `req.params.bookingId`, валидирует через `bookingAdmGetOne`, вызывает `BookingService.admDelete`, возвращает успешный результат
- `bookingAvailabilityGet`: Принимает `req.query`, валидирует через `bookingAvailability`, вызывает `BookingService.bookingAvailabilityGet`, возвращает информацию о доступности номера

### Валидация (Validation) — `server/utils/validation/`

Используется библиотека Joi.

**validationScheme.js**: Содержит схемы валидации для всех эндпоинтов:
- `authLogin`: Валидация email и password для входа
- `authRegister`: Валидация email, password, name, role для регистрации
- `authAdmGet`: Валидация offset и limit для получения списка пользователей (Admin)
- `roomCreate`: Валидация name, category, price, capacity, status, blocks, is_published для создания номера
- `roomUpdate`: Расширение `roomCreate` с добавлением обязательного `roomId`
- `roomAdmGet`: Валидация фильтров и пагинации для получения списка номеров (Admin)
- `roomAdmGetOne`: Валидация roomId для получения одного номера
- `bookingCreate`: Валидация roomId, guest_name, guest_phone, date_start, date_end с проверкой, что date_end > date_start
- `bookingUpdate`: Валидация опциональных полей для обновления бронирования
- `bookingAdmGet`: Валидация фильтров и пагинации для получения списка бронирований
- `bookingAdmGetOne`: Валидация bookingId для получения одного бронирования
- `bookingCancel`: Валидация bookingId для отмены бронирования
- `bookingAvailability`: Валидация roomId, dateStart, dateEnd, excludeBookingId для проверки доступности номера

### Роутеры (Routers) — `server/routers/`

Определяют маршруты API и применяют middleware для аутентификации и авторизации.

**authRouter.js**:
- `POST /auth/register` (публичный): Регистрация нового пользователя
- `POST /auth/login` (публичный): Вход в систему
- `GET /auth/check` (авторизованный): Проверка текущего пользователя
- `GET /auth/users` (только ADMIN): Получение списка всех пользователей

**roomRouter.js**:
- `GET /rooms/` (публичный): Получение списка опубликованных номеров
- `GET /rooms/:roomId` (публичный): Получение одного опубликованного номера
- `GET /rooms/adm/list` (ADMIN, MANAGER): Получение списка всех номеров
- `GET /rooms/adm/:roomId` (ADMIN, MANAGER): Получение одного номера
- `POST /rooms/adm` (ADMIN, MANAGER): Создание номера
- `PUT /rooms/adm/:roomId` (ADMIN, MANAGER): Обновление номера
- `DELETE /rooms/adm/:roomId` (только ADMIN): Удаление номера

**bookingRouter.js**:
- `GET /bookings/availability` (публичный): Проверка доступности номера на даты
- `GET /bookings/adm` (ADMIN, MANAGER): Получение списка бронирований
- `GET /bookings/adm/:bookingId` (ADMIN, MANAGER): Получение одного бронирования
- `POST /bookings/adm` (ADMIN, MANAGER): Создание бронирования
- `PUT /bookings/adm/:bookingId` (ADMIN, MANAGER): Обновление бронирования
- `PUT /bookings/adm/:bookingId/cancel` (ADMIN, MANAGER): Отмена бронирования
- `DELETE /bookings/adm/:bookingId` (только ADMIN): Удаление бронирования

