import { Controller, useFormContext } from 'react-hook-form';
import { Select, SelectItem, SelectProps } from '@nextui-org/react';

interface SelectControlProps extends Omit<SelectProps, 'children'> {
    name: string;
    label: string;
    options: { value: string | number; label: string }[];
    rules?: any;
    placeholder?: string;
    isRequired?: boolean;
}

export default function SelectControl({
    name,
    label,
    options,
    rules,
    placeholder,
    isRequired,
    ...props
}: SelectControlProps) {
    const { control } = useFormContext();

    return (
        <Controller
            control={control}
            name={name}
            rules={rules}
            render={({ field: { onChange, value, ...field }, fieldState: { error } }) => (
                <div className="flex flex-col gap-1 w-full">
                    {label && (
                        <span className="text-small font-medium text-default-700">
                            {label} {isRequired && <span className="text-danger">*</span>}
                        </span>
                    )}
                    <Select
                        {...field}
                        selectedKeys={value ? [String(value)] : []}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={placeholder}
                        isInvalid={!!error}
                        errorMessage={error?.message}
                        variant="bordered"
                        size="md"
                        classNames={{
                            trigger: "bg-default-100",
                        }}
                        {...props}
                    >
                        {options.map((option) => (
                            <SelectItem key={String(option.value)} value={String(option.value)}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </Select>
                </div>
            )}
        />
    );
}
