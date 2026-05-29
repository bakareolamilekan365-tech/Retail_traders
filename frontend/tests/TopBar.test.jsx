import { render, screen } from "@testing-library/react";

import TopBar from "../src/components/TopBar.jsx";

describe("TopBar", () => {
  it("renders branding without a theme toggle", () => {
    render(
      <TopBar
        user={{ username: "demo", isAdmin: false }}
        showAvatar={false}
        theme="dark"
        onToggleTheme={() => {}}
        onLogout={() => {}}
        onChangePassword={() => {}}
      />,
    );

    expect(
      screen.getByRole("heading", { name: /tradesense ng/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/ai investment signals/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /switch to light mode/i }),
    ).toBeInTheDocument();
  });

  it("does not render a duplicate standalone admin button", () => {
    render(
      <TopBar
        user={{ username: "admin", isAdmin: true }}
        showAvatar={false}
        theme="dark"
        onToggleTheme={() => {}}
        onLogout={() => {}}
        onChangePassword={() => {}}
      />,
    );

    expect(
      screen.queryByRole("button", { name: /^admin$/i }),
    ).not.toBeInTheDocument();
  });
});
