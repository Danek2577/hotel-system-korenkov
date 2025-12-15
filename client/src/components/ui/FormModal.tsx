import { ReactNode } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@nextui-org/react';

interface FormModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    icon?: string;
    children: ReactNode;
    footer?: ReactNode;
}

/**
 * Reusable modal wrapper with proper z-index for NextUI
 * Using z-[99999] to ensure modal appears above all other elements
 */
export default function FormModal({
    isOpen,
    onClose,
    title,
    icon = '📝',
    children,
    footer
}: FormModalProps) {
    if (!isOpen) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            onOpenChange={(open) => !open && onClose()}
            placement="center"
            size="xl"
            scrollBehavior="inside"
            classNames={{
                wrapper: 'z-[99999] h-dvh',
                base: 'bg-content1',
                header: 'border-b border-divider',
                body: 'py-6',
                footer: 'border-t border-divider'
            }}
        >
            <ModalContent>
                <ModalHeader className="flex items-center gap-2">
                    <span>{icon}</span>
                    <span>{title}</span>
                </ModalHeader>
                <ModalBody>
                    {children}
                </ModalBody>
                {footer && (
                    <ModalFooter>
                        {footer}
                    </ModalFooter>
                )}
            </ModalContent>
        </Modal>
    );
}
