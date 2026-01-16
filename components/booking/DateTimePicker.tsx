import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/lib/database.types'
import { cn } from '@/lib/utils'
import { format, addMinutes, isBefore, setHours, setMinutes } from 'date-fns'

type TimeSlot = {
    start: Date
    end: Date
    available: boolean
}

type Schedule = {
    barbero_id: string;
    hora_inicio: string;
    hora_fin: string;
    activo: boolean
}

type Appointment = {
    fecha_hora: string;
    barbero_id: string;
    servicios: { duracion_minutos: number } | null
}

interface DateTimePickerProps {
    barberId: string
    serviceDuration: number
    onSelect: (date: Date) => void
    selectedDate?: Date
}

export default function DateTimePicker({ barberId, serviceDuration, onSelect, selectedDate }: DateTimePickerProps) {
    const [date, setDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'))
    const [slots, setSlots] = useState<TimeSlot[]>([])
    const [loading, setLoading] = useState(false)
    const supabase = createClientComponentClient<Database>()

    useEffect(() => {
        const fetchAvailability = async () => {
            setLoading(true)
            const selectedDateObj = new Date(date + 'T00:00:00')
            const dayOfWeek = selectedDateObj.getDay()

            // 1. Determinar qué barberos consultar
            let targetBarberIds: string[] = []

            if (barberId === 'any') {
                const { data: allBarbers } = await supabase
                    .from('perfiles')
                    .select('id')
                    .eq('rol', 'barbero')
                if (allBarbers) targetBarberIds = (allBarbers as any).map((b: any) => b.id)
            } else {
                targetBarberIds = [barberId]
            }

            if (targetBarberIds.length === 0) {
                setSlots([])
                setLoading(false)
                return
            }

            // 2. Obtener Horarios
            const { data: schedulesData } = await supabase
                .from('horarios_disponibilidad')
                .select('*')
                .in('barbero_id', targetBarberIds)
                .eq('dia_semana', dayOfWeek)
                .eq('activo', true)

            const schedules = (schedulesData || []) as unknown as Schedule[]

            if (!schedules || schedules.length === 0) {
                setSlots([])
                setLoading(false)
                return
            }

            // 3. Obtener Citas existentes
            // Buscamos citas en el rango del día seleccionado (Local Time -> UTC)
            // Aseguramos cubrir todo el día local convirtiendo a ISOString
            const startOfDayDate = new Date(`${date}T00:00:00`)
            const endOfDayDate = new Date(`${date}T23:59:59.999`)

            const startOfDayISO = startOfDayDate.toISOString()
            const endOfDayISO = endOfDayDate.toISOString()

            const { data: appointmentsData } = await supabase
                .from('citas')
                .select('fecha_hora, servicio_id, barbero_id, servicios(duracion_minutos)')
                .in('barbero_id', targetBarberIds)
                .gte('fecha_hora', startOfDayISO)
                .lte('fecha_hora', endOfDayISO)
                .neq('estado', 'cancelada')

            const appointments = (appointmentsData || []) as unknown as Appointment[]

            // 4. Generar Slots Combinados
            const slotStatus = new Map<number, boolean>()

            schedules.forEach(schedule => {
                const [startHour, startMinute] = schedule.hora_inicio.split(':').map(Number)
                const [endHour, endMinute] = schedule.hora_fin.split(':').map(Number)

                let currentSlotStart = setMinutes(setHours(selectedDateObj, startHour), startMinute)
                const dayEndTime = setMinutes(setHours(selectedDateObj, endHour), endMinute)

                // Asegurar que no mostramos horarios pasados si es hoy
                const now = new Date()
                if (date === format(now, 'yyyy-MM-dd')) {
                    if (currentSlotStart < now) {
                        currentSlotStart = addMinutes(now, 30 - (now.getMinutes() % 30))
                    }
                }

                while (isBefore(addMinutes(currentSlotStart, serviceDuration), dayEndTime)) {
                    const currentSlotEnd = addMinutes(currentSlotStart, serviceDuration)
                    let isBooked = false

                    // Verificar citas de ESTE barbero específico
                    const barberApps = appointments.filter(a => a.barbero_id === schedule.barbero_id)

                    for (const apt of barberApps) {
                        const aptTime = new Date(apt.fecha_hora)
                        const aptDuration = apt.servicios?.duracion_minutos || 30
                        const aptEnd = addMinutes(aptTime, aptDuration)

                        if (
                            (currentSlotStart >= aptTime && currentSlotStart < aptEnd) ||
                            (currentSlotEnd > aptTime && currentSlotEnd <= aptEnd) ||
                            (currentSlotStart <= aptTime && currentSlotEnd >= aptEnd)
                        ) {
                            isBooked = true
                            break
                        }
                    }

                    const timeKey = currentSlotStart.getTime()
                    const currentStatus = slotStatus.get(timeKey) || false
                    // Si ya estaba disponible (por otro barbero), se mantiene disponible.
                    // Si no, tomamos el estado actual (!isBooked).
                    slotStatus.set(timeKey, currentStatus || !isBooked)

                    currentSlotStart = addMinutes(currentSlotStart, 30)
                }
            })

            const sortedSlots: TimeSlot[] = Array.from(slotStatus.entries())
                .sort(([a], [b]) => a - b)
                .map(([time, available]) => ({
                    start: new Date(time),
                    end: addMinutes(new Date(time), serviceDuration),
                    available: available
                }))

            setSlots(sortedSlots)
            setLoading(false)
        }

        if (barberId && date) {
            fetchAvailability()
        }
    }, [barberId, date, serviceDuration, supabase])

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-bold text-navy-900 mb-4">¿Cuándo te gustaría venir?</h3>

            <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-200">
                <label className="block text-sm font-bold text-navy-900 mb-2 uppercase tracking-wide">Fecha</label>
                <input
                    type="date"
                    value={date}
                    min={format(new Date(), 'yyyy-MM-dd')}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full p-3 rounded-xl bg-white border border-zinc-200 text-navy-900 focus:border-navy-900 focus:ring-1 focus:ring-navy-900 outline-none font-outfit text-lg"
                />
            </div>

            {loading ? (
                <div className="text-center text-navy-900 py-8 animate-pulse">Buscando espacios disponibles...</div>
            ) : slots.length === 0 ? (
                <div className="text-center text-zinc-500 py-8 bg-zinc-50 rounded-xl border border-zinc-200">
                    No hay horarios disponibles para esta fecha.
                </div>
            ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {slots.map((slot, i) => (
                        <button
                            key={i}
                            disabled={!slot.available}
                            onClick={() => onSelect(slot.start)}
                            className={cn(
                                "py-3 px-2 rounded-xl text-sm font-bold transition-all shadow-sm",
                                !slot.available && "cursor-not-allowed bg-red-100 text-red-600 border border-red-200 opacity-60",
                                slot.available && selectedDate?.getTime() === slot.start.getTime()
                                    ? "bg-navy-900 text-white shadow-lg scale-105"
                                    : slot.available && "bg-white text-navy-900 border border-zinc-200 hover:border-navy-900 hover:bg-navy-50"
                            )}
                        >
                            {format(slot.start, 'HH:mm')}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
