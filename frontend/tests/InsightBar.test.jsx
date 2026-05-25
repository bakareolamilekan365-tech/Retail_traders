import { render, screen } from '@testing-library/react'

import InsightBar from '../src/components/InsightBar.jsx'

describe('InsightBar', () => {
  it('renders insight text', () => {
    render(<InsightBar insight="Trend is bullish with RSI at 55." />)

    expect(screen.getByText(/trend is bullish/i)).toBeInTheDocument()
  })
})
