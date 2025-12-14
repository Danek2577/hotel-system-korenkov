import useSWR from 'swr';
import Auth from '../../../../store/AuthStore';
import { fetchBookingsAdmGet, BookingsAdmGetParams, BookingsResponse } from '../../../../API/bookingAPI';

// SWR key for cache invalidation
export const useBookingsAdmGetKeys = (params?: BookingsAdmGetParams) => ['bookings', 'adm', params];

const useBookingsAdmGet = (params?: BookingsAdmGetParams) => {
    // Use Auth.isAuth for conditional fetching
    const isReady = Auth.isAuth && !Auth.isLoading;

    // Include Auth.hash in the key to force revalidation when user logs in/out
    const key = isReady ? [...useBookingsAdmGetKeys(params), Auth.hash] : null;

    const hook = useSWR<BookingsResponse>(
        key,
        () => fetchBookingsAdmGet(params),
        {
            revalidateOnFocus: false,
            keepPreviousData: true
        }
    );

    const responseData = hook?.data;
    // The API always returns { message: { count, bookings } } based on the interface
    const data = responseData?.message;

    return {
        ...hook,
        data,
        bookings: data?.bookings || [],
        count: data?.count || 0
    };
};

export default useBookingsAdmGet;
