'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter, useSearchParams } from 'next/navigation'
import { Database } from '@/lib/database.types'
import Link from 'next/link'
import AppointmentCard from '@/components/dashboard/AppointmentCard'
import { cn } from '@/lib/utils'

type AppointmentFull = any

export default function DashboardPage() {
    const [appointments, setAppointments] = useState<AppointmentFull[]>([])
    const [loading, setLoading] = useState(true)
    const [profile, setProfile] = useState<Database['public']['Tables']['perfiles']['Row'] | null>(null)
    const supabase = createClientComponentClient<Database>()
    const router = useRouter()
    const searchParams = useSearchParams()
    const isSuccess = searchParams.get('booking') === 'success'

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push('/login')
                return
            }

            try {
                const { data: profile } = await supabase
                    .from('perfiles')
                    .select('*')
                    .eq('id', user.id)
                    .single()

                setProfile(profile)

                if (profile) {
                    let query = supabase
                        .from('citas')
                        .select(`
                            *,
                            servicios(*),
                            perfiles_barbero:perfiles!citas_barbero_id_fkey(*),
                            perfiles_cliente:perfiles!citas_cliente_id_fkey(*)
                        `)
                        .order('fecha_hora', { ascending: true })

                    if (profile.rol === 'barbero') {
                        query = query.eq('barbero_id', user.id)
                    } else if (profile.rol === 'cliente') {
                        query = query.eq('cliente_id', user.id)
                    }
                    // Admin sees all appointments

                    const { data, error } = await query
                    if (data) setAppointments(data)
                    if (error) console.error('Error fetching appointments:', error)
                }
            } catch (error) {
                console.error('Error in checkUser:', error)
            } finally {
                setLoading(false)
            }
        }

        checkUser()
    }, [supabase, router])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/')
        router.refresh()
    }

    const handleMarkAsCompleted = async (citaId: string) => {
        if (!confirm('¿Marcar esta cita como completada?')) return

        const { error } = await supabase
            .from('citas')
            .update({ estado: 'completada' })
            .eq('id', citaId)

        if (error) {
            alert('Error al actualizar: ' + error.message)
        } else {
            alert('✅ Cita marcada como completada')
            router.refresh()
        }
    }

    const groupAppointmentsByDate = () => {
        const now = new Date()
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)
        const weekEnd = new Date(today)
        weekEnd.setDate(weekEnd.getDate() + 7)

        const groups = {
            today: [] as AppointmentFull[],
            tomorrow: [] as AppointmentFull[],
            thisWeek: [] as AppointmentFull[],
            later: [] as AppointmentFull[]
        }

        appointments.forEach(apt => {
            const aptDate = new Date(apt.fecha_hora)
            const aptDay = new Date(aptDate.getFullYear(), aptDate.getMonth(), aptDate.getDate())

            if (aptDay.getTime() === today.getTime()) {
                groups.today.push(apt)
            } else if (aptDay.getTime() === tomorrow.getTime()) {
                groups.tomorrow.push(apt)
            } else if (aptDay > tomorrow && aptDay < weekEnd) {
                groups.thisWeek.push(apt)
            } else if (aptDay >= weekEnd) {
                groups.later.push(apt)
            }
        })

        return groups
    }

    const grouped = groupAppointmentsByDate()

    if (loading) return <div className="min-h-screen bg-[#F2F2F2] flex items-center justify-center font-outfit text-navy-900">Cargando tu agenda...</div>

    const isAdmin = profile?.rol === 'admin'
    const isBarber = profile?.rol === 'barbero'

    return (
        <main className="min-h-screen bg-[#F2F2F2] text-navy-900 px-4 py-8 font-outfit">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header Container */}
                <div className="flex flex-col gap-4">
                    {/* Main Card */}
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-white p-8 rounded-[2rem] shadow-sm border border-white relative overflow-hidden">

                        {/* Logout Button (Absolute top-right for desktop, normal for mobile) */}
                        <button
                            onClick={handleLogout}
                            className="absolute top-6 right-6 text-zinc-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50"
                            title="Cerrar Sesión"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                            </svg>
                        </button>

                        <div className="text-center md:text-left pr-12">
                            <div className="flex items-center gap-3 justify-center md:justify-start mb-2">
                                <span className="bg-navy-900 text-white w-10 h-10 flex items-center justify-center rounded-full text-lg font-bold shadow-md">
                                    {profile?.nombre?.[0] || 'T'}
                                </span>
                                <h1 className="text-3xl font-bold text-navy-900 tracking-tight">
                                    Hola, {profile?.nombre?.split(' ')[0]}
                                </h1>
                            </div>
                            <p className="text-zinc-500 font-medium pl-14">
                                Bienvenido a tu panel de {profile?.rol === 'admin' ? 'Administrador' : profile?.rol === 'barbero' ? 'Barbero' : 'Cliente'}
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap justify-center gap-4 mt-2 md:mt-0">
                            <Link
                                href="/book"
                                className="bg-navy-900 text-white px-8 py-3.5 rounded-xl font-bold text-base transition-all duration-300 hover:bg-navy-800 hover:scale-105 shadow-lg flex items-center gap-2"
                            >
                                <span>+</span> Nueva Cita
                            </Link>

                            {isAdmin && (
                                <Link
                                    href="/admin/barbers"
                                    className="bg-white text-navy-900 border border-zinc-200 px-8 py-3.5 rounded-xl font-bold text-base transition-all duration-300 hover:bg-zinc-50 hover:scale-105 shadow-sm flex items-center gap-2"
                                >
                                    <span>🛠️</span> Panel Admin
                                </Link>
                            )}

                            {(isAdmin || isBarber) && (
                                <Link
                                    href="/admin/qr"
                                    className="bg-slate-100 text-slate-600 px-6 py-3.5 rounded-xl font-bold text-base transition-all duration-300 hover:bg-slate-200 flex items-center gap-2"
                                >
                                    <span>📱</span> QR
                                </Link>
                            )}

                            {/* New Settings Button (For everyone) */}
                            <Link
                                href="/settings"
                                className="bg-white text-zinc-600 border border-zinc-200 px-6 py-3.5 rounded-xl font-bold text-base transition-all duration-300 hover:bg-zinc-50 flex items-center gap-2"
                            >
                                <span>🔑</span> Clave
                            </Link>
                        </div>
                    </div>
                </div>



                {/* Success Message */}
                {isSuccess && (
                    <div className="bg-green-50 text-green-800 border border-green-200 rounded-2xl p-6 flex items-center gap-4 shadow-sm animate-in fade-in slide-in-from-top-4">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-2xl">🎉</div>
                        <div>
                            <p className="font-bold text-lg">¡Reserva confirmada con éxito!</p>
                            <p className="opacity-80">Te hemos enviado un correo con los detalles.</p>
                        </div>
                    </div>
                )}

                {/* Appointments by Date */}
                {appointments.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border border-white shadow-sm">
                        <div className="text-5xl mb-4">📅</div>
                        <h3 className="text-xl font-bold text-navy-900 mb-2">No tienes citas programadas</h3>
                        <p className="text-zinc-500 mb-6">¿Qué tal un corte fresco para esta semana?</p>
                        <Link href="/book" className="text-navy-900 font-bold underline underline-offset-4 hover:text-navy-700">
                            Agendar mi primera cita
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-10">
                        {/* Today */}
                        {grouped.today.length > 0 && (
                            <section>
                                <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-navy-900">
                                    <span className="bg-navy-50 text-navy-900 p-2 rounded-lg text-lg">📅</span>
                                    Hoy
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {grouped.today.map((apt) => (
                                        <AppointmentCard key={apt.id} appointment={apt} role={profile?.rol || 'cliente'} />
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Tomorrow */}
                        {grouped.tomorrow.length > 0 && (
                            <section>
                                <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-navy-900">
                                    <span className="bg-navy-50 text-navy-900 p-2 rounded-lg text-lg">🗓️</span>
                                    Mañana
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {grouped.tomorrow.map((apt) => (
                                        <AppointmentCard key={apt.id} appointment={apt} role={profile?.rol || 'cliente'} />
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* This Week */}
                        {grouped.thisWeek.length > 0 && (
                            <section>
                                <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-navy-900">
                                    <span className="bg-navy-50 text-navy-900 p-2 rounded-lg text-lg">📆</span>
                                    Esta Semana
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {grouped.thisWeek.map((apt) => (
                                        <AppointmentCard key={apt.id} appointment={apt} role={profile?.rol || 'cliente'} />
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Later */}
                        {grouped.later.length > 0 && (
                            <section>
                                <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-navy-900">
                                    <span className="bg-navy-50 text-navy-900 p-2 rounded-lg text-lg">📋</span>
                                    Próximamente
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {grouped.later.map((apt) => (
                                        <AppointmentCard key={apt.id} appointment={apt} role={profile?.rol || 'cliente'} />
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                )}
            </div>
        </main>
    )
}
