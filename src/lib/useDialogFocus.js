import { useEffect, useRef } from 'react'

let pageScrollLockCount = 0
let previousRootOverflow = ''

function lockPageScroll() {
  if (pageScrollLockCount === 0) {
    previousRootOverflow = document.documentElement.style.overflow
    document.documentElement.style.overflow = 'hidden'
  }
  pageScrollLockCount += 1
}

function unlockPageScroll() {
  pageScrollLockCount = Math.max(0, pageScrollLockCount - 1)
  if (pageScrollLockCount === 0) {
    document.documentElement.style.overflow = previousRootOverflow
    previousRootOverflow = ''
  }
}

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

function getFocusableElements(dialog) {
  return Array.from(dialog.querySelectorAll(FOCUSABLE_SELECTOR))
    .filter(element => element.getAttribute('aria-hidden') !== 'true')
}

export function useDialogFocus(dialogRef, open, onClose) {
  const closeRef = useRef(onClose)
  closeRef.current = onClose

  useEffect(() => {
    if (!open) return undefined

    const dialog = dialogRef.current
    if (!dialog) return undefined

    const previousFocus = document.activeElement
    lockPageScroll()
    const first = getFocusableElements(dialog)[0]
    ;(first ?? dialog).focus()

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        event.preventDefault()
        closeRef.current?.()
        return
      }

      if (event.key !== 'Tab') return

      const focusable = getFocusableElements(dialog)
      if (!focusable.length) {
        event.preventDefault()
        dialog.focus()
        return
      }

      const firstItem = focusable[0]
      const lastItem = focusable[focusable.length - 1]
      const active = document.activeElement

      if (event.shiftKey && (active === firstItem || !dialog.contains(active))) {
        event.preventDefault()
        lastItem.focus()
      } else if (!event.shiftKey && (active === lastItem || !dialog.contains(active))) {
        event.preventDefault()
        firstItem.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      unlockPageScroll()
      if (previousFocus?.isConnected && typeof previousFocus.focus === 'function') previousFocus.focus()
    }
  }, [dialogRef, open])
}
