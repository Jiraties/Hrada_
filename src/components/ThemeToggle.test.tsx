/** @vitest-environment jsdom */
import { readFileSync } from 'node:fs'

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { useLocaleStore } from '@/lib/i18n'
import { readSavedTheme, useTheme } from '@/store/theme'

import { ThemeToggle } from './ThemeToggle'

const bootstrap = readFileSync('index.html', 'utf8').match(/<script>([\s\S]*?)<\/script>/)?.[1]

describe('theme preference', () => {
  beforeEach(() => {
    window.localStorage.clear()
    useLocaleStore.getState().setLocale('en')
    useTheme.getState().setTheme('light')
  })
  afterEach(cleanup)

  it('defaults to light and ignores an invalid saved preference', () => {
    window.localStorage.removeItem('hrada-theme')
    expect(readSavedTheme()).toBe('light')
    window.localStorage.setItem('hrada-theme', 'invalid')
    expect(readSavedTheme()).toBe('light')
  })

  it('toggles the document and saves the choice for the next visit', () => {
    render(<ThemeToggle />)
    fireEvent.click(screen.getByRole('button', { name: 'Switch to dark mode' }))
    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(readSavedTheme()).toBe('dark')
    expect(screen.getByRole('button', { name: 'Switch to light mode' }).getAttribute('aria-pressed')).toBe('true')

    // The pre-paint script must use the same preference as the rendered app.
    expect(bootstrap).toBeTruthy()
    document.documentElement.dataset.theme = 'light'
    new Function(bootstrap!)()
    expect(document.documentElement.dataset.theme).toBe('dark')

    fireEvent.click(screen.getByRole('button', { name: 'Switch to light mode' }))
    expect(document.documentElement.dataset.theme).toBe('light')
    expect(readSavedTheme()).toBe('light')
  })

  it('still switches modes when browser storage is blocked', () => {
    const descriptor = Object.getOwnPropertyDescriptor(window, 'localStorage')!
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      get: () => { throw new Error('Storage blocked') },
    })
    try {
      expect(readSavedTheme()).toBe('light')
      render(<ThemeToggle />)
      fireEvent.click(screen.getByRole('button', { name: 'Switch to dark mode' }))
      expect(document.documentElement.dataset.theme).toBe('dark')
      expect(useTheme.getState().theme).toBe('dark')
    } finally {
      Object.defineProperty(window, 'localStorage', descriptor)
      useTheme.getState().setTheme('light')
    }
  })
})
