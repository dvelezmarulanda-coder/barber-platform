'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { format, parseISO, isSameDay } from 'date-fns'
import { es } from 'date-fns/locale'
import { Database } from '@/lib/database.types'

type Cita = Database['public']['Tables']['citas']['Row'] & {
    barbero: { nombre: string } | null
    servicio: { nombre: string, precio: number, duracion_minutos: number } | null
}

export default function AdminAppointmentsPage() {
    const [citas, setCitas] = useState<Cita[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedDate, setSelectedDate] = useState(new Date())
    const supabase = createClientComponentClient<Database>()

    useEffect(() => {
        const fetchCitas = async () => {
            setLoading(true)

            // Fetch appointments with relations
            // Ideally we filter by date range, but for now specific date matching in JS
            // Supabase filter for date would be better for performance

            const startOfDay = new Date(selectedDate)
            startOfDay.setHours(0, 0, 0, 0)
            const endOfDay = new Date(selectedDate)
            endOfDay.setHours(23, 59, 59, 999)

            const { data, error } = await supabase
                .from('citas')
                .select(`
                    *,
                    barbero:barbero_id(nombre),
                    servicio:servicio_id(nombre, precio, duracion_minutos)
                `)
                .gte('fecha_hora', startOfDay.toISOString())
                .lte('fecha_hora', endOfDay.toISOString())
                .order('fecha_hora', { ascending: true })

            if (data) {
                // Type assertion because Supabase types with joins are tricky
                setCitas(data as any)
            }

            setLoading(false)
        }

        fetchCitas()
    }, [supabase, selectedDate])

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(amount)
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmada': return 'bg-green-100 text-green-700 border-green-200'
            case 'pendiente': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
            case 'cancelada': return 'bg-red-100 text-red-700 border-red-200'
            case 'completada': return 'bg-blue-100 text-blue-700 border-blue-200'
            default: return 'bg-zinc-100 text-zinc-700 border-zinc-200'
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-navy-900 tracking-tight">Citas Programadas</h1>
                    <p className="text-zinc-500 text-sm mt-1">Gestiona las reservas de tu negocio</p>
                </div>

                {/* Date Picker Simple */}
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-zinc-200 shadow-sm">
                    <span className="text-xl">📅</span>
                    <input
                        type="date"
                        value={format(selectedDate, 'yyyy-MM-dd')}
                        onChange={(e) => setSelectedDate(new Date(e.target.value))}
                        className="bg-transparent border-none focus:ring-0 text-navy-900 font-medium outline-none"
                    />
                </div>
            </div>

            {loading ? (
                <div className="text-center py-12 text-zinc-400">Cargando citas...</div>
            ) : citas.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-zinc-300 p-12 text-center">
                    <span className="text-4xl mb-4 block">📭</span>
                    <h3 className="text-xl font-bold text-navy-900 mb-2">No hay citas para este día</h3>
                    <p className="text-zinc-500">Selecciona otra fecha o espera nuevas reservas.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {citas.map((cita) => (
                        <div key={cita.id} className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row gap-6 items-start md:items-center">

                            {/* Time Box */}
                            <div className="flex-shrink-0 bg-navy-50 rounded-xl p-4 text-center min-w-[100px]">
                                <span className="block text-2xl font-bold text-navy-900">
                                    {format(parseISO(cita.fecha_hora), 'HH:mm')}
                                </span>
                                <span className="text-xs font-bold uppercase text-navy-900/50 mt-1">
                                    {format(parseISO(cita.fecha_hora), 'a')}
                                </span>
                            </div>

                            {/* Info */}
                            <div className="flex-1 space-y-3">
                                <div className="flex flex-wrap items-center gap-3">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${getStatusColor(cita.estado)}`}>
                                        {cita.estado}
                                    </span>
                                    <h3 className="text-lg font-bold text-navy-900">
                                        {cita.cliente_nombre || 'Cliente sin nombre'}
                                    </h3>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm text-zinc-600">
                                    <div className="flex items-center gap-2">
                                        <span>✂️</span>
                                        <span className="font-medium text-navy-900">{cita.servicio?.nombre}</span>
                                        <span className="text-zinc-400">({cita.servicio?.duracion_minutos} min)</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span>💈</span>
                                        <span>Barbero: <span className="font-medium text-navy-900">{cita.barbero?.nombre}</span></span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span>📞</span>
                                        <span>{cita.cliente_telefono || 'Sin teléfono'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span>💰</span>
                                        <span className="font-medium text-green-600">{formatCurrency(cita.servicio?.precio || 0)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
