import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { apiFetch } from "../src/utils/api.js";
import SignalSimulator from "../src/components/SignalSimulator.jsx";

vi.mock("../src/utils/api.js", () => ({
  apiFetch: vi.fn(),
}));

describe("SignalSimulator", () => {
  beforeEach(() => {
    vi.mocked(apiFetch).mockReset();
  });

  it("shows estimates from the latest prediction", async () => {
    const user = userEvent.setup();

    vi.mocked(apiFetch)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          { symbol: "BTC", name: "Bitcoin" },
          { symbol: "ETH", name: "Ethereum" },
        ],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          prediction: { expected_return_7d: 5.5, confidence: 0.78 },
          ohlcv: [{ close: 2000 }],
        }),
      });

    render(
      <SignalSimulator
        asset="BTC"
        latestClose={2000}
        prediction={{ expected_return_7d: 5.5, confidence: 0.78 }}
      />,
    );

    await user.clear(screen.getByLabelText(/amount in naira/i));
    await user.type(screen.getByLabelText(/amount in naira/i), "10000");

    expect(screen.getByText(/asset: btc/i)).toBeInTheDocument();
    expect(screen.getByText("78%")).toBeInTheDocument();

    expect(
      screen.getByText(/expected 7-day return/i).closest("div"),
    ).toHaveTextContent("5.50%");
    expect(
      screen.getByText(/estimated units/i).closest("div"),
    ).toHaveTextContent("5");
    expect(
      screen.getByText(/expected 7-day value/i).closest("div"),
    ).toHaveTextContent("₦10,550");
    expect(
      screen.getByText(/possible gain \/ loss/i).closest("div"),
    ).toHaveTextContent("₦550");
    expect(
      screen.getByText(
        /this is a simulated estimate based on the ai model's prediction/i,
      ),
    ).toBeInTheDocument();
  });

  it("prompts for a prediction when no data is available", async () => {
    vi.mocked(apiFetch).mockResolvedValueOnce({
      ok: true,
      json: async () => [{ symbol: "BTC", name: "Bitcoin" }],
    });

    render(<SignalSimulator />);

    await waitFor(() => {
      expect(
        screen.getByText(
          /run a prediction on the dashboard to unlock the simulator/i,
        ),
      ).toBeInTheDocument();
    });
  });
});
