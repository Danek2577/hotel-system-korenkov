import { useRouter } from 'next/router';
import { Button } from '@nextui-org/react';
import MainLayout from "../../../src/components/layout/MainLayout";
import RoomCreateForm from "../../../src/components/module/room/ui/RoomCreateForm";

export default function CreateRoomPage() {
    const router = useRouter();

    return (
        <MainLayout>
            <div className="max-w-2xl mx-auto space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="light" onPress={() => router.back()}>
                        ← Назад
                    </Button>
                    <h1 className="text-2xl font-bold">Создание номера</h1>
                </div>

                <RoomCreateForm />
            </div>
        </MainLayout>
    );
}
