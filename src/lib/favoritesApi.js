import { supabase } from './supabaseClient'

function normalizeFavorite(row) {
  return {
    itemType: row.item_type,
    itemId: row.item_id,
    createdAt: row.created_at,
  }
}

export async function loadFavorites(userId) {
  if (!supabase || !userId) return []

  const { data, error } = await supabase
    .from('zoom_favorites')
    .select('item_type,item_id,created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data || []).map(normalizeFavorite)
}

export async function saveFavorite(userId, itemType, itemId) {
  if (!supabase) throw new Error('Favorites are unavailable because Supabase is not configured.')

  const { data, error } = await supabase
    .from('zoom_favorites')
    .insert({
      user_id: userId,
      item_type: itemType,
      item_id: itemId,
    })
    .select('item_type,item_id,created_at')
    .single()

  if (error) throw error
  return normalizeFavorite(data)
}

export async function deleteFavorite(userId, itemType, itemId) {
  if (!supabase) throw new Error('Favorites are unavailable because Supabase is not configured.')

  const { error } = await supabase
    .from('zoom_favorites')
    .delete()
    .eq('user_id', userId)
    .eq('item_type', itemType)
    .eq('item_id', itemId)

  if (error) throw error
}
