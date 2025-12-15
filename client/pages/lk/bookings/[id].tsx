import { useRouter } from 'next/router';
import { Button, Spinner } from '@nextui-org/react';
import MainLayout from "../../../src/components/layout/MainLayout";
import BookingEditForm from "../../../src/components/module/booking/ui/BookingEditForm";

export default function EditBookingPage() {
    const router = useRouter();
    const { id } = router.query;

    if (!id) {
        return (
            <MainLayout>
                <div className="flex justify-center items-center h-64">
                    <Spinner size="lg" label="Загрузка..." />
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="max-w-2xl mx-auto space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="light" onPress={() => router.back()}>
                        ← Назад
                    </Button>
                    <h1 className="text-2xl font-bold">Редактирование бронирования</h1>
                </div>

                <BookingEditForm bookingId={Number(id)} />
            </div>
        </MainLayout>
    );
}
