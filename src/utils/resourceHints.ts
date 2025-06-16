// DNS prefetch for external domains
export const dnsPrefetch = (domains: string[]) => {
  domains.forEach(domain => {
    const link = document.createElement('link')
    link.rel = 'dns-prefetch'
    link.href = domain
    document.head.appendChild(link)
  })
}

// Preload critical fonts
export const preloadFonts = (fonts: { url: string; format: string }[]) => {
  fonts.forEach(({ url, format }) => {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.href = url
    link.as = 'font'
    link.type = `font/${format}`
    link.crossOrigin = 'anonymous'
    document.head.appendChild(link)
  })
}

// Resource cleanup
export const cleanupResourceHints = () => {
  const hints = document.querySelectorAll('link[rel="prefetch"], link[rel="preconnect"], link[rel="dns-prefetch"]')
  hints.forEach(hint => hint.remove())
}