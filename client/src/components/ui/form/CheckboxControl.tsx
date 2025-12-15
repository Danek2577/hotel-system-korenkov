import { Controller, useFormContext } from 'react-hook-form';
import { Checkbox, CheckboxProps } from '@nextui-org/react';

interface CheckboxControlProps extends CheckboxProps {
    name: string;
    children: React.ReactNode;
}

export default function CheckboxControl({ name, children, ...props }: CheckboxControlProps) {
    const { control } = useFormContext();

    return (
        <Controller
            control={control}
            name={name}
            render={({ field: { value, onChange, ...field } }) => (
                <Checkbox
                    {...field}
                    isSelected={value}
                    onValueChange={onChange}
                    {...props}
                >
                    {children}
                </Checkbox>
            )}
        />
    );
}
