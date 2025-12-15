import { $host, $authHost } from './index';

// ==================== TYPES ====================

// Room types
export interface Room {
    id: number;
    name: string;
    category: 'STANDARD' | 'LUXURY' | 'SUITE';
    price: number;
    capacity: number;
    status: 'AVAILABLE' | 'BOOKED' | 'MAINTENANCE';
    blocks: any[];
    is_published: boolean;
    date_add: number;
    date_edit: number | null;
}

export interface RoomCreateParams {
    name: string;
    category: 'STANDARD' | 'LUXURY' | 'SUITE';
    price: number;
    capacity: number;
    status?: 'AVAILABLE' | 'BOOKED' | 'MAINTENANCE';
    blocks?: any[];
    is_published?: boolean;
}

export interface RoomUpdateParams extends RoomCreateParams {
    roomId: number;
}

export interface RoomsAdmGetParams {
    roomId?: number;
    name?: string;
    category?: 'STANDARD' | 'LUXURY' | 'SUITE';
    status?: 'AVAILABLE' | 'BOOKED' | 'MAINTENANCE';
    offset?: number;
    limit?: number;
    sort_by?: 'price' | 'name' | 'id';
    order?: 'ASC' | 'DESC';
}

export interface RoomsResponse {
    message: {
        count: number;
        rooms: Room[];
    };
}

export interface RoomResponse {
    message: Room;
}

// Booking types
export interface Booking {
    id: number;
    room_id: number;
    guest_name: string;
    guest_phone: string;
    date_start: number;
    date_end: number;
    total_price: number;
    status: 'CONFIRMED' | 'CANCELLED';
    date_add: number;
    room?: Pick<Room, 'id' | 'name' | 'category' | 'price'>;
}

export interface BookingCreateParams {
    roomId: number;
    guest_name: string;
    guest_phone: string;
    date_start: number;
    date_end: number;
}

export interface BookingUpdateParams {
    bookingId: number;
    guest_name?: string;
    guest_phone?: string;
    date_start?: number;
    date_end?: number;
    status?: 'CONFIRMED' | 'CANCELLED';
}

export interface BookingsAdmGetParams {
    bookingId?: number;
    roomId?: number;
    guest_name?: string;
    status?: 'CONFIRMED' | 'CANCELLED';
    date_from?: number;
    date_to?: number;
    active_at?: number;
    offset?: number;
    limit?: number;
}

export interface BookingsResponse {
    message: {
        count: number;
        bookings: Booking[];
    };
}

export interface BookingResponse {
    message: Booking;
}

export interface AvailabilityResponse {
    message: {
        available: boolean;
        conflictingBookings: Array<{
            id: number;
            guest_name: string;
            date_start: number;
            date_end: number;
        }>;
    };
}

// Auth types
export interface LoginParams {
    email: string;
    password: string;
}

export interface RegisterParams extends LoginParams {
    name: string;
    role?: 'ADMIN' | 'MANAGER';
}

export interface AuthResponse {
    message: {
        token: string;
        user: {
            id: number;
            email: string;
            name: string;
            role: 'ADMIN' | 'MANAGER';
        };
    };
}

export interface UserResponse {
    message: {
        id: number;
        email: string;
        name: string;
        role: 'ADMIN' | 'MANAGER';
    };
}

export interface UsersResponse {
    message: {
        count: number;
        users: Array<{
            id: number;
            email: string;
            name: string;
            role: 'ADMIN' | 'MANAGER';
        }>;
    };
}

// Stats types
export interface DashboardStats {
    freeRooms: number;
    avgPrice: number;
    totalUsers: number;
}

// ==================== ROOM ENDPOINTS ====================

// Public endpoints
export const fetchRoomsPublicGet = async ({ offset, limit, category }: { offset?: number; limit?: number; category?: string } = {}) => {
    const { data } = await $host.get('/rooms', {
        params: { offset, limit, category }
    });
    return data;
};

export const fetchRoomPublicGetOne = async ({ roomId }: { roomId: number }) => {
    const { data } = await $host.get(`/rooms/${roomId}`);
    return data;
};

// Admin endpoints
export const fetchRoomsAdmGet = async ({
    roomId,
    name,
    category,
    status,
    offset,
    limit,
    sort_by,
    order
}: RoomsAdmGetParams = {}) => {
    const { data } = await $authHost.get('/rooms/adm/list', {
        params: { roomId, name, category, status, offset, limit, sort_by, order }
    });
    return data;
};

export const fetchRoomAdmGetOne = async ({ roomId }: { roomId: number }) => {
    const { data } = await $authHost.get(`/rooms/adm/${roomId}`);
    return data;
};

export const fetchRoomAdmCreate = async ({ name, category, price, capacity, status, blocks, is_published }: RoomCreateParams) => {
    const { data } = await $authHost.post('/rooms/adm', {
        name, category, price, capacity, status, blocks, is_published
    });
    return data;
};

export const fetchRoomAdmUpdate = async ({ roomId, name, category, price, capacity, status, blocks, is_published }: RoomUpdateParams) => {
    const { data } = await $authHost.put(`/rooms/adm/${roomId}`, {
        name, category, price, capacity, status, blocks, is_published
    });
    return data;
};

export const fetchRoomAdmDelete = async ({ roomId }: { roomId: number }) => {
    const { data } = await $authHost.delete(`/rooms/adm/${roomId}`);
    return data;
};

// ==================== BOOKING ENDPOINTS ====================

// Public endpoint
export const fetchBookingAvailabilityGet = async ({ roomId, dateStart, dateEnd, excludeBookingId }: { roomId: number; dateStart: number; dateEnd: number; excludeBookingId?: number }) => {
    const { data } = await $host.get('/bookings/availability', {
        params: { roomId, dateStart, dateEnd, excludeBookingId }
    });
    return data;
};

// Admin endpoints
export const fetchBookingsAdmGet = async ({
    bookingId,
    roomId,
    guest_name,
    status,
    date_from,
    date_to,
    active_at,
    offset,
    limit
}: BookingsAdmGetParams = {}) => {
    const { data } = await $authHost.get('/bookings/adm', {
        params: { bookingId, roomId, guest_name, status, date_from, date_to, active_at, offset, limit }
    });
    return data;
};

export const fetchBookingAdmGetOne = async ({ bookingId }: { bookingId: number }) => {
    const { data } = await $authHost.get(`/bookings/adm/${bookingId}`);
    return data;
};

export const fetchBookingAdmCreate = async ({ roomId, guest_name, guest_phone, date_start, date_end }: BookingCreateParams) => {
    const { data } = await $authHost.post('/bookings/adm', {
        roomId, guest_name, guest_phone, date_start, date_end
    });
    return data;
};

export const fetchBookingAdmUpdate = async ({ bookingId, guest_name, guest_phone, date_start, date_end, status }: BookingUpdateParams) => {
    const { data } = await $authHost.put(`/bookings/adm/${bookingId}`, {
        guest_name, guest_phone, date_start, date_end, status
    });
    return data;
};

export const fetchBookingAdmCancel = async ({ bookingId }: { bookingId: number }) => {
    const { data } = await $authHost.put(`/bookings/adm/${bookingId}/cancel`);
    return data;
};

export const fetchBookingAdmDelete = async ({ bookingId }: { bookingId: number }) => {
    const { data } = await $authHost.delete(`/bookings/adm/${bookingId}`);
    return data;
};

// ==================== AUTH ENDPOINTS ====================

export const fetchAuthLogin = async ({ email, password }: LoginParams) => {
    const { data } = await $host.post('/auth/login', { email, password });
    return data;
};

export const fetchAuthRegister = async ({ email, password, name, role }: RegisterParams) => {
    const { data } = await $host.post('/auth/register', { email, password, name, role });
    return data;
};

export const fetchAuthCheck = async () => {
    const { data } = await $authHost.get('/auth/check');
    return data;
};

// ==================== STATS ENDPOINTS ====================

/**
 * Получить статистику для дашборда
 * Использует Promise.allSettled для обработки ошибок отдельных запросов
 * @returns {Promise<DashboardStats>} - статистика дашборда
 */
export const fetchAdmDashboardStatsGet = async (): Promise<DashboardStats> => {
    const [roomsResult, bookingsResult, usersResult] = await Promise.allSettled([
        $authHost.get<RoomsResponse>('/rooms/adm/list'),
        $authHost.get<BookingsResponse>('/bookings/adm'),
        $authHost.get<UsersResponse>('/auth/users')
    ]);

    // Вспомогательная функция для получения данных из message или дефолтного значения
    const getData = <T>(result: PromiseSettledResult<any>, defaultVal: T): T => {
        if (result.status === 'fulfilled') {
            // API возвращает { message: { ... } }
            return result.value.data?.message || result.value.data || defaultVal;
        }
        return defaultVal;
    };

    const roomsData = getData(roomsResult, { rooms: [] });
    const bookingsData = getData(bookingsResult, { bookings: [] });
    const usersData = getData(usersResult, { count: 0, users: [] });

    // Приводим данные к массивам
    const rooms = Array.isArray(roomsData)
        ? roomsData
        : (roomsData.rooms || []);
    const bookings = Array.isArray(bookingsData)
        ? bookingsData
        : (bookingsData.bookings || []);

    // Для пользователей: если вернулась ошибка (например нет прав), будет 0
    let usersCount = 0;
    if (usersResult.status === 'fulfilled') {
        usersCount = usersData.count !== undefined
            ? usersData.count
            : (Array.isArray(usersData.users) ? usersData.users.length : 0);
    } else {
        console.warn("Не удалось загрузить пользователей (возможно нет прав)", usersResult.reason);
    }

    // Логика расчета статистики
    // Средняя стоимость
    const totalPrice = rooms.reduce((acc: number, room: any) => acc + Number(room.price), 0);
    const avgPrice = rooms.length > 0 ? Math.round(totalPrice / rooms.length) : 0;

    // Свободные номера (статус 'AVAILABLE')
    const freeCount = rooms.filter((r: any) => r.status === 'AVAILABLE').length;

    return {
        freeRooms: freeCount,
        avgPrice,
        totalUsers: usersCount || 0
    };
};
