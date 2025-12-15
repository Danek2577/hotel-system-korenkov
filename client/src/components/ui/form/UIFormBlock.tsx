import { ReactNode } from 'react';
import { Card, CardHeader, CardBody, Divider } from '@nextui-org/react';

interface UIFormBlockProps {
    header: string;
    text?: string;
    children: ReactNode;
}

export default function UIFormBlock({ header, text, children }: UIFormBlockProps) {
    return (
        <Card className="shadow-none border border-divider">
            <CardHeader className="flex flex-col items-start gap-1 px-6 pt-6">
                <h3 className="text-lg font-bold">{header}</h3>
                {text && <p className="text-small text-default-500">{text}</p>}
            </CardHeader>
            <Divider className="my-2" />
            <CardBody className="px-6 pb-6 gap-6">
                {children}
            </CardBody>
        </Card>
    );
}
