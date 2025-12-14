import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Card,
    CardBody,
    Chip,
    Link
} from '@nextui-org/react';

interface AboutAuthorModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const techStack = [
    { name: 'Node.js', color: 'success' as const },
    { name: 'Next.js', color: 'default' as const },
    { name: 'MySQL', color: 'warning' as const },
    { name: 'MobX', color: 'secondary' as const },
    { name: 'NextUI', color: 'primary' as const },
    { name: 'Tailwind CSS', color: 'primary' as const },
    { name: 'Sequelize', color: 'success' as const },
];

const AboutAuthorModal = ({ isOpen, onClose }: AboutAuthorModalProps) => {
    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            size="2xl"
            backdrop="opaque"
            placement="center"
            scrollBehavior="inside"
            classNames={{
                backdrop: "bg-black/80",
                base: "bg-content1 border border-divider shadow-xl",
                header: "border-b border-divider py-4",
                body: "py-6",
                footer: "border-t border-divider py-4",
            }}
        >
            <ModalContent>
                {(onModalClose) => (
                <>
                <ModalHeader className="text-lg font-semibold">
                    <div className="flex items-center gap-2">
                        <span>👨‍💻</span>
                        <span>Об авторе</span>
                    </div>
                </ModalHeader>

                <ModalBody className="py-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Author Info */}
                        <Card className="bg-content2">
                            <CardBody className="gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-2xl font-bold text-primary-foreground">
                                        К
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold">Коренков Д. Е.</h3>
                                        <p className="text-default-500">Разработчик</p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <svg className="w-5 h-5 text-default-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                        <span className="text-default-600">Группа: <strong>ДПИ23-1</strong></span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <svg className="w-5 h-5 text-default-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                        </svg>
                                        <span className="text-default-600">Курсовая работа</span>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>

                        {/* Project Info */}
                        <Card className="bg-content2">
                            <CardBody className="gap-4">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    <span>🏨</span>
                                    Hotel Management System
                                </h3>
                                <p className="text-default-500 text-sm">
                                    Система управления отелем с функциями бронирования номеров, 
                                    управления гостями и аналитики.
                                </p>
                                
                                <div>
                                    <p className="text-sm text-default-500 mb-2">Стек технологий:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {techStack.map((tech) => (
                                            <Chip 
                                                key={tech.name} 
                                                color={tech.color} 
                                                variant="flat" 
                                                size="sm"
                                            >
                                                {tech.name}
                                            </Chip>
                                        ))}
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    </div>

                    {/* Links */}
                    <Card className="bg-content2 mt-4">
                        <CardBody>
                            <h3 className="text-sm font-semibold mb-3 text-default-500">Контакты</h3>
                            <div className="flex flex-wrap gap-3">
                                <Link 
                                    href="https://github.com" 
                                    isExternal 
                                    showAnchorIcon
                                    className="text-sm"
                                >
                                    GitHub
                                </Link>
                                <Link 
                                    href="https://t.me/" 
                                    isExternal 
                                    showAnchorIcon
                                    className="text-sm"
                                >
                                    Telegram
                                </Link>
                            </div>
                        </CardBody>
                    </Card>
                </ModalBody>

                <ModalFooter>
                    <Button color="primary" onPress={onModalClose}>
                        Закрыть
                    </Button>
                </ModalFooter>
                </>
                )}
            </ModalContent>
        </Modal>
    );
};

export default AboutAuthorModal;

