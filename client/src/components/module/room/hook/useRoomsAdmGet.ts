import useSWR from 'swr';
import Auth from '../../../../store/AuthStore';
import { fetchRoomsAdmGet, RoomsAdmGetParams, RoomsResponse } from '../../../../API/privateAPI';

// SWR key for cache invalidation
export const useRoomsAdmGetKeys = (params?: RoomsAdmGetParams) => ['rooms', 'adm', params];

const useRoomsAdmGet = (params?: RoomsAdmGetParams) => {
    // Use Auth.isAuth for conditional fetching
    const isReady = Auth.isAuth && !Auth.isLoading;

    const hook = useSWR<RoomsResponse>(
        isReady ? useRoomsAdmGetKeys(params) : null,
        () => fetchRoomsAdmGet(params || {}),
        { revalidateOnFocus: false }
    );

    return {
        ...hook,
        data: hook?.data?.message,
        rooms: hook?.data?.message?.rooms || [],
        count: hook?.data?.message?.count || 0
    };
};

export default useRoomsAdmGet;
