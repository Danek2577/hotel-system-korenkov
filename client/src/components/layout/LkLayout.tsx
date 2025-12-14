import { ReactNode } from 'react';
import { useRouter } from 'next/router';
import { observer } from 'mobx-react-lite';
import {
    Navbar,
    NavbarBrand,
    NavbarContent,
    NavbarItem,
    Button,
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownItem,
    Spinner,
    Link
} from '@nextui-org/react';
import Auth from '../../store/AuthStore';

interface LkLayoutProps {
    children: ReactNode;
}

const LkLayout = observer(({ children }: LkLayoutProps) => {
    const router = useRouter();

    if (Auth.isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Spinner size="lg" label="Загрузка..." />
            </div>
        );
    }

    if (!Auth.isAuth) {
        router.push('/login');
        return null;
    }

    const handleLogout = () => {
        Auth.logout();
        router.push('/login');
    };

    const navItems = [
        { label: 'Главная', href: '/lk' },
        { label: 'Номера', href: '/lk/rooms' },
        { label: 'Бронирования', href: '/lk/bookings' }
    ];

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Navbar isBordered className="bg-content1">
                <NavbarBrand>
                    <Link href="/lk" className="font-bold text-xl text-inherit">
                        🏨 Отель
                    </Link>
                </NavbarBrand>

                <NavbarContent className="hidden sm:flex gap-4" justify="center">
                    {navItems.map((item) => (
                        <NavbarItem key={item.href} isActive={router.pathname === item.href}>
                            <Link
                                href={item.href}
                                color={router.pathname === item.href ? 'primary' : 'foreground'}
                                className="font-medium"
                            >
                                {item.label}
                            </Link>
                        </NavbarItem>
                    ))}
                </NavbarContent>

                <NavbarContent justify="end">
                    <Dropdown>
                        <DropdownTrigger>
                            <Button variant="light" className="font-medium">
                                👤 {Auth.user?.name}
                            </Button>
                        </DropdownTrigger>
                        <DropdownMenu aria-label="Меню пользователя">
                            <DropdownItem key="profile" className="h-14 gap-2">
                                <p className="font-semibold">{Auth.user?.email}</p>
                                <p className="text-sm text-default-500">
                                    {Auth.user?.role === 'ADMIN' ? 'Администратор' : 'Менеджер'}
                                </p>
                            </DropdownItem>
                            <DropdownItem
                                key="logout"
                                color="danger"
                                onPress={handleLogout}
                            >
                                Выйти
                            </DropdownItem>
                        </DropdownMenu>
                    </Dropdown>
                </NavbarContent>
            </Navbar>

            <main className="container mx-auto px-4 py-6">
                {children}
            </main>
        </div>
    );
});

export default LkLayout;
