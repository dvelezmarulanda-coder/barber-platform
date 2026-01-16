import { Database } from '@/lib/database.types'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

type Service = Database['public']['Tables']['servicios']['Row']
type Barber = Database['public']['Tables']['perfiles']['Row']

interface BookingSummaryProps {
    service: Service
    barber: Barber
    date: Date
    onConfirm: () => void
    loading: boolean
}

export default function BookingSummary({ service, barber, date, onConfirm, loading }: BookingSummaryProps) {
    return (
        <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white mb-4">Resumen de tu Reserva</h3>

            <div className="bg-zinc-900 rounded-2xl p-6 space-y-4 border border-zinc-800">
                <div className="flex justify-between items-center pb-4 border-b border-zinc-800">
                    <span className="text-zinc-400">Servicio</span>
                    <span className="font-bold text-white text-right">{service.nombre}<br />
                        <span className="text-sm font-normal text-zinc-500">${service.precio} • {service.duracion_minutos} min</span>
                    </span>
                </div>

                <div className="flex justify-between items-center pb-4 border-b border-zinc-800">
                    <span className="text-zinc-400">Barbero</span>
                    <span className="font-bold text-white">{barber.nombre}</span>
                </div>

                <div className="flex justify-between items-center">
                    <span className="text-zinc-400">Fecha y Hora</span>
                    <span className="font-bold text-white text-right capitalize">
                        {format(date, "EEEE d 'de' MMMM", { locale: es })}<br />
                        {format(date, "HH:mm")}
                    </span>
                </div>
            </div>

            <button
                onClick={onConfirm}
                disabled={loading}
                className="w-full py-4 rounded-full bg-navy-900 text-white font-bold text-lg hover:bg-navy-800 transition-all duration-300 hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? 'Confirmando...' : 'Confirmar Reserva'}
            </button>
        </div>
    )
}
