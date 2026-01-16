import { useState } from 'react'
import { cn } from '@/lib/utils'

interface GuestFormProps {
    onChange: (data: { nombre: string; telefono: string; email: string }) => void
    defaultValues: { nombre: string; telefono: string; email: string }
}

export default function GuestForm({ onChange, defaultValues }: GuestFormProps) {
    return (
        <div className="space-y-4 max-w-md mx-auto">
            <h3 className="text-xl font-semibold text-white">Tus Datos</h3>
            <p className="text-zinc-400 text-sm">Ingresa tu información para confirmar la cita.</p>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm text-zinc-400 mb-1">Nombre Completo *</label>
                    <input
                        type="text"
                        required
                        value={defaultValues.nombre}
                        onChange={(e) => onChange({ ...defaultValues, nombre: e.target.value })}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-white focus:border-white outline-none placeholder:text-zinc-500"
                        placeholder="Ej. Juan Pérez"
                    />
                </div>

                <div>
                    <label className="block text-sm text-zinc-400 mb-1">Teléfono (Celular) *</label>
                    <input
                        type="tel"
                        required
                        value={defaultValues.telefono}
                        onChange={(e) => onChange({ ...defaultValues, telefono: e.target.value })}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-white focus:border-white outline-none placeholder:text-zinc-500"
                        placeholder="Ej. 300 123 4567"
                    />
                </div>

                <div>
                    <label className="block text-sm text-zinc-400 mb-1">Correo Electrónico (Opcional)</label>
                    <input
                        type="email"
                        value={defaultValues.email}
                        onChange={(e) => onChange({ ...defaultValues, email: e.target.value })}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-white focus:border-white outline-none placeholder:text-zinc-500"
                        placeholder="Ej. juan@ejemplo.com"
                    />
                    <p className="text-xs text-zinc-500 mt-1">Te enviaremos el recordatorio a este correo.</p>
                </div>
            </div>
        </div>
    )
}
