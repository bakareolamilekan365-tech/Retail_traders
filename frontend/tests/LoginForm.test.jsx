import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import LoginForm from '../src/components/LoginForm.jsx'

describe('LoginForm', () => {
  it('submits username and password', async () => {
    const user = userEvent.setup()
    const handleSubmit = vi.fn()

    render(
      <LoginForm onSubmit={handleSubmit} onSwitch={() => {}} loading={false} error="" />
    )

    await user.type(screen.getByLabelText(/username/i), 'demo')
    await user.type(screen.getByLabelText(/password/i), 'demo123')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    expect(handleSubmit).toHaveBeenCalledWith({ username: 'demo', password: 'demo123' })
  })

  it('shows an error message when provided', () => {
    render(
      <LoginForm
        onSubmit={() => {}}
        onSwitch={() => {}}
        loading={false}
        error="Invalid credentials"
      />
    )

    expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument()
  })
})
