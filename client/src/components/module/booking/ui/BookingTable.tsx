import { useState, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Chip,
    Button,
    Spinner,
    Pagination,
    Input,
    Select,
    SelectItem,
    Popover,
    PopoverTrigger,
    PopoverContent,
    useDisclosure
} from '@nextui-org/react';
import { useSWRConfig } from 'swr';
import useBookingsAdmGet from '../hook/useBookingsAdmGet';
import BookingForm from './BookingForm';
import { bookingAdmCancel, bookingAdmDelete } from '../data/bookingData';
import {
    BookingProps,
    BOOKING_STATUS_LABELS,
    BOOKING_STATUS_COLORS
} from '../domain/bookingDomain';
import { formatPrice, formatDate } from '../../../../utils/dateUtils';
import { ROOM_CATEGORY_LABELS } from '../../room/domain/roomDomain';

// Debounce hook
const useDebounce = (callback: (value: string) => void, delay: number) => {
    const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

    return useCallback((value: string) => {
        if (timeoutId) clearTimeout(timeoutId);
        const id = setTimeout(() => callback(value), delay);
        setTimeoutId(id);
    }, [callback, delay, timeoutId]);
};



// ... imports

const BookingTable = observer(() => {
    const { mutate } = useSWRConfig();
    const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
    const [selectedBooking, setSelectedBooking] = useState<BookingProps | null>(null);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [deletePopoverId, setDeletePopoverId] = useState<number | null>(null);
    const limit = 10;

    const handleCreate = () => {
        setSelectedBooking(null);
        onOpen();
    };

    const handleEdit = (booking: BookingProps) => {
        setSelectedBooking(booking);
        onOpen();
    };

    const { bookings, count, isLoading } = useBookingsAdmGet({
        offset: (page - 1) * limit,
        limit,
        guest_name: search || undefined,
        status: statusFilter as 'CONFIRMED' | 'CANCELLED' | undefined
    });

    const totalPages = Math.ceil(count / limit);

    // Debounced search
    const debouncedSearch = useDebounce((value: string) => {
        setSearch(value);
        setPage(1);
    }, 500);

    const handleSearchChange = (value: string) => {
        setSearchInput(value);
        debouncedSearch(value);
    };

    const handleCancel = async (bookingId: number) => {
        await bookingAdmCancel({
            bookingId,
            onSuccess: async () => {
                await mutate((key) => Array.isArray(key) && key[0] === 'bookings');
            }
        });
    };

    const handleDelete = async (bookingId: number) => {
        await bookingAdmDelete({
            bookingId,
            onSuccess: async () => {
                await mutate((key) => Array.isArray(key) && key[0] === 'bookings');
                setDeletePopoverId(null);
            }
        });
    };

    const columns = [
        { key: 'id', label: '№' },
        { key: 'room', label: 'Номер' },
        { key: 'guest_name', label: 'Гость' },
        { key: 'guest_phone', label: 'Телефон' },
        { key: 'dates', label: 'Даты' },
        { key: 'total_price', label: 'Сумма' },
        { key: 'status', label: 'Статус' },
        { key: 'actions', label: 'Действия' }
    ];

    const renderCell = (booking: BookingProps, columnKey: string) => {
        switch (columnKey) {
            case 'id':
                return <span className="font-mono text-default-500">#{booking.id}</span>;
            case 'room':
                return (
                    <div>
                        <p className="font-medium">{booking.room?.name}</p>
                        <p className="text-xs text-default-500">
                            {booking.room?.category && ROOM_CATEGORY_LABELS[booking.room.category as keyof typeof ROOM_CATEGORY_LABELS]}
                        </p>
                    </div>
                );
            case 'guest_name':
                return <span className="font-medium">{booking.guest_name}</span>;
            case 'guest_phone':
                return <span className="text-default-500">{booking.guest_phone}</span>;
            case 'dates':
                return (
                    <div className="text-sm">
                        <p>{formatDate(booking.date_start)}</p>
                        <p className="text-default-500">→ {formatDate(booking.date_end)}</p>
                    </div>
                );
            case 'total_price':
                return <span className="font-medium">{formatPrice(booking.total_price)}</span>;
            case 'status':
                return (
                    <Chip color={BOOKING_STATUS_COLORS[booking.status]} variant="flat" size="sm">
                        {BOOKING_STATUS_LABELS[booking.status]}
                    </Chip>
                );
            case 'actions':
                return (
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            variant="flat"
                            color="primary"
                            onPress={() => handleEdit(booking)}
                        >
                            Изменить
                        </Button>
                        {booking.status === 'CONFIRMED' && (
                            <Button
                                size="sm"
                                variant="flat"
                                color="warning"
                                onPress={() => handleCancel(booking.id)}
                            >
                                Отменить
                            </Button>
                        )}
                        <Popover
                            isOpen={deletePopoverId === booking.id}
                            onOpenChange={(open) => setDeletePopoverId(open ? booking.id : null)}
                        >
                            <PopoverTrigger>
                                <Button size="sm" variant="flat" color="danger">
                                    Удалить
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="p-4">
                                <div className="space-y-3">
                                    <p className="font-medium">Вы уверены?</p>
                                    <p className="text-sm text-default-500">
                                        Бронирование будет удалено
                                    </p>
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            variant="flat"
                                            onPress={() => setDeletePopoverId(null)}
                                        >
                                            Отмена
                                        </Button>
                                        <Button
                                            size="sm"
                                            color="danger"
                                            onPress={() => handleDelete(booking.id)}
                                        >
                                            Удалить
                                        </Button>
                                    </div>
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <>
            <div className="space-y-4">
                {/* Filters */}
                <div className="flex flex-wrap justify-between items-center gap-4 p-4 border-b border-divider">
                    <div className="flex flex-wrap gap-3">
                        <Input
                            placeholder="Поиск по имени гостя..."
                            value={searchInput}
                            onValueChange={handleSearchChange}
                            className="w-64"
                            isClearable
                            onClear={() => handleSearchChange('')}
                            startContent={
                                <svg className="w-4 h-4 text-default-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            }
                            variant="bordered"
                            size="sm"
                        />
                        <Select
                            placeholder="Статус"
                            className="w-44"
                            selectedKeys={statusFilter ? [statusFilter] : []}
                            onSelectionChange={(keys) => {
                                setStatusFilter(Array.from(keys)[0] as string || '');
                                setPage(1);
                            }}
                            variant="bordered"
                            size="sm"
                        >
                            {[
                                <SelectItem key="" value="">Все статусы</SelectItem>,
                                <SelectItem key="CONFIRMED" value="CONFIRMED">Подтверждено</SelectItem>,
                                <SelectItem key="CANCELLED" value="CANCELLED">Отменено</SelectItem>
                            ]}
                        </Select>
                    </div>
                    <Button color="primary" onPress={handleCreate} startContent={
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                    }>
                        Создать бронирование
                    </Button>
                </div>

                {/* Table */}
                <Table
                    aria-label="Таблица бронирований"
                    classNames={{
                        wrapper: "bg-transparent shadow-none",
                        th: "bg-content2 text-default-500",
                    }}
                    bottomContent={
                        totalPages > 1 && (
                            <div className="flex w-full justify-center py-4">
                                <Pagination
                                    isCompact
                                    showControls
                                    showShadow
                                    color="primary"
                                    page={page}
                                    total={totalPages}
                                    onChange={setPage}
                                />
                            </div>
                        )
                    }
                >
                    <TableHeader columns={columns}>
                        {(column) => (
                            <TableColumn key={column.key}>
                                {column.label}
                            </TableColumn>
                        )}
                    </TableHeader>
                    <TableBody
                        items={bookings}
                        isLoading={isLoading}
                        loadingContent={<Spinner label="Загрузка..." />}
                        emptyContent="Нет данных"
                    >
                        {(booking) => (
                            <TableRow key={booking.id}>
                                {(columnKey) => (
                                    <TableCell>{renderCell(booking, columnKey as string)}</TableCell>
                                )}
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <BookingForm
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                editBooking={selectedBooking}
                onClose={onClose}
            />
        </>
    );
});

export default BookingTable;
