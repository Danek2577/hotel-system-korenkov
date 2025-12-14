import React, { useEffect } from 'react';
import { useForm, Controller } from "react-hook-form";
import { Input, Button, Select, SelectItem } from "@nextui-org/react";
import { $authHost } from "../../../../API";
import { RoomProps } from "../domain/roomDomain";

interface FormData {
    name: string;
    category: 'STANDARD' | 'LUXURY' | 'SUITE';
    price: string;
    capacity: string;
    status: 'AVAILABLE' | 'BOOKED' | 'MAINTENANCE';
}

interface Props {
    onSuccess: () => void;
    onCancel?: () => void;
    editRoom?: RoomProps | null;
}

const RoomCreateForm = ({ onSuccess, onCancel, editRoom }: Props) => {
    const isEdit = !!editRoom;

    const { register, handleSubmit, control, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
        defaultValues: {
            name: '',
            category: 'STANDARD',
            price: '',
            capacity: '2',
            status: 'AVAILABLE'
        }
    });

    // Fill form if editing
    useEffect(() => {
        if (editRoom) {
            reset({
                name: editRoom.name,
                category: editRoom.category,
                price: String(editRoom.price),
                capacity: String(editRoom.capacity),
                status: editRoom.status
            });
        } else {
            reset({
                name: '',
                category: 'STANDARD',
                price: '',
                capacity: '2',
                status: 'AVAILABLE'
            });
        }
    }, [editRoom, reset]);

    const onSubmit = async (data: FormData) => {
        try {
            const payload = {
                name: data.name,
                category: data.category,
                price: Number(data.price),
                capacity: Number(data.capacity),
                status: data.status
            };

            if (isEdit) {
                await $authHost.put(`rooms/adm/${editRoom!.id}`, payload);
            } else {
                await $authHost.post('rooms/adm', payload);
            }

            onSuccess();
        } catch (e: any) {
            console.error(e);
            alert(e.response?.data?.message || "Ошибка сохранения");
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 pb-4">
            <Input
                label="Название номера"
                placeholder="Например: Стандарт 101"
                {...register("name", { required: "Обязательное поле" })}
                isInvalid={!!errors.name}
                errorMessage={errors.name?.message}
            />

            <Controller
                name="category"
                control={control}
                render={({ field }) => (
                    <Select
                        label="Категория"
                        selectedKeys={[field.value]}
                        onSelectionChange={(keys) => field.onChange(Array.from(keys)[0])}
                    >
                        <SelectItem key="STANDARD" value="STANDARD">Стандарт</SelectItem>
                        <SelectItem key="LUXURY" value="LUXURY">Люкс</SelectItem>
                        <SelectItem key="SUITE" value="SUITE">Сьют</SelectItem>
                    </Select>
                )}
            />

            <div className="grid grid-cols-2 gap-4">
                <Input
                    label="Цена за ночь"
                    type="number"
                    placeholder="3000"
                    endContent={<span className="text-default-400">₽</span>}
                    {...register("price", {
                        required: "Обязательное поле",
                        min: { value: 1, message: "Минимум 1" }
                    })}
                    isInvalid={!!errors.price}
                    errorMessage={errors.price?.message}
                />

                <Input
                    label="Вместимость"
                    type="number"
                    placeholder="2"
                    endContent={<span className="text-default-400">чел.</span>}
                    {...register("capacity", {
                        required: "Обязательное поле",
                        min: { value: 1, message: "Минимум 1" },
                        max: { value: 20, message: "Максимум 20" }
                    })}
                    isInvalid={!!errors.capacity}
                    errorMessage={errors.capacity?.message}
                />
            </div>

            <Controller
                name="status"
                control={control}
                render={({ field }) => (
                    <Select
                        label="Статус"
                        selectedKeys={[field.value]}
                        onSelectionChange={(keys) => field.onChange(Array.from(keys)[0])}
                    >
                        <SelectItem key="AVAILABLE" value="AVAILABLE">Свободен</SelectItem>
                        <SelectItem key="BOOKED" value="BOOKED">Занят</SelectItem>
                        <SelectItem key="MAINTENANCE" value="MAINTENANCE">На обслуживании</SelectItem>
                    </Select>
                )}
            />

            <div className="flex gap-3 pt-2">
                {onCancel && (
                    <Button
                        type="button"
                        variant="flat"
                        onPress={onCancel}
                        className="flex-1"
                    >
                        Отмена
                    </Button>
                )}
                <Button
                    type="submit"
                    color="primary"
                    isLoading={isSubmitting}
                    className="flex-1"
                >
                    {isEdit ? 'Сохранить' : 'Создать'}
                </Button>
            </div>
        </form>
    );
};

export default RoomCreateForm;
