import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import PresetSwitcher from '../src/components/PresetSwitcher.jsx'

describe('PresetSwitcher', () => {
  it('allows selecting a preset', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()
    const presets = [
      { id: 'premium', name: 'Premium Finance', colors: { accent: '#3b82f6' } },
      { id: 'terminal', name: 'Dark Trading Terminal', colors: { accent: '#22c55e' } },
    ]

    render(
      <PresetSwitcher
        presets={presets}
        activePresetId="premium"
        onChange={handleChange}
      />
    )

    await user.click(screen.getByRole('button', { name: /select color preset/i }))
    await user.click(screen.getByRole('button', { name: /dark trading terminal/i }))

    expect(handleChange).toHaveBeenCalledWith('terminal')
  })
})
