'use client'

import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

function AuthRedirector() {
    const router = useRouter()
    const searchParams = useSearchParams()

    useEffect(() => {
        const code = searchParams.get('code')
        const error = searchParams.get('error')

        if (code) {
            router.push(`/auth/callback?code=${code}`)
        } else if (error) {
            const params = new URLSearchParams(searchParams as any)
            router.push(`/login?${params.toString()}`)
        }
    }, [searchParams, router])

    return null
}

export default function Home() {
    return (
        <main className="min-h-screen bg-[#F2F2F2] text-navy-900 font-outfit relative overflow-hidden">
            <Suspense fallback={null}>
                <AuthRedirector />
            </Suspense>

            {/* Header Flotante Distribuido */}
            <header className="fixed top-0 left-0 right-0 z-50 px-6 py-6 flex justify-between items-center max-w-7xl mx-auto pointer-events-none">

                {/* Logo Branding */}
                <div className="pointer-events-auto flex items-center gap-2 bg-white/90 backdrop-blur-md px-6 py-3 rounded-full shadow-xl border border-white/50 animate-in fade-in slide-in-from-top-4 duration-1000">
                    <span className="bg-navy-900 text-white w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold">T</span>
                    <span className="font-bold tracking-tight text-xl text-navy-900">TRIM APP</span>
                </div>

                {/* Botón de Acceso Rápido */}
                <Link
                    href="/login"
                    className="pointer-events-auto flex items-center gap-2 bg-white/90 backdrop-blur-md px-6 py-3 rounded-full shadow-xl border border-white/50 text-navy-900 font-bold text-sm hover:bg-navy-900 hover:text-white transition-all hover:scale-105 animate-in fade-in slide-in-from-top-4 duration-1000 delay-100"
                >
                    <span>🔐</span>
                    <span>Ingresar</span>
                </Link>

            </header>

            {/* Hero Section */}
            <section className="relative h-screen w-full flex flex-col items-center justify-center text-center px-4">

                {/* FONDO REAL CON AJUSTE "MUY CLARO" OPTIMIZADO */}
                <div className="absolute inset-0 z-0">
                    <Image
                        src="https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=2074&auto=format&fit=crop"
                        alt="Barbershop Background"
                        fill
                        priority
                        className="object-cover object-center grayscale"
                        quality={85}
                    />
                    {/* Overlay blanco muy fuerte (85%) para efecto "muy claro" */}
                    <div className="absolute inset-0 bg-white/85 backdrop-blur-[1px]" />
                </div>

                {/* Contenido Visual */}
                <div className="relative z-10 space-y-8 max-w-4xl mx-auto animate-in fade-in zoom-in duration-1000 delay-150">

                    <span className="inline-block px-6 py-2 rounded-full bg-zinc-400 text-white text-xs md:text-sm font-bold tracking-widest uppercase shadow-xl">
                        Estilo que se reserva, elegancia que se nota.
                    </span>

                    <h1 className="text-6xl md:text-9xl font-bold tracking-tighter text-navy-900 drop-shadow-sm">
                        EL CORTE <br />
                        PERFECTO.
                    </h1>

                    <p className="text-xl md:text-2xl text-navy-900 font-medium max-w-2xl mx-auto leading-relaxed opacity-90">
                        Reserva tu experiencia en segundos.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
                        <Link
                            href="/book"
                            className="px-12 py-5 bg-navy-900 text-white text-xl font-bold rounded-full hover:bg-navy-800 transition-all duration-300 shadow-2xl hover:scale-105 hover:shadow-navy-900/30"
                        >
                            Reservar Cita
                        </Link>
                        <Link
                            href="/login"
                            className="px-12 py-5 bg-white text-navy-900 border border-zinc-200 text-xl font-bold rounded-full hover:bg-zinc-50 transition-all duration-300 shadow-xl hover:scale-105"
                        >
                            Soy Barbero
                        </Link>
                    </div>
                </div>

                {/* Footer simple integrado */}
                <div className="absolute bottom-8 text-navy-900/40 text-sm font-medium z-10">
                    TRIM APP © 2026
                </div>
            </section>
        </main>
    )
}
