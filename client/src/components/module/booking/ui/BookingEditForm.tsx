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

function BookingEditForm({ bookingId, onSuccess, onCancel }: BookingEditFormProps) {
    const router = useRouter();
    const { booking, isLoading, mutate } = useBookingAdmGetOne({ id: bookingId });

    const form = useForm<BookingUpdateProps>();

    const { handleSubmit, reset, formState: { isSubmitting, defaultValues } } = form;

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
        } as any);
    }, [booking, reset]);

    const onSubmit = handleSubmit(async (data) => {
        // Handle dates
        const formattedData: BookingUpdateProps = {
            bookingId: Number(bookingId),
            guest_name: data.guest_name,
            guest_phone: data.guest_phone,
            status: data.status,
            date_start: typeof data.date_start === 'string' ? dateToUnix(new Date(data.date_start)) : data.date_start,
            date_end: typeof data.date_end === 'string' ? dateToUnix(new Date(data.date_end)) : data.date_end,
        };

        await bookingAdmUpdate({
            data: formattedData,
            onSuccess: async () => {
                await mutate();
                if (onSuccess) {
                    onSuccess();
                } else {
                    await router.push('/lk/bookings');
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

    if (isLoading || !defaultValues) {
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
