import { useState } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Database } from '@/lib/database.types'
import { cn } from '@/lib/utils'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'

type AppointmentFull = Database['public']['Tables']['citas']['Row'] & {
    servicios: Database['public']['Tables']['servicios']['Row'] | null
    perfiles_barbero: Database['public']['Tables']['perfiles']['Row'] | null
    perfiles_cliente: Database['public']['Tables']['perfiles']['Row'] | null
}

interface AppointmentCardProps {
    appointment: AppointmentFull
    role: 'cliente' | 'barbero' | 'admin' | string
}

export default function AppointmentCard({ appointment, role }: AppointmentCardProps) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createClientComponentClient<Database>()

    const handleCancel = async () => {
        if (!confirm('¿Estás seguro de que quieres cancelar esta cita?')) return

        setLoading(true)
        const { error } = await supabase
            .from('citas')
            .update({ estado: 'cancelada' })
            .eq('id', appointment.id)

        if (error) {
            alert('Error al cancelar: ' + error.message)
            setLoading(false)
        } else {
            router.refresh()
        }
    }
    const statusColors = {
        pendiente: 'bg-amber-100 text-amber-700 border-amber-200',
        confirmada: 'bg-green-100 text-green-700 border-green-200',
        cancelada: 'bg-red-50 text-red-600 border-red-100',
        completada: 'bg-zinc-100 text-zinc-500 border-zinc-200',
    }

    const otherPerson = role === 'cliente'
        ? appointment.perfiles_barbero
        : appointment.perfiles_cliente

    // If admin, show both names or client name
    const displayPerson = role === 'admin'
        ? `${appointment.perfiles_cliente?.nombre || 'Cliente'} con ${appointment.perfiles_barbero?.nombre || 'Barbero'}`
        : otherPerson?.nombre || 'Desconocido'

    return (
        <div className="bg-white border border-zinc-100 rounded-[1.5rem] p-6 shadow-sm hover:shadow-lg hover:border-navy-900/10 transition-all duration-300 group">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <span className={cn(
                        "text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-widest",
                        statusColors[appointment.estado]
                    )}>
                        {appointment.estado}
                    </span>
                    <h3 className="text-navy-900 font-bold text-lg mt-3 group-hover:text-blue-600 transition-colors">
                        {appointment.servicios?.nombre || 'Servicio General'}
                    </h3>
                </div>
                <div className="text-right bg-zinc-50 rounded-xl px-3 py-2 border border-zinc-100">
                    <p className="text-xl font-bold text-navy-900 leading-none">
                        {format(new Date(appointment.fecha_hora), 'd', { locale: es })}
                    </p>
                    <p className="text-zinc-400 uppercase text-[10px] font-bold tracking-wider leading-none mt-1">
                        {format(new Date(appointment.fecha_hora), 'MMM', { locale: es })}
                    </p>
                </div>
            </div>

            <div className="space-y-3 text-sm text-zinc-500">
                <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-400">🕒</span>
                    <span className="font-medium">{format(new Date(appointment.fecha_hora), 'h:mm a')} • {appointment.servicios?.duracion_minutos} min</span>
                </div>

                <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-400">👤</span>
                    <span>
                        <span className="text-xs uppercase font-bold text-zinc-400 block mb-0.5">
                            {role === 'cliente' ? 'Barbero' : 'Cliente'}
                        </span>
                        <span className="text-navy-900 font-bold text-base">{displayPerson}</span>
                    </span>
                </div>

                <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-400">💰</span>
                    <span className="font-mono font-bold text-navy-900">${appointment.servicios?.precio.toLocaleString('es-CO')}</span>
                </div>
            </div>

            {/* Cancel Button */}
            {(appointment.estado === 'pendiente' || appointment.estado === 'confirmada') && (
                <div className="mt-6 pt-4 border-t border-zinc-50">
                    <button
                        onClick={handleCancel}
                        disabled={loading}
                        className="w-full text-center text-sm text-red-500 hover:text-red-600 font-bold transition-colors hover:bg-red-50 py-3 rounded-xl"
                    >
                        {loading ? 'Cancelando...' : 'Cancelar Cita'}
                    </button>
                </div>
            )}
        </div>
    )
}
