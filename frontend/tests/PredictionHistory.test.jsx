import { render, screen } from '@testing-library/react'

import PredictionHistory from '../src/components/PredictionHistory.jsx'

describe('PredictionHistory', () => {
  it('renders empty state', () => {
    render(<PredictionHistory history={[]} />)

    expect(
      screen.getByText(/no prediction history yet\. select an asset to generate your first signal/i)
    ).toBeInTheDocument()
  })

  it('renders prediction rows', () => {
    render(
      <PredictionHistory
        history={[
          {
            id: 1,
            asset: 'BTC',
            signal: 'BUY',
            expected_return: 2.5,
            confidence: 0.75,
            timestamp: '2024-01-01T00:00:00Z',
          },
        ]}
      />
    )

    expect(screen.getByText('BTC')).toBeInTheDocument()
    expect(screen.getByText('BUY')).toBeInTheDocument()
    expect(screen.getByText('+2.50%')).toBeInTheDocument()
    expect(screen.getByText('75%')).toBeInTheDocument()
    expect(screen.getByText('2024-01-01T00:00:00Z')).toBeInTheDocument()
  })
})
