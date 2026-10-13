import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

import { darkColors, lightColors } from './theme'

const rgb = (hex: string) => [1, 3, 5].map((index) => parseInt(hex.slice(index, index + 2), 16) / 255)
const luminance = (color: number[]) => {
  const linear = color.map((value) => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4)
  return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722
}
const ratio = (a: number[], b: number[]) => {
  const x = luminance(a)
  const y = luminance(b)
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)
}
const blend = (foreground: number[], background: number[], alpha: number) =>
  foreground.map((value, index) => value * alpha + background[index] * (1 - alpha))

describe.each([['light', lightColors], ['dark', darkColors]] as const)('%s theme', (mode, palette) => {
  it('keeps text, secondary labels, and semantic accents readable on every surface', () => {
    for (const surface of ['ink', 'panel', 'panelRaised'] as const) {
      for (const label of ['text', 'haze', 'sky', 'warn', 'critical'] as const) {
        expect(ratio(rgb(palette[label]), rgb(palette[surface])), `${label} on ${surface}`).toBeGreaterThanOrEqual(4.5)
      }
    }
  })

  it('keeps primary button text and course cover labels readable', () => {
    expect(ratio(rgb(palette.onSignal), rgb(palette.signal))).toBeGreaterThanOrEqual(4.5)
    for (const surface of ['panel', 'panelRaised'] as const) {
      expect(ratio(rgb(palette.onSignal), blend(rgb(palette.signal), rgb(palette[surface]), 0.95))).toBeGreaterThanOrEqual(4.5)
    }
    for (const type of ['course', 'workshop'] as const) {
      expect(ratio(rgb(palette[`${type}CoverText`]), rgb(palette[`${type}Cover`]))).toBeGreaterThanOrEqual(4.5)
      expect(ratio(rgb(palette[`${type}CoverMuted`]), rgb(palette[`${type}Cover`]))).toBeGreaterThanOrEqual(4.5)
    }
  })

  it('keeps small badge labels readable on their tinted surfaces', () => {
    for (const label of ['sky', 'warn', 'critical'] as const) {
      const foreground = rgb(palette[label])
      const background = blend(foreground, rgb(palette.panelRaised), 0.1)
      expect(ratio(foreground, background), label).toBeGreaterThanOrEqual(4.5)
    }
  })

  it('keeps the stylesheet and chart palette in sync', () => {
    const css = readFileSync('src/index.css', 'utf8')
    const block = mode === 'light' ? css.match(/@theme\s*\{([^}]+)\}/)?.[1]
      : css.match(/:root\[data-theme='dark'\]\s*\{([^}]+)\}/)?.[1]
    expect(block).toBeTruthy()
    for (const [key, value] of Object.entries(palette)) {
      const token = key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)
      expect(block?.toLowerCase()).toContain(`--color-${token}: ${value.toLowerCase()};`)
    }
  })
})
