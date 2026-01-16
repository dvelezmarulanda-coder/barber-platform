'use client'

import { useState, useEffect } from 'react'
import { Database } from '@/lib/database.types'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import ServiceSelection from './ServiceSelection'
import BarberSelection from './BarberSelection'
import DateTimePicker from './DateTimePicker'
import BookingSummary from './BookingSummary'
import GuestForm from './GuestForm'
import { cn } from '@/lib/utils'
import { addMinutes, format } from 'date-fns'

type Service = Database['public']['Tables']['servicios']['Row']
type Barber = Database['public']['Tables']['perfiles']['Row']

export default function BookingWizard() {
    const [step, setStep] = useState(1)
    const [selectedService, setSelectedService] = useState<Service | null>(null)
    const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null)
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
    const [loading, setLoading] = useState(false)
    const [user, setUser] = useState<any>(null)
    const [guestDetails, setGuestDetails] = useState({
        nombre: '',
        telefono: '',
        email: ''
    })

    const supabase = createClientComponentClient<Database>()
    const router = useRouter()

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)
        }
        checkUser()
    }, [supabase])

    const handleConfirm = async () => {
        if (!selectedService || !selectedBarber || !selectedDate) return

        // Validation for guest
        if (!user) {
            if (!guestDetails.nombre || !guestDetails.telefono) {
                alert('Por favor completa tu nombre y teléfono')
                return
            }
        }

        setLoading(true)

        let finalBarberId = selectedBarber.id

        // LOGICA DE ASIGNACION AUTOMATICA
        if (finalBarberId === 'any') {
            try {
                // 1. Encontrar quién trabaja este día
                const dayOfWeek = selectedDate.getDay()
                const { data: schedules } = await supabase
                    .from('horarios_disponibilidad')
                    .select('barbero_id, hora_inicio, hora_fin')
                    .eq('dia_semana', dayOfWeek)
                    .eq('activo', true)

                if (!schedules || schedules.length === 0) throw new Error('No hay barberos trabajando este día.')

                // 2. Filtrar quién cubre este horario específico
                const bookingTime = format(selectedDate, 'HH:mm:ss')
                const candidates = schedules.filter(s =>
                    s.hora_inicio <= bookingTime && s.hora_fin > bookingTime
                ).map(s => s.barbero_id)

                if (candidates.length === 0) throw new Error('Ningún barbero cubre este horario.')

                // 3. Verificar quién NO tiene cita ya
                const conflictStart = selectedDate.toISOString()
                const conflictEnd = addMinutes(selectedDate, selectedService.duracion_minutos).toISOString()

                const { data: conflicts } = await supabase
                    .from('citas')
                    .select('barbero_id')
                    .in('barbero_id', candidates)
                    .gte('fecha_hora', conflictStart)
                    .lt('fecha_hora', conflictEnd)
                    .neq('estado', 'cancelada')

                const busyBarberIds = new Set(conflicts?.map(c => c.barbero_id) || [])
                const availableBarbers = candidates.filter(id => !busyBarberIds.has(id))

                if (availableBarbers.length === 0) throw new Error('Lo sentimos, el horario que elegiste ya no está disponible.')

                // 4. Asignar aleatoriamente
                finalBarberId = availableBarbers[Math.floor(Math.random() * availableBarbers.length)]

            } catch (error: any) {
                alert('Error de disponibilidad: ' + error.message)
                setLoading(false)
                return
            }
        }

        const appointmentData: any = {
            barbero_id: finalBarberId,
            servicio_id: selectedService.id,
            fecha_hora: selectedDate.toISOString(),
            estado: 'pendiente'
        }

        if (user) {
            appointmentData.cliente_id = user.id
        } else {
            appointmentData.cliente_nombre = guestDetails.nombre
            appointmentData.cliente_telefono = guestDetails.telefono
            appointmentData.cliente_email = guestDetails.email
        }

        const { error } = await supabase.from('citas').insert(appointmentData)

        if (error) {
            alert('Error al crear la cita: ' + error.message)
            setLoading(false)
        } else {
            router.push('/dashboard?booking=success')
        }
    }

    return (
        <div className="max-w-3xl mx-auto">
            {/* Progress Bar Light Theme */}
            <div className="flex gap-2 mb-8">
                {[1, 2, 3, 4].map((i) => (
                    <div
                        key={i}
                        className={cn(
                            "h-1.5 flex-1 rounded-full transition-all duration-500",
                            step >= i ? "bg-navy-900" : "bg-zinc-200"
                        )}
                    />
                ))}
            </div>

            <div className="min-h-[400px]">
                {step === 1 && (
                    <ServiceSelection
                        selectedServiceId={selectedService?.id}
                        onSelect={(service) => {
                            setSelectedService(service)
                            setStep(2)
                        }}
                    />
                )}

                {step === 2 && (
                    <div className="space-y-6">
                        <button onClick={() => setStep(1)} className="text-sm font-medium text-navy-900/60 hover:text-navy-900 transition-colors flex items-center gap-2">
                            ← Volver a servicios
                        </button>
                        <BarberSelection
                            selectedBarberId={selectedBarber?.id}
                            onSelect={(barber) => {
                                setSelectedBarber(barber)
                                setStep(3)
                            }}
                        />
                    </div>
                )}

                {step === 3 && selectedService && selectedBarber && (
                    <div className="space-y-6">
                        <button onClick={() => setStep(2)} className="text-sm font-medium text-navy-900/60 hover:text-navy-900 transition-colors flex items-center gap-2">
                            ← Volver a barberos
                        </button>
                        <DateTimePicker
                            barberId={selectedBarber.id}
                            serviceDuration={selectedService.duracion_minutos}
                            selectedDate={selectedDate}
                            onSelect={(date) => {
                                setSelectedDate(date)
                                setStep(4)
                            }}
                        />
                    </div>
                )}

                {step === 4 && selectedService && selectedBarber && selectedDate && (
                    <div className="space-y-6">
                        <button onClick={() => setStep(3)} className="text-sm font-medium text-navy-900/60 hover:text-navy-900 transition-colors flex items-center gap-2">
                            ← Volver a horarios
                        </button>

                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="order-2 md:order-1">
                                {!user && (
                                    <GuestForm
                                        defaultValues={guestDetails}
                                        onChange={setGuestDetails}
                                    />
                                )}
                            </div>
                            <div className="order-1 md:order-2">
                                <BookingSummary
                                    service={selectedService}
                                    barber={selectedBarber}
                                    date={selectedDate}
                                    onConfirm={handleConfirm}
                                    loading={loading}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
