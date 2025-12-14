import React, { useEffect, useState } from 'react';
import LkLayout from "../../../src/components/layout/LkLayout";
import {
    Table, TableHeader, TableColumn, TableBody, TableRow, TableCell,
    Button, useDisclosure, Modal, ModalContent, ModalHeader, ModalBody, Spinner, Chip
} from "@nextui-org/react";
import { $authHost } from "../../../src/API";
import RoomCreateForm from "../../../src/components/module/room/ui/RoomCreateForm";

// Интерфейс прямо тут, чтобы не искать по файлам
interface Room {
    id: number;
    name: string;
    price: number;
    capacity: number;
    description?: string;
}

const RoomsPage = () => {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);

    // Простая функция загрузки без SWR (для надежности отладки)
    const fetchRooms = async () => {
        try {
            setLoading(true);
            const { data } = await $authHost.get('rooms/adm'); // Или 'rooms/my' в зависимости от твоего роута
            // Бэк может вернуть массив сразу или объект { count: ..., rows: ... }
            // Проверяем, что пришло
            const items = Array.isArray(data) ? data : (data.rows || data.entities || []);
            setRooms(items);
        } catch (e) {
            console.error("Ошибка загрузки номеров:", e);
            alert("Не удалось загрузить номера. Чекни консоль.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRooms();
    }, []);

    return (
        <LkLayout>
            <div className="p-4">
                <div className="flex justify-between items-center mb-5">
                    <h1 className="text-2xl font-bold">Номера</h1>
                    <Button color="primary" onPress={onOpen}>
                        + Создать номер
                    </Button>
                </div>

                {loading ? (
                    <div className="flex justify-center"><Spinner size="lg" /></div>
                ) : rooms.length === 0 ? (
                    <div className="text-center text-gray-500 mt-10">Номеров нет. Создай первый!</div>
                ) : (
                    <Table aria-label="Таблица номеров">
                        <TableHeader>
                            <TableColumn>ID</TableColumn>
                            <TableColumn>Название</TableColumn>
                            <TableColumn>Цена</TableColumn>
                            <TableColumn>Вместимость</TableColumn>
                        </TableHeader>
                        <TableBody>
                            {rooms.map((room) => (
                                <TableRow key={room.id}>
                                    <TableCell>{room.id}</TableCell>
                                    <TableCell className="font-bold">{room.name}</TableCell>
                                    <TableCell>
                                        <Chip color="success" variant="flat">{room.price} ₽</Chip>
                                    </TableCell>
                                    <TableCell>{room.capacity} чел.</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}

                {/* Модалка вынесена наружу, чтобы не обрезалась */}
                <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="top-center">
                    <ModalContent>
                        {(onClose) => (
                            <>
                                <ModalHeader>Новый номер</ModalHeader>
                                <ModalBody>
                                    <RoomCreateForm onSuccess={() => {
                                        onClose();
                                        fetchRooms(); // Обновляем таблицу после создания
                                    }} />
                                </ModalBody>
                            </>
                        )}
                    </ModalContent>
                </Modal>
            </div>
        </LkLayout>
    );
};

export default RoomsPage;
