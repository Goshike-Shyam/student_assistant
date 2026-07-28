import Image from 'next/image'

interface AppLogoProps {
  size: number
  alt?: string
  className?: string
  priority?: boolean
  ariaHidden?: boolean
}

export function AppLogo({
  size,
  alt = 'Veda AI — Student Assistant',
  className,
  priority = false,
  ariaHidden = false,
}: AppLogoProps) {
  const mergedClassName = ['object-contain h-auto w-auto', className].filter(Boolean).join(' ')

  return (
    <Image
      src="/veda-ai-logo.png"
      alt={alt}
      width={size}
      height={size}
      className={mergedClassName}
      priority={priority}
      aria-hidden={ariaHidden}
    />
  )
}
