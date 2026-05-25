import { render, screen } from '@testing-library/react'

import PredictionPanel from '../src/components/PredictionPanel.jsx'

describe('PredictionPanel', () => {
  it('renders prediction details', () => {
    render(
      <PredictionPanel
        prediction={{ signal: 'BUY', expected_return_7d: 2.3456, confidence: 0.78 }}
      />
    )

    expect(screen.getByText(/buy/i)).toBeInTheDocument()
    expect(screen.getByText('2.35%')).toBeInTheDocument()
    expect(screen.getByText(/78% confidence/i)).toBeInTheDocument()
  })
})
