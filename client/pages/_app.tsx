import type { AppProps } from 'next/app';
import { useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { NextUIProvider } from '@nextui-org/react';
import { Toaster } from 'react-hot-toast';
import Auth from '../src/store/AuthStore';
import '../src/styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
    const router = useRouter();

    useEffect(() => {
        Auth.checkAuth();
        // Force dark theme
        document.documentElement.classList.remove('light');
        document.documentElement.classList.add('dark');
    }, []);

    return (
        <>
            <NextUIProvider navigate={router.push}>
                <main className="dark text-foreground bg-background min-h-screen">
                    <Component {...pageProps} />
                </main>
            </NextUIProvider>
            <Toaster
                position="bottom-center"
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: '#18181b',
                        color: '#fff',
                        border: '1px solid #27272a',
                    },
                    success: {
                        iconTheme: {
                            primary: '#22c55e',
                            secondary: '#fff',
                        },
                        style: {
                            background: '#18181b',
                            color: '#22c55e',
                            border: '1px solid #22c55e',
                        },
                    },
                    error: {
                        iconTheme: {
                            primary: '#ef4444',
                            secondary: '#fff',
                        },
                        style: {
                            background: '#18181b',
                            color: '#ef4444',
                            border: '1px solid #ef4444',
                        },
                    },
                }}
            />
        </>
    );
}

