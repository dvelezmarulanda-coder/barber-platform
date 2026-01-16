import BookingWizard from '@/components/booking/BookingWizard'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default function BookPage() {
    return (
        <main className="min-h-screen bg-[#F2F2F2] text-navy-900 px-4 py-8 font-outfit">
            {/* Header Mini */}
            <div className="max-w-4xl mx-auto mb-8 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 group">
                    <span className="bg-navy-900 text-white w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold group-hover:scale-105 transition-transform">T</span>
                    <span className="font-bold tracking-tight text-xl text-navy-900">TRIM APP</span>
                </Link>
            </div>

            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-2 tracking-tight text-navy-900">Agendar Cita</h1>
                    <p className="text-zinc-500 text-lg">Selecciona tu servicio y profesional preferido.</p>
                </div>

                <div className="bg-white rounded-[2rem] p-6 md:p-10 shadow-xl border border-white/50">
                    <BookingWizard />
                </div>
            </div>
        </main>
    )
}
