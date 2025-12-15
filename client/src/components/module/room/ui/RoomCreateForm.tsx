import React from 'react';
import { useRouter } from 'next/router';
import { useForm, FormProvider } from 'react-hook-form';
import { observer } from 'mobx-react-lite';
import { Button, Divider } from '@nextui-org/react';
import { RoomFormMain, RoomFormPricing } from './RoomFormBlocks';
import { roomAdmCreate } from '../data/roomData';
import { RoomCreateParams } from '../../../../API/roomAPI';

interface RoomCreateFormProps {
    onSuccess?: () => void;
    onCancel?: () => void;
}

function RoomCreateForm({ onSuccess, onCancel }: RoomCreateFormProps) {
    const router = useRouter();

    const form = useForm<RoomCreateParams>({
        defaultValues: {
            name: '',
            category: 'STANDARD',
            price: 0,
            capacity: 1
        }
    });

    const onSubmit = form.handleSubmit(async (data) => {
        await roomAdmCreate({
            data,
            onSuccess: async () => {
                if (onSuccess) {
                    onSuccess();
                } else {
                    await router.push('/lk/rooms');
                }
            }
        });
    });

    const handleCancel = () => {
        if (onCancel) {
            onCancel();
        } else {
            router.back();
        }
    };

    const components = [
        RoomFormMain,
        RoomFormPricing
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
                        isLoading={form.formState.isSubmitting}
                    >
                        Создать
                    </Button>
                </div>
            </form>
        </FormProvider>
    );
}

export default observer(RoomCreateForm);
