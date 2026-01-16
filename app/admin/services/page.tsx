'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/lib/database.types'
import ServiceModal from '@/components/admin/ServiceModal'

type Service = Database['public']['Tables']['servicios']['Row']

export default function AdminServicesPage() {
    const [services, setServices] = useState<Service[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingService, setEditingService] = useState<Service | null>(null)

    const supabase = createClientComponentClient<Database>()

    const fetchServices = async () => {
        setLoading(true)
        const { data } = await supabase
            .from('servicios')
            .select('*')
            .order('nombre')
        if (data) setServices(data)
        setLoading(false)
    }

    useEffect(() => {
        fetchServices()
    }, [])

    const handleSave = async (serviceData: Partial<Service>) => {
        if (editingService) {
            // Update
            await supabase
                .from('servicios')
                .update(serviceData)
                .eq('id', editingService.id)
        } else {
            // Create
            await supabase
                .from('servicios')
                .insert(serviceData as any)
        }
        await fetchServices()
    }

    const handleDelete = async (id: string) => {
        if (!confirm('¿Estás seguro de eliminar este servicio?')) return
        await supabase.from('servicios').delete().eq('id', id)
        await fetchServices()
    }

    const openForEdit = (service: Service) => {
        setEditingService(service)
        setIsModalOpen(true)
    }

    const openForNew = () => {
        setEditingService(null)
        setIsModalOpen(true)
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-zinc-100">
                <div>
                    <h1 className="text-3xl font-bold text-navy-900">Catálogo de Servicios</h1>
                    <p className="text-zinc-500">Gestiona los cortes y servicios que ofreces.</p>
                </div>
                <button
                    onClick={openForNew}
                    className="bg-navy-900 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-navy-800 hover:shadow-xl hover:-translate-y-0.5 transition-all text-sm flex items-center gap-2"
                >
                    <span>+</span> Nuevo Servicio
                </button>
            </div>

            {loading ? (
                <div className="text-center py-12 text-zinc-400">Cargando servicios...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {services.map((service) => (
                        <div key={service.id} className="bg-white border border-zinc-200 rounded-2xl p-6 group hover:shadow-xl hover:border-navy-900/10 transition-all duration-300 relative overflow-hidden">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="font-bold text-xl text-navy-900 line-clamp-1">{service.nombre}</h3>
                                <span className="bg-zinc-100 text-navy-900 text-sm font-bold px-3 py-1 rounded-lg">
                                    ${service.precio.toLocaleString('es-CO')}
                                </span>
                            </div>
                            <p className="text-zinc-500 text-sm mb-6 line-clamp-2 h-10 leading-relaxed">
                                {service.descripcion || 'Sin descripción disponible.'}
                            </p>
                            <div className="flex justify-between items-center text-sm font-medium pt-4 border-t border-zinc-100">
                                <span className="text-zinc-400 flex items-center gap-1">
                                    ⏱ {service.duracion_minutos} min
                                </span>
                                <span className={`flex items-center gap-1.5 ${service.activo ? 'text-green-600' : 'text-zinc-400'}`}>
                                    <span className={`w-2 h-2 rounded-full ${service.activo ? 'bg-green-500' : 'bg-zinc-300'}`}></span>
                                    {service.activo ? 'Activo' : 'Inactivo'}
                                </span>
                            </div>

                            {/* Actions Overlay (Glassmorphism) */}
                            <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3">
                                <button
                                    onClick={() => openForEdit(service)}
                                    className="bg-navy-900 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-lg hover:scale-105 transition-transform"
                                >
                                    Editar
                                </button>
                                <button
                                    onClick={() => handleDelete(service.id)}
                                    className="bg-red-50 text-red-600 border border-red-100 px-4 py-2 rounded-xl font-bold text-sm hover:bg-red-100 hover:scale-105 transition-all"
                                >
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    ))}

                    {/* Empty State Helper */}
                    {services.length === 0 && (
                        <button onClick={openForNew} className="border-2 border-dashed border-zinc-200 rounded-2xl p-6 flex flex-col items-center justify-center text-zinc-400 hover:border-navy-900 hover:text-navy-900 hover:bg-zinc-50 transition-all min-h-[200px]">
                            <span className="text-4xl mb-2">+</span>
                            <span className="font-bold">Agregar primer servicio</span>
                        </button>
                    )}
                </div>
            )}

            <ServiceModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                initialData={editingService}
            />
        </div>
    )
}
