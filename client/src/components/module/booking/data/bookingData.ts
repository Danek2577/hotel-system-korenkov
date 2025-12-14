import toast from 'react-hot-toast';
import {
    fetchBookingAdmCreate,
    fetchBookingAdmUpdate,
    fetchBookingAdmCancel,
    fetchBookingAdmDelete,
    BookingCreateParams,
    BookingUpdateParams
} from '../../../../API/bookingAPI';

// Create booking
export const bookingAdmCreate = async ({
    data,
    onSuccess
}: {
    data: BookingCreateParams;
    onSuccess?: () => Promise<void>;
}) => {
    const toastId = toast.loading('Создание бронирования...');
    try {
        const result = await fetchBookingAdmCreate(data);
        toast.success('Бронирование успешно создано', { id: toastId });
        onSuccess && await onSuccess();
        return result.message.id;
    } catch (e: any) {
        toast.error(e?.response?.data?.message || 'Произошла ошибка', { id: toastId });
        throw e;
    }
};

// Update booking
export const bookingAdmUpdate = async ({
    data,
    onSuccess
}: {
    data: BookingUpdateParams;
    onSuccess?: () => Promise<void>;
}) => {
    const toastId = toast.loading('Обновление бронирования...');
    try {
        await fetchBookingAdmUpdate(data);
        toast.success('Бронирование успешно обновлено', { id: toastId });
        onSuccess && await onSuccess();
    } catch (e: any) {
        toast.error(e?.response?.data?.message || 'Произошла ошибка', { id: toastId });
        throw e;
    }
};

// Cancel booking
export const bookingAdmCancel = async ({
    bookingId,
    onSuccess
}: {
    bookingId: number;
    onSuccess?: () => Promise<void>;
}) => {
    const toastId = toast.loading('Отмена бронирования...');
    try {
        await fetchBookingAdmCancel(bookingId);
        toast.success('Бронирование успешно отменено', { id: toastId });
        onSuccess && await onSuccess();
    } catch (e: any) {
        toast.error(e?.response?.data?.message || 'Произошла ошибка', { id: toastId });
        throw e;
    }
};

// Delete booking
export const bookingAdmDelete = async ({
    bookingId,
    onSuccess
}: {
    bookingId: number;
    onSuccess?: () => Promise<void>;
}) => {
    const toastId = toast.loading('Удаление бронирования...');
    try {
        await fetchBookingAdmDelete(bookingId);
        toast.success('Бронирование успешно удалено', { id: toastId });
        onSuccess && await onSuccess();
    } catch (e: any) {
        toast.error(e?.response?.data?.message || 'Произошла ошибка', { id: toastId });
        throw e;
    }
};
