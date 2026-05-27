import { render, screen } from "@testing-library/react";
import { vi } from "vitest";

import App from "../src/App.jsx";

vi.mock("../src/components/Dashboard.jsx", () => ({
  default: () => <div>Dashboard content</div>,
}));

vi.mock("../src/components/AdminPanel.jsx", () => ({
  default: () => <div>Admin content</div>,
}));

vi.mock("../src/utils/api.js", () => ({
  changePassword: vi.fn(),
  checkAdmin: vi.fn(async () => false),
  clearToken: vi.fn(),
  decodeTokenPayload: vi.fn(() => ({ sub: "demo", user_id: 1 })),
  fetchPredictionHistory: vi.fn(async () => []),
  getToken: vi.fn(() => "demo-token"),
  loginUser: vi.fn(),
  registerUser: vi.fn(),
}));

describe("App", () => {
  beforeEach(() => {
    const storage = {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };
    Object.defineProperty(window, "localStorage", {
      value: storage,
      configurable: true,
    });
    Object.defineProperty(globalThis, "localStorage", {
      value: storage,
      configurable: true,
    });
  });

  it("shows first-login guide, demo banner, and hides admin tab for non-admins", async () => {
    render(<App />);

    expect(
      await screen.findByText(/welcome back, demo trader/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/reading your signal dashboard/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/this is an educational tool, not financial advice/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/historical dataset: 2022-2024/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /simulator/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /^admin$/i }),
    ).not.toBeInTheDocument();
  });
});
