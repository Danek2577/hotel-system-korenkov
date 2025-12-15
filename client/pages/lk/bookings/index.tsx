import { useState } from 'react';
import { useRouter } from 'next/router';
import { observer } from 'mobx-react-lite';
import { Button, Chip, Card, CardBody } from '@nextui-org/react';
import toast from 'react-hot-toast';
import MainLayout from "../../../src/components/layout/MainLayout";
import TablePagination from "../../../src/components/module/adm/TablePagination";
import {
    fetchBookingsAdmGet,
    fetchBookingAdmCancel,
    fetchBookingAdmUpdate,
    Booking
} from "../../../src/API/privateAPI";
import {
    BOOKING_STATUS_LABELS,
    BOOKING_STATUS_COLORS
} from "../../../src/components/module/booking/domain/bookingDomain";
import { formatDate, formatPrice } from "../../../src/utils/dateUtils";

const BookingsPage = observer(() => {
    const router = useRouter();
    const [refreshKey, setRefreshKey] = useState(0);

    const handleCreate = () => {
        router.push('/lk/bookings/create');
    };

    const handleEdit = (booking: Booking) => {
        router.push(`/lk/bookings/${booking.id}`);
    };

    const handleCancel = async (booking: Booking) => {
        const toastId = 'booking-cancel-toast';
        toast((t) => (
            <div className="flex flex-col gap-3">
                <p className="font-medium">Отменить бронирование?</p>
                <p className="text-sm text-default-500">Гость: {booking.guest_name}</p>
                <div className="flex gap-2">
                    <Button size="sm" variant="flat" onPress={() => toast.dismiss(t.id)}>
                        Нет
                    </Button>
                    <Button
                        size="sm"
                        color="warning"
                        onPress={async () => {
                            toast.loading('Отмена...', { id: toastId });
                            try {
                                await fetchBookingAdmCancel({ bookingId: booking.id });
                                toast.success('Бронирование отменено', { id: toastId });
                                setRefreshKey(prev => prev + 1);
                            } catch (e: any) {
                                toast.error(e?.response?.data?.message || 'Ошибка', { id: toastId });
                            }
                        }}
                    >
                        Да, отменить
                    </Button>
                </div>
            </div>
        ), { id: toastId, duration: 10000 });
    };

    const handleRestore = async (booking: Booking) => {
        const toastId = 'booking-restore-toast';
        toast.loading('Восстановление...', { id: toastId });
        try {
            await fetchBookingAdmUpdate({ bookingId: booking.id, status: 'CONFIRMED' });
            toast.success('Бронирование восстановлено', { id: toastId });
            setRefreshKey(prev => prev + 1);
        } catch (e: any) {
            toast.error(e?.response?.data?.message || 'Ошибка', { id: toastId });
        }
    };

    const fetchBookingsWithFilter = async (params: any) => {
        const { dateFilter, ...rest } = params;

        const now = Math.floor(Date.now() / 1000);
        const newParams: any = { ...rest };

        if (dateFilter === 'upcoming') {
            newParams.date_from = now;
        } else if (dateFilter === 'past') {
            newParams.date_to = now;
        } else if (dateFilter === 'active') {
            newParams.active_at = now;
        }

        return fetchBookingsAdmGet(newParams);
    };

    return (
        <MainLayout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold">Управление бронированиями</h1>
                        <p className="text-default-500 mt-1">
                            Создавайте и управляйте бронированиями номеров
                        </p>
                    </div>
                    <Button color="primary" onPress={handleCreate}>
                        + Создать бронирование
                    </Button>
                </div>

                <Card className="bg-content1">
                    <CardBody className="p-0">
                        <TablePagination
                            key={refreshKey}
                            request={fetchBookingsWithFilter}
                            rowsName="bookings"
                            inputs={[
                                { name: 'guest_name', label: 'Поиск гостя...' },
                                {
                                    name: 'dateFilter',
                                    label: 'Период',
                                    select: {
                                        options: [
                                            { value: 'active', label: 'Актуальные' },
                                            { value: 'upcoming', label: 'Предстоящие' },
                                            { value: 'past', label: 'Прошедшие' }
                                        ]
                                    }
                                },
                                {
                                    name: 'status',
                                    label: 'Статус',
                                    select: {
                                        options: Object.entries(BOOKING_STATUS_LABELS).map(([value, label]) => ({ value, label }))
                                    }
                                }
                            ]}
                            table={[
                                { header: '№', text: 'id', align: 'center' },
                                {
                                    header: 'Номер',
                                    custom: {
                                        func: (row: Booking) => (
                                            <div>
                                                <p className="font-medium">{row.room?.name || `#${row.room_id}`}</p>
                                                {row.room?.category && (
                                                    <p className="text-xs text-default-500">{row.room.category}</p>
                                                )}
                                            </div>
                                        )
                                    }
                                },
                                { header: 'Гость', text: 'guest_name' },
                                { header: 'Телефон', text: 'guest_phone' },
                                {
                                    header: 'Даты',
                                    custom: {
                                        func: (row: Booking) => (
                                            <div className="text-sm">
                                                <p>{formatDate(row.date_start)}</p>
                                                <p className="text-default-500">→ {formatDate(row.date_end)}</p>
                                            </div>
                                        )
                                    }
                                },
                                {
                                    header: 'Сумма',
                                    custom: {
                                        func: (row: Booking) => formatPrice(row.total_price)
                                    }
                                },
                                {
                                    header: 'Статус',
                                    align: 'center',
                                    custom: {
                                        func: (row: Booking) => (
                                            <Chip
                                                size="sm"
                                                color={BOOKING_STATUS_COLORS[row.status] || 'default'}
                                                variant="flat"
                                            >
                                                {BOOKING_STATUS_LABELS[row.status] || row.status}
                                            </Chip>
                                        )
                                    }
                                },
                                {
                                    header: 'Действия',
                                    align: 'end',
                                    custom: {
                                        func: (row: Booking) => (
                                            <div className="flex gap-2 justify-end">
                                                <Button
                                                    size="sm"
                                                    variant="flat"
                                                    color="primary"
                                                    onPress={() => handleEdit(row)}
                                                >
                                                    Изменить
                                                </Button>
                                                {row.status === 'CONFIRMED' && (
                                                    <Button
                                                        size="sm"
                                                        variant="flat"
                                                        color="warning"
                                                        onPress={() => handleCancel(row)}
                                                    >
                                                        Отменить
                                                    </Button>
                                                )}
                                                {row.status === 'CANCELLED' && (
                                                    <Button
                                                        size="sm"
                                                        variant="flat"
                                                        color="success"
                                                        onPress={() => handleRestore(row)}
                                                    >
                                                        Вернуть
                                                    </Button>
                                                )}
                                            </div>
                                        )
                                    }
                                }
                            ]}
                            isShowCount={false}
                        />
                    </CardBody>
                </Card>
            </div>
        </MainLayout>
    );
});

export default BookingsPage;
