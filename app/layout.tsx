import type { Metadata } from 'next'
import { Outfit } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/components/providers/AuthProvider'

const outfit = Outfit({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-outfit'
})

export const metadata: Metadata = {
    title: 'TRIM APP - Reserva tu Corte',
    description: 'Agenda tu cita de barbería en segundos. La forma más fácil de reservar tu corte.',
}

export const dynamic = 'force-dynamic'

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="es" className={outfit.variable}>
            <body className="font-outfit antialiased text-white bg-black">
                <AuthProvider>
                    {children}
                </AuthProvider>
            </body>
        </html>
    )
}
