import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import AssetSelector from '../src/components/AssetSelector.jsx'

describe('AssetSelector', () => {
  it('renders assets and handles selection', async () => {
    const user = userEvent.setup()
    const handleSelect = vi.fn()

    render(
      <AssetSelector
        assets={[
          { symbol: 'BTC', name: 'Bitcoin', asset_type: 'crypto' },
          { symbol: 'ETH', name: 'Ethereum', asset_type: 'crypto' },
        ]}
        selectedAsset="BTC"
        onSelect={handleSelect}
      />
    )

    expect(screen.getByRole('combobox')).toBeInTheDocument()
    expect(screen.getByText(/BTC · Bitcoin/)).toBeInTheDocument()

    await user.selectOptions(screen.getByRole('combobox'), 'ETH')
    expect(handleSelect).toHaveBeenCalledWith('ETH')
  })
})
