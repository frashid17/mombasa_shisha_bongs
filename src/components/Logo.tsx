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
      <Image
        src="/logo.png"
        alt="Mombasa Shisha Bongs Logo"
        width={width}
        height={height}
        className="object-contain"
        priority
      />
      {showText && (
        <span className="text-2xl font-bold text-white hover:text-blue-400 transition">
          Mombasa Shisha
        </span>
      )}
    </Link>
  )
}

