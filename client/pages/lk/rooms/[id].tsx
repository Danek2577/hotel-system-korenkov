import { useRouter } from 'next/router';
import { Button, Spinner } from '@nextui-org/react';
import MainLayout from "../../../src/components/layout/MainLayout";
import RoomEditForm from "../../../src/components/module/room/ui/RoomEditForm";

export default function EditRoomPage() {
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
                    <h1 className="text-2xl font-bold">Редактирование номера</h1>
                </div>

                <RoomEditForm roomId={Number(id)} />
            </div>
        </MainLayout>
    );
}
