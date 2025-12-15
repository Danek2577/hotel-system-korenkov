import toast from 'react-hot-toast';
import { fetchRoomAdmCreate, fetchRoomAdmUpdate, fetchRoomAdmDelete, RoomCreateParams, RoomUpdateParams } from '../../../../API/privateAPI';

// Create room
export const roomAdmCreate = async ({
    data,
    onSuccess
}: {
    data: RoomCreateParams;
    onSuccess?: () => Promise<void>;
}) => {
    const toastId = toast.loading('Создание номера...');
    try {
        const result = await fetchRoomAdmCreate(data);
        toast.success('Номер успешно создан', { id: toastId });
        onSuccess && await onSuccess();
        return result.message.id;
    } catch (e: any) {
        toast.error(e?.response?.data?.message || 'Произошла ошибка', { id: toastId });
        throw e;
    }
};

// Update room
export const roomAdmUpdate = async ({
    data,
    onSuccess
}: {
    data: RoomUpdateParams;
    onSuccess?: () => Promise<void>;
}) => {
    const toastId = toast.loading('Обновление номера...');
    try {
        await fetchRoomAdmUpdate(data);
        toast.success('Номер успешно обновлён', { id: toastId });
        onSuccess && await onSuccess();
    } catch (e: any) {
        toast.error(e?.response?.data?.message || 'Произошла ошибка', { id: toastId });
        throw e;
    }
};

// Delete room
export const roomAdmDelete = async ({
    roomId,
    onSuccess
}: {
    roomId: number;
    onSuccess?: () => Promise<void>;
}) => {
    const toastId = toast.loading('Удаление номера...');
    try {
        await fetchRoomAdmDelete({ roomId });
        toast.success('Номер успешно удалён', { id: toastId });
        onSuccess && await onSuccess();
    } catch (e: any) {
        toast.error(e?.response?.data?.message || 'Произошла ошибка', { id: toastId });
        throw e;
    }
};
