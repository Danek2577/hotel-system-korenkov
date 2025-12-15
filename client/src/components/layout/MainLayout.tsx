import { ReactNode, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { observer } from 'mobx-react-lite';
import {
    Button,
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownItem,
    Spinner,
    Tooltip,
} from '@nextui-org/react';
import Auth from '../../store/AuthStore';

interface MainLayoutProps {
    children: ReactNode;
}

// Navigation items
const navItems = [
    {
        key: 'dashboard',
        label: 'Дашборд',
        href: '/lk',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
        )
    },
    {
        key: 'rooms',
        label: 'Номера',
        href: '/lk/rooms',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
        )
    },
    {
        key: 'bookings',
        label: 'Бронирования',
        href: '/lk/bookings',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
        )
    },
];

const MainLayout = observer(({ children }: MainLayoutProps) => {
    const router = useRouter();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    if (Auth.isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Spinner size="lg" label="Загрузка..." color="primary" />
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

    const isActive = (href: string) => {
        if (href === '/lk') {
            return router.pathname === '/lk';
        }
        return router.pathname.startsWith(href);
    };

    return (
        <div className="flex h-screen w-full bg-background text-foreground overflow-hidden">
            {/* Sidebar */}
            <aside
                className={`h-full bg-content1 border-r border-divider transition-all duration-300 flex-shrink-0
                    ${sidebarCollapsed ? 'w-20' : 'w-64'}`}
            >
                {/* Logo */}
                <div className="h-16 flex items-center justify-between px-4 border-b border-divider">
                    {!sidebarCollapsed && (
                        <span className="text-xl font-bold text-foreground">
                            🏨 Отель
                        </span>
                    )}
                    <Button
                        isIconOnly
                        variant="light"
                        size="sm"
                        onPress={() => setSidebarCollapsed(!sidebarCollapsed)}
                        className={sidebarCollapsed ? 'mx-auto' : ''}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </Button>
                </div>

                {/* Navigation */}
                <nav className="p-4 space-y-2">
                    {navItems.map((item) => (
                        <Tooltip
                            key={item.key}
                            content={item.label}
                            placement="right"
                            isDisabled={!sidebarCollapsed}
                        >
                            <Button
                                fullWidth
                                variant={isActive(item.href) ? 'flat' : 'light'}
                                color={isActive(item.href) ? 'primary' : 'default'}
                                className={`flex flex-row items-center justify-start gap-3 h-12 ${sidebarCollapsed ? 'px-0 justify-center' : 'px-4'}`}
                                onPress={() => router.push(item.href)}
                            >
                                <span className="flex items-center justify-center min-w-[20px]">
                                    {item.icon}
                                </span>
                                {!sidebarCollapsed && <span className="font-medium text-small truncate ml-1">{item.label}</span>}
                            </Button>
                        </Tooltip>
                    ))}
                </nav>

                {/* Bottom section */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-divider">
                    <Tooltip
                        content="Об авторе"
                        placement="right"
                        isDisabled={!sidebarCollapsed}
                    >
                        <Button
                            as={Link}
                            href="/about"
                            fullWidth
                            variant="light"
                            className={`flex flex-row items-center justify-start gap-3 h-12 ${sidebarCollapsed ? 'px-0 justify-center' : 'px-4'}`}
                        >
                            <span className="flex items-center justify-center min-w-[20px]">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </span>
                            {!sidebarCollapsed && <span className="font-medium text-small truncate ml-1">Об авторе</span>}
                        </Button>
                    </Tooltip>
                </div>
            </aside>

            {/* Main content area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Header */}
                <header className="h-16 bg-content1 border-b border-divider flex items-center justify-between px-6 flex-shrink-0">
                    <div>
                        <h1 className="text-lg font-semibold text-foreground">
                            {navItems.find(item => isActive(item.href))?.label || 'Панель управления'}
                        </h1>
                    </div>

                    {/* User menu */}
                    <Dropdown placement="bottom-end">
                        <DropdownTrigger>
                            <Button color="primary" className="gap-2 px-4">
                                {Auth.user?.name}
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </Button>
                        </DropdownTrigger>
                        <DropdownMenu aria-label="Меню пользователя" className="p-2 min-w-[200px]">
                            <DropdownItem key="profile" className="h-16 gap-2 py-3 cursor-default opacity-100" isReadOnly textValue="Профиль">
                                <p className="font-semibold">{Auth.user?.email}</p>
                                <p className="text-sm text-default-500">
                                    {Auth.user?.role === 'ADMIN' ? 'Администратор' : 'Менеджер'}
                                </p>
                            </DropdownItem>
                            <DropdownItem
                                key="about"
                                as={Link}
                                href="/about"
                                startContent={
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                }
                            >
                                Об авторе
                            </DropdownItem>
                            <DropdownItem
                                key="logout"
                                color="danger"
                                onPress={handleLogout}
                                startContent={
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                }
                            >
                                Выйти
                            </DropdownItem>
                        </DropdownMenu>
                    </Dropdown>
                </header>

                {/* Page content */}
                <main className="flex-1 overflow-y-auto p-6">
                    {children}
                </main>
            </div>

        </div>
    );
});

export default MainLayout;

