import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/lib/database.types'
import { cn } from '@/lib/utils'

type Barber = Database['public']['Tables']['perfiles']['Row']

interface BarberSelectionProps {
    onSelect: (barber: Barber) => void
    selectedBarberId?: string
}

export default function BarberSelection({ onSelect, selectedBarberId }: BarberSelectionProps) {
    const [barbers, setBarbers] = useState<Barber[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClientComponentClient<Database>()

    useEffect(() => {
        const fetchBarbers = async () => {
            const { data, error } = await supabase
                .from('perfiles')
                .select('*')
                .eq('rol', 'barbero')

            if (data) setBarbers(data)
            setLoading(false)
        }

        fetchBarbers()
    }, [supabase])

    if (loading) return <div className="text-navy-900 text-center py-8">Cargando profesionales...</div>

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-bold text-navy-900 mb-4">Elige tu profesional</h3>

            {barbers.length === 0 ? (
                <div className="text-center p-8 bg-zinc-50 rounded-xl border border-zinc-100">
                    <p className="text-zinc-500">No hay barberos disponibles en este momento.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {/* Opción: Cualquier Profesional */}
                    <button
                        onClick={() => onSelect({ id: 'any', nombre: 'Cualquier Profesional', rol: 'barbero', email: '', telefono: null } as any)}
                        className={cn(
                            "p-6 rounded-2xl border transition-all duration-300 flex flex-col items-center gap-4 group",
                            selectedBarberId === 'any'
                                ? "border-navy-900 bg-navy-900 text-white shadow-lg scale-105"
                                : "border-zinc-200 bg-white text-navy-900 hover:border-navy-900/30 hover:shadow-md"
                        )}
                    >
                        <div className={cn(
                            "w-20 h-20 rounded-full flex items-center justify-center text-3xl transition-colors",
                            selectedBarberId === 'any'
                                ? "bg-white/20 text-white"
                                : "bg-zinc-100 text-navy-900 group-hover:bg-zinc-200"
                        )}>
                            💈
                        </div>
                        <div className="text-center">
                            <span className="font-bold block text-lg">Cualquiera</span>
                            <span className={cn(
                                "text-xs font-medium uppercase tracking-wider",
                                selectedBarberId === 'any' ? "text-white/70" : "text-zinc-500"
                            )}>
                                Máxima Disponibilidad
                            </span>
                        </div>
                    </button>

                    {barbers.map((barber) => (
                        <button
                            key={barber.id}
                            onClick={() => onSelect(barber)}
                            className={cn(
                                "p-6 rounded-2xl border transition-all duration-300 flex flex-col items-center gap-4 group",
                                selectedBarberId === barber.id
                                    ? "border-navy-900 bg-navy-900 text-white shadow-lg scale-105"
                                    : "border-zinc-200 bg-white text-navy-900 hover:border-navy-900/30 hover:shadow-md"
                            )}
                        >
                            <div className={cn(
                                "w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold uppercase transition-colors",
                                selectedBarberId === barber.id
                                    ? "bg-white/20 text-white"
                                    : "bg-zinc-100 text-navy-900 group-hover:bg-zinc-200"
                            )}>
                                {barber.nombre.substring(0, 2)}
                            </div>
                            <div className="text-center">
                                <span className="font-bold block text-lg">{barber.nombre}</span>
                                <span className={cn(
                                    "text-xs font-medium uppercase tracking-wider",
                                    selectedBarberId === barber.id ? "text-white/70" : "text-zinc-500"
                                )}>
                                    Barbero
                                </span>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
