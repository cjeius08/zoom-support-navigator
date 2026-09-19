import { supabase } from './supabaseClient'

function normalizeRecentView(row) {
  return {
    itemType: row.item_type,
    itemId: row.item_id,
    viewedAt: row.viewed_at,
  }
}

export async function loadRecentlyViewed(userId) {
  if (!supabase || !userId) return []

  const { data, error } = await supabase
    .from('zoom_recently_viewed')
    .select('item_type,item_id,viewed_at')
    .eq('user_id', userId)
    .order('viewed_at', { ascending: false })
    .limit(8)

  if (error) throw error
  return (data || []).map(normalizeRecentView)
}

export async function recordRecentView(itemType, itemId) {
  if (!supabase) throw new Error('Recently Viewed is unavailable because Supabase is not configured.')

  const { error } = await supabase.rpc('zoom_record_recent_view', {
    p_item_type: itemType,
    p_item_id: itemId,
  })

  if (error) throw error
}

export async function clearRecentlyViewed(userId) {
  if (!supabase || !userId) return

  const { error } = await supabase
    .from('zoom_recently_viewed')
    .delete()
    .eq('user_id', userId)

  if (error) throw error
}
