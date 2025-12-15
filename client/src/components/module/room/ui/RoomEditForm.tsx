import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useForm, FormProvider } from 'react-hook-form';
import { observer } from 'mobx-react-lite';
import { Button, Divider, Skeleton } from '@nextui-org/react';
import { RoomFormMain, RoomFormPricing, RoomFormStatus } from './RoomFormBlocks';
import { roomAdmUpdate } from '../data/roomData';
import useRoomAdmGetOne from '../hook/useRoomAdmGetOne';
import { RoomUpdateParams } from '../../../../API/privateAPI';

interface RoomEditFormProps {
    roomId: number;
    onSuccess?: () => void;
    onCancel?: () => void;
}

function RoomEditForm({ roomId, onSuccess, onCancel }: RoomEditFormProps) {
    const router = useRouter();
    const { data: room, isLoading, mutate } = useRoomAdmGetOne(roomId);

    const form = useForm<RoomUpdateParams>();

    const {
        handleSubmit,
        reset,
        formState: { isSubmitting }
    } = form;

    // Fill form with room data
    useEffect(() => {
        if (!room) return;
        reset({
            name: room.name,
            category: room.category,
            price: room.price,
            capacity: room.capacity,
            status: room.status
        });
    }, [room, reset]);

    const onSubmit = handleSubmit(async (data) => {
        try {
            await roomAdmUpdate({
                data: { ...data, roomId },
                onSuccess: async () => {
                    await mutate();

                    if (onSuccess) {
                        onSuccess();
                        return;
                    }

                    router.push('/lk/rooms');
                }
            });
        } catch (error) {
            // TODO: обработать ошибку (toast / setError и т.п.)
            // eslint-disable-next-line no-console
            console.error('roomAdmUpdate error', error);
        }
    });

    const handleCancel = () => {
        if (onCancel) {
            onCancel();
            return;
        }

        router.back();
    };

    if (isLoading || !room) {
        return <Skeleton className="h-32 rounded-lg mt-6" />;
    }

    const components = [
        RoomFormMain,
        RoomFormPricing,
        RoomFormStatus
    ];

    return (
        <FormProvider {...form}>
            <form onSubmit={onSubmit} className="flex flex-col gap-6">

                {components.map((Component, i) => (
                    <React.Fragment key={i}>
                        {i !== 0 && <Divider />}
                        <Component />
                    </React.Fragment>
                ))}

                <Divider />

                <div className="flex gap-2 justify-end">
                    <Button variant="flat" onPress={handleCancel}>
                        Отмена
                    </Button>
                    <Button
                        type="submit"
                        color="primary"
                        isLoading={isSubmitting}
                    >
                        Сохранить
                    </Button>
                </div>
            </form>
        </FormProvider>
    );
}

export default observer(RoomEditForm);
