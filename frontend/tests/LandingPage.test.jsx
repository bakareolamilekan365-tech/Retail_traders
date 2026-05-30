import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import LandingPage from "../src/LandingPage";

vi.mock("../src/components/CryptoWidget.jsx", () => ({
  default: () => <div data-testid="crypto-widget">widget</div>,
}));

test("renders landing hero and CTA", async () => {
  render(<LandingPage />);
  expect(screen.getByText(/Smarter Signals/i)).toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: /Get Started Free/i }),
  ).toBeInTheDocument();
  const widget = await screen.findByTestId("crypto-widget");
  expect(widget).toBeInTheDocument();
});
