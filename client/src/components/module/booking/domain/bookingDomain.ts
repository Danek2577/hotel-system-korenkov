export interface BookingProps {
    id: number;
    room_id: number;
    guest_name: string;
    guest_phone: string;
    date_start: number;
    date_end: number;
    total_price: number;
    status: 'CONFIRMED' | 'CANCELLED';
    date_add: number;
    room?: {
        id: number;
        name: string;
        category: string;
        price: number;
    };
}

export interface BookingCreateProps {
    room_id: number;
    guest_name: string;
    guest_phone: string;
    date_start: number;
    date_end: number;
}

export interface BookingUpdateProps {
    bookingId: number;
    guest_name?: string;
    guest_phone?: string;
    date_start?: number;
    date_end?: number;
    status?: 'CONFIRMED' | 'CANCELLED';
}

export interface BookingsAdmGetParams {
    bookingId?: number;
    room_id?: number;
    guest_name?: string;
    status?: 'CONFIRMED' | 'CANCELLED';
    date_from?: number;
    date_to?: number;
    offset?: number;
    limit?: number;
}

// Status options for selects
export const BOOKING_STATUS_OPTIONS: BookingProps['status'][] = ['CONFIRMED', 'CANCELLED'];

// Status labels in Russian
export const BOOKING_STATUS_LABELS: Record<BookingProps['status'], string> = {
    CONFIRMED: 'Подтверждено',
    CANCELLED: 'Отменено'
};

// Status colors
export const BOOKING_STATUS_COLORS: Record<BookingProps['status'], 'success' | 'danger'> = {
    CONFIRMED: 'success',
    CANCELLED: 'danger'
};
