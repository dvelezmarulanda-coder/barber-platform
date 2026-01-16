'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/lib/database.types'
import Link from 'next/link'
import Logo from '@/components/Logo'

type Service = Database['public']['Tables']['servicios']['Row']

export default function ServicesPage() {
    const [services, setServices] = useState<Service[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClientComponentClient<Database>()

    useEffect(() => {
        const fetchServices = async () => {
            const { data, error } = await supabase
                .from('servicios')
                .select('*')
                .eq('activo', true)
                .order('precio', { ascending: true })

            if (data) setServices(data)
            if (error) console.error('Error cargando servicios:', error)
            setLoading(false)
        }

        fetchServices()
    }, [supabase])

    return (
        <main className="min-h-screen bg-black text-white">
            {/* Header */}
            <header className="border-b border-white/10 backdrop-blur-sm sticky top-0 z-50 bg-black/80">
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                    <Link href="/" className="hover:opacity-80 transition-opacity">
                        <Logo size="md" />
                    </Link>
                    <Link
                        href="/book"
                        className="px-6 py-2 bg-white text-black rounded-full hover:bg-gray-200 transition-all duration-300 font-semibold"
                    >
                        Agendar Cita
                    </Link>
                </div>
            </header>

            {/* Hero Section */}
            <section className="py-20 px-4 bg-gradient-to-b from-black via-zinc-900 to-black">
                <div className="max-w-6xl mx-auto text-center">
                    <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-amber-500 to-white">
                        Nuestros Servicios
                    </h1>
                    <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
                        Experimenta el arte del cuidado personal con nuestros servicios premium diseñados para el caballero moderno.
                    </p>
                </div>
            </section>

            {/* Services Grid */}
            <section className="py-16 px-4 bg-black">
                <div className="max-w-6xl mx-auto">
                    {loading ? (
                        <div className="text-center py-20">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
                            <p className="mt-4 text-zinc-400">Cargando servicios...</p>
                        </div>
                    ) : services.length === 0 ? (
                        <div className="text-center py-20">
                            <p className="text-xl text-zinc-400 mb-6">No hay servicios disponibles en este momento.</p>
                            <Link
                                href="/"
                                className="inline-block px-6 py-3 border border-white/30 rounded-full hover:bg-white/10 transition-all"
                            >
                                Volver al Inicio
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {services.map((service, index) => (
                                <div
                                    key={service.id}
                                    className="group relative p-8 border border-white/10 rounded-2xl bg-gradient-to-br from-zinc-900 to-black hover:border-amber-500/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(251,191,36,0.15)] hover:scale-105"
                                    style={{
                                        animationDelay: `${index * 100}ms`,
                                        animation: 'fadeInUp 0.6s ease-out forwards',
                                        opacity: 0
                                    }}
                                >
                                    {/* Service Number Badge */}
                                    <div className="absolute -top-3 -right-3 w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center font-bold text-black text-sm shadow-lg">
                                        {index + 1}
                                    </div>

                                    {/* Service Content */}
                                    <div className="space-y-4">
                                        <h3 className="text-2xl font-bold group-hover:text-amber-500 transition-colors">
                                            {service.nombre}
                                        </h3>

                                        <p className="text-zinc-400 text-sm leading-relaxed min-h-[60px]">
                                            {service.descripcion || 'Servicio profesional de alta calidad'}
                                        </p>

                                        {/* Duration */}
                                        <div className="flex items-center gap-2 text-sm text-zinc-500">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span>{service.duracion_minutos} minutos</span>
                                        </div>

                                        {/* Price */}
                                        <div className="pt-4 border-t border-white/10">
                                            <div className="flex items-baseline justify-between">
                                                <span className="text-3xl font-bold font-mono text-amber-500">
                                                    ${service.precio.toLocaleString('es-CO')}
                                                </span>
                                                <span className="text-xs text-zinc-500 uppercase tracking-wider">COP</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* CTA Section */}
                    {services.length > 0 && (
                        <div className="mt-16 text-center">
                            <Link
                                href="/book"
                                className="inline-block px-10 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-black text-lg font-bold rounded-full hover:from-amber-400 hover:to-amber-500 transition-all duration-300 shadow-[0_0_30px_rgba(251,191,36,0.3)] hover:shadow-[0_0_40px_rgba(251,191,36,0.5)] hover:scale-105"
                            >
                                Agendar Mi Cita Ahora
                            </Link>
                            <p className="mt-4 text-sm text-zinc-500">
                                Reserva en línea y confirma tu cita al instante
                            </p>
                        </div>
                    )}
                </div>
            </section>

            {/* Animation Keyframes */}
            <style jsx>{`
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </main>
    )
}
