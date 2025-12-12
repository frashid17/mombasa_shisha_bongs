import Image from 'next/image'
import Link from 'next/link'

interface LogoProps {
  className?: string
  width?: number
  height?: number
  showText?: boolean
}

export default function Logo({ className = '', width = 40, height = 40, showText = true }: LogoProps) {
  return (
    <Link href="/" className={`flex items-center gap-3 ${className}`}>
      {/* Check if logo.png exists, otherwise show placeholder */}
      <div className="relative">
        <Image
          src="/logo.png"
          alt="Mombasa Shisha Bongs Logo"
          width={width}
          height={height}
          className="object-contain"
          priority
          onError={(e) => {
            // Fallback if image fails to load
            const target = e.target as HTMLImageElement
            target.style.display = 'none'
            if (target.parentElement) {
              const fallback = document.createElement('div')
              fallback.className = `w-[${width}px] h-[${height}px] bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-xs`
              fallback.textContent = 'MSB'
              target.parentElement.appendChild(fallback)
            }
          }}
        />
      </div>
      {showText && (
        <span className="text-2xl font-bold text-white hover:text-blue-400 transition">
          Mombasa Shisha
        </span>
      )}
    </Link>
  )
}

