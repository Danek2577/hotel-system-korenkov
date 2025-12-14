import useSWR from 'swr';
import Auth from '../../../../store/AuthStore';
import { fetchRoomsAdmGet, RoomsAdmGetParams, RoomsResponse } from '../../../../API/roomAPI';

// SWR key for cache invalidation
export const useRoomsAdmGetKeys = (params?: RoomsAdmGetParams) => ['rooms', 'adm', params];

const useRoomsAdmGet = (params?: RoomsAdmGetParams) => {
    // Use Auth.isAuth for conditional fetching - accessing it to make it reactive if observer is used, 
    // but here we are in a hook. We should pass the auth state in the key or rely on SWR revalidating when key changes.
    // AuthStore.hash changes on login/logout, so we use it to construct the key.
    const isReady = Auth.isAuth && !Auth.isLoading;

    // Include Auth.hash in the key to force revalidation when user logs in/out
    const key = isReady ? [...useRoomsAdmGetKeys(params), Auth.hash] : null;

    const hook = useSWR<RoomsResponse>(
        key,
        () => fetchRoomsAdmGet(params),
        {
            revalidateOnFocus: false,
            keepPreviousData: true
        }
    );

    const responseData = hook?.data;
    // The API always returns { message: { count, rooms } } based on the interface
    const data = responseData?.message;

    return {
        ...hook,
        data,
        rooms: data?.rooms || [],
        count: data?.count || 0
    };
};

export default useRoomsAdmGet;
