'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/lib/database.types'
import Logo from '@/components/Logo'
import Link from 'next/link'
import { Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<string | null>(null)
    const supabase = createClientComponentClient<Database>()

    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)

    const handlePasswordLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage(null)

        const trimmedEmail = email.trim()

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: trimmedEmail,
                password,
            })

            if (error) {
                console.error('Login error:', error)
                setMessage('Error: Contraseña incorrecta o usuario no encontrado')
                setLoading(false)
                return
            }

            if (data.user) {
                // Check role redirection
                const { data: profile } = await supabase
                    .from('perfiles')
                    .select('*')
                    .eq('id', data.user.id)
                    .single()

                if ((profile as any)?.rol === 'admin') {
                    window.location.href = '/admin/barbers'
                } else {
                    window.location.href = '/dashboard'
                }
            }
        } catch (err) {
            console.error('Unexpected error:', err)
            setMessage('Ocurrió un error al iniciar sesión')
            setLoading(false)
        }
    }

    const handleMagicLink = async () => {
        setLoading(true)
        setMessage(null)
        const trimmedEmail = email.trim()

        try {


            const { error } = await supabase.auth.signInWithOtp({
                email: trimmedEmail,
                options: {
                    emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || location.origin}/auth/callback?next=/dashboard`,
                },
            })

            if (error) {
                setMessage(`Error: ${error.message}`)
            } else {
                setMessage('¡Enlace mágico enviado! Revisa tu correo.')
            }
        } catch (err) {
            setMessage('Ocurrió un error al verificar los permisos')
        }

        setLoading(false)
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F2F2F2] px-4 font-outfit">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-[2rem] border border-white shadow-xl">
                <div className="flex flex-col items-center">
                    <Link href="/">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="bg-navy-900 text-white w-10 h-10 flex items-center justify-center rounded-full text-lg font-bold">T</span>
                        </div>
                    </Link>
                    <h2 className="mt-4 text-center text-3xl font-bold text-navy-900 tracking-tight">
                        Bienvenido
                    </h2>
                    <p className="mt-2 text-center text-sm text-zinc-500">
                        Ingresa tus credenciales para acceder
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handlePasswordLogin}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="email-address" className="block text-sm font-medium text-navy-900 mb-1">
                                Correo electrónico
                            </label>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="appearance-none rounded-xl block w-full px-4 py-3.5 border border-zinc-200 placeholder-zinc-400 text-navy-900 bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-navy-900 focus:bg-white transition-all text-lg"
                                placeholder="nombre@ejemplo.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-navy-900 mb-1">
                                Contraseña
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="current-password"
                                    className="appearance-none rounded-xl block w-full px-4 py-3.5 border border-zinc-200 placeholder-zinc-400 text-navy-900 bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-navy-900 focus:bg-white transition-all text-lg pr-12"
                                    placeholder="Tu contraseña"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-navy-900 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <button
                            type="submit"
                            disabled={loading || !password}
                            className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-lg font-bold rounded-xl text-white bg-navy-900 hover:bg-navy-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-navy-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                        >
                            {loading ? 'Entrando...' : 'Entrar con Contraseña'}
                        </button>

                        <button
                            type="button"
                            onClick={handleMagicLink}
                            disabled={loading}
                            className="group relative w-full flex justify-center py-3 px-4 border-2 border-zinc-200 text-base font-bold rounded-xl text-zinc-600 bg-white hover:bg-zinc-50 hover:border-zinc-300 focus:outline-none transition-all"
                        >
                            Enviarme enlace mágico (Sin contraseña)
                        </button>
                    </div>

                    {message && (
                        <div className={`text-center text-sm p-4 rounded-xl font-medium ${message.includes('Error') || message.includes('incorrecta') ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-700 border border-green-100'}`}>
                            {message}
                        </div>
                    )}
                </form>

                <div className="text-center pt-4">
                    <Link href="/" className="text-sm text-zinc-400 hover:text-navy-900 transition-colors font-medium">
                        ← Volver al inicio
                    </Link>
                </div>
            </div>
        </div>
    )
}
