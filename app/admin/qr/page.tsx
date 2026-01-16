'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { Database } from '@/lib/database.types'
import Link from 'next/link'

export default function QRCodePage() {
    const [loading, setLoading] = useState(true)
    const [profile, setProfile] = useState<Database['public']['Tables']['perfiles']['Row'] | null>(null)
    const supabase = createClientComponentClient<Database>()
    const router = useRouter()

    const bookingUrl = 'https://trim-app.vercel.app/book'
    // Using a more reliable QR API with smaller size
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&format=png&data=${encodeURIComponent(bookingUrl)}`

    useEffect(() => {
        const checkUser = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) {
                    router.push('/login')
                    return
                }

                const { data: profile } = await supabase
                    .from('perfiles')
                    .select('*')
                    .eq('id', user.id)
                    .single()

                setProfile(profile)

                if (profile && profile.rol !== 'admin' && profile.rol !== 'barbero') {
                    router.push('/dashboard')
                    return
                }
            } catch (error) {
                console.error('Error loading QR page:', error)
                router.push('/dashboard')
            } finally {
                setLoading(false)
            }
        }

        checkUser()
    }, [supabase, router])

    const handleDownload = () => {
        const link = document.createElement('a')
        link.href = qrCodeUrl
        link.download = 'barber-shop-qr-code.png'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    if (loading) return <div className="min-h-screen bg-black text-white p-8 text-center">Cargando...</div>

    return (
        <main className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black text-white px-4 py-8">
            <div className="max-w-2xl mx-auto space-y-8">
                {/* Header */}
                <div className="space-y-4">
                    <Link
                        href="/admin"
                        className="text-zinc-400 hover:text-white transition-colors inline-flex items-center gap-2 group"
                    >
                        <span className="group-hover:-translate-x-1 transition-transform">←</span>
                        Volver al Panel de Administración
                    </Link>
                    <div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
                            Código QR para Reservas
                        </h1>
                        <p className="text-zinc-400 mt-2">
                            Comparte este código QR para que tus clientes puedan agendar citas fácilmente
                        </p>
                    </div>
                </div>

                {/* QR Code Display */}
                <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-3xl border border-zinc-700/50 p-6 sm:p-10 shadow-2xl">
                    <div className="flex flex-col items-center space-y-8">
                        {/* QR Code */}
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur-xl opacity-20"></div>
                            <div className="relative bg-white p-6 rounded-2xl shadow-xl">
                                <img
                                    src={qrCodeUrl}
                                    alt="QR Code para reservas"
                                    className="w-full max-w-[250px] sm:max-w-[300px] h-auto"
                                    loading="lazy"
                                    onError={(e) => {
                                        console.error('Error loading QR code')
                                        e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="300"%3E%3Crect fill="%23ddd" width="300" height="300"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EError cargando QR%3C/text%3E%3C/svg%3E'
                                    }}
                                />
                            </div>
                        </div>

                        {/* URL */}
                        <div className="text-center space-y-3 w-full px-2">
                            <p className="text-sm text-zinc-400 font-medium">Este QR redirige a:</p>
                            <div className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-700 px-4 py-3 rounded-xl">
                                <code className="text-xs text-zinc-300 break-all">
                                    {bookingUrl}
                                </code>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-4 w-full pt-4">
                            <button
                                onClick={handleDownload}
                                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white px-6 py-4 rounded-xl font-bold text-sm sm:text-base transition-all duration-300 shadow-lg hover:shadow-blue-500/50 hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                            >
                                <span className="text-xl">📥</span>
                                Descargar QR
                            </button>
                            <button
                                onClick={() => window.print()}
                                className="flex-1 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white px-6 py-4 rounded-xl font-bold text-sm sm:text-base transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                            >
                                <span className="text-xl">🖨️</span>
                                Imprimir
                            </button>
                        </div>
                    </div>
                </div>

                {/* Instructions */}
                <div className="bg-zinc-900/50 backdrop-blur-sm rounded-2xl border border-zinc-800 p-6 sm:p-8 space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                            <span className="text-xl">💡</span>
                        </div>
                        <h2 className="text-xl font-bold">Cómo usar el QR</h2>
                    </div>
                    <ul className="space-y-4 text-zinc-300">
                        <li className="flex items-start gap-4 group">
                            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center font-bold text-sm group-hover:bg-blue-600 transition-colors">
                                1
                            </div>
                            <span className="pt-1">Descarga o imprime el código QR</span>
                        </li>
                        <li className="flex items-start gap-4 group">
                            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center font-bold text-sm group-hover:bg-blue-600 transition-colors">
                                2
                            </div>
                            <span className="pt-1">Colócalo en un lugar visible de tu barbería (entrada, espejo, mostrador)</span>
                        </li>
                        <li className="flex items-start gap-4 group">
                            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center font-bold text-sm group-hover:bg-blue-600 transition-colors">
                                3
                            </div>
                            <span className="pt-1">Los clientes pueden escanearlo con su celular para agendar directamente</span>
                        </li>
                        <li className="flex items-start gap-4 group">
                            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center font-bold text-sm group-hover:bg-blue-600 transition-colors">
                                4
                            </div>
                            <span className="pt-1">También puedes compartirlo en redes sociales o WhatsApp</span>
                        </li>
                    </ul>
                </div>
            </div>
        </main>
    )
}
