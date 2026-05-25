import { render, screen } from '@testing-library/react'

import TopBar from '../src/components/TopBar.jsx'

describe('TopBar', () => {
  it('renders branding and controls', () => {
    render(
      <TopBar
        presets={[{ id: 'premium', name: 'Premium Finance', colors: { accent: '#3b82f6' } }]}
        activePresetId="premium"
        onPresetChange={() => {}}
        darkMode={false}
        onToggleDarkMode={() => {}}
        user={{ username: 'demo', isAdmin: false }}
        showAvatar={false}
        onLogout={() => {}}
        onChangePassword={() => {}}
      />
    )

    expect(screen.getByRole('heading', { name: /investment assistant/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/toggle dark mode/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/select color preset/i)).toBeInTheDocument()
  })
})
