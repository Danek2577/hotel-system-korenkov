import useSWR from 'swr';
import Auth from '../../../../store/AuthStore';
import { fetchBookingAdmGetOne, BookingResponse } from '../../../../API/privateAPI';

// SWR key for cache invalidation
export const useBookingAdmGetOneKeys = (bookingId: number) => ['bookings', 'adm', bookingId];

interface UseBookingAdmGetOneParams {
    id: number | undefined;
}

const useBookingAdmGetOne = ({ id }: UseBookingAdmGetOneParams) => {
    const hook = useSWR<BookingResponse>(
        Auth.hash && id ? useBookingAdmGetOneKeys(id) : null,
        () => fetchBookingAdmGetOne({ bookingId: id! })
    );

    return {
        booking: hook?.data?.message,
        isLoading: hook.isLoading,
        error: hook.error,
        mutate: hook.mutate
    };
};

export default useBookingAdmGetOne;
