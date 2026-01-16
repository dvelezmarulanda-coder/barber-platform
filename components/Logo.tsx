import Image from 'next/image'

interface LogoProps {
    className?: string
    size?: 'sm' | 'md' | 'lg'
}

export default function Logo({ className = '', size = 'md' }: LogoProps) {
    // Dimensiones basadas en el tamaño solicitado
    const dimensions = {
        sm: { width: 32, height: 32, text: 'text-xl' },
        md: { width: 48, height: 48, text: 'text-2xl' },
        lg: { width: 80, height: 80, text: 'text-4xl' }
    }

    const { width, height, text } = dimensions[size]

    return (
        <div className={`flex items-center gap-3 ${className}`}>
            <div className="relative overflow-hidden rounded-full border-2 border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                <Image
                    src="/logo.jpg"
                    alt="TRIM APP Logo"
                    width={width}
                    height={height}
                    className="object-cover"
                />
            </div>
            <div className={`font-bold tracking-tight ${text} text-white`}>
                TRIM <span className="font-light opacity-80">APP</span>
            </div>
        </div>
    )
}
