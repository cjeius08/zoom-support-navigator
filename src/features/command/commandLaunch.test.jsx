import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { FAQ_ITEMS } from '../../data/supportReference'
import { hostFaqItems } from '../../data/hostExperience'
import { Navigator } from '../navigator/Navigator'

describe('Batch 10 — direct command launch into approved support UI',()=>{
  it('opens the exact Host guided route and consumes the launch once', async()=>{
    const onCommandConsumed=vi.fn()
    const { container }=render(<Navigator commandLaunch={{kind:'host',id:'host-controls-missing',role:'Host'}}
      onCommandConsumed={onCommandConsumed} />)
    await waitFor(()=>expect(screen.getByRole('dialog',{name:'Host controls are missing'})).toBeInTheDocument())
    expect(onCommandConsumed).toHaveBeenCalledTimes(1)
    expect(container.querySelector('.host-support-drawer')).toBeInTheDocument()
  })

  it('opens the exact Host-safe FAQ first without removing any other approved answers', async()=>{
    const selected=hostFaqItems(FAQ_ITEMS)[0]
    const onCommandConsumed=vi.fn()
    const { container }=render(<Navigator commandLaunch={{kind:'faq',id:selected.label,role:'Host'}}
      onCommandConsumed={onCommandConsumed} />)
    await waitFor(()=>expect(screen.getByRole('heading',{name:'Host / Arbitrator FAQ'})).toBeInTheDocument())
    const first=container.querySelector('.support-reference-grid article')
    expect(first.querySelector('h3')).toHaveTextContent(selected.label)
    expect(first).toHaveClass('faq-command-target')
    expect(first).toHaveTextContent(selected.answer)
    expect(container.querySelectorAll('.support-reference-grid article')).toHaveLength(hostFaqItems(FAQ_ITEMS).length)
    expect(onCommandConsumed).toHaveBeenCalledTimes(1)
  })

  it('refuses to open a Participant-only route under Host role',()=>{
    const onCommandConsumed=vi.fn()
    render(<Navigator commandLaunch={{kind:'issue',id:'waiting-entry',role:'Host'}}
      onCommandConsumed={onCommandConsumed} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(onCommandConsumed).toHaveBeenCalledTimes(1)
  })
})
