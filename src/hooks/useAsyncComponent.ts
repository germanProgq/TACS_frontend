import { useState } from 'react'
import React from 'react'

export const useAsyncComponent = <T extends Record<string, unknown>>(
  importFunc: () => Promise<{ default: React.ComponentType<T> }>,
  fallback?: React.ComponentType
) => {
  const [Component, setComponent] = useState<React.ComponentType<T> | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const loadComponent = async () => {
    if (Component || loading) return

    setLoading(true)
    try {
      const module = await importFunc()
      setComponent(() => module.default)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }

  return {
    Component: Component || fallback || null,
    loading,
    error,
    loadComponent
  }
}