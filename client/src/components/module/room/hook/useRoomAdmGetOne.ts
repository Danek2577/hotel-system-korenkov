import useSWR from 'swr';
import Auth from '../../../../store/AuthStore';
import { fetchRoomAdmGetOne, RoomResponse } from '../../../../API/roomAPI';

// SWR key for cache invalidation
export const useRoomAdmGetOneKeys = (roomId: number) => ['rooms', 'adm', roomId];

const useRoomAdmGetOne = (roomId: number | null) => {
    const hook = useSWR<RoomResponse>(
        Auth.hash && roomId ? useRoomAdmGetOneKeys(roomId) : null,
        () => fetchRoomAdmGetOne(roomId!)
    );

    return {
        ...hook,
        data: hook?.data?.message
    };
};

export default useRoomAdmGetOne;
