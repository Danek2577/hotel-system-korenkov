import useSWR from 'swr';
import Auth from '../../../../store/AuthStore';
import { fetchBookingAdmGetOne, BookingResponse } from '../../../../API/bookingAPI';

// SWR key for cache invalidation
export const useBookingAdmGetOneKeys = (bookingId: number) => ['bookings', 'adm', bookingId];

const useBookingAdmGetOne = (bookingId: number | null) => {
    const hook = useSWR<BookingResponse>(
        Auth.hash && bookingId ? useBookingAdmGetOneKeys(bookingId) : null,
        () => fetchBookingAdmGetOne(bookingId!)
    );

    return {
        ...hook,
        data: hook?.data?.message
    };
};

export default useBookingAdmGetOne;
