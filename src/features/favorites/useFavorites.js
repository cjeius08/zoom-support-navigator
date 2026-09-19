import { useCallback, useEffect, useMemo, useState } from 'react'
import { deleteFavorite, loadFavorites, saveFavorite } from '../../lib/favoritesApi'

function favoriteKey(itemType, itemId) {
  return `${itemType}:${itemId}`
}

export function useFavorites(userId) {
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [busyKeys, setBusyKeys] = useState(() => new Set())

  useEffect(() => {
    let live = true

    if (!userId) {
      setFavorites([])
      setLoading(false)
      setError('')
      setBusyKeys(new Set())
      return undefined
    }

    setLoading(true)
    setError('')

    loadFavorites(userId)
      .then(items => {
        if (live) setFavorites(items)
      })
      .catch(loadError => {
        if (live) setError(loadError?.message || 'Could not load Favorites.')
      })
      .finally(() => {
        if (live) setLoading(false)
      })

    return () => {
      live = false
    }
  }, [userId])

  const favoriteKeys = useMemo(
    () => new Set(favorites.map(item => favoriteKey(item.itemType, item.itemId))),
    [favorites],
  )

  const isFavorite = useCallback(
    (itemType, itemId) => favoriteKeys.has(favoriteKey(itemType, itemId)),
    [favoriteKeys],
  )

  const isFavoriteBusy = useCallback(
    (itemType, itemId) => busyKeys.has(favoriteKey(itemType, itemId)),
    [busyKeys],
  )

  const toggleFavorite = useCallback(async (itemType, itemId) => {
    if (!userId || !itemType || !itemId) return

    const key = favoriteKey(itemType, itemId)
    if (busyKeys.has(key)) return

    const active = favoriteKeys.has(key)
    setBusyKeys(current => new Set(current).add(key))
    setError('')

    try {
      if (active) {
        await deleteFavorite(userId, itemType, itemId)
        setFavorites(current => current.filter(item => favoriteKey(item.itemType, item.itemId) !== key))
      } else {
        const saved = await saveFavorite(userId, itemType, itemId)
        setFavorites(current => [
          saved,
          ...current.filter(item => favoriteKey(item.itemType, item.itemId) !== key),
        ])
      }
    } catch (toggleError) {
      setError(toggleError?.message || 'Could not update Favorites.')
    } finally {
      setBusyKeys(current => {
        const next = new Set(current)
        next.delete(key)
        return next
      })
    }
  }, [busyKeys, favoriteKeys, userId])

  return {
    favorites,
    loading,
    error,
    isFavorite,
    isFavoriteBusy,
    toggleFavorite,
  }
}
