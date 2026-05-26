import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import AssetSelector from "../src/components/AssetSelector.jsx";

describe("AssetSelector", () => {
  it("filters assets and handles selection", async () => {
    const user = userEvent.setup();
    const handleSelect = vi.fn();

    render(
      <AssetSelector
        assets={[
          { symbol: "BTC", name: "Bitcoin", asset_type: "crypto" },
          { symbol: "ETH", name: "Ethereum", asset_type: "crypto" },
        ]}
        selectedAsset="BTC"
        onSelect={handleSelect}
      />,
    );

    const input = screen.getByLabelText("Asset search");
    await user.click(input);
    await user.type(input, "eth");

    await user.click(screen.getByRole("button", { name: /eth · ethereum/i }));
    expect(handleSelect).toHaveBeenCalledWith("ETH");
  });

  it("keeps category and risk dropdowns interactive", async () => {
    const user = userEvent.setup();

    render(
      <AssetSelector
        assets={[{ symbol: "BTC", name: "Bitcoin", asset_type: "crypto" }]}
        selectedAsset="BTC"
        onSelect={() => {}}
      />,
    );

    await user.selectOptions(screen.getByLabelText(/category/i), "Crypto");
    await user.selectOptions(screen.getByLabelText(/risk/i), "Moderate");

    expect(screen.getByLabelText(/category/i)).toHaveValue("Crypto");
    expect(screen.getByLabelText(/risk/i)).toHaveValue("Moderate");
  });
});
