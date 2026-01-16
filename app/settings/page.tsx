'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/lib/database.types'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SettingsPage() {
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null)
    const supabase = createClientComponentClient<Database>()
    const router = useRouter()

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
        <div className="min-h-screen bg-[#F2F2F2] p-4 font-outfit">
            <div className="max-w-md mx-auto space-y-6">

                {/* Header with Back Button */}
                <div className="flex items-center gap-4">
                    <Link href="/dashboard" className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-navy-900 shadow-sm hover:scale-105 transition-transform">
                        ←
                    </Link>
                    <h1 className="text-2xl font-bold text-navy-900">Mi Seguridad</h1>
                </div>

                <div className="bg-white p-6 rounded-[2rem] shadow-lg border border-white">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-navy-50 rounded-full flex items-center justify-center text-xl">🔐</div>
                        <div>
                            <h2 className="text-lg font-bold text-navy-900">Contraseña de Acceso</h2>
                            <p className="text-zinc-400 text-xs">Para ingresar sin enlace mágico</p>
                        </div>
                    </div>

                    <form onSubmit={handleUpdatePassword} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-navy-900 mb-1 pl-1">
                                Nueva Contraseña
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900 transition-all text-navy-900 bg-zinc-50 focus:bg-white"
                                placeholder="Mínimo 6 caracteres"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-navy-900 mb-1 pl-1">
                                Confirmar Contraseña
                            </label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900 transition-all text-navy-900 bg-zinc-50 focus:bg-white"
                                placeholder="Repite la contraseña"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !password}
                            className="w-full bg-navy-900 text-white font-bold py-4 rounded-xl hover:bg-navy-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:-translate-y-0.5 mt-2"
                        >
                            {loading ? 'Guardando...' : 'Establecer Contraseña'}
                        </button>

                        {message && (
                            <div className={`p-4 rounded-xl text-sm font-medium text-center animate-in fade-in zoom-in ${message.type === 'success'
                                ? 'bg-green-50 text-green-700 border border-green-100'
                                : 'bg-red-50 text-red-600 border border-red-100'
                                }`}>
                                {message.text}
                            </div>
                        )}
                    </form>
                </div>

                <div className="text-center">
                    <p className="text-zinc-400 text-xs">
                        Al establecer una contraseña, podrás usar tanto el acceso con contraseña como el enlace mágico.
                    </p>
                </div>
            </div>
        </div>
    )
}
