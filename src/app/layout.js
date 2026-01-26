import './globals.css';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/context/AuthContext';
import LayoutWrapper from '@/components/LayoutWrapper';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
    title: 'CentralMed',
    description: 'Sistema de Gestão Clínica',
};

export default function RootLayout({ children }) {
    return (
        <html lang="pt-BR">
            <body className={inter.className}>
                <AuthProvider>
                    <LayoutWrapper>
                        {children}
                    </LayoutWrapper>
                </AuthProvider>
            </body>
        </html>
    );
}