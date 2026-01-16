import { useState, useEffect } from 'react';
import { format, addDays, startOfToday, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { type Database } from '@/lib/database.types';

// Mock types if database types aren't fully generated yet
type Service = {
  id: string;
  name: string;
  duration_minutes: number;
  price: number;
};

type Barber = {
  id: string;
  nombre: string;
};

type Slot = {
  time: string;
  available: boolean;
};

export default function BookingCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date>(startOfToday());
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null);
  const [availableSlots, setAvailableSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);

  const supabase = createClientComponentClient<Database>();

  // Fetch Services and Barbers on mount
  useEffect(() => {
    const fetchData = async () => {
      const { data: servicesData } = await supabase.from('services').select('*').eq('active', true);
      const { data: barbersData } = await supabase.from('profiles').select('*').eq('rol', 'barbero');
      
      if (servicesData) setServices(servicesData);
      if (barbersData) setBarbers(barbersData);
    };
    fetchData();
  }, [supabase]);

  // Fetch availability when dependencies change
  useEffect(() => {
    if (!selectedDate || !selectedService || !selectedBarber) return;

    const fetchAvailability = async () => {
      setLoading(true);
      try {
        // 1. Get barber's schedule for the day of week
        const dayOfWeek = selectedDate.getDay();
        const { data: schedule } = await supabase
          .from('availability')
          .select('*')
          .eq('barbero_id', selectedBarber.id)
          .eq('day_of_week', dayOfWeek)
          .single();

        if (!schedule || !schedule.is_active) {
          setAvailableSlots([]);
          return;
        }

        // 2. Get existing appointments for that day
        const startOfDay = new Date(selectedDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(selectedDate);
        endOfDay.setHours(23, 59, 59, 999);

        const { data: appointments } = await supabase
          .from('appointments')
          .select('fecha_hora, services(duration_minutes)')
          .eq('barbero_id', selectedBarber.id)
          .gte('fecha_hora', startOfDay.toISOString())
          .lte('fecha_hora', endOfDay.toISOString())
          .neq('estado', 'cancelada');

        // 3. Calculate slots
        // This is a simplified logic. In production, use a robust time library.
        const slots: Slot[] = [];
        let currentTime = new Date(`${selectedDate.toDateString()} ${schedule.start_time}`);
        const endTime = new Date(`${selectedDate.toDateString()} ${schedule.end_time}`);

        while (currentTime < endTime) {
          const slotTime = format(currentTime, 'HH:mm');
          
          // Check collision
          const isBusy = appointments?.some(app => {
             const appTime = new Date(app.fecha_hora);
             const appDuration = Array.isArray(app.services) ? app.services[0].duration_minutes : app.services?.duration_minutes || 30; // Handle join
             const appEnd = new Date(appTime.getTime() + appDuration * 60000);
             return currentTime >= appTime && currentTime < appEnd;
          });

          if (!isBusy) {
             slots.push({ time: slotTime, available: true });
          }

          // Increment by service duration or fixed interval (e.g. 30 mins)
          // For simplicity using 30 mins interval, but ensuring service fits would be next step
          currentTime = new Date(currentTime.getTime() + 30 * 60000); 
        }
        setAvailableSlots(slots);

      } catch (error) {
        console.error('Error fetching availability', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAvailability();
  }, [selectedDate, selectedService, selectedBarber, supabase]);

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Reserva tu Cita</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Service Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Servicio</label>
          <div className="grid grid-cols-1 gap-3">
            {services.map((service) => (
              <button
                key={service.id}
                onClick={() => setSelectedService(service)}
                className={`p-4 border rounded-lg text-left transition-all ${
                  selectedService?.id === service.id 
                    ? 'border-black bg-gray-50 ring-1 ring-black' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-semibold">{service.name}</div>
                <div className="text-sm text-gray-500">
                  {service.duration_minutes} min - ${service.price}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Date & Barber Selection */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Barbero</label>
            <select 
              className="w-full p-2 border border-gray-300 rounded-md"
              onChange={(e) => setSelectedBarber(barbers.find(b => b.id === e.target.value) || null)}
            >
              <option value="">Selecciona un barbero</option>
              {barbers.map(barber => (
                <option key={barber.id} value={barber.id}>{barber.nombre}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Fecha</label>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {[...Array(7)].map((_, i) => {
                const date = addDays(startOfToday(), i);
                return (
                  <button
                    key={i}
                    onClick={() => setSelectedDate(date)}
                    className={`flex-shrink-0 w-16 h-20 rounded-lg flex flex-col items-center justify-center border ${
                      isSameDay(date, selectedDate)
                        ? 'bg-black text-white border-black'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-xs">{format(date, 'EEE', { locale: es })}</span>
                    <span className="text-lg font-bold">{format(date, 'd')}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Slots */}
          {selectedService && selectedBarber && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Horarios Disponibles</label>
              {loading ? (
                <div className="animate-pulse h-10 bg-gray-100 rounded"></div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {availableSlots.map((slot, i) => (
                    <button
                      key={i}
                      className="py-2 px-4 text-sm border rounded-md hover:bg-black hover:text-white transition-colors"
                      disabled={!slot.available}
                    >
                      {slot.time}
                    </button>
                  ))}
                  {availableSlots.length === 0 && (
                    <p className="text-sm text-gray-500 col-span-3">No hay horarios disponibles.</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
