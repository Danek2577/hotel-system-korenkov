import React from 'react';
import { useForm } from "react-hook-form";
import { Input, Button } from "@nextui-org/react";
import { $authHost } from "../../../../API";

interface Props {
    onSuccess: () => void;
}

const RoomCreateForm = ({ onSuccess }: Props) => {
    const { register, handleSubmit } = useForm();

    const onSubmit = async (data: any) => {
        try {
            // Преобразуем строки в числа где надо
            const payload = {
                ...data,
                price: Number(data.price),
                capacity: Number(data.capacity)
            };

            await $authHost.post('rooms/adm', payload); // Проверь роут на бэке!
            onSuccess(); // Закрываем модалку и обновляем таблицу
        } catch (e) {
            console.error(e);
            alert("Ошибка создания. См. консоль");
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 pb-4">
            <Input label="Название" {...register("name", { required: true })} />
            <Input label="Цена" type="number" {...register("price", { required: true })} />
            <Input label="Вместимость" type="number" {...register("capacity", { required: true })} />

            <Button type="submit" color="primary">
                Сохранить
            </Button>
        </form>
    );
};

export default RoomCreateForm;
