import { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Button, Chip, Card, CardBody, Modal, ModalContent, ModalHeader, ModalBody, useDisclosure } from '@nextui-org/react';
import toast from 'react-hot-toast';
import MainLayout from "../../../src/components/layout/MainLayout";
import TablePagination from "../../../src/components/module/adm/TablePagination";
import RoomCreateForm from "../../../src/components/module/room/ui/RoomCreateForm";
import { fetchRoomsAdmGet, fetchRoomAdmDelete, Room } from "../../../src/API/roomAPI";
import {
    ROOM_CATEGORY_LABELS,
    ROOM_STATUS_LABELS,
    ROOM_STATUS_COLORS
} from "../../../src/components/module/room/domain/roomDomain";

const RoomsPage = observer(() => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);

    const handleCreate = () => {
        setSelectedRoom(null);
        onOpen();
    };

    const handleEdit = (room: Room) => {
        setSelectedRoom(room);
        onOpen();
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
            await fetchRoomAdmDelete(roomId);
            toast.success('Номер удалён', { id: deleteToastId });
            setRefreshKey(prev => prev + 1);
        } catch (e: any) {
            toast.error(e?.response?.data?.message || 'Ошибка удаления', { id: deleteToastId });
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
                    <h1 className="text-2xl font-bold">Управление номерами</h1>
                    <p className="text-default-500 mt-1">
                        Создавайте и управляйте номерным фондом
                    </p>
                </div>

                <Card className="bg-content1">
                    <CardBody className="p-0">
                        <TablePagination
                            key={refreshKey}
                            request={fetchRoomsAdmGet}
                            rowsName="rooms"
                            inputs={[
                                { name: 'name', label: 'Поиск...' },
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
                                { header: '№', text: 'id' },
                                { header: 'Название', text: 'name' },
                                {
                                    header: 'Категория',
                                    custom: {
                                        func: (row: Room) => ROOM_CATEGORY_LABELS[row.category] || row.category
                                    }
                                },
                                { header: 'Цена/ночь', price: { valueName: 'price' } },
                                { header: 'Мест', text: 'capacity' },
                                {
                                    header: 'Статус',
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
                                    custom: {
                                        func: (row: Room) => (
                                            <div className="flex gap-2">
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
                            leftContent={
                                <Button color="primary" onPress={handleCreate}>
                                    + Создать номер
                                </Button>
                            }
                            isShowCount={false}
                        />
                    </CardBody>
                </Card>

                <Modal
                    isOpen={isOpen}
                    onClose={onClose}
                    placement="center"
                    size="xl"
                >
                    <ModalContent>
                        <ModalHeader className="flex items-center gap-2">
                            <span>🏨</span>
                            <span>{selectedRoom ? 'Редактировать номер' : 'Создать номер'}</span>
                        </ModalHeader>
                        <ModalBody className="pb-6">
                            <RoomCreateForm
                                editRoom={selectedRoom}
                                onSuccess={handleSuccess}
                                onCancel={onClose}
                            />
                        </ModalBody>
                    </ModalContent>
                </Modal>
            </div>
        </MainLayout>
    );
});

export default RoomsPage;
