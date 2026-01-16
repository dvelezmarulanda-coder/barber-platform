'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/lib/database.types'

export default function AdminSettingsPage() {
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null)
    const supabase = createClientComponentClient<Database>()

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage(null)

        if (password.length < 6) {
            setMessage({ text: 'La contraseña debe tener al menos 6 caracteres', type: 'error' })
            setLoading(false)
            return
        }

        if (password !== confirmPassword) {
            setMessage({ text: 'Las contraseñas no coinciden', type: 'error' })
            setLoading(false)
            return
        }

        try {
            const { error } = await supabase.auth.updateUser({
                password: password
            })

            if (error) {
                setMessage({ text: `Error: ${error.message}`, type: 'error' })
            } else {
                setMessage({ text: '¡Contraseña actualizada correctamente!', type: 'success' })
                setPassword('')
                setConfirmPassword('')
            }
        } catch (err) {
            setMessage({ text: 'Ocurrió un error inesperado', type: 'error' })
        }

        setLoading(false)
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-navy-900 tracking-tight">Configuración</h1>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100 max-w-xl">
                <h2 className="text-xl font-bold text-navy-900 mb-4">Cambiar Contraseña</h2>
                <p className="text-zinc-500 text-sm mb-6">
                    Establece una contraseña para iniciar sesión más rápido sin necesidad de esperar el correo mágico.
                </p>

                <form onSubmit={handleUpdatePassword} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-navy-900 mb-1">
                            Nueva Contraseña
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900 transition-all text-navy-900 bg-white"
                            placeholder="Mínimo 6 caracteres"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-navy-900 mb-1">
                            Confirmar Contraseña
                        </label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900 transition-all text-navy-900 bg-white"
                            placeholder="Repite la contraseña"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !password}
                        className="w-full bg-navy-900 text-white font-bold py-3 px-4 rounded-xl hover:bg-navy-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                    >
                        {loading ? 'Actualizando...' : 'Actualizar Contraseña'}
                    </button>

                    {message && (
                        <div className={`p-4 rounded-xl text-sm font-medium text-center ${message.type === 'success'
                            ? 'bg-green-50 text-green-700 border border-green-100'
                            : 'bg-red-50 text-red-600 border border-red-100'
                            }`}>
                            {message.text}
                        </div>
                    )}
                </form>
            </div>
        </div>
    )
}
