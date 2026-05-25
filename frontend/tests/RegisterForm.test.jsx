import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import RegisterForm from '../src/components/RegisterForm.jsx'

describe('RegisterForm', () => {
  it('submits registration details', async () => {
    const user = userEvent.setup()
    const handleSubmit = vi.fn()

    render(
      <RegisterForm onSubmit={handleSubmit} onSwitch={() => {}} loading={false} error="" />
    )

    await user.type(screen.getByLabelText(/username/i), 'trader')
    await user.type(screen.getByLabelText(/email/i), 'trader@example.com')
    await user.type(screen.getByLabelText(/password/i), 'securepass')
    await user.click(screen.getByRole('button', { name: /create account/i }))

    expect(handleSubmit).toHaveBeenCalledWith({
      username: 'trader',
      email: 'trader@example.com',
      password: 'securepass',
    })
  })

  it('shows an error message when provided', () => {
    render(
      <RegisterForm
        onSubmit={() => {}}
        onSwitch={() => {}}
        loading={false}
        error="Email already registered"
      />
    )

    expect(screen.getByText(/email already registered/i)).toBeInTheDocument()
  })
})
