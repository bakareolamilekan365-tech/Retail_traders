import { render, screen } from "@testing-library/react";

import IndicatorCards from "../src/components/IndicatorCards.jsx";

describe("IndicatorCards", () => {
  it("renders latest indicator values", () => {
    render(
      <IndicatorCards
        indicators={[
          { rsi_14: 40, volatility_14: 1.2, sma_crossover: 0 },
          { rsi_14: 55.2, volatility_14: 1.8, sma_crossover: 1 },
        ]}
      />,
    );

    expect(screen.getByText("55.2")).toBeInTheDocument();
    expect(screen.getByText("1.80%")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /bullish/i }),
    ).toBeInTheDocument();
  });

  it("renders N/A when values are missing", () => {
    render(
      <IndicatorCards
        indicators={[
          { rsi_14: null, volatility_14: null, sma_crossover: null },
        ]}
      />,
    );

    const naValues = screen.getAllByText("N/A");
    expect(naValues.length).toBeGreaterThanOrEqual(2);
  });
});
