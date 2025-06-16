import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useTheme } from '../contexts/ThemeContext'

interface OptimizedImageProps {
  src: string
  alt: string
  className?: string
  width?: number
  height?: number
  priority?: boolean
  onLoad?: () => void
  placeholder?: string
}

export const OptimizedImage = ({
  src,
  alt,
  className = '',
  width,
  height,
  priority = false,
  onLoad,
  placeholder = 'data:image/svg+xml,%3Csvg width="1" height="1" xmlns="http://www.w3.org/2000/svg"%3E%3Crect width="1" height="1" fill="%23333"%2F%3E%3C/svg%3E'
}: OptimizedImageProps) => {
  const [loaded, setLoaded] = useState(false)
  const [inView, setInView] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const { resolvedTheme } = useTheme()
  const getPlaceholderBg = () => resolvedTheme === 'light' ? '#e5e7eb' : '#111'

  useEffect(() => {
    if (priority) {
      setInView(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setInView(true)
            observer.disconnect()
          }
        })
      },
      {
        rootMargin: '50px',
        threshold: 0.01
      }
    )

    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => observer.disconnect()
  }, [priority])

  useEffect(() => {
    if (!inView || !imgRef.current) return

    const img = new Image()
    img.src = src
    img.onload = () => {
      setLoaded(true)
      if (onLoad) onLoad()
    }
  }, [inView, src, onLoad])

  return (
    <div
      ref={containerRef}
      className={`optimized-image-container ${className}`}
      style={{
        width: width ? `${width}px` : '100%',
        height: height ? `${height}px` : 'auto',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: getPlaceholderBg()
      }}
    >
      {/* Placeholder */}
      {!loaded && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: getPlaceholderBg(),
            backgroundImage: `url(${placeholder})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(20px)',
            transform: 'scale(1.1)'
          }}
        >
          <div className="loading-shimmer" />
        </div>
      )}

      {/* Actual image */}
      {inView && (
        <motion.img
          ref={imgRef}
          src={src}
          alt={alt}
          width={width}
          height={height}
          initial={{ opacity: 0 }}
          animate={{ opacity: loaded ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
        />
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .loading-shimmer {
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.1),
            transparent
          );
          animation: shimmer 1.5s infinite;
        }

        @keyframes shimmer {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(200%);
          }
        }
      ` }} />
    </div>
  )
}

