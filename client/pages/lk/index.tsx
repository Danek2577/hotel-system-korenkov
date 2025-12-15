import React, { useEffect, useState } from 'react';
import MainLayout from "../../src/components/layout/MainLayout";
import { Card, CardBody, Spinner } from "@nextui-org/react";
import { fetchAdmDashboardStatsGet } from "@/API/privateAPI";

export default function Dashboard() {
    // Состояние для хранения статистики
    const [stats, setStats] = useState({
        freeRooms: 0,
        avgPrice: 0,
        totalUsers: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await fetchAdmDashboardStatsGet();
                setStats(data);
            } catch (e) {
                console.error("Критическая ошибка дашборда:", e);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <MainLayout>
            <div className="p-6">
                <h1 className="text-2xl font-bold mb-6">Статистика отеля</h1>

                {loading ? (
                    <div className="flex justify-center w-full mt-10">
                        <Spinner size="lg" label="Анализ данных..." />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                        {/* Карточка 1: Свободные номера */}
                        <Card className="bg-primary text-white shadow-lg">
                            <CardBody className="p-6">
                                <p className="text-sm uppercase opacity-80 font-semibold">Свободных номеров</p>
                                <div className="flex items-baseline gap-2 mt-2">
                                    <h3 className="text-5xl font-bold">{stats.freeRooms}</h3>
                                    <span className="text-sm opacity-80">сейчас</span>
                                </div>
                            </CardBody>
                        </Card>

                        {/* Карточка 2: Средняя цена */}
                        <Card className="bg-secondary text-white shadow-lg">
                            <CardBody className="p-6">
                                <p className="text-sm uppercase opacity-80 font-semibold">Средняя стоимость (ночь)</p>
                                <div className="flex items-baseline gap-2 mt-2">
                                    <h3 className="text-5xl font-bold">{stats.avgPrice} ₽</h3>
                                </div>
                            </CardBody>
                        </Card>

                        {/* Карточка 3: Пользователи (Общая статистика) */}
                        <Card className="bg-default-100 border border-default-200 shadow-sm">
                            <CardBody className="p-6">
                                <p className="text-sm uppercase text-default-500 font-semibold">Пользователей в системе</p>
                                <div className="flex items-baseline gap-2 mt-2">
                                    <h3 className="text-5xl font-bold text-default-900">{stats.totalUsers || '-'}</h3>
                                </div>
                            </CardBody>
                        </Card>

                    </div>
                )}
            </div>
        </MainLayout>
    );
}
