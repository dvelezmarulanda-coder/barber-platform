'use client'

import { useState, useEffect } from 'react'
import { Database } from '@/lib/database.types'

type Service = Database['public']['Tables']['servicios']['Row']

interface ServiceModalProps {
    isOpen: boolean
    onClose: () => void
    onSave: (service: Partial<Service>) => Promise<void>
    initialData?: Service | null
}

export default function ServiceModal({ isOpen, onClose, onSave, initialData }: ServiceModalProps) {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState<Partial<Service>>({
        nombre: '',
        duracion_minutos: 30,
        precio: 0,
        descripcion: '',
        activo: true
    })

    useEffect(() => {
        if (initialData) {
            setFormData(initialData)
        } else {
            setFormData({
                nombre: '',
                duracion_minutos: 30,
                precio: 0,
                descripcion: '',
                activo: true
            })
        }
    }, [initialData, isOpen])

    if (!isOpen) return null

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        await onSave(formData)
        setLoading(false)
        onClose()
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl transform transition-all animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
                <div className="px-8 py-6 border-b border-zinc-100 bg-zinc-50/50">
                    <h2 className="text-2xl font-bold text-navy-900">
                        {initialData ? 'Editar Servicio' : 'Nuevo Servicio'}
                    </h2>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-navy-900 mb-2">Nombre del Servicio</label>
                        <input
                            type="text"
                            required
                            placeholder="Ej. Corte Clásico + Barba"
                            className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-navy-900 outline-none focus:border-navy-900 focus:ring-1 focus:ring-navy-900 transition-all placeholder:text-zinc-300"
                            value={formData.nombre}
                            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-navy-900 mb-2">Precio ($)</label>
                            <input
                                type="number"
                                required
                                min="0"
                                step="1000"
                                className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-navy-900 outline-none focus:border-navy-900 focus:ring-1 focus:ring-navy-900 transition-all font-mono"
                                value={formData.precio}
                                onChange={(e) => setFormData({ ...formData, precio: parseFloat(e.target.value) })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-navy-900 mb-2">Duración (min)</label>
                            <input
                                type="number"
                                required
                                min="5"
                                step="5"
                                className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-navy-900 outline-none focus:border-navy-900 focus:ring-1 focus:ring-navy-900 transition-all font-mono"
                                value={formData.duracion_minutos}
                                onChange={(e) => setFormData({ ...formData, duracion_minutos: parseInt(e.target.value) })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-navy-900 mb-2">Descripción</label>
                        <textarea
                            placeholder="Detalles sobre lo que incluye el servicio..."
                            className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-navy-900 outline-none focus:border-navy-900 focus:ring-1 focus:ring-navy-900 transition-all h-28 resize-none placeholder:text-zinc-300"
                            value={formData.descripcion || ''}
                            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                        />
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-zinc-50 rounded-xl border border-zinc-100">
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={formData.activo}
                                onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                            />
                            <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-navy-900"></div>
                        </label>
                        <span className="text-sm font-medium text-navy-900">
                            {formData.activo ? 'El servicio está activo y visible' : 'El servicio está oculto'}
                        </span>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 text-zinc-500 font-bold hover:bg-zinc-100 rounded-xl transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-navy-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-navy-800 hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50"
                        >
                            {loading ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
