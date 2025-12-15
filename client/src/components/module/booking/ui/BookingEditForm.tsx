import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useForm, FormProvider } from 'react-hook-form';
import { observer } from 'mobx-react-lite';
import { Button, Divider, Skeleton } from '@nextui-org/react';
import {
    EditBookingFormRoomWrapper,
    BookingFormGuest,
    BookingFormDates,
    BookingFormStatus
} from './BookingFormBlocks';
import { bookingAdmUpdate } from '../data/bookingData';
import useBookingAdmGetOne from '../hook/useBookingAdmGetOne';
import { BookingUpdateProps } from '../domain/bookingDomain';
import { dateToUnix, unixToDateInput } from '../../../../utils/dateUtils';

interface BookingEditFormProps {
    bookingId: number;
    onSuccess?: () => void;
    onCancel?: () => void;
}

type BookingEditFormValues = {
    bookingId: number;
    room_id: number;
    guest_name: string;
    guest_phone: string;
    date_start: string;
    date_end: string;
    status: BookingUpdateProps['status'];
};

function BookingEditForm({ bookingId, onSuccess, onCancel }: BookingEditFormProps) {
    const router = useRouter();
    const { booking, isLoading, mutate } = useBookingAdmGetOne({ id: bookingId });

    const form = useForm<BookingEditFormValues>();

    const {
        handleSubmit,
        reset,
        formState: { isSubmitting }
    } = form;

    // Fill form with booking data
    useEffect(() => {
        if (!booking) return;
        reset({
            bookingId: booking.id,
            room_id: booking.room_id, // Add room_id for availability check context
            guest_name: booking.guest_name,
            guest_phone: booking.guest_phone,
            date_start: unixToDateInput(booking.date_start),
            date_end: unixToDateInput(booking.date_end),
            status: booking.status
        });
    }, [booking, reset]);

    const onSubmit = handleSubmit(async (data) => {
        // Handle dates
        const formattedData: BookingUpdateProps = {
            bookingId: Number(bookingId),
            guest_name: data.guest_name,
            guest_phone: data.guest_phone,
            status: data.status,
            date_start: dateToUnix(new Date(data.date_start)),
            date_end: dateToUnix(new Date(data.date_end))
        };

        try {
            await bookingAdmUpdate({
                data: formattedData,
                onSuccess: async () => {
                    await mutate();

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
            console.error('bookingAdmUpdate error', error);
        }
    });

    const handleCancel = () => {
        if (onCancel) {
            onCancel();
            return;
        }

        router.back();
    };

    if (isLoading || !booking) {
        return <Skeleton className="h-32 rounded-lg mt-6" />;
    }

    // Wrapper to pass props
    const RoomWrapper = () => <EditBookingFormRoomWrapper excludeBookingId={bookingId} />;

    const components = [
        RoomWrapper,
        BookingFormDates,
        BookingFormGuest,
        BookingFormStatus
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

export default observer(BookingEditForm);
