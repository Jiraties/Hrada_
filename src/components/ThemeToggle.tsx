import { Moon, Sun } from 'lucide-react'

import { useT } from '@/lib/i18n'
import { useTheme } from '@/store/theme'

export const ThemeToggle = () => {
  const t = useT()
  const theme = useTheme((state) => state.theme)
  const setTheme = useTheme((state) => state.setTheme)
  const label = t(theme === 'light' ? 'theme.switchDark' : 'theme.switchLight')
  const Icon = theme === 'light' ? Moon : Sun

  return (
    <button
      type="button"
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      aria-label={label}
      aria-pressed={theme === 'dark'}
      title={label}
      className="grid size-9 shrink-0 place-items-center rounded-lg border border-line bg-panel text-haze transition-colors duration-150 hover:bg-panel-raised hover:text-text pointer-coarse:size-11"
    >
      <Icon size={17} aria-hidden="true" />
    </button>
  )
}
