import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import AvatarMenu from '../src/components/AvatarMenu.jsx'

describe('AvatarMenu', () => {
  it('renders user details and handles logout', async () => {
    const user = userEvent.setup()
    const handleLogout = vi.fn()

    render(
      <AvatarMenu
        username="demo"
        isAdmin={false}
        onLogout={handleLogout}
        onChangePassword={() => {}}
      />
    )

    await user.click(screen.getByRole('button', { name: /open user menu/i }))
    expect(screen.getByText(/demo/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /logout/i }))
    expect(handleLogout).toHaveBeenCalled()
  })
})
