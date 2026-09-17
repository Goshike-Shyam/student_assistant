'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

interface ParentChild {
  id: string
  name: string
  grade?: string
  board?: string
  subjects?: string[]
  loginStreak?: number
  lastLogin?: string | null
  queryCount?: number
  practiceCount?: number
  avgScore?: number
  flaggedCount?: number
}

interface ParentDashboardData {
  parentName: string
  familyCode?: string | null
  children: ParentChild[]
}

export function useParentDashboard() {
  const [data, setData] = useState<ParentDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    fetch('/api/parent/dashboard', { cache: 'no-store' })
      .then((response) => {
        if (response.status === 401) {
          window.location.replace('/parent/login')
          return null
        }

        if (!response.ok) {
          throw new Error('Failed to load dashboard')
        }

        return response.json()
      })
      .then((payload) => {
        if (active && payload) {
          setData(payload)
          setError('')
        }
      })
      .catch(() => {
        if (active) {
          setError('Failed to load. Refresh.')
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [])

  return { data, loading, error }
}

export function useChildData<T = any>(endpoint: string) {
  const params = useSearchParams()
  const [children, setChildren] = useState<ParentChild[]>([])
  const [selectedChildId, setSelectedChildId] = useState('')
  const [childData, setChildData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [childrenLoaded, setChildrenLoaded] = useState(false)

  useEffect(() => {
    let active = true

    setLoading(true)
    setChildrenLoaded(false)

    fetch('/api/parent/dashboard', { cache: 'no-store' })
      .then((response) => {
        if (response.status === 401) {
          window.location.replace('/parent/login')
          return null
        }

        if (!response.ok) {
          throw new Error('Failed to load children')
        }

        return response.json()
      })
      .then((payload) => {
        if (!active || !payload) return

        const kids = Array.isArray(payload.children) ? payload.children : []
        setChildren(kids)

        const fromParam = params.get('child')
        setSelectedChildId((currentId) => {
          if (fromParam && kids.some((child: ParentChild) => child.id === fromParam)) {
            return String(fromParam)
          }

          if (currentId && kids.some((child: ParentChild) => child.id === currentId)) {
            return currentId
          }

          return kids[0]?.id ?? ''
        })
        setError('')
        setChildrenLoaded(true)
      })
      .catch(() => {
        if (active) {
          setChildren([])
          setError('Failed to load. Refresh.')
          setChildrenLoaded(true)
          setLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [params])

  useEffect(() => {
    let active = true

    if (!childrenLoaded) {
      return () => {
        active = false
      }
    }

    if (!selectedChildId) {
      setChildData(null)
      setLoading(false)
      return () => {
        active = false
      }
    }

    setLoading(true)
    setError('')

    fetch(`/api/parent/child/${selectedChildId}/${endpoint}`, { cache: 'no-store' })
      .then((response) => {
        if (response.status === 401) {
          window.location.replace('/parent/login')
          return null
        }

        if (!response.ok) {
          throw new Error('Failed to load child data')
        }

        return response.json()
      })
      .then((payload) => {
        if (active && payload) {
          setChildData(payload)
        }
      })
      .catch(() => {
        if (active) {
          setChildData(null)
          setError('Failed to load. Refresh.')
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [childrenLoaded, selectedChildId, endpoint])

  return {
    children,
    selectedChildId,
    setSelectedChildId,
    childData,
    loading,
    error,
  }
}