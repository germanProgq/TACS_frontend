import type { DeviceCapabilities } from './performanceOptimizer'

interface ScrollOptimizationConfig {
  batchScrollEvents: boolean
  prefetchDistance: number
  unloadDistance: number
  keepComponentsLoaded: boolean
  throttleDelay: number
}

export class ScrollOptimizer {
  private config: ScrollOptimizationConfig
  private scrollListeners: Map<string, () => void> = new Map()
  private scrollTimer: number | null = null

  constructor(private deviceCapabilities: DeviceCapabilities) {
    this.config = this.generateOptimizationConfig()
  }

  private generateOptimizationConfig(): ScrollOptimizationConfig {
    const { tier } = this.deviceCapabilities

    switch (tier) {
      case 'low':
        return {
          batchScrollEvents: true,
          prefetchDistance: 50,
          unloadDistance: 300,
          keepComponentsLoaded: false,
          throttleDelay: 100
        }
      
      case 'medium':
        return {
          batchScrollEvents: true,
          prefetchDistance: 100,
          unloadDistance: 500,
          keepComponentsLoaded: false,
          throttleDelay: 50
        }
      
      case 'high':
        return {
          batchScrollEvents: false,
          prefetchDistance: 200,
          unloadDistance: 800,
          keepComponentsLoaded: true,
          throttleDelay: 16
        }
      
      case 'ultra':
        return {
          batchScrollEvents: false,
          prefetchDistance: 300,
          unloadDistance: 1000,
          keepComponentsLoaded: true,
          throttleDelay: 8
        }
    }
  }

  optimizeScrollHandler(callback: () => void, id: string): () => void {
    const { throttleDelay, batchScrollEvents } = this.config

    if (batchScrollEvents) {
      // Batch scroll events for low-end devices
      const batchedCallback = () => {
        if (this.scrollTimer) {
          clearTimeout(this.scrollTimer)
        }
        
        this.scrollTimer = setTimeout(() => {
          callback()
          this.scrollTimer = null
        }, throttleDelay)
      }
      
      this.scrollListeners.set(id, batchedCallback)
      return batchedCallback
    } else {
      // Use requestAnimationFrame for high-end devices
      let ticking = false
      const rafCallback = () => {
        if (!ticking) {
          requestAnimationFrame(() => {
            callback()
            ticking = false
          })
          ticking = true
        }
      }
      
      this.scrollListeners.set(id, rafCallback)
      return rafCallback
    }
  }

  getPrefetchThreshold(priority: 'low' | 'medium' | 'high' = 'medium'): number {
    const baseDistance = this.config.prefetchDistance
    
    switch (priority) {
      case 'high':
        return baseDistance * 1.5
      case 'medium':
        return baseDistance
      case 'low':
        return baseDistance * 0.5
    }
  }

  shouldKeepComponentLoaded(): boolean {
    return this.config.keepComponentsLoaded
  }

  getUnloadDistance(): number {
    return this.config.unloadDistance
  }

  // Memory cleanup for components that are far from viewport
  scheduleComponentCleanup(_componentId: string, callback: () => void) {
    if (!this.config.keepComponentsLoaded) {
      setTimeout(callback, 1000) // Cleanup after 1 second if not needed
    }
  }

  // Preload strategy based on scroll direction and speed
  getPreloadStrategy(scrollDirection: 'up' | 'down' | 'none', scrollSpeed: number) {
    const { tier } = this.deviceCapabilities
    
    if (tier === 'low') {
      return {
        aggressive: false,
        distance: this.config.prefetchDistance * 0.5,
        batchSize: 1
      }
    }

    const isSlowScroll = scrollSpeed < 0.5
    const isFastScroll = scrollSpeed > 2

    if (isFastScroll && (tier === 'high' || tier === 'ultra')) {
      return {
        aggressive: true,
        distance: this.config.prefetchDistance * 2,
        batchSize: scrollDirection === 'down' ? 3 : 2
      }
    }

    return {
      aggressive: false,
      distance: this.config.prefetchDistance,
      batchSize: isSlowScroll ? 1 : 2
    }
  }

  cleanup() {
    if (this.scrollTimer) {
      clearTimeout(this.scrollTimer)
    }
    this.scrollListeners.clear()
  }
}

export default ScrollOptimizer