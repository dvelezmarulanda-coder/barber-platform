import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/lib/database.types'
import { cn } from '@/lib/utils'

type Service = Database['public']['Tables']['servicios']['Row']

interface ServiceSelectionProps {
    onSelect: (service: Service) => void
    selectedServiceId?: string
}

export default function ServiceSelection({ onSelect, selectedServiceId }: ServiceSelectionProps) {
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
            setLoading(false)
        }

        fetchServices()
    }, [supabase])

    if (loading) return <div className="text-navy-900 text-center py-8">Cargando servicios disponibles...</div>

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-bold text-navy-900 mb-4">Selecciona tu servicio</h3>

            {services.length === 0 ? (
                <div className="text-center p-8 bg-zinc-50 rounded-xl border border-zinc-100">
                    <p className="text-zinc-500">No hay servicios disponibles.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {services.map((service) => (
                        <button
                            key={service.id}
                            onClick={() => onSelect(service)}
                            className={cn(
                                "p-6 rounded-2xl border text-left transition-all duration-300 group hover:shadow-md",
                                selectedServiceId === service.id
                                    ? "border-navy-900 bg-navy-900 text-white shadow-lg transform scale-[1.02]"
                                    : "border-zinc-200 bg-white text-navy-900 hover:border-navy-900/30"
                            )}
                        >
                            <div className="flex justify-between items-start mb-3">
                                <span className="font-bold text-lg">{service.nombre}</span>
                                <span className={cn(
                                    "font-mono text-lg font-bold px-3 py-1 rounded-lg",
                                    selectedServiceId === service.id
                                        ? "bg-white/20 text-white"
                                        : "bg-zinc-100 text-navy-900"
                                )}>
                                    ${service.precio.toLocaleString('es-CO')}
                                </span>
                            </div>
                            <p className={cn(
                                "text-sm mb-4 leading-relaxed",
                                selectedServiceId === service.id ? "text-zinc-300" : "text-zinc-500"
                            )}>
                                {service.descripcion || 'Servicio de corte profesional.'}
                            </p>
                            <div className={cn(
                                "text-xs font-bold uppercase tracking-wider flex items-center gap-2",
                                selectedServiceId === service.id ? "text-white/80" : "text-navy-900/60"
                            )}>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                {service.duracion_minutos} min de duración
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
