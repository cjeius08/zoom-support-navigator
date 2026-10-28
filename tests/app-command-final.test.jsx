import {it,expect,vi} from 'vitest'
import {render,screen,fireEvent,waitFor} from '@testing-library/react'
import App from '../src/App'
const {noop}=vi.hoisted(()=>({noop:()=>{}}))
vi.mock('../src/lib/authApi',()=>({getCurrentProfile:async()=>({id:'synthetic',username:'qa',initials:'QA',role:'agent',ozzie_intro_seen_at:'2026-01-01'}),activateAccount:vi.fn(),changeOwnPassword:vi.fn(),loginWithUsername:vi.fn(),markOzzieIntroSeen:vi.fn(),signOut:vi.fn(),updateOwnAvatar:vi.fn()}))
vi.mock('../src/features/analytics/usePresence',()=>({useUsageTracking:()=>({trackEvent:noop})}))
vi.mock('../src/features/favorites/useFavorites',()=>({useFavorites:()=>({favorites:[],isFavorite:()=>false,isFavoriteBusy:()=>false,toggleFavorite:noop})}))
vi.mock('../src/features/favorites/useRecentlyViewed',()=>({useRecentlyViewed:()=>({recentlyViewed:[],rememberRecentView:noop,clearRecentViews:noop})}))
vi.mock('../src/lib/avatarLibraryApi',()=>({loadAvatarLibrary:async()=>[]}))
it('navigates from dashboard, revisits Hub, and opens another destination through App',async()=>{
 render(<App/>);await screen.findByRole('button',{name:'Search Ozzie'})
 async function select(q){fireEvent.click(screen.getByRole('button',{name:'Search Ozzie'}));fireEvent.change(screen.getByRole('combobox',{name:'Search Ozzie commands and approved guides'}),{target:{value:q}});fireEvent.click(screen.getAllByRole('option')[0])}
 await select('Reschedule hearing date');await waitFor(()=>expect(document.activeElement.id).toBe('flex-scheduling'));expect(document.activeElement.textContent).toMatch(/PMI link itself/)
 await select('Favorites');expect(await screen.findByRole('heading',{name:'My Quick Access',exact:true})).toBeInTheDocument()
 await select('Reschedule hearing date');await waitFor(()=>expect(document.activeElement.id).toBe('flex-scheduling'))
 await select('Reschedule hearing date');expect(document.getElementById('flex-scheduling')).toHaveTextContent('SAME PMI link')
},30000)
