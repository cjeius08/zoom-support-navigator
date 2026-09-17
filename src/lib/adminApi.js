import { supabase } from './supabaseClient'

export async function loadTeam(){const {data,error}=await supabase.from('zoom_profiles').select('id,username,initials,role,status,avatar_id,created_at').order('created_at');if(error)throw error;return data||[]}
export async function loadUsage(){const [{data:events,error:eventError},{data:presence,error:presenceError}]=await Promise.all([supabase.from('zoom_usage_events').select('event_type,created_at,user_id').order('created_at',{ascending:false}).limit(200),supabase.from('zoom_presence').select('user_id,state,last_heartbeat')]);if(eventError)throw eventError;if(presenceError)throw presenceError;return {events:events||[],presence:presence||[]}}
export async function loadFeedback(){const {data,error}=await supabase.from('zoom_feedback_reports').select('id,type,status,page_label,process_id,what_noticed,suggested_change,created_at,reporter_user_id').order('created_at',{ascending:false});if(error)throw error;return data||[]}
