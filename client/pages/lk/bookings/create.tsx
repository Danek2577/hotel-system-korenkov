import { useRouter } from 'next/router';
import { Button } from '@nextui-org/react';
import MainLayout from "../../../src/components/layout/MainLayout";
import BookingCreateForm from "../../../src/components/module/booking/ui/BookingCreateForm";

export default function CreateBookingPage() {
    const router = useRouter();

    return (
        <MainLayout>
            <div className="max-w-2xl mx-auto space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="light" onPress={() => router.back()}>
                        ← Назад
                    </Button>
                    <h1 className="text-2xl font-bold">Создание бронирования</h1>
                </div>

                <BookingCreateForm />
            </div>
        </MainLayout>
    );
}
