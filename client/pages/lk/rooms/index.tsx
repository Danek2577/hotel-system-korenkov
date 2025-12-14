import { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Card, CardBody } from '@nextui-org/react';
import MainLayout from '../../../src/components/layout/MainLayout';
import RoomTable from '../../../src/components/module/room/ui/RoomTable';
import RoomCreateForm from '../../../src/components/module/room/ui/RoomCreateForm';
import { RoomProps } from '../../../src/components/module/room/domain/roomDomain';

const RoomsPage = observer(() => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editRoom, setEditRoom] = useState<RoomProps | null>(null);

    const handleCreate = () => {
        setEditRoom(null);
        setIsModalOpen(true);
    };

    const handleEdit = (room: RoomProps) => {
        setEditRoom(room);
        setIsModalOpen(true);
    };

    const handleClose = () => {
        setIsModalOpen(false);
        setEditRoom(null);
    };

    return (
        <MainLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold">Управление номерами</h1>
                    <p className="text-default-500 mt-1">
                        Создавайте и редактируйте номера отеля
                    </p>
                </div>

                <Card className="bg-content1">
                    <CardBody className="p-0">
                        <RoomTable onEdit={handleEdit} onCreate={handleCreate} />
                    </CardBody>
                </Card>

                <RoomCreateForm
                    isOpen={isModalOpen}
                    onClose={handleClose}
                    editRoom={editRoom}
                />
            </div>
        </MainLayout>
    );
});

export default RoomsPage;
