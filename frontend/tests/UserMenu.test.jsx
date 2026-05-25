import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import UserMenu from '../src/components/UserMenu.jsx'

describe('UserMenu', () => {
  it('shows admin link when user is admin', async () => {
    const user = userEvent.setup()
    render(
      <UserMenu
        username="admin"
        isAdmin
        onLogout={() => {}}
        onChangePassword={() => {}}
      />
    )

    await user.click(screen.getByRole('button', { name: /admin/i }))
    expect(screen.getByText(/admin panel/i)).toBeInTheDocument()
  })

  it('calls logout handler', async () => {
    const user = userEvent.setup()
    const handleLogout = vi.fn()

    render(
      <UserMenu
        username="demo"
        isAdmin={false}
        onLogout={handleLogout}
        onChangePassword={() => {}}
      />
    )

    await user.click(screen.getByRole('button', { name: /demo/i }))
    await user.click(screen.getByRole('button', { name: /logout/i }))

    expect(handleLogout).toHaveBeenCalled()
  })
})
