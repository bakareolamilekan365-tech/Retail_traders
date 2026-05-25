import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import TimeRangeSelector from '../src/components/TimeRangeSelector.jsx'

describe('TimeRangeSelector', () => {
  it('calls onChange when a range is selected', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()

    render(<TimeRangeSelector value={180} onChange={handleChange} />)

    await user.click(screen.getByRole('button', { name: /30d/i }))
    expect(handleChange).toHaveBeenCalledWith(30)
  })
})
