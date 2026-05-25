import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import AssetSelector from '../src/components/AssetSelector.jsx'

describe('AssetSelector', () => {
  it('filters assets and handles selection', async () => {
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

    const input = screen.getByRole('combobox')
    await user.click(input)
    await user.type(input, 'eth')

    await user.click(screen.getByRole('button', { name: /eth · ethereum/i }))
    expect(handleSelect).toHaveBeenCalledWith('ETH')
  })
})
