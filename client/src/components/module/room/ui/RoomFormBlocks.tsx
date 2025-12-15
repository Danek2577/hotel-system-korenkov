import {
    ROOM_CATEGORY_OPTIONS,
    ROOM_CATEGORY_LABELS,
    ROOM_STATUS_OPTIONS,
    ROOM_STATUS_LABELS
} from '../domain/roomDomain';
import InputControl from '../../../../components/ui/form/InputControl';
import SelectControl from '../../../../components/ui/form/SelectControl';
import UIFormBlock from '../../../../components/ui/form/UIFormBlock';

// === Field Components ===

export function RoomFormFieldName() {
    return (
        <InputControl
            name="name"
            label="Название"
            isRequired={true}
            placeholder="Например, Люкс с видом на море"
            rules={{
                required: 'Обязательное поле',
                minLength: { value: 3, message: 'Минимум 3 символа' },
                maxLength: { value: 100, message: 'Максимум 100 символов' }
            }}
        />
    );
}

export function RoomFormFieldCategory() {
    return (
        <SelectControl
            name="category"
            label="Категория"
            isRequired={true}
            placeholder="Выберите категорию"
            options={ROOM_CATEGORY_OPTIONS.map(opt => ({
                value: opt,
                label: ROOM_CATEGORY_LABELS[opt]
            }))}
            rules={{ required: 'Выберите категорию' }}
        />
    );
}

export function RoomFormFieldPrice() {
    return (
        <InputControl
            name="price"
            label="Цена за ночь (₽)"
            type="number"
            isRequired={true}
            placeholder="0"
            rules={{
                required: 'Обязательное поле',
                min: { value: 0, message: 'Цена не может быть отрицательной' },
                max: { value: 1000000, message: 'Слишком высокая цена' }
            }}
        />
    );
}

export function RoomFormFieldCapacity() {
    return (
        <InputControl
            name="capacity"
            label="Вместимость (чел.)"
            type="number"
            isRequired={true}
            placeholder="1"
            rules={{
                required: 'Обязательное поле',
                min: { value: 1, message: 'Минимум 1 человек' },
                max: { value: 20, message: 'Максимум 20 человек' }
            }}
        />
    );
}

export function RoomFormFieldStatus() {
    return (
        <SelectControl
            name="status"
            label="Статус"
            isRequired={true}
            placeholder="Выберите статус"
            options={ROOM_STATUS_OPTIONS.map(opt => ({
                value: opt,
                label: ROOM_STATUS_LABELS[opt]
            }))}
            rules={{ required: 'Выберите статус' }}
        />
    );
}

// === Form Blocks ===

export function RoomFormMain() {
    return (
        <UIFormBlock
            header="Основная информация"
            text="Укажите название и категорию номера"
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <RoomFormFieldName />
                <RoomFormFieldCategory />
            </div>
        </UIFormBlock>
    );
}

export function RoomFormPricing() {
    return (
        <UIFormBlock header="Цена и вместимость">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <RoomFormFieldPrice />
                <RoomFormFieldCapacity />
            </div>
        </UIFormBlock>
    );
}

export function RoomFormStatus() {
    return (
        <UIFormBlock header="Статус">
            <RoomFormFieldStatus />
        </UIFormBlock>
    );
}
