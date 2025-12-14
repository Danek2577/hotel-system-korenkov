export interface RoomProps {
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

export interface RoomCreateProps {
    name: string;
    category: 'STANDARD' | 'LUXURY' | 'SUITE';
    price: number;
    capacity: number;
    status?: 'AVAILABLE' | 'BOOKED' | 'MAINTENANCE';
    blocks?: any[];
    is_published?: boolean;
}

export interface RoomUpdateProps extends RoomCreateProps {
    roomId: number;
}

export interface RoomsAdmGetParams {
    roomId?: number;
    name?: string;
    category?: 'STANDARD' | 'LUXURY' | 'SUITE';
    status?: 'AVAILABLE' | 'BOOKED' | 'MAINTENANCE';
    offset?: number;
    limit?: number;
}

// Category labels in Russian
export const ROOM_CATEGORY_LABELS: Record<RoomProps['category'], string> = {
    STANDARD: 'Стандарт',
    LUXURY: 'Люкс',
    SUITE: 'Сьют'
};

// Status labels in Russian
export const ROOM_STATUS_LABELS: Record<RoomProps['status'], string> = {
    AVAILABLE: 'Доступен',
    BOOKED: 'Занят',
    MAINTENANCE: 'Обслуживание'
};

// Status colors
export const ROOM_STATUS_COLORS: Record<RoomProps['status'], 'success' | 'warning' | 'danger'> = {
    AVAILABLE: 'success',
    BOOKED: 'warning',
    MAINTENANCE: 'danger'
};
