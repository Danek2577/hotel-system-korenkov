import { useEffect } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { Chip } from '@nextui-org/react';
import {
    BOOKING_STATUS_OPTIONS,
    BOOKING_STATUS_LABELS,
    BookingProps
} from '../domain/bookingDomain';
import { ROOM_CATEGORY_LABELS } from '../../room/domain/roomDomain';
import useRoomsAdmGet from '../../room/hook/useRoomsAdmGet';
import { fetchBookingAvailabilityGet, Booking, Room } from '../../../../API/privateAPI';
import { dateToUnix, formatPrice, calculateNights } from '../../../../utils/dateUtils';
import UIFormBlock from '../../../../components/ui/form/UIFormBlock';
import InputControl from '../../../../components/ui/form/InputControl';
import SelectControl from '../../../../components/ui/form/SelectControl';

// === Field Components ===

export function BookingFormFieldRoom({ excludeBookingId }: { excludeBookingId?: number }) {
    const { control, setValue, watch, formState: { errors }, setError, clearErrors } = useFormContext();

    // Watch fields for automatic calculation
    const dateStart = watch('date_start');
    const dateEnd = watch('date_end');
    const selectedRoomId = watch('room_id');

    const { rooms, isLoading: isRoomsLoading } = useRoomsAdmGet({ limit: 100 });

    // Effect: Calculate price when dates or room changes
    useEffect(() => {
        if (dateStart && dateEnd && selectedRoomId) {
            const startInput = new Date(dateStart);
            const endInput = new Date(dateEnd);

            // Convert to unix for API if strings
            const startUnix = typeof dateStart === 'string' ? dateToUnix(new Date(dateStart)) : dateStart;
            const endUnix = typeof dateEnd === 'string' ? dateToUnix(new Date(dateEnd)) : dateEnd;

            const room = rooms.find((r: Room) => r.id === Number(selectedRoomId));

            if (room && startUnix && endUnix) {
                const nights = calculateNights(startUnix, endUnix);
                // Only set price if it works out positive
                if (nights > 0) {
                    // We don't have a total_price field in CREATE params typically on client side logic unless we want to show it?
                    // Actually API handles price usually, but let's assume we want to show estimated price or sth.
                    // For now, let's just check availability.
                }
            }
        }
    }, [dateStart, dateEnd, selectedRoomId, rooms]);

    // Availability Check Effect
    useEffect(() => {
        const checkAvailability = async () => {
            if (dateStart && dateEnd && selectedRoomId) {
                const startUnix = typeof dateStart === 'string' ? dateToUnix(new Date(dateStart)) : dateStart;
                const endUnix = typeof dateEnd === 'string' ? dateToUnix(new Date(dateEnd)) : dateEnd;

                if (startUnix >= endUnix) return; // Invalid dates

                try {
                    const result = await fetchBookingAvailabilityGet({
                        roomId: Number(selectedRoomId),
                        dateStart: startUnix,
                        dateEnd: endUnix
                    });

                    if (!result.message.available) {
                        // Set error manually
                        setError('room_id', {
                            type: 'custom',
                            message: 'Номер занят на выбранные даты ❌'
                        });
                    } else {
                        clearErrors('room_id');
                    }
                } catch (e) {
                    console.error(e);
                }
            }
        };

        // Debounce could be good here, but for now simple effect
        const timeout = setTimeout(checkAvailability, 500);
        return () => clearTimeout(timeout);
    }, [dateStart, dateEnd, selectedRoomId, excludeBookingId, setError, clearErrors]);

    return (
        <SelectControl
            name="room_id"
            label="Номер"
            placeholder="Выберите номер"
            isRequired={true}
            isLoading={isRoomsLoading}
            options={rooms.map((r: Room) => ({
                value: r.id,
                label: `${r.name} (${ROOM_CATEGORY_LABELS[r.category]}) - ${formatPrice(r.price)}/ночь`
            }))}
            rules={{ required: 'Выберите номер' }}
        />
    );
}

export function BookingFormFieldGuestName() {
    return (
        <InputControl
            name="guest_name"
            label="Имя гостя"
            placeholder="Иван Иванов"
            isRequired={true}
            rules={{
                required: 'Введите имя гостя',
                minLength: { value: 3, message: 'Минимум 3 символа' },
                pattern: {
                    value: /^[a-zA-Zа-яА-ЯёЁ\s-]+$/,
                    message: 'Имя может содержать только буквы'
                }
            }}
        />
    );
}

export function BookingFormFieldGuestPhone() {
    return (
        <InputControl
            name="guest_phone"
            label="Телефон"
            placeholder="+7 (999) 000-00-00"
            isRequired={true}
            rules={{
                required: 'Введите телефон',
                pattern: {
                    value: /^(\+7|8)[\s(]*\d{3}[)\s]*\d{3}[\s-]?\d{2}[\s-]?\d{2}$/,
                    message: 'Неверный формат телефона'
                }
            }}
        />
    );
}

export function BookingFormFieldDateStart() {
    return (
        <InputControl
            name="date_start"
            label="Дата заселения"
            type="date"
            isRequired={true}
            rules={{ required: 'Выберите дату заселения' }}
        />
    );
}

export function BookingFormFieldDateEnd() {
    return (
        <InputControl
            name="date_end"
            label="Дата выезда"
            type="date"
            isRequired={true}
            rules={{
                required: 'Выберите дату выезда',
                validate: (value: string, formValues: any) => {
                    const start = formValues.date_start;
                    if (start && value <= start) {
                        return 'Дата выезда должна быть позже даты заселения';
                    }
                    return true;
                }
            }}
        />
    );
}

export function BookingFormFieldStatus() {
    return (
        <SelectControl
            name="status"
            label="Статус"
            placeholder="Выберите статус"
            isRequired={true}
            options={BOOKING_STATUS_OPTIONS.map(opt => ({
                value: opt,
                label: BOOKING_STATUS_LABELS[opt]
            }))}
            rules={{ required: 'Выберите статус' }}
        />
    );
}

// === Blocks ===

/**
 * Wrapper to inject props into BookingFormFieldRoom
 * Ideally we'd use context or just pass props down, but Component map pattern makes passing props tricky without wrapper
 */
export const CreateBookingFormRoomWrapper = () => (
    <UIFormBlock header="Выбор номера">
        <BookingFormFieldRoom />
    </UIFormBlock>
);

export const EditBookingFormRoomWrapper = ({ excludeBookingId }: { excludeBookingId?: number }) => (
    <UIFormBlock header="Выбор номера">
        <BookingFormFieldRoom excludeBookingId={excludeBookingId} />
    </UIFormBlock>
);

export function BookingFormGuest() {
    return (
        <UIFormBlock header="Данные гостя">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <BookingFormFieldGuestName />
                <BookingFormFieldGuestPhone />
            </div>
        </UIFormBlock>
    );
}

export function BookingFormDates() {
    return (
        <UIFormBlock header="Даты проживания">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <BookingFormFieldDateStart />
                <BookingFormFieldDateEnd />
            </div>
        </UIFormBlock>
    );
}

export function BookingFormStatus() {
    return (
        <UIFormBlock header="Статус">
            <BookingFormFieldStatus />
        </UIFormBlock>
    );
}
