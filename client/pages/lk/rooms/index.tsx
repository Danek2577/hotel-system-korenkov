import { useState } from 'react';
import { useRouter } from 'next/router';
import { observer } from 'mobx-react-lite';
import { Button, Chip, Card, CardBody } from '@nextui-org/react';
import toast from 'react-hot-toast';
import MainLayout from "../../../src/components/layout/MainLayout";
import TablePagination from "../../../src/components/module/adm/TablePagination";
import { fetchRoomsAdmGet, fetchRoomAdmDelete, Room } from "../../../src/API/privateAPI";
import {
    ROOM_CATEGORY_LABELS,
    ROOM_STATUS_LABELS,
    ROOM_STATUS_COLORS
} from "../../../src/components/module/room/domain/roomDomain";

const RoomsPage = observer(() => {
    const router = useRouter();
    const [refreshKey, setRefreshKey] = useState(0);

    const handleCreate = () => {
        router.push('/lk/rooms/create');
    };

    const handleEdit = (room: Room) => {
        router.push(`/lk/rooms/${room.id}`);
    };

    const deleteToastId = 'room-delete-toast';

    const handleDeleteConfirm = (room: Room) => {
        toast((t) => (
            <div className="flex flex-col gap-3">
                <p className="font-medium">Удалить номер "{room.name}"?</p>
                <div className="flex gap-2">
                    <Button size="sm" variant="flat" onPress={() => toast.dismiss(t.id)}>
                        Отмена
                    </Button>
                    <Button size="sm" color="danger" onPress={() => handleDelete(room.id)}>
                        Удалить
                    </Button>
                </div>
            </div>
        ), { id: deleteToastId, duration: 10000 });
    };

    const handleDelete = async (roomId: number) => {
        toast.loading('Удаление...', { id: deleteToastId });
        try {
            await fetchRoomAdmDelete({ roomId });
            toast.success('Номер удалён', { id: deleteToastId });
            setRefreshKey(prev => prev + 1);
        } catch (e: any) {
            toast.error(e?.response?.data?.message || 'Ошибка удаления', { id: deleteToastId });
        }
    };

    const fetchRoomsWithSort = async (params: any) => {
        const { sortFilter, ...rest } = params;
        const newParams: any = { ...rest };

        if (sortFilter === 'price_asc') {
            newParams.sort_by = 'price';
            newParams.order = 'ASC';
        } else if (sortFilter === 'price_desc') {
            newParams.sort_by = 'price';
            newParams.order = 'DESC';
        }

        return fetchRoomsAdmGet(newParams);
    };

    return (
        <MainLayout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold">Управление номерами</h1>
                        <p className="text-default-500 mt-1">
                            Создавайте и управляйте номерным фондом
                        </p>
                    </div>
                    <Button color="primary" onPress={handleCreate}>
                        + Создать номер
                    </Button>
                </div>

                <Card className="bg-content1">
                    <CardBody className="p-0">
                        <TablePagination
                            key={refreshKey}
                            request={fetchRoomsWithSort}
                            rowsName="rooms"
                            inputs={[
                                { name: 'name', label: 'Поиск...' },
                                {
                                    name: 'sortFilter',
                                    label: 'Сортировка',
                                    select: {
                                        options: [
                                            { value: 'price_asc', label: 'Сначала дешевые' },
                                            { value: 'price_desc', label: 'Сначала дорогие' }
                                        ]
                                    }
                                },
                                {
                                    name: 'category',
                                    label: 'Категория',
                                    select: {
                                        options: Object.entries(ROOM_CATEGORY_LABELS).map(([value, label]) => ({ value, label }))
                                    }
                                },
                                {
                                    name: 'status',
                                    label: 'Статус',
                                    select: {
                                        options: Object.entries(ROOM_STATUS_LABELS).map(([value, label]) => ({ value, label }))
                                    }
                                }
                            ]}
                            table={[
                                { header: '№', text: 'id', align: 'center' },
                                { header: 'Название', text: 'name', align: 'start' },
                                {
                                    header: 'Категория',
                                    custom: {
                                        func: (row: Room) => ROOM_CATEGORY_LABELS[row.category] || row.category
                                    }
                                },
                                { header: 'Цена/ночь', price: { valueName: 'price' } },
                                { header: 'Мест', text: 'capacity', align: 'center' },
                                {
                                    header: 'Статус',
                                    align: 'center',
                                    custom: {
                                        func: (row: Room) => (
                                            <Chip
                                                size="sm"
                                                color={ROOM_STATUS_COLORS[row.status] || 'default'}
                                                variant="flat"
                                            >
                                                {ROOM_STATUS_LABELS[row.status] || row.status}
                                            </Chip>
                                        )
                                    }
                                },
                                { header: 'Создан', timestamp: { valueName: 'date_add' } },
                                {
                                    header: 'Действия',
                                    align: 'end',
                                    custom: {
                                        func: (row: Room) => (
                                            <div className="flex gap-2 justify-end">
                                                <Button
                                                    size="sm"
                                                    variant="flat"
                                                    color="primary"
                                                    onPress={() => handleEdit(row)}
                                                >
                                                    Изменить
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="flat"
                                                    color="danger"
                                                    onPress={() => handleDeleteConfirm(row)}
                                                >
                                                    Удалить
                                                </Button>
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

export default RoomsPage;
