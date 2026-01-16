'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter, usePathname } from 'next/navigation'
import { Database } from '@/lib/database.types'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [loading, setLoading] = useState(true)
    const router = useRouter()
    const pathname = usePathname()
    const supabase = createClientComponentClient<Database>()

    // Hide sidebar on QR page
    const isQRPage = pathname === '/admin/qr'

    useEffect(() => {
        const checkAdmin = async () => {
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                router.push('/login')
                return
            }

            const { data: profile } = await supabase
                .from('perfiles')
                .select('rol')
                .eq('id', user.id)
                .single()

            if ((profile as any)?.rol !== 'admin') {
                router.push('/dashboard')
                return
            }

            setLoading(false)
        }

        checkAdmin()
    }, [supabase, router])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/')
        router.refresh()
    }

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    // Close mobile menu when pathname changes
    useEffect(() => {
        setMobileMenuOpen(false)
    }, [pathname])

    if (loading) {
        return <div className="min-h-screen bg-[#F2F2F2] text-navy-900 flex items-center justify-center font-outfit">Verificando acceso...</div>
    }

    const NavigationContent = () => (
        <nav className="flex-1 p-6 space-y-2">
            <p className="px-4 text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4">Gestión</p>

            <Link href="/admin/settings" className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium",
                pathname === '/admin/settings'
                    ? "bg-navy-900 text-white shadow-md"
                    : "text-zinc-600 hover:bg-zinc-50 hover:text-navy-900"
            )}>
                <span>⚙️</span> Configuración
            </Link>

            <Link href="/admin/appointments" className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium",
                pathname === '/admin/appointments'
                    ? "bg-navy-900 text-white shadow-md"
                    : "text-zinc-600 hover:bg-zinc-50 hover:text-navy-900"
            )}>
                <span>📅</span> Citas
            </Link>

            <Link href="/admin/services" className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium",
                pathname === '/admin/services'
                    ? "bg-navy-900 text-white shadow-md"
                    : "text-zinc-600 hover:bg-zinc-50 hover:text-navy-900"
            )}>
                <span>✂️</span> Servicios
            </Link>

            <Link href="/admin/barbers" className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium",
                pathname === '/admin/barbers'
                    ? "bg-navy-900 text-white shadow-md"
                    : "text-zinc-600 hover:bg-zinc-50 hover:text-navy-900"
            )}>
                <span>💈</span> Barberos
            </Link>

            <Link href="/admin/qr" className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium",
                pathname === '/admin/qr'
                    ? "bg-navy-900 text-white shadow-md"
                    : "text-zinc-600 hover:bg-zinc-50 hover:text-navy-900"
            )}>
                <span>📱</span> Código QR
            </Link>
        </nav>
    )

    return (
        <div className="min-h-screen bg-[#F2F2F2] flex flex-col md:flex-row font-outfit">

            {/* Mobile Header */}
            {!isQRPage && (
                <div className="md:hidden bg-white border-b border-zinc-200 p-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
                    <div className="flex items-center gap-2">
                        <span className="bg-navy-900 text-white w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold">T</span>
                        <span className="font-bold tracking-tight text-xl text-navy-900">ADMIN</span>
                    </div>
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="p-2 text-navy-900 hover:bg-zinc-100 rounded-lg"
                    >
                        {mobileMenuOpen ? '✕' : '☰'}
                    </button>
                </div>
            )}

            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-20 bg-white pt-20 px-4 md:hidden overflow-y-auto">
                    <NavigationContent />
                    <div className="p-6 border-t border-zinc-100 flex flex-col gap-2">
                        <Link href="/dashboard" className="flex items-center gap-2 text-zinc-500 hover:text-navy-900 transition-colors text-sm font-medium px-4 py-2">
                            <span>←</span> Volver al Dashboard
                        </Link>

                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors text-sm font-medium px-4 py-2 rounded-lg text-left w-full"
                        >
                            <span>🚪</span> Cerrar Sesión
                        </button>
                    </div>
                </div>
            )}

            {/* Desktop Sidebar - Modern Navy Style */}
            {!isQRPage && (
                <aside className="hidden md:flex w-72 bg-white border-r border-zinc-200 flex-col shadow-sm sticky top-0 h-screen z-10">
                    <div className="p-8 border-b border-zinc-100">
                        <div className="flex items-center gap-3">
                            <span className="bg-navy-900 text-white w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold">T</span>
                            <span className="font-bold tracking-tight text-xl text-navy-900">ADMIN PANEL</span>
                        </div>
                    </div>

                    <NavigationContent />

                    <div className="p-6 border-t border-zinc-100 flex flex-col gap-2">
                        <Link href="/dashboard" className="flex items-center gap-2 text-zinc-500 hover:text-navy-900 transition-colors text-sm font-medium px-4 py-2">
                            <span>←</span> Volver al Dashboard
                        </Link>

                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors text-sm font-medium px-4 py-2 rounded-lg text-left w-full"
                        >
                            <span>🚪</span> Cerrar Sesión
                        </button>
                    </div>
                </aside>
            )}

            {/* Content Area */}
            <main className="flex-1 p-4 md:p-12 overflow-auto w-full">
                <div className="max-w-5xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    )
}
