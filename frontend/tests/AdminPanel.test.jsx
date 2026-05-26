import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import AdminPanel from "../src/components/AdminPanel.jsx";

const mockApiFetch = vi.fn();

vi.mock("../src/utils/api.js", () => ({
  apiFetch: (...args) => mockApiFetch(...args),
}));

describe("AdminPanel", () => {
  beforeEach(() => {
    mockApiFetch.mockReset();
  });

  it("loads stats, users, and predictions from admin endpoints", async () => {
    const user = userEvent.setup();
    mockApiFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          {
            id: 1,
            username: "admin",
            email: "admin@example.com",
            is_admin: true,
            created_at: "2024-01-01",
          },
        ],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          {
            id: 1,
            user_id: 1,
            asset: "BTC",
            signal: "BUY",
            expected_return: 2.5,
            confidence: 0.75,
            timestamp: "2024-01-02",
          },
        ],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          total_users: 1,
          total_predictions: 1,
          top_asset: "BTC",
          most_active_user: "admin",
        }),
      });

    render(<AdminPanel />);

    expect(await screen.findByText("System Oversight")).toBeInTheDocument();
    expect(screen.getByText("BTC")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /users/i }));
    expect(screen.getByText("admin@example.com")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /predictions/i }));
    await waitFor(() => expect(screen.getByText("+2.50%")).toBeInTheDocument());
  });
});
