import { render, screen, waitFor } from "@testing-library/react";
import { fireEvent } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import AuditLogs from "../src/components/AuditLogs.jsx";

const mockApiFetch = vi.fn();

vi.mock("../src/utils/api.js", () => ({
  apiFetch: (...args) => mockApiFetch(...args),
}));

describe("AuditLogs", () => {
  beforeEach(() => {
    mockApiFetch.mockReset();
  });

  it("loads and displays backend logs", async () => {
    mockApiFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ content: "line one\nline two" }),
    });

    render(<AuditLogs canAccess onBack={vi.fn()} />);

    expect(await screen.findByLabelText(/audit logs/i)).toBeInTheDocument();
    await waitFor(() => expect(screen.getByDisplayValue(/line one/)).toBeInTheDocument());
    expect(screen.getByText(/2 lines/i)).toBeInTheDocument();
  });

  it("filters log lines by search term", async () => {
    mockApiFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ content: "error boot\ninfo ready\nwarn retry" }),
    });

    render(<AuditLogs canAccess onBack={vi.fn()} />);

    const searchInput = await screen.findByPlaceholderText(/search log messages/i);
    await waitFor(() => expect(screen.getByDisplayValue(/error boot/)).toBeInTheDocument());

    fireEvent.change(searchInput, { target: { value: "error" } });

    expect(screen.getByText(/1 \/ 3 lines/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue(/error boot/)).toBeInTheDocument();
    expect(screen.getByDisplayValue(/info ready/)).not.toBeInTheDocument();
    expect(searchInput).toHaveValue("error");
  });
});