import React from 'react';
import { useRouter } from 'next/router';
import { useForm, FormProvider } from 'react-hook-form';
import { observer } from 'mobx-react-lite';
import { Button, Divider } from '@nextui-org/react';
import {
    CreateBookingFormRoomWrapper,
    BookingFormGuest,
    BookingFormDates
} from './BookingFormBlocks';
import { bookingAdmCreate } from '../data/bookingData';
import { BookingCreateProps } from '../domain/bookingDomain';
import { dateToUnix } from '../../../../utils/dateUtils';

interface BookingCreateFormProps {
    onSuccess?: () => void;
    onCancel?: () => void;
}

type BookingCreateFormValues = {
    room_id: number;
    guest_name: string;
    guest_phone: string;
    date_start: string;
    date_end: string;
};

function BookingCreateForm({ onSuccess, onCancel }: BookingCreateFormProps) {
    const router = useRouter();

    const form = useForm<BookingCreateFormValues>();

    const onSubmit = form.handleSubmit(async (data) => {
        // Convert dates to unix for API
        const formattedData: BookingCreateProps = {
            ...data,
            date_start: dateToUnix(new Date(String(data.date_start))),
            date_end: dateToUnix(new Date(String(data.date_end))),
            roomId: Number(data.room_id)
        };

        try {
            await bookingAdmCreate({
                data: formattedData,
                onSuccess: async () => {
                    if (onSuccess) {
                        onSuccess();
                        return;
                    }

                    router.push('/lk/bookings');
                }
            });
        } catch (error) {
            // TODO: обработать ошибку (toast / setError и т.п.)
            // eslint-disable-next-line no-console
            console.error('bookingAdmCreate error', error);
        }
    });

    const handleCancel = () => {
        if (onCancel) {
            onCancel();
        } else {
            router.back();
        }
    };

    const components = [
        CreateBookingFormRoomWrapper,
        BookingFormDates,
        BookingFormGuest
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

export default observer(BookingCreateForm);
