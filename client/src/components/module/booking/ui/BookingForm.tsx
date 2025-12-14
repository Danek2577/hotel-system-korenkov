import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Input,
    Select,
    SelectItem,
    Chip,
    Card,
    CardBody
} from '@nextui-org/react';
import { useSWRConfig } from 'swr';
import { bookingAdmCreate, bookingAdmUpdate } from '../data/bookingData';
import { BookingProps, BOOKING_STATUS_LABELS } from '../domain/bookingDomain';
import { fetchBookingAvailabilityGet } from '../../../../API/bookingAPI';
import useRoomsAdmGet from '../../room/hook/useRoomsAdmGet';
import { ROOM_CATEGORY_LABELS } from '../../room/domain/roomDomain';
import { dateToUnix, unixToDate, formatPrice, calculateNights } from '../../../../utils/dateUtils';

interface BookingFormProps {
    isOpen: boolean;
    onClose: () => void;
    onOpenChange: (isOpen: boolean) => void;
    editBooking?: BookingProps | null;
}

interface FormData {
    roomId: string;
    guest_name: string;
    guest_phone: string;
    date_start: string;
    date_end: string;
    status: 'CONFIRMED' | 'CANCELLED';
}

const BookingForm = ({ isOpen, onClose, onOpenChange, editBooking }: BookingFormProps) => {
    const { mutate } = useSWRConfig();
    const { rooms } = useRoomsAdmGet({ limit: 100, status: 'AVAILABLE' });
    const isEdit = !!editBooking;
    const [availability, setAvailability] = useState<boolean | null>(null);
    const [estimatedPrice, setEstimatedPrice] = useState<number | null>(null);
    const [checkingAvailability, setCheckingAvailability] = useState(false);

    const { control, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
        defaultValues: {
            roomId: '',
            guest_name: '',
            guest_phone: '',
            date_start: '',
            date_end: '',
            status: 'CONFIRMED'
        }
    });

    const watchRoomId = watch('roomId');
    const watchDateStart = watch('date_start');
    const watchDateEnd = watch('date_end');

    const formatDateForInput = (unix: number) => {
        const date = unixToDate(unix);
        return date.toISOString().split('T')[0];
    };

    useEffect(() => {
        if (isOpen && editBooking) {
            reset({
                roomId: String(editBooking.room_id),
                guest_name: editBooking.guest_name,
                guest_phone: editBooking.guest_phone,
                date_start: formatDateForInput(editBooking.date_start),
                date_end: formatDateForInput(editBooking.date_end),
                status: editBooking.status
            });
        } else if (isOpen && !editBooking) {
            reset({
                roomId: '',
                guest_name: '',
                guest_phone: '',
                date_start: '',
                date_end: '',
                status: 'CONFIRMED'
            });
        }
        setAvailability(null);
        setEstimatedPrice(null);
    }, [isOpen, editBooking, reset]);

    // Check availability when room and dates change
    useEffect(() => {
        const checkAvailability = async () => {
            if (watchRoomId && watchDateStart && watchDateEnd) {
                const dateStart = dateToUnix(new Date(watchDateStart));
                const dateEnd = dateToUnix(new Date(watchDateEnd));

                if (dateEnd > dateStart) {
                    setCheckingAvailability(true);
                    try {
                        const { message } = await fetchBookingAvailabilityGet({
                            roomId: parseInt(watchRoomId),
                            dateStart,
                            dateEnd
                        });

                        if (isEdit && message.conflictingBookings.length === 1) {
                            const conflict = message.conflictingBookings[0];
                            setAvailability(conflict.id === editBooking?.id);
                        } else {
                            setAvailability(message.available);
                        }

                        const selectedRoom = rooms.find(r => r.id === parseInt(watchRoomId));
                        if (selectedRoom) {
                            const nights = calculateNights(dateStart, dateEnd);
                            setEstimatedPrice(selectedRoom.price * nights);
                        }
                    } catch {
                        setAvailability(null);
                    } finally {
                        setCheckingAvailability(false);
                    }
                }
            } else {
                setAvailability(null);
                setEstimatedPrice(null);
            }
        };

        const debounce = setTimeout(checkAvailability, 300);
        return () => clearTimeout(debounce);
    }, [watchRoomId, watchDateStart, watchDateEnd, rooms, isEdit, editBooking?.id]);

    const onSubmit = async (data: FormData) => {
        // Ensure dates are parsed correctly as unix timestamp (seconds), start of day if needed
        // The input type="date" returns YYYY-MM-DD string
        const dateStart = dateToUnix(new Date(data.date_start));
        const dateEnd = dateToUnix(new Date(data.date_end));

        const onSuccess = async () => {
            await mutate((key) => Array.isArray(key) && key[0] === 'bookings');
            // Also invalidate rooms availability cache if possible, but rooms list might not need invalidation unless room status changed
            await mutate((key) => Array.isArray(key) && key[0] === 'rooms');
            onOpenChange(false);
        };

        try {
            if (isEdit) {
                await bookingAdmUpdate({
                    data: {
                        bookingId: editBooking!.id,
                        guest_name: data.guest_name,
                        guest_phone: data.guest_phone,
                        date_start: dateStart,
                        date_end: dateEnd,
                        status: data.status
                    },
                    onSuccess
                });
            } else {
                await bookingAdmCreate({
                    data: {
                        roomId: parseInt(data.roomId),
                        guest_name: data.guest_name,
                        guest_phone: data.guest_phone,
                        date_start: dateStart,
                        date_end: dateEnd
                    },
                    onSuccess
                });
            }
        } catch (e) {
            console.error(e);
            // Toast is handled in data layer
        }
    };

    const availableRooms = isEdit
        ? [...rooms, ...(editBooking?.room ? [{ id: editBooking.room_id, name: editBooking.room.name, category: editBooking.room.category, price: editBooking.room.price }] : [])]
        : rooms;

    const uniqueRooms = availableRooms.filter((room, index, self) =>
        index === self.findIndex(r => r.id === room.id)
    );

    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            size="lg"
            backdrop="opaque"
            placement="center"
            scrollBehavior="inside"
            classNames={{
                backdrop: "bg-black/80",
                base: "bg-content1 border border-divider shadow-xl",
                header: "border-b border-divider py-4",
                body: "py-6",
                footer: "border-t border-divider py-4",
            }}
        >
            <ModalContent>
                {(onModalClose) => (
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <ModalHeader className="flex items-center gap-2 text-lg">
                            <span>📅</span>
                            <span>{isEdit ? 'Редактирование бронирования' : 'Создание бронирования'}</span>
                        </ModalHeader>

                        <ModalBody className="flex flex-col gap-4">
                            <Controller
                                name="roomId"
                                control={control}
                                rules={{ required: 'Выберите номер' }}
                                render={({ field, fieldState }) => (
                                    <Select
                                        label="Номер"
                                        placeholder="Выберите номер"
                                        selectedKeys={field.value ? [field.value] : []}
                                        onSelectionChange={(keys) => field.onChange(Array.from(keys)[0])}
                                        isInvalid={!!fieldState.error}
                                        errorMessage={fieldState.error?.message}
                                        isDisabled={isEdit}
                                        variant="bordered"
                                        size="lg"
                                    >
                                        {uniqueRooms.map((room) => (
                                            <SelectItem key={String(room.id)} value={String(room.id)}>
                                                {room.name} - {ROOM_CATEGORY_LABELS[room.category as keyof typeof ROOM_CATEGORY_LABELS]} ({formatPrice(room.price)}/ночь)
                                            </SelectItem>
                                        ))}
                                    </Select>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-6">
                                <Controller
                                    name="guest_name"
                                    control={control}
                                    rules={{
                                        required: 'Имя гостя обязательно',
                                        minLength: { value: 2, message: 'Минимум 2 символа' }
                                    }}
                                    render={({ field, fieldState }) => (
                                        <Input
                                            {...field}
                                            label="Имя гостя"
                                            placeholder="Иван Иванов"
                                            isInvalid={!!fieldState.error}
                                            errorMessage={fieldState.error?.message}
                                            variant="bordered"
                                            size="lg"
                                        />
                                    )}
                                />

                                <Controller
                                    name="guest_phone"
                                    control={control}
                                    rules={{
                                        required: 'Телефон обязателен',
                                        pattern: {
                                            value: /^[\d\+\-\(\)\s]{10,20}$/,
                                            message: 'Введите корректный номер телефона'
                                        }
                                    }}
                                    render={({ field, fieldState }) => (
                                        <Input
                                            {...field}
                                            label="Телефон гостя"
                                            placeholder="+7 (999) 123-45-67"
                                            isInvalid={!!fieldState.error}
                                            errorMessage={fieldState.error?.message}
                                            variant="bordered"
                                            size="lg"
                                        />
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <Controller
                                    name="date_start"
                                    control={control}
                                    rules={{ required: 'Дата заезда обязательна' }}
                                    render={({ field, fieldState }) => (
                                        <Input
                                            {...field}
                                            type="date"
                                            label="Дата заезда"
                                            isInvalid={!!fieldState.error || availability === false}
                                            errorMessage={fieldState.error?.message}
                                            variant="bordered"
                                            size="lg"
                                        />
                                    )}
                                />

                                <Controller
                                    name="date_end"
                                    control={control}
                                    rules={{
                                        required: 'Дата выезда обязательна',
                                        validate: (value, formValues) => {
                                            if (formValues.date_start && value <= formValues.date_start) {
                                                return 'Дата выезда должна быть позже даты заезда';
                                            }
                                            return true;
                                        }
                                    }}
                                    render={({ field, fieldState }) => (
                                        <Input
                                            {...field}
                                            type="date"
                                            label="Дата выезда"
                                            isInvalid={!!fieldState.error || availability === false}
                                            errorMessage={fieldState.error?.message}
                                            variant="bordered"
                                            size="lg"
                                        />
                                    )}
                                />
                            </div>

                            {/* Availability & Price Card */}
                            {(availability !== null || checkingAvailability) && (
                                <Card className="bg-content2">
                                    <CardBody className="flex-row items-center justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                            {checkingAvailability ? (
                                                <Chip size="sm" variant="flat">
                                                    Проверка...
                                                </Chip>
                                            ) : (
                                                <Chip
                                                    color={availability ? 'success' : 'danger'}
                                                    variant="flat"
                                                    size="sm"
                                                >
                                                    {availability ? '✓ Номер доступен' : '✗ Номер занят на эти даты'}
                                                </Chip>
                                            )}
                                        </div>
                                        {estimatedPrice !== null && availability && (
                                            <div className="text-right">
                                                <p className="text-xs text-default-500">Итого</p>
                                                <p className="text-lg font-bold text-success">
                                                    {formatPrice(estimatedPrice)}
                                                </p>
                                            </div>
                                        )}
                                    </CardBody>
                                </Card>
                            )}

                            {isEdit && (
                                <Controller
                                    name="status"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            label="Статус"
                                            selectedKeys={[field.value]}
                                            onSelectionChange={(keys) => field.onChange(Array.from(keys)[0])}
                                            variant="bordered"
                                            size="lg"
                                        >
                                            {Object.entries(BOOKING_STATUS_LABELS).map(([key, label]) => (
                                                <SelectItem key={key} value={key}>
                                                    {label}
                                                </SelectItem>
                                            ))}
                                        </Select>
                                    )}
                                />
                            )}
                        </ModalBody>

                        <ModalFooter className="gap-2">
                            <Button variant="flat" onPress={onModalClose}>
                                Отмена
                            </Button>
                            <Button
                                color="primary"
                                type="submit"
                                isLoading={isSubmitting}
                                isDisabled={availability === false || checkingAvailability}
                            >
                                {isEdit ? 'Сохранить' : 'Создать'}
                            </Button>
                        </ModalFooter>
                    </form>
                )}
            </ModalContent>
        </Modal>
    );
};

export default BookingForm;
