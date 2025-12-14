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
    PopoverContent
} from '@nextui-org/react';
import { useSWRConfig } from 'swr';
import useRoomsAdmGet from '../hook/useRoomsAdmGet';
import { roomAdmDelete } from '../data/roomData';
import {
    RoomProps,
    ROOM_CATEGORY_LABELS,
    ROOM_STATUS_LABELS,
    ROOM_STATUS_COLORS
} from '../domain/roomDomain';
import { formatPrice, formatDate } from '../../../../utils/dateUtils';

interface RoomTableProps {
    onEdit: (room: RoomProps) => void;
    onCreate: () => void;
}

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

const RoomTable = observer(({ onEdit, onCreate }: RoomTableProps) => {
    const { mutate } = useSWRConfig();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<string>('');
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [deletePopoverId, setDeletePopoverId] = useState<number | null>(null);
    const limit = 10;

    const { rooms, count, isLoading } = useRoomsAdmGet({
        offset: (page - 1) * limit,
        limit,
        name: search || undefined,
        category: categoryFilter as 'STANDARD' | 'LUXURY' | 'SUITE' | undefined,
        status: statusFilter as 'AVAILABLE' | 'BOOKED' | 'MAINTENANCE' | undefined
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

    const handleDelete = async (roomId: number) => {
        await roomAdmDelete({
            roomId,
            onSuccess: async () => {
                await mutate((key) => Array.isArray(key) && key[0] === 'rooms');
                setDeletePopoverId(null);
            }
        });
    };

    const columns = [
        { key: 'id', label: '№' },
        { key: 'name', label: 'Название' },
        { key: 'category', label: 'Категория' },
        { key: 'price', label: 'Цена/ночь' },
        { key: 'capacity', label: 'Вместимость' },
        { key: 'status', label: 'Статус' },
        { key: 'date_add', label: 'Создан' },
        { key: 'actions', label: 'Действия' }
    ];

    const renderCell = (room: RoomProps, columnKey: string) => {
        switch (columnKey) {
            case 'id':
                return <span className="font-mono text-default-500">#{room.id}</span>;
            case 'name':
                return <span className="font-medium">{room.name}</span>;
            case 'category':
                return (
                    <Chip size="sm" variant="flat">
                        {ROOM_CATEGORY_LABELS[room.category]}
                    </Chip>
                );
            case 'price':
                return <span className="font-medium">{formatPrice(room.price)}</span>;
            case 'capacity':
                return `${room.capacity} чел.`;
            case 'status':
                return (
                    <Chip color={ROOM_STATUS_COLORS[room.status]} variant="flat" size="sm">
                        {ROOM_STATUS_LABELS[room.status]}
                    </Chip>
                );
            case 'date_add':
                return <span className="text-default-500">{formatDate(room.date_add)}</span>;
            case 'actions':
                return (
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            variant="flat"
                            color="primary"
                            onPress={() => onEdit(room)}
                        >
                            Изменить
                        </Button>
                        <Popover
                            isOpen={deletePopoverId === room.id}
                            onOpenChange={(open) => setDeletePopoverId(open ? room.id : null)}
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
                                        Номер "{room.name}" будет удалён
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
                                            onPress={() => handleDelete(room.id)}
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
        <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 border-b border-divider">
                <div className="flex flex-col sm:flex-row gap-3">
                    <Input
                        placeholder="Поиск по названию..."
                        value={searchInput}
                        onValueChange={handleSearchChange}
                        classNames={{
                            base: "w-full sm:w-64",
                            inputWrapper: "h-10"
                        }}
                        isClearable
                        onClear={() => handleSearchChange('')}
                        startContent={
                            <svg className="w-4 h-4 text-default-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        }
                        variant="bordered"
                        size="sm"
                    />
                    <div className="flex gap-3">
                        <Select
                            placeholder="Категория"
                            classNames={{
                                base: "w-full sm:w-36",
                                trigger: "h-10"
                            }}
                            selectedKeys={categoryFilter ? [categoryFilter] : []}
                            onSelectionChange={(keys) => {
                                setCategoryFilter(Array.from(keys)[0] as string || '');
                                setPage(1);
                            }}
                            variant="bordered"
                            size="sm"
                        >
                            {[
                                <SelectItem key="" value="">Все</SelectItem>,
                                ...Object.entries(ROOM_CATEGORY_LABELS).map(([key, label]) => (
                                    <SelectItem key={key} value={key}>{label}</SelectItem>
                                ))
                            ]}
                        </Select>
                        <Select
                            placeholder="Статус"
                            classNames={{
                                base: "w-full sm:w-36",
                                trigger: "h-10"
                            }}
                            selectedKeys={statusFilter ? [statusFilter] : []}
                            onSelectionChange={(keys) => {
                                setStatusFilter(Array.from(keys)[0] as string || '');
                                setPage(1);
                            }}
                            variant="bordered"
                            size="sm"
                        >
                            {[
                                <SelectItem key="" value="">Все</SelectItem>,
                                ...Object.entries(ROOM_STATUS_LABELS).map(([key, label]) => (
                                    <SelectItem key={key} value={key}>{label}</SelectItem>
                                ))
                            ]}
                        </Select>
                    </div>
                </div>
                <Button
                    color="primary"
                    onPress={onCreate}
                    className="h-10 flex-shrink-0"
                    startContent={
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                    }
                >
                    Добавить номер
                </Button>
            </div>

            {/* Table */}
            <Table
                aria-label="Таблица номеров"
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
                    items={rooms}
                    isLoading={isLoading}
                    loadingContent={<Spinner label="Загрузка..." />}
                    emptyContent="Нет данных"
                >
                    {(room) => (
                        <TableRow key={room.id}>
                            {(columnKey) => (
                                <TableCell>{renderCell(room, columnKey as string)}</TableCell>
                            )}
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
});

export default RoomTable;
