import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { FAQ_ITEMS } from '../../data/supportReference'
import { hostFaqItems, hostProcesses } from '../../data/hostExperience'
import { PROCESSES } from '../../data/processes'
import { AppShell } from '../shell/AppShell'
import { CommandCenter } from './CommandCenter'
import { commandQuickLinks, commandResults, findCommandPage } from './commandSearch'

describe('Ozzie Batch 10 — source-backed universal Command Center', () => {
  it('returns a working Host guide for no host controls, not Participant-only routes', () => {
    const results = commandResults('no host controls', { role: 'Host' })
    expect(results.some(item => item.kind === 'host' && item.id === 'host-controls-missing')).toBe(true)
    expect(results.some(item => item.kind === 'issue')).toBe(false)
    expect(results.filter(item => item.kind === 'process').every(item => hostProcesses(PROCESSES).some(p => p.id === item.id))).toBe(true)
  })

  it('changes corpus with explicit caller role, keeping Host-only guides away from Participant', () => {
    const participant = commandResults('waiting for host', { role: 'Participant' })
    expect(participant.some(item => item.kind === 'issue')).toBe(true)
    expect(participant.some(item => ['host','roadblock'].includes(item.kind))).toBe(false)
    const host = commandResults('waiting room', { role: 'Host' })
    expect(host.some(item => item.kind === 'issue')).toBe(false)
    const faqHost = hostFaqItems(FAQ_ITEMS)
    expect(commandResults('Login Credentials', { role: 'Host' }).filter(x => x.kind === 'faq').every(x => faqHost.some(item => item.label === x.id))).toBe(true)
  })

  it('never leaks Admin navigation into Agent or Lead search', () => {
    expect(findCommandPage('team', false)).toBeNull()
    expect(findCommandPage('usage', false)).toBeNull()
    expect(commandQuickLinks(false).some(item => item.id === 'team')).toBe(false)
    expect(commandResults('team management', { isAdmin: false }).some(item => item.id === 'team')).toBe(false)
    expect(commandResults('team management', { isAdmin: true }).some(item => item.id === 'team')).toBe(true)
    expect(findCommandPage('team', true)).toEqual(expect.objectContaining({kind:'page',id:'team'}))
  })

  it('opens correct selected result with Enter and keeps arrow selection synced', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    const onClose = vi.fn()
    render(<CommandCenter onSelect={onSelect} onClose={onClose}/>)
    const input = screen.getByRole('combobox',{name:'Search Ozzie commands and approved guides'})
    expect(input).toHaveFocus()
    await user.type(input, 'no host controls')
    const list = screen.getByRole('listbox',{name:'Command Center results'})
    const options = within(list).getAllByRole('option')
    expect(options.length).toBeGreaterThan(0)
    expect(options[0]).toHaveAttribute('aria-selected','true')
    await user.keyboard('{ArrowDown}')
    expect(options[1]).toHaveAttribute('aria-selected','true')
    await user.keyboard('{ArrowUp}')
    expect(options[0]).toHaveAttribute('aria-selected','true')
    await user.keyboard('{Enter}')
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({
      kind: 'host', id: 'host-controls-missing', role: 'Host',
    }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('offers role selection, opens exact approved FAQ, and closes on Escape', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    const onClose = vi.fn()
    render(<CommandCenter onSelect={onSelect} onClose={onClose}/>)
    const participantButton = screen.getByRole('button',{name:'Participant'})
    await user.click(participantButton)
    expect(participantButton).toHaveAttribute('aria-pressed','true')
    await user.type(screen.getByRole('combobox'), 'Recording')
    const faqOption = screen.getAllByRole('option').find(x => x.textContent.includes('Recording'))
    expect(faqOption).toBeDefined()
    await user.click(faqOption)
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({kind:'faq',id:'Recording',role:'Participant'}))
    fireEvent.keyDown(document,{key:'Escape'})
    expect(onClose).toHaveBeenCalled()
  })

  it('opens Command Center from anywhere via Ctrl+K and header Search Ozzie', async () => {
    const user = userEvent.setup()
    const onDashboardSearch = vi.fn()
    render(<AppShell profile={{username:'member',role:'agent',initials:'ME'}} currentView="training"
      onDashboardSearch={onDashboardSearch}/>)
    fireEvent.keyDown(document,{key:'k',ctrlKey:true})
    expect(onDashboardSearch).toHaveBeenCalledTimes(1)
    await user.click(screen.getByRole('button',{name:'Search Ozzie'}))
    expect(onDashboardSearch).toHaveBeenCalledTimes(2)
  })
})
