import { Controller, useFormContext } from 'react-hook-form';
import { Input, InputProps } from '@nextui-org/react';

interface InputControlProps extends InputProps {
    name: string;
    label: string;
    rules?: any;
    placeholder?: string;
    type?: string;
    isRequired?: boolean;
}

export default function InputControl({
    name,
    label,
    rules,
    placeholder,
    type = 'text',
    isRequired,
    ...props
}: InputControlProps) {
    const { control } = useFormContext();

    return (
        <Controller
            control={control}
            name={name}
            rules={rules}
            render={({ field, fieldState: { error } }) => (
                <div className="flex flex-col gap-1 w-full">
                    {label && (
                        <span className="text-small font-medium text-default-700">
                            {label} {isRequired && <span className="text-danger">*</span>}
                        </span>
                    )}
                    <Input
                        {...field}
                        {...props}
                        placeholder={placeholder}
                        type={type}
                        isInvalid={!!error}
                        errorMessage={error?.message}
                        variant="bordered"
                        size="md"
                        classNames={{
                            inputWrapper: "bg-default-100",
                        }}
                    />
                </div>
            )}
        />
    );
}
