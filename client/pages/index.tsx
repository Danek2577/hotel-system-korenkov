import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { observer } from 'mobx-react-lite';
import { Spinner } from '@nextui-org/react';
import Auth from '../src/store/AuthStore';

const HomePage = observer(() => {
    const router = useRouter();

    useEffect(() => {
        if (!Auth.isLoading) {
            if (Auth.isAuth) {
                router.replace('/lk');
            } else {
                router.replace('/login');
            }
        }
    }, [Auth.isLoading, Auth.isAuth, router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <Spinner size="lg" label="Загрузка..." color="primary" />
        </div>
    );
});

export default HomePage;
