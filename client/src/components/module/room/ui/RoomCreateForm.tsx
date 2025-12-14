import { useEffect } from 'react';
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
    Switch
} from '@nextui-org/react';
import { useSWRConfig } from 'swr';
import { roomAdmCreate, roomAdmUpdate } from '../data/roomData';
import { RoomProps, RoomCreateProps, ROOM_CATEGORY_LABELS, ROOM_STATUS_LABELS } from '../domain/roomDomain';

interface RoomCreateFormProps {
    isOpen: boolean;
    onClose: () => void;
    editRoom?: RoomProps | null;
}

interface FormData {
    name: string;
    category: 'STANDARD' | 'LUXURY' | 'SUITE';
    price: string;
    capacity: string;
    status: 'AVAILABLE' | 'BOOKED' | 'MAINTENANCE';
    is_published: boolean;
}

const RoomCreateForm = ({ isOpen, onClose, editRoom }: RoomCreateFormProps) => {
    const { mutate } = useSWRConfig();
    const isEdit = !!editRoom;

    const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
        defaultValues: {
            name: '',
            category: 'STANDARD',
            price: '',
            capacity: '2',
            status: 'AVAILABLE',
            is_published: true
        }
    });

    useEffect(() => {
        if (isOpen && editRoom) {
            reset({
                name: editRoom.name,
                category: editRoom.category,
                price: String(editRoom.price),
                capacity: String(editRoom.capacity),
                status: editRoom.status,
                is_published: editRoom.is_published
            });
        } else if (isOpen && !editRoom) {
            reset({
                name: '',
                category: 'STANDARD',
                price: '',
                capacity: '2',
                status: 'AVAILABLE',
                is_published: true
            });
        }
    }, [isOpen, editRoom, reset]);

    const onSubmit = async (data: FormData) => {
        // Ensure price and capacity are numbers
        const price = parseFloat(data.price);
        const capacity = parseInt(data.capacity);

        const payload: RoomCreateProps = {
            name: data.name,
            category: data.category,
            price: isNaN(price) ? 0 : price,
            capacity: isNaN(capacity) ? 0 : capacity,
            status: data.status,
            is_published: data.is_published,
            blocks: editRoom?.blocks || []
        };

        const onSuccess = async () => {
            await mutate((key) => Array.isArray(key) && key[0] === 'rooms');
            onClose();
        };

        try {
            if (isEdit) {
                await roomAdmUpdate({
                    data: { ...payload, roomId: editRoom!.id },
                    onSuccess
                });
            } else {
                await roomAdmCreate({ data: payload, onSuccess });
            }
        } catch (e) {
            console.error(e);
            // Toast is handled in data layer
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
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
                            <span>🛏️</span>
                            <span>{isEdit ? 'Редактирование номера' : 'Добавление номера'}</span>
                        </ModalHeader>

                        <ModalBody className="flex flex-col gap-4">
                            <Controller
                                name="name"
                                control={control}
                                rules={{
                                    required: 'Название обязательно',
                                    minLength: { value: 1, message: 'Минимум 1 символ' }
                                }}
                                render={({ field, fieldState }) => (
                                    <Input
                                        {...field}
                                        label="Название номера"
                                        placeholder="101 или Люкс с видом на море"
                                        isInvalid={!!fieldState.error}
                                        errorMessage={fieldState.error?.message}
                                        variant="bordered"
                                        size="lg"
                                    />
                                )}
                            />

                            <Controller
                                name="category"
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        label="Категория"
                                        selectedKeys={[field.value]}
                                        onSelectionChange={(keys) => field.onChange(Array.from(keys)[0])}
                                        variant="bordered"
                                        size="lg"
                                    >
                                        {Object.entries(ROOM_CATEGORY_LABELS).map(([key, label]) => (
                                            <SelectItem key={key} value={key}>
                                                {label}
                                            </SelectItem>
                                        ))}
                                    </Select>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-6">
                                <Controller
                                    name="price"
                                    control={control}
                                    rules={{
                                        required: 'Цена обязательна',
                                        min: { value: 1, message: 'Цена должна быть положительной' },
                                        validate: (value) => parseFloat(value) > 0 || 'Цена должна быть положительной'
                                    }}
                                    render={({ field, fieldState }) => (
                                        <Input
                                            {...field}
                                            type="number"
                                            label="Цена за ночь (₽)"
                                            placeholder="5000"
                                            isInvalid={!!fieldState.error}
                                            errorMessage={fieldState.error?.message}
                                            variant="bordered"
                                            size="lg"
                                            min={0}
                                        />
                                    )}
                                />

                                <Controller
                                    name="capacity"
                                    control={control}
                                    rules={{
                                        required: 'Вместимость обязательна',
                                        min: { value: 1, message: 'Минимум 1 человек' },
                                        max: { value: 20, message: 'Максимум 20 человек' }
                                    }}
                                    render={({ field, fieldState }) => (
                                        <Input
                                            {...field}
                                            type="number"
                                            label="Вместимость (чел.)"
                                            placeholder="2"
                                            isInvalid={!!fieldState.error}
                                            errorMessage={fieldState.error?.message}
                                            variant="bordered"
                                            size="lg"
                                            min={1}
                                            max={20}
                                        />
                                    )}
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
                                        variant="bordered"
                                        size="lg"
                                    >
                                        {Object.entries(ROOM_STATUS_LABELS).map(([key, label]) => (
                                            <SelectItem key={key} value={key}>
                                                {label}
                                            </SelectItem>
                                        ))}
                                    </Select>
                                )}
                            />

                            <Controller
                                name="is_published"
                                control={control}
                                render={({ field }) => (
                                    <div className="flex items-center justify-between p-4 bg-content2 rounded-lg">
                                        <div>
                                            <p className="font-medium">Опубликован</p>
                                            <p className="text-sm text-default-500">
                                                Номер будет виден на сайте
                                            </p>
                                        </div>
                                        <Switch
                                            isSelected={field.value}
                                            onValueChange={field.onChange}
                                            color="success"
                                        />
                                    </div>
                                )}
                            />
                        </ModalBody>

                        <ModalFooter className="gap-2">
                            <Button variant="flat" onPress={onModalClose}>
                                Отмена
                            </Button>
                            <Button color="primary" type="submit" isLoading={isSubmitting}>
                                {isEdit ? 'Сохранить' : 'Создать'}
                            </Button>
                        </ModalFooter>
                    </form>
                )}
            </ModalContent>
        </Modal>
    );
};

export default RoomCreateForm;
