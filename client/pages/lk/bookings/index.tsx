import { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Button, Chip, Card, CardBody, useDisclosure } from '@nextui-org/react';
import toast from 'react-hot-toast';
import MainLayout from "../../../src/components/layout/MainLayout";
import TablePagination from "../../../src/components/module/adm/TablePagination";
import BookingForm from "../../../src/components/module/booking/ui/BookingForm";
import {
    fetchBookingsAdmGet,
    fetchBookingAdmCancel,
    fetchBookingAdmUpdate,
    Booking
} from "../../../src/API/bookingAPI";
import {
    BOOKING_STATUS_LABELS,
    BOOKING_STATUS_COLORS
} from "../../../src/components/module/booking/domain/bookingDomain";
import { formatDate, formatPrice } from "../../../src/utils/dateUtils";

const BookingsPage = observer(() => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);

    const handleCreate = () => {
        setSelectedBooking(null);
        onOpen();
    };

    const handleEdit = (booking: Booking) => {
        setSelectedBooking(booking as any);
        onOpen();
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
                                await fetchBookingAdmCancel(booking.id);
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

    const handleSuccess = () => {
        onClose();
        setRefreshKey(prev => prev + 1);
    };

    return (
        <MainLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold">Управление бронированиями</h1>
                    <p className="text-default-500 mt-1">
                        Создавайте и управляйте бронированиями номеров
                    </p>
                </div>

                <Card className="bg-content1">
                    <CardBody className="p-0">
                        <TablePagination
                            key={refreshKey}
                            request={fetchBookingsAdmGet}
                            rowsName="bookings"
                            inputs={[
                                { name: 'guest_name', label: 'Поиск гостя...' },
                                {
                                    name: 'status',
                                    label: 'Статус',
                                    select: {
                                        options: Object.entries(BOOKING_STATUS_LABELS).map(([value, label]) => ({ value, label }))
                                    }
                                }
                            ]}
                            table={[
                                { header: '№', text: 'id' },
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
                                    custom: {
                                        func: (row: Booking) => (
                                            <div className="flex gap-2">
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
                            leftContent={
                                <Button color="primary" onPress={handleCreate}>
                                    + Создать бронирование
                                </Button>
                            }
                            isShowCount={false}
                        />
                    </CardBody>
                </Card>

                <BookingForm
                    isOpen={isOpen}
                    onClose={handleSuccess}
                    editBooking={selectedBooking as any}
                />
            </div>
        </MainLayout>
    );
});

export default BookingsPage;
