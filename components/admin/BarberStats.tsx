'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/lib/database.types'

interface BarberStatsProps {
    barberId: string
}

type ServiceCount = {
    servicio_nombre: string
    count: number
}

export default function BarberStats({ barberId }: BarberStatsProps) {
    const [stats, setStats] = useState<ServiceCount[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClientComponentClient<Database>()

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true)

            // Get current month start and end
            const now = new Date()
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

            // Fetch completed appointments for this barber this month
            const { data, error } = await supabase
                .from('citas')
                .select(`
                    servicio_id,
                    servicios(nombre)
                `)
                .eq('barbero_id', barberId)
                .eq('estado', 'completada')
                .gte('fecha_hora', startOfMonth.toISOString())
                .lte('fecha_hora', endOfMonth.toISOString())

            if (error) {
                console.error('Error fetching stats:', error)
                setLoading(false)
                return
            }

            // Count services
            const serviceCounts: { [key: string]: number } = {}

            data?.forEach((cita: any) => {
                const serviceName = cita.servicios?.nombre || 'Sin servicio'
                serviceCounts[serviceName] = (serviceCounts[serviceName] || 0) + 1
            })

            // Convert to array
            const statsArray = Object.entries(serviceCounts).map(([servicio_nombre, count]) => ({
                servicio_nombre,
                count
            }))

            // Sort by count descending
            statsArray.sort((a, b) => b.count - a.count)

            setStats(statsArray)
            setLoading(false)
        }

        fetchStats()
    }, [barberId, supabase])

    if (loading) {
        return (
            <div className="p-6 border-b border-zinc-100">
                <p className="text-sm text-zinc-400">Cargando estadísticas...</p>
            </div>
        )
    }

    if (stats.length === 0) {
        return (
            <div className="p-6 border-b border-zinc-100">
                <h3 className="font-bold text-navy-900 mb-2">📊 Servicios Realizados (Este Mes)</h3>
                <p className="text-sm text-zinc-400">No hay servicios completados este mes.</p>
            </div>
        )
    }

    return (
        <div className="p-6 border-b border-zinc-100 bg-gradient-to-br from-zinc-50 to-white">
            <h3 className="font-bold text-navy-900 mb-4">📊 Servicios Realizados (Este Mes)</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {stats.map((stat, index) => (
                    <div
                        key={index}
                        className="bg-white border border-zinc-200 rounded-xl p-4 hover:shadow-md transition-shadow"
                    >
                        <div className="text-2xl font-bold text-navy-900">{stat.count}</div>
                        <div className="text-xs text-zinc-500 mt-1">{stat.servicio_nombre}</div>
                    </div>
                ))}
            </div>
        </div>
    )
}
