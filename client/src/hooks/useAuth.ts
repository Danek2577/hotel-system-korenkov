import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { observer } from 'mobx-react-lite';
import Auth from '../store/AuthStore';

/**
 * Hook for checking authentication on protected pages
 */
export const useAuthGuard = (requiredRoles?: ('ADMIN' | 'MANAGER')[]) => {
    const router = useRouter();

    useEffect(() => {
        if (!Auth.isLoading) {
            if (!Auth.isAuth) {
                router.replace('/login');
            } else if (requiredRoles && requiredRoles.length > 0) {
                if (!requiredRoles.includes(Auth.user!.role)) {
                    router.replace('/lk');
                }
            }
        }
    }, [Auth.isLoading, Auth.isAuth, Auth.user?.role, router, requiredRoles]);

    return {
        isLoading: Auth.isLoading,
        isAuth: Auth.isAuth,
        user: Auth.user
    };
};

export default useAuthGuard;
