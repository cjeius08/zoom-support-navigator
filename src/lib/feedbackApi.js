import { supabase } from './supabaseClient'
export async function submitFeedback(payload) { const { data: session } = await supabase.auth.getSession(); const userId = session.session?.user.id; if (!userId) throw new Error('You must be signed in.'); const { error } = await supabase.from('zoom_feedback_reports').insert({ reporter_user_id:userId, ...payload }); if (error) throw error }
