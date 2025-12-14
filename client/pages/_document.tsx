import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
    return (
        <Html lang="ru" className="dark">
            <Head>
                <meta name="color-scheme" content="dark" />
            </Head>
            <body className="dark bg-background text-foreground">
                <Main />
                <NextScript />
            </body>
        </Html>
    );
}

