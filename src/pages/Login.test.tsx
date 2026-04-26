// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import Login from "./Login";

describe("Login", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("submits the login payload", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({ user: { id: 1, email: "reader@example.com" } })),
    });

    vi.stubGlobal("fetch", fetchMock);

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "reader@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Submit" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/auth/login",
        expect.objectContaining({
          method: "POST",
          credentials: "same-origin",
          body: JSON.stringify({
            email: "reader@example.com",
            password: "password123",
          }),
        })
      );
    });
  });

  it("renders API errors", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      text: () => Promise.resolve(JSON.stringify({ error: "Invalid email or password." })),
    });

    vi.stubGlobal("fetch", fetchMock);

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "reader@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "wrongpass" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Submit" }));

    await expect(screen.findByText("Invalid email or password.")).resolves.toBeInTheDocument();
  });
});
