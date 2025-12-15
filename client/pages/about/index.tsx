import React from 'react';
import MainLayout from "../../src/components/layout/MainLayout";
import { Card, CardBody, CardHeader, Divider } from "@nextui-org/react";

const AboutPage = () => {
    return (
        <MainLayout>
            <div className="container mx-auto p-10 flex justify-center">
                <Card className="max-w-[600px] w-full">
                    <CardHeader className="flex gap-3">
                        <div className="flex flex-col">
                            <p className="text-md font-bold">Коренков Даниил Евгеньевич</p>
                            <p className="text-small text-default-500">Студент группы ДПИ23-1</p>
                        </div>
                    </CardHeader>
                    <Divider />
                    <CardBody>
                        <p className="mb-4">
                            <strong>Тема курсовой:</strong> Информационно-справочная система гостиницы.
                        </p>
                        <div className="mb-4">
                            <strong>Стек технологий:</strong>
                            <ul className="list-disc list-inside ml-4">
                                <li>Frontend: Next.js, NextUI, Tailwind CSS</li>
                                <li>Backend: Node.js, Express, Sequelize</li>
                                <li>Database: MySQL</li>
                            </ul>
                        </div>
                        <p>
                            <strong>Описание:</strong> Система предназначена для автоматизации процессов бронирования и управления номерным фондом.
                        </p>
                    </CardBody>
                </Card>
            </div>
        </MainLayout>
    );
};

export default AboutPage;
