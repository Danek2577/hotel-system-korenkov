import { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Card, CardBody } from '@nextui-org/react';
import MainLayout from '../../../src/components/layout/MainLayout';
import BookingTable from '../../../src/components/module/booking/ui/BookingTable';
import BookingForm from '../../../src/components/module/booking/ui/BookingForm';
import { BookingProps } from '../../../src/components/module/booking/domain/bookingDomain';

const BookingsPage = observer(() => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editBooking, setEditBooking] = useState<BookingProps | null>(null);

    const handleCreate = () => {
        setEditBooking(null);
        setIsModalOpen(true);
    };

    const handleEdit = (booking: BookingProps) => {
        setEditBooking(booking);
        setIsModalOpen(true);
    };

    const handleClose = () => {
        setIsModalOpen(false);
        setEditBooking(null);
    };

    return (
        <MainLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold">Управление бронированиями</h1>
                    <p className="text-default-500 mt-1">
                        Создавайте и управляйте бронированиями номеров
                    </p>
                </div>

                <Card className="bg-content1">
                    <CardBody className="p-0">
                        <BookingTable onCreate={handleCreate} onEdit={handleEdit} />
                    </CardBody>
                </Card>

                <BookingForm
                    isOpen={isModalOpen}
                    onClose={handleClose}
                    editBooking={editBooking}
                />
            </div>
        </MainLayout>
    );
});

export default BookingsPage;
