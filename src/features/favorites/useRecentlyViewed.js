import { useCallback, useEffect, useState } from 'react'
import { clearRecentlyViewed, loadRecentlyViewed, recordRecentView } from '../../lib/recentlyViewedApi'

export function useRecentlyViewed(userId) {
  const [recentlyViewed, setRecentlyViewed] = useState([])
  const [loading, setLoading] = useState(false)
  const [clearing, setClearing] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let live = true

    if (!userId) {
      setRecentlyViewed([])
      setLoading(false)
      setClearing(false)
      setError('')
      return undefined
    }

    setLoading(true)
    setError('')

    loadRecentlyViewed(userId)
      .then(items => {
        if (live) setRecentlyViewed(items)
      })
      .catch(loadError => {
        if (live) setError(loadError?.message || 'Could not load Recently Viewed.')
      })
      .finally(() => {
        if (live) setLoading(false)
      })

    return () => {
      live = false
    }
  }, [userId])

  const rememberRecentView = useCallback(async (itemType, itemId) => {
    if (!userId || !itemType || !itemId) return

    const viewedAt = new Date().toISOString()
    setRecentlyViewed(current => [
      { itemType, itemId, viewedAt },
      ...current.filter(item => !(item.itemType === itemType && item.itemId === itemId)),
    ].slice(0, 8))
    setError('')

    try {
      await recordRecentView(itemType, itemId)
    } catch (recordError) {
      setError(recordError?.message || 'Could not update Recently Viewed.')
      try {
        setRecentlyViewed(await loadRecentlyViewed(userId))
      } catch {
        // Keep the optimistic list visible if the recovery fetch also fails.
      }
    }
  }, [userId])

  const clearRecentViews = useCallback(async () => {
    if (!userId || clearing) return

    const previous = recentlyViewed
    setRecentlyViewed([])
    setClearing(true)
    setError('')

    try {
      await clearRecentlyViewed(userId)
    } catch (clearError) {
      setRecentlyViewed(previous)
      setError(clearError?.message || 'Could not clear Recently Viewed.')
    } finally {
      setClearing(false)
    }
  }, [clearing, recentlyViewed, userId])

  return {
    recentlyViewed,
    loading,
    clearing,
    error,
    rememberRecentView,
    clearRecentViews,
  }
}
