import useSWR from 'swr';
import Auth from '../../../../store/AuthStore';
import { fetchBookingsAdmGet, BookingsAdmGetParams, BookingsResponse } from '../../../../API/privateAPI';

// SWR key for cache invalidation
export const useBookingsAdmGetKeys = (params?: BookingsAdmGetParams) => ['bookings', 'adm', params];

const useBookingsAdmGet = (params?: BookingsAdmGetParams) => {
    // Use Auth.isAuth for conditional fetching
    const isReady = Auth.isAuth && !Auth.isLoading;

    const hook = useSWR<BookingsResponse>(
        isReady ? useBookingsAdmGetKeys(params) : null,
        () => fetchBookingsAdmGet(params || {}),
        { revalidateOnFocus: false }
    );

    return {
        ...hook,
        data: hook?.data?.message,
        bookings: hook?.data?.message?.bookings || [],
        count: hook?.data?.message?.count || 0
    };
};

export default useBookingsAdmGet;
