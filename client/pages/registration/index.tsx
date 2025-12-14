import { useState } from 'react';
import { useRouter } from 'next/router';
import { observer } from 'mobx-react-lite';
import { Card, CardBody, CardHeader, Input, Button, Divider, Link } from '@nextui-org/react';
import toast from 'react-hot-toast';
import Auth from '../../src/store/AuthStore';

const RegistrationPage = observer(() => {
    const router = useRouter();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string }>({});

    // Redirect if already logged in
    if (Auth.isAuth && !Auth.isLoading) {
        router.push('/lk');
        return null;
    }

    const validate = () => {
        const newErrors: { name?: string; email?: string; password?: string } = {};

        if (!name.trim()) {
            newErrors.name = 'Имя обязательно';
        }

        if (!email.trim()) {
            newErrors.email = 'Email обязателен';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = 'Введите корректный email';
        }

        if (!password.trim()) {
            newErrors.password = 'Пароль обязателен';
        } else if (password.length < 6) {
            newErrors.password = 'Пароль должен быть не менее 6 символов';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        setIsLoading(true);

        try {
            await Auth.register({ name, email, password });
            toast.success('Регистрация успешна! Добро пожаловать!');
            router.push('/lk');
        } catch (error: any) {
            setPassword('');
            toast.error(
                error?.response?.data?.message || 'Ошибка регистрации',
                { duration: 5000 }
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
            {/* Background with blur effect - same as login */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-secondary/20 pointer-events-none" />
            <div className="absolute inset-0 backdrop-blur-3xl pointer-events-none" />

            {/* Decorative elements */}
            <div className="absolute top-20 left-20 w-72 h-72 bg-primary/30 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-20 right-20 w-96 h-96 bg-secondary/20 rounded-full blur-3xl pointer-events-none" />

            {/* Registration Card */}
            <Card className="w-full max-w-md mx-4 relative z-10 bg-content1/80 backdrop-blur-xl border border-divider">
                <CardHeader className="flex flex-col gap-1 pt-8 pb-0">
                    <div className="text-4xl mb-2">📝</div>
                    <h1 className="text-2xl font-bold">Регистрация</h1>
                    <p className="text-default-500 text-sm">Создайте новый аккаунт</p>
                </CardHeader>

                <Divider className="my-4" />

                <CardBody className="px-8 pb-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <Input
                            type="text"
                            label="Имя"
                            placeholder="Иван Иванов"
                            value={name}
                            onValueChange={setName}
                            isInvalid={!!errors.name}
                            errorMessage={errors.name}
                            variant="bordered"
                            size="lg"
                            classNames={{
                                inputWrapper: "bg-content2/50",
                            }}
                            startContent={
                                <svg className="w-5 h-5 text-default-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            }
                        />

                        <Input
                            type="email"
                            label="Email"
                            placeholder="user@hotel.com"
                            value={email}
                            onValueChange={setEmail}
                            isInvalid={!!errors.email}
                            errorMessage={errors.email}
                            variant="bordered"
                            size="lg"
                            classNames={{
                                inputWrapper: "bg-content2/50",
                            }}
                            startContent={
                                <svg className="w-5 h-5 text-default-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                </svg>
                            }
                        />

                        <Input
                            type="password"
                            label="Пароль"
                            placeholder="Придумайте пароль"
                            value={password}
                            onValueChange={setPassword}
                            isInvalid={!!errors.password}
                            errorMessage={errors.password}
                            variant="bordered"
                            size="lg"
                            classNames={{
                                inputWrapper: "bg-content2/50",
                            }}
                            startContent={
                                <svg className="w-5 h-5 text-default-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            }
                        />

                        <Button
                            type="submit"
                            color="primary"
                            size="lg"
                            fullWidth
                            isLoading={isLoading}
                            className="font-semibold"
                        >
                            {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-default-500">
                            Уже есть аккаунт?{' '}
                            <Link href="/login" size="sm" color="primary">
                                Войти
                            </Link>
                        </p>
                    </div>
                </CardBody>
            </Card>
        </div>
    );
});

export default RegistrationPage;
