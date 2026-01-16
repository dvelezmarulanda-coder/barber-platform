'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/lib/database.types'
import { cn } from '@/lib/utils'

type Profile = Database['public']['Tables']['perfiles']['Row']
type Schedule = {
    id?: string;
    dia_semana: number;
    hora_inicio: string;
    hora_fin: string;
    activo: boolean
}

const DAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

export default function AdminBarbersPage() {
    // Estados principales
    const [barbers, setBarbers] = useState<Profile[]>([])
    const [loading, setLoading] = useState(true)

    // Estados para promover usuario
    const [emailToPromote, setEmailToPromote] = useState('')
    const [promoting, setPromoting] = useState(false)
    const [message, setMessage] = useState('')

    // Estados para gestión de horarios
    const [selectedBarber, setSelectedBarber] = useState<Profile | null>(null)
    const [schedules, setSchedules] = useState<Schedule[]>([])
    const [savingSchedule, setSavingSchedule] = useState(false)

    const supabase = createClientComponentClient<Database>()

    // Cargar barberos
    const fetchBarbers = async () => {
        setLoading(true)
        const { data } = await supabase
            .from('perfiles')
            .select('*')
            .eq('rol', 'barbero')
            .order('nombre')
        if (data) setBarbers(data)
        setLoading(false)
    }

    // Cargar horarios de un barbero específico
    const fetchSchedules = async (barberId: string) => {
        const { data } = await supabase
            .from('horarios_disponibilidad')
            .select('*')
            .eq('barbero_id', barberId)

        // Supabase types workaround
        const safeData = data as any[] | null

        // Inicializar estructura básica si no existe
        const fullWeek: Schedule[] = Array.from({ length: 7 }).map((_, i) => {
            const existing = safeData?.find((d: any) => d.dia_semana === i)
            return existing ? {
                id: existing.id,
                dia_semana: existing.dia_semana,
                hora_inicio: existing.hora_inicio,
                hora_fin: existing.hora_fin,
                activo: existing.activo
            } : {
                dia_semana: i,
                hora_inicio: '09:00',
                hora_fin: '18:00',
                activo: false
            }
        })
        setSchedules(fullWeek)
    }

    useEffect(() => {
        fetchBarbers()
    }, [])

    // Manejar selección de barbero para editar horario
    const handleEditSchedule = (barber: Profile) => {
        setSelectedBarber(barber)
        fetchSchedules(barber.id)
    }

    // Guardar cambios de horario
    const handleSaveSchedule = async () => {
        if (!selectedBarber) return
        setSavingSchedule(true)

        // Upsert de horarios
        const updates = schedules.map(s => ({
            barbero_id: selectedBarber.id,
            dia_semana: s.dia_semana,
            hora_inicio: s.hora_inicio,
            hora_fin: s.hora_fin,
            activo: s.activo
        }))

        // Borrar anteriores (estrategia segura)
        const { error: deleteError } = await supabase
            .from('horarios_disponibilidad')
            .delete()
            .eq('barbero_id', selectedBarber.id)

        if (!deleteError) {
            const { error: insertError } = await supabase
                .from('horarios_disponibilidad')
                .insert(updates as any)

            if (insertError) alert('Error guardando: ' + insertError.message)
            else alert('¡Horarios actualizados exitosamente!')
        } else {
            alert('Error preparando actualización: ' + deleteError.message)
        }

        setSavingSchedule(false)
    }

    // Promover usuario a barbero
    const handlePromote = async (e: React.FormEvent) => {
        e.preventDefault()
        setPromoting(true)
        setMessage('')

        const { data: users, error } = await supabase
            .from('perfiles')
            .select('*')
            .eq('email', emailToPromote)
            .single()

        if (error || !users) {
            setMessage('❌ Usuario no encontrado.')
            setPromoting(false)
            return
        }

        const { error: updateError } = await supabase
            .from('perfiles')
            .update({ rol: 'barbero' } as any)
            .eq('id', users.id)

        if (updateError) {
            setMessage(`❌ Error: ${updateError.message}`)
        } else {
            setMessage('✅ ¡Usuario promovido!')
            setEmailToPromote('')
            fetchBarbers()
        }
        setPromoting(false)
    }

    const handleDemote = async (id: string) => {
        if (!confirm('¿Quitar rol de barbero a este usuario?')) return
        await supabase.from('perfiles').update({ rol: 'cliente' } as any).eq('id', id)
        fetchBarbers()
    }

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-navy-900">Gestión de Equipo</h1>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Columna Izquierda: Lista y Agregar */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Add Barber Widget */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100">
                        <h2 className="font-bold text-navy-900 mb-4">Agregar Nuevo Barbero</h2>
                        <form onSubmit={handlePromote} className="space-y-3">
                            <input
                                type="email"
                                placeholder="Email del usuario..."
                                className="w-full rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-navy-900/10 text-sm border border-zinc-200"
                                style={{ backgroundColor: '#ffffff', color: '#000000' }}
                                autoComplete="off"
                                value={emailToPromote}
                                onChange={(e) => setEmailToPromote(e.target.value)}
                            />
                            <button
                                disabled={promoting}
                                className="w-full bg-navy-900 text-white font-bold py-3 rounded-xl text-sm hover:bg-navy-800 transition-colors disabled:opacity-50"
                            >
                                {promoting ? 'Buscando...' : 'Promover Usuario'}
                            </button>
                            {message && <p className="text-xs font-medium text-center">{message}</p>}
                        </form>
                    </div>

                    {/* Lista de Barberos */}
                    <div className="space-y-3">
                        {barbers.map((barber) => (
                            <div
                                key={barber.id}
                                onClick={() => handleEditSchedule(barber)}
                                className={cn(
                                    "p-4 rounded-xl border cursor-pointer transition-all flex items-center gap-3 hover:shadow-md",
                                    selectedBarber?.id === barber.id
                                        ? "bg-navy-900 border-navy-900 text-white"
                                        : "bg-white border-zinc-200 text-navy-900 hover:border-navy-900/30"
                                )}
                            >
                                <div className={cn(
                                    "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm",
                                    selectedBarber?.id === barber.id ? "bg-white/20 text-white" : "bg-zinc-100 text-zinc-500"
                                )}>
                                    {barber.nombre?.[0]}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold truncate">{barber.nombre}</h3>
                                    <p className={cn("text-xs truncate", selectedBarber?.id === barber.id ? "text-white/60" : "text-zinc-400")}>{barber.email}</p>
                                </div>
                                <span className={cn(
                                    "text-xl",
                                    selectedBarber?.id === barber.id ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                                )}>👉</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Columna Derecha: Editor de Horarios */}
                <div className="lg:col-span-2">
                    {selectedBarber ? (
                        <div className="bg-white rounded-3xl shadow-xl border border-zinc-100 overflow-hidden">
                            <div className="p-8 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
                                <div>
                                    <h2 className="text-2xl font-bold text-navy-900">Configurar Horario</h2>
                                    <p className="text-zinc-500">Editando disponibilidad de <span className="font-bold text-navy-900">{selectedBarber.nombre}</span></p>
                                </div>
                                <button
                                    onClick={() => handleDemote(selectedBarber.id)}
                                    className="text-red-500 text-sm font-medium hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
                                >
                                    Eliminar rol
                                </button>
                            </div>

                            <div className="p-8 space-y-4">
                                {schedules.map((schedule, index) => (
                                    <div key={index} className={cn(
                                        "flex items-center gap-4 p-4 rounded-xl transition-colors border",
                                        schedule.activo ? "bg-white border-zinc-200" : "bg-zinc-50 border-transparent opacity-60"
                                    )}>
                                        <div className="w-32 font-medium text-navy-900">{DAYS[schedule.dia_semana]}</div>

                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={schedule.activo}
                                                onChange={(e) => {
                                                    const newSchedules = [...schedules]
                                                    newSchedules[index].activo = e.target.checked
                                                    setSchedules(newSchedules)
                                                }}
                                            />
                                            <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-navy-900"></div>
                                        </label>

                                        {schedule.activo && (
                                            <div className="flex items-center gap-2 flex-1 justify-end animate-in fade-in duration-300">
                                                <input
                                                    type="time"
                                                    value={schedule.hora_inicio}
                                                    onChange={(e) => {
                                                        const newSchedules = [...schedules]
                                                        newSchedules[index].hora_inicio = e.target.value
                                                        setSchedules(newSchedules)
                                                    }}
                                                    className="bg-zinc-50 border border-zinc-200 rounded-lg px-2 py-1 text-sm outline-none focus:border-navy-900"
                                                />
                                                <span className="text-zinc-400">-</span>
                                                <input
                                                    type="time"
                                                    value={schedule.hora_fin}
                                                    onChange={(e) => {
                                                        const newSchedules = [...schedules]
                                                        newSchedules[index].hora_fin = e.target.value
                                                        setSchedules(newSchedules)
                                                    }}
                                                    className="bg-zinc-50 border border-zinc-200 rounded-lg px-2 py-1 text-sm outline-none focus:border-navy-900"
                                                />
                                            </div>
                                        )}
                                        {!schedule.activo && <div className="flex-1 text-right text-xs text-zinc-400 font-medium uppercase tracking-wider">No Laboral</div>}
                                    </div>
                                ))}
                            </div>

                            <div className="p-6 bg-zinc-50 border-t border-zinc-100 flex justify-end gap-3 sticky bottom-0">
                                <button
                                    onClick={() => setSelectedBarber(null)}
                                    className="px-6 py-3 text-zinc-500 font-bold hover:bg-zinc-100 rounded-xl transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleSaveSchedule}
                                    disabled={savingSchedule}
                                    className="px-8 py-3 bg-navy-900 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50"
                                >
                                    {savingSchedule ? 'Guardando...' : 'Guardar Horario'}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-zinc-400 border-2 border-dashed border-zinc-200 rounded-3xl p-12 bg-zinc-50/50">
                            <span className="text-4xl mb-4">👈</span>
                            <p className="font-medium">Selecciona un barbero para gestionar su horario</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
