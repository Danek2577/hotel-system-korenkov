import { $host, $authHost } from './index';

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

// Public endpoints
export const fetchRoomsPublicGet = async (params?: { offset?: number; limit?: number; category?: string }): Promise<RoomsResponse> => {
    const { data } = await $host.get('/rooms', { params });
    return data;
};

export const fetchRoomPublicGetOne = async (roomId: number): Promise<RoomResponse> => {
    const { data } = await $host.get(`/rooms/${roomId}`);
    return data;
};

// Admin endpoints
export const fetchRoomsAdmGet = async (params?: RoomsAdmGetParams): Promise<RoomsResponse> => {
    const { data } = await $authHost.get('/rooms/adm/list', { params });
    return data;
};

export const fetchRoomAdmGetOne = async (roomId: number): Promise<RoomResponse> => {
    const { data } = await $authHost.get(`/rooms/adm/${roomId}`);
    return data;
};

export const fetchRoomAdmCreate = async (params: RoomCreateParams): Promise<{ message: { id: number } }> => {
    const { data } = await $authHost.post('/rooms/adm', params);
    return data;
};

export const fetchRoomAdmUpdate = async ({ roomId, ...params }: RoomUpdateParams): Promise<{ message: boolean }> => {
    const { data } = await $authHost.put(`/rooms/adm/${roomId}`, params);
    return data;
};

export const fetchRoomAdmDelete = async (roomId: number): Promise<{ message: boolean }> => {
    const { data } = await $authHost.delete(`/rooms/adm/${roomId}`);
    return data;
};
