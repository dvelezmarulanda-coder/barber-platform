'use client'

import React, { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/lib/database.types'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import Link from 'next/link'

type AppointmentFull = Database['public']['Tables']['citas']['Row'] & {
    servicios: Database['public']['Tables']['servicios']['Row'] | null
    perfiles_barbero: Database['public']['Tables']['perfiles']['Row'] | null
}

export default function GuestAppointmentsPage() {
    const [phone, setPhone] = useState('')
    const [appointments, setAppointments] = useState<AppointmentFull[]>([])
    const [hasSearched, setHasSearched] = useState(false)
    const [loading, setLoading] = useState(false)
    const [cancelingId, setCancelingId] = useState<string | null>(null)

    const supabase = createClientComponentClient<Database>()

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!phone.trim()) return

        setLoading(true)
        setHasSearched(false)
        setAppointments([])

        try {
            // Normalizar telefono si es necesario, por ahora búsqueda exacta
            const { data, error } = await supabase
                .from('citas')
                .select(`
                    *,
                    servicios(*),
                    perfiles_barbero:perfiles!citas_barbero_id_fkey(*)
                `)
                .eq('cliente_telefono', phone.trim())
                .is('cliente_id', null) // Solo invitadso
                .in('estado', ['pendiente', 'confirmada']) // Solo activas
                .gte('fecha_hora', new Date().toISOString()) // Solo futuras
                .order('fecha_hora', { ascending: true })

            if (error) throw error

            setAppointments(data as any || [])
            setHasSearched(true)
        } catch (error: any) {
            alert('Error al buscar citas: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    const handleCancel = async (citaId: string) => {
        if (!confirm('¿Seguro que deseas cancelar esta cita? Esta acción no se puede deshacer.')) return

        setCancelingId(citaId)
        try {
            const { error } = await supabase
                .from('citas')
                .update({ estado: 'cancelada' })
                .eq('id', citaId)

            if (error) throw error

            alert('Cita cancelada correctamente')
            // Recargar la lista
            setAppointments(prev => prev.filter(a => a.id !== citaId))
        } catch (error: any) {
            alert('Error al cancelar: ' + error.message + '\n\nNOTA: Si eres invitado, asegúrate de que el administrador haya habilitado la política de cancelación para invitados en la base de datos.')
        } finally {
            setCancelingId(null)
        }
    }

    return (
        <main className="min-h-screen bg-[#F2F2F2] text-navy-900 font-outfit">
            {/* Header Simple */}
            <div className="bg-white px-6 py-4 shadow-sm mb-8">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 group">
                        <span className="bg-navy-900 text-white w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold">T</span>
                        <span className="font-bold tracking-tight text-xl text-navy-900">TRIM APP</span>
                    </Link>
                    <Link href="/book" className="text-sm font-bold text-navy-900 hover:text-navy-700">
                        Nueva Reserva
                    </Link>
                </div>
            </div>

            <div className="max-w-md mx-auto px-4">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-navy-900 mb-2">Mis Citas</h1>
                    <p className="text-zinc-500">Gestiona tus reservas sin necesitas de crear una cuenta.</p>
                </div>

                {/* Formulario de Búsqueda */}
                <div className="bg-white rounded-2xl p-6 shadow-xl border border-white/50 mb-8">
                    <form onSubmit={handleSearch} className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-navy-900 mb-2">Número de Celular</label>
                            <input
                                type="tel"
                                placeholder="Ej. 3001234567"
                                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-navy-900 outline-none focus:border-navy-900 focus:ring-1 focus:ring-navy-900 transition-all font-mono text-lg placeholder:text-zinc-300"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                required
                            />
                            <p className="text-xs text-zinc-400 mt-2">Ingresa el mismo número que usaste al reservar.</p>
                        </div>
                        <button
                            type="submit"
                            disabled={loading || !phone}
                            className="w-full bg-navy-900 text-white font-bold py-3.5 rounded-xl hover:bg-navy-800 transition-all shadow-lg hover:shadow-navy-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Buscando...' : 'Buscar mis Citas'}
                        </button>
                    </form>
                </div>

                {/* Resultados */}
                {hasSearched && appointments.length === 0 && (
                    <div className="text-center py-8 bg-zinc-100 rounded-2xl border border-zinc-200 border-dashed">
                        <p className="text-navy-900 font-medium">No encontramos citas futuras asociadas a este número.</p>
                        <p className="text-sm text-zinc-500 mt-1">Verifica que el número sea correcto.</p>
                    </div>
                )}

                <div className="space-y-4">
                    {appointments.map((apt) => (
                        <div key={apt.id} className="bg-white p-5 rounded-2xl shadow-sm border border-zinc-100 relative overflow-hidden group">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-lg text-navy-900">{apt.servicios?.nombre}</h3>
                                    <p className="text-zinc-500 text-sm">con {apt.perfiles_barbero?.nombre}</p>
                                </div>
                                <div className="text-right">
                                    <span className="block font-bold text-navy-900">
                                        {format(new Date(apt.fecha_hora), 'd MMM', { locale: es })}
                                    </span>
                                    <span className="text-sm text-zinc-500">
                                        {format(new Date(apt.fecha_hora), 'h:mm a')}
                                    </span>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-zinc-50">
                                <button
                                    onClick={() => handleCancel(apt.id)}
                                    disabled={cancelingId === apt.id}
                                    className="w-full py-2.5 rounded-xl text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                                >
                                    {cancelingId === apt.id ? 'Cancelando...' : 'Cancelar Cita'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    )
}
