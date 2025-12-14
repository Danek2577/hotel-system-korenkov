import { observer } from 'mobx-react-lite';
import { Card, CardBody, CardHeader, Chip, Skeleton, Divider } from '@nextui-org/react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import MainLayout from '../../src/components/layout/MainLayout';
import Auth from '../../src/store/AuthStore';
import useRoomsAdmGet from '../../src/components/module/room/hook/useRoomsAdmGet';
import useBookingsAdmGet from '../../src/components/module/booking/hook/useBookingsAdmGet';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

// Status colors
const STATUS_COLORS = {
    AVAILABLE: '#22c55e',   // Green
    BOOKED: '#ef4444',      // Red
    MAINTENANCE: '#f59e0b', // Yellow
};

const DashboardPage = observer(() => {
    const { rooms, count: roomsCount, isLoading: roomsLoading } = useRoomsAdmGet({ limit: 100 });
    const { bookings, count: bookingsCount, isLoading: bookingsLoading } = useBookingsAdmGet({ limit: 100, status: 'CONFIRMED' });

    const isLoading = roomsLoading || bookingsLoading;

    // Calculate stats
    const availableRooms = rooms.filter(r => r.status === 'AVAILABLE').length;
    const bookedRooms = rooms.filter(r => r.status === 'BOOKED').length;
    const maintenanceRooms = rooms.filter(r => r.status === 'MAINTENANCE').length;
    const occupancyRate = roomsCount > 0 ? Math.round((bookedRooms / roomsCount) * 100) : 0;

    // Calculate total revenue
    const totalRevenue = bookings.reduce((sum, b) => sum + parseFloat(String(b.total_price || 0)), 0);

    // Get today's check-ins
    const today = Math.floor(Date.now() / 1000);
    const todayStart = today - (today % 86400);
    const todayEnd = todayStart + 86400;
    const todayCheckIns = bookings.filter(b => b.date_start >= todayStart && b.date_start < todayEnd).length;

    // Metrics cards data
    const metrics = [
        {
            title: 'Загрузка отеля',
            value: `${occupancyRate}%`,
            icon: '📊',
            color: 'primary',
            description: `${bookedRooms} из ${roomsCount} номеров`
        },
        {
            title: 'Текущая выручка',
            value: `${totalRevenue.toLocaleString('ru-RU')} ₽`,
            icon: '💰',
            color: 'success',
            description: 'За активные бронирования'
        },
        {
            title: 'Заездов сегодня',
            value: todayCheckIns,
            icon: '🚪',
            color: 'warning',
            description: 'Ожидается гостей'
        },
        {
            title: 'Активных броней',
            value: bookingsCount,
            icon: '📅',
            color: 'secondary',
            description: 'Подтверждённых бронирований'
        },
    ];

    // Pie chart data - Room structure
    const pieChartData = {
        labels: ['Свободно', 'Занято', 'На обслуживании'],
        datasets: [{
            data: [availableRooms, bookedRooms, maintenanceRooms],
            backgroundColor: [STATUS_COLORS.AVAILABLE, STATUS_COLORS.BOOKED, STATUS_COLORS.MAINTENANCE],
            borderWidth: 0,
            hoverOffset: 10,
        }]
    };

    // Line chart data - Last 7 days (based on real data when available)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return date.toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric' });
    });

    // Use actual check-ins for today, zeros for other days (real analytics would require more data)
    const lineChartData = {
        labels: last7Days,
        datasets: [{
            label: 'Заселения',
            data: [0, 0, 0, 0, 0, 0, todayCheckIns],
            fill: true,
            borderColor: '#006FEE',
            backgroundColor: 'rgba(0, 111, 238, 0.1)',
            tension: 0.4,
            pointBackgroundColor: '#006FEE',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 5,
        }]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)',
                },
                ticks: {
                    color: '#71717a',
                },
            },
            x: {
                grid: {
                    display: false,
                },
                ticks: {
                    color: '#71717a',
                },
            },
        },
    };

    const pieOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom' as const,
                labels: {
                    color: '#a1a1aa',
                    padding: 20,
                    usePointStyle: true,
                },
            },
        },
        cutout: '60%',
    };

    return (
        <MainLayout>
            <div className="space-y-6">
                {/* Welcome */}
                <div>
                    <h1 className="text-2xl font-bold">
                        Добро пожаловать, {Auth.user?.name}! 👋
                    </h1>
                    <p className="text-default-500 mt-1">
                        Панель управления отелем
                    </p>
                </div>

                {/* Metrics Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    {metrics.map((metric, index) => (
                        <Card key={index} className="bg-content1">
                            <CardBody className="p-4">
                                {isLoading ? (
                                    <div className="space-y-3">
                                        <Skeleton className="w-10 h-10 rounded-lg" />
                                        <Skeleton className="w-20 h-8 rounded-lg" />
                                        <Skeleton className="w-32 h-4 rounded-lg" />
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-2xl">{metric.icon}</span>
                                            <Chip size="sm" color={metric.color as any} variant="flat">
                                                {metric.title}
                                            </Chip>
                                        </div>
                                        <p className="text-2xl font-bold">{metric.value}</p>
                                        <p className="text-xs text-default-500 mt-1">{metric.description}</p>
                                    </>
                                )}
                            </CardBody>
                        </Card>
                    ))}
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Line Chart */}
                    <Card className="lg:col-span-2 bg-content1">
                        <CardHeader className="pb-0">
                            <div>
                                <h3 className="text-base font-semibold">Динамика заселения</h3>
                                <p className="text-xs text-default-500">Последние 7 дней</p>
                            </div>
                        </CardHeader>
                        <CardBody className="pt-2">
                            <div className="h-[250px] w-full">
                                {isLoading ? (
                                    <Skeleton className="w-full h-full rounded-lg" />
                                ) : (
                                    <Line data={lineChartData} options={chartOptions} />
                                )}
                            </div>
                        </CardBody>
                    </Card>

                    {/* Pie Chart */}
                    <Card className="bg-content1">
                        <CardHeader className="pb-0">
                            <div>
                                <h3 className="text-base font-semibold">Структура фонда</h3>
                                <p className="text-xs text-default-500">Состояние номеров</p>
                            </div>
                        </CardHeader>
                        <CardBody className="pt-2">
                            <div className="h-[250px] w-full">
                                {isLoading ? (
                                    <Skeleton className="w-full h-full rounded-full" />
                                ) : (
                                    <Doughnut data={pieChartData} options={pieOptions} />
                                )}
                            </div>
                        </CardBody>
                    </Card>
                </div>

                {/* Room Status Grid */}
                <Card className="bg-content1">
                    <CardHeader>
                        <div>
                            <h3 className="text-lg font-semibold">Статус номеров</h3>
                            <p className="text-sm text-default-500">Текущее состояние всех номеров</p>
                        </div>
                    </CardHeader>
                    <Divider />
                    <CardBody>
                        {isLoading ? (
                            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
                                {Array.from({ length: 10 }).map((_, i) => (
                                    <Skeleton key={i} className="w-full aspect-square rounded-lg" />
                                ))}
                            </div>
                        ) : rooms.length === 0 ? (
                            <p className="text-center text-default-500 py-8">
                                Нет номеров. Создайте первый номер в разделе "Номера".
                            </p>
                        ) : (
                            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
                                {rooms.map((room) => (
                                    <div
                                        key={room.id}
                                        className="aspect-square rounded-lg flex items-center justify-center text-white font-medium text-sm cursor-pointer transition-transform hover:scale-105"
                                        style={{ backgroundColor: STATUS_COLORS[room.status] }}
                                        title={`${room.name} - ${room.status === 'AVAILABLE' ? 'Свободен' :
                                                room.status === 'BOOKED' ? 'Занят' : 'На обслуживании'
                                            }`}
                                    >
                                        {room.name.substring(0, 4)}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Legend */}
                        <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-divider">
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded" style={{ backgroundColor: STATUS_COLORS.AVAILABLE }} />
                                <span className="text-sm text-default-500">Свободен ({availableRooms})</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded" style={{ backgroundColor: STATUS_COLORS.BOOKED }} />
                                <span className="text-sm text-default-500">Занят ({bookedRooms})</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded" style={{ backgroundColor: STATUS_COLORS.MAINTENANCE }} />
                                <span className="text-sm text-default-500">На обслуживании ({maintenanceRooms})</span>
                            </div>
                        </div>
                    </CardBody>
                </Card>
            </div>
        </MainLayout>
    );
});

export default DashboardPage;
