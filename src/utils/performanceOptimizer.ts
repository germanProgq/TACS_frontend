interface DeviceCapabilities {
  tier: 'low' | 'medium' | 'high' | 'ultra'
  maxFPS: number
  supportedFeatures: {
    webGL: boolean
    webGL2: boolean
    animations: boolean
    particles: boolean
    shadows: boolean
    postProcessing: boolean
  }
  memoryLimit: number
  concurrency: number
}

interface PerformanceConfig {
  animations: {
    enabled: boolean
    complexity: 'minimal' | 'standard' | 'enhanced' | 'ultra'
    frameRate: number
  }
  rendering: {
    quality: 'low' | 'medium' | 'high' | 'ultra'
    shadows: boolean
    antialiasing: boolean
    particles: number
  }
  interactions: {
    responsiveness: 'fast' | 'standard' | 'smooth'
    effects: boolean
  }
}

class PerformanceOptimizer {
  private capabilities: DeviceCapabilities
  private config: PerformanceConfig
  private frameTime: number[] = []
  private lastFrameTime = performance.now()

  constructor() {
    this.capabilities = this.detectDeviceCapabilities()
    this.config = this.generateOptimalConfig()
    this.startPerformanceMonitoring()
  }

  private detectDeviceCapabilities(): DeviceCapabilities {
    // CPU Detection
    const cores = navigator.hardwareConcurrency || 4
    
    // Memory Detection
    const memory = (navigator as { deviceMemory?: number }).deviceMemory || 4
    
    // GPU Detection
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    const gl2 = canvas.getContext('webgl2')
    
    let gpuTier = 'medium'
    if (gl) {
      const renderer = (gl as WebGLRenderingContext).getParameter((gl as WebGLRenderingContext).RENDERER)
      
      // High-end GPU detection
      if (renderer.includes('RTX') || renderer.includes('GTX 1080') || 
          renderer.includes('RX 6') || renderer.includes('M1') ||
          renderer.includes('M2') || renderer.includes('A15') ||
          renderer.includes('A16') || renderer.includes('A17')) {
        gpuTier = 'ultra'
      } else if (renderer.includes('GTX') || renderer.includes('RX') ||
                 renderer.includes('Intel Iris') || renderer.includes('Mali-G')) {
        gpuTier = 'high'
      } else if (renderer.includes('Intel HD') || renderer.includes('Adreno')) {
        gpuTier = 'medium'
      } else {
        gpuTier = 'low'
      }
    }

    // Device Type Detection
    const userAgent = navigator.userAgent
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)
    const isTablet = /iPad|Android.*Tablet/i.test(userAgent)
    const isLowEnd = memory < 4 || cores < 4

    // Battery Level (if available) - Properly handle getBattery API
    try {
      if ('getBattery' in navigator && typeof (navigator as { getBattery?: () => Promise<{ level: number }> }).getBattery === 'function') {
        (navigator as { getBattery: () => Promise<{ level: number }> }).getBattery().then(() => {
          // Future: Could implement battery-based optimizations
        }).catch(() => {
          // Battery API access denied or not available
        })
      }
    } catch (error) {
      // Battery API not supported in this environment
      console.debug('Battery API not available:', error)
    }

    // Determine overall tier
    let tier: DeviceCapabilities['tier'] = 'medium'
    
    if (isMobile && isLowEnd) {
      tier = 'low'
    } else if ((isMobile || isTablet) && !isLowEnd) {
      tier = 'medium'
    } else if (!isMobile && memory >= 8 && cores >= 8 && gpuTier === 'ultra') {
      tier = 'ultra'
    } else if (!isMobile && memory >= 6 && cores >= 6) {
      tier = 'high'
    }

    return {
      tier,
      maxFPS: tier === 'low' ? 30 : tier === 'medium' ? 60 : tier === 'high' ? 120 : 144,
      supportedFeatures: {
        webGL: !!gl,
        webGL2: !!gl2,
        animations: tier !== 'low',
        particles: tier === 'high' || tier === 'ultra',
        shadows: tier === 'high' || tier === 'ultra',
        postProcessing: tier === 'ultra'
      },
      memoryLimit: memory * 1024, // MB to approximate limit
      concurrency: cores
    }
  }

  private generateOptimalConfig(): PerformanceConfig {
    const { tier, supportedFeatures } = this.capabilities

    switch (tier) {
      case 'low':
        return {
          animations: {
            enabled: false,
            complexity: 'minimal',
            frameRate: 30
          },
          rendering: {
            quality: 'low',
            shadows: false,
            antialiasing: false,
            particles: 10
          },
          interactions: {
            responsiveness: 'fast',
            effects: false
          }
        }
      
      case 'medium':
        return {
          animations: {
            enabled: true,
            complexity: 'standard',
            frameRate: 60
          },
          rendering: {
            quality: 'medium',
            shadows: false,
            antialiasing: true,
            particles: 50
          },
          interactions: {
            responsiveness: 'standard',
            effects: true
          }
        }
      
      case 'high':
        return {
          animations: {
            enabled: true,
            complexity: 'enhanced',
            frameRate: 120
          },
          rendering: {
            quality: 'high',
            shadows: supportedFeatures.shadows,
            antialiasing: true,
            particles: 200
          },
          interactions: {
            responsiveness: 'smooth',
            effects: true
          }
        }
      
      case 'ultra':
        return {
          animations: {
            enabled: true,
            complexity: 'ultra',
            frameRate: 144
          },
          rendering: {
            quality: 'ultra',
            shadows: true,
            antialiasing: true,
            particles: 500
          },
          interactions: {
            responsiveness: 'smooth',
            effects: true
          }
        }
    }
  }

  private startPerformanceMonitoring() {
    const monitor = () => {
      const currentTime = performance.now()
      const deltaTime = currentTime - this.lastFrameTime
      this.lastFrameTime = currentTime

      this.frameTime.push(deltaTime)
      if (this.frameTime.length > 60) {
        this.frameTime.shift()
      }

      // Adaptive quality adjustment
      const avgFrameTime = this.frameTime.reduce((a, b) => a + b, 0) / this.frameTime.length
      const currentFPS = 1000 / avgFrameTime

      if (currentFPS < this.config.animations.frameRate * 0.8) {
        this.reduceQuality()
      } else if (currentFPS > this.config.animations.frameRate * 1.2 && this.capabilities.tier !== 'low') {
        this.increaseQuality()
      }

      requestAnimationFrame(monitor)
    }
    requestAnimationFrame(monitor)
  }

  private reduceQuality() {
    if (this.config.rendering.particles > 10) {
      this.config.rendering.particles *= 0.8
    }
    if (this.config.animations.complexity === 'ultra') {
      this.config.animations.complexity = 'enhanced'
    } else if (this.config.animations.complexity === 'enhanced') {
      this.config.animations.complexity = 'standard'
    }
  }

  private increaseQuality() {
    if (this.config.rendering.particles < 500 && this.capabilities.tier === 'ultra') {
      this.config.rendering.particles *= 1.1
    }
  }

  getCapabilities(): DeviceCapabilities {
    return this.capabilities
  }

  getConfig(): PerformanceConfig {
    return this.config
  }

  getCurrentFPS(): number {
    if (this.frameTime.length === 0) return 60
    const avgFrameTime = this.frameTime.reduce((a, b) => a + b, 0) / this.frameTime.length
    return Math.round(1000 / avgFrameTime)
  }

  // CSS Custom Properties for performance-based styling
  applyCSSVariables() {
    const root = document.documentElement
    const { tier } = this.capabilities
    const { animations, rendering } = this.config

    root.style.setProperty('--animation-speed', animations.complexity === 'minimal' ? '0.1s' : 
                          animations.complexity === 'standard' ? '0.3s' : 
                          animations.complexity === 'enhanced' ? '0.5s' : '0.8s')
    
    root.style.setProperty('--particle-count', rendering.particles.toString())
    root.style.setProperty('--device-tier', tier)
    root.style.setProperty('--blur-quality', rendering.quality === 'low' ? '2px' : 
                          rendering.quality === 'medium' ? '5px' : 
                          rendering.quality === 'high' ? '10px' : '15px')
  }

  // Intersection Observer for scroll animations
  createScrollObserver(callback: (entries: IntersectionObserverEntry[]) => void) {
    const options = {
      threshold: this.capabilities.tier === 'low' ? 0.5 : 0.1,
      rootMargin: this.capabilities.tier === 'low' ? '50px' : '100px'
    }
    
    return new IntersectionObserver(callback, options)
  }

  // Debounced event handlers based on device capability
  getEventDelay(): number {
    switch (this.capabilities.tier) {
      case 'low': return 150
      case 'medium': return 100
      case 'high': return 50
      case 'ultra': return 16
    }
  }
}

export default PerformanceOptimizer
export type { DeviceCapabilities, PerformanceConfig }