import { $host, $authHost } from './index';
import { Room } from './roomAPI';

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

// Public endpoint - check availability
export const fetchBookingAvailabilityGet = async (params: {
    roomId: number;
    dateStart: number;
    dateEnd: number;
}): Promise<AvailabilityResponse> => {
    const { data } = await $host.get('/bookings/availability', { params });
    return data;
};

// Admin endpoints
export const fetchBookingsAdmGet = async (params?: BookingsAdmGetParams): Promise<BookingsResponse> => {
    const { data } = await $authHost.get('/bookings/adm', { params });
    return data;
};

export const fetchBookingAdmGetOne = async (bookingId: number): Promise<BookingResponse> => {
    const { data } = await $authHost.get(`/bookings/adm/${bookingId}`);
    return data;
};

export const fetchBookingAdmCreate = async (params: BookingCreateParams): Promise<{ message: { id: number } }> => {
    const { data } = await $authHost.post('/bookings/adm', params);
    return data;
};

export const fetchBookingAdmUpdate = async ({ bookingId, ...params }: BookingUpdateParams): Promise<{ message: boolean }> => {
    const { data } = await $authHost.put(`/bookings/adm/${bookingId}`, params);
    return data;
};

export const fetchBookingAdmCancel = async (bookingId: number): Promise<{ message: boolean }> => {
    const { data } = await $authHost.put(`/bookings/adm/${bookingId}/cancel`);
    return data;
};

export const fetchBookingAdmDelete = async (bookingId: number): Promise<{ message: boolean }> => {
    const { data } = await $authHost.delete(`/bookings/adm/${bookingId}`);
    return data;
};
