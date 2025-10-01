// __tests__/account.test.tsx
import { render, screen } from "@testing-library/react";
import AccountsPage from "@/app/dashboard/accounts/page";
import { vi } from "vitest";

// --- Mock Clerk so `useAuth` works without ClerkProvider ---
vi.mock("@clerk/nextjs", () => {
    return {
        useAuth: () => ({
            getToken: async () => "fake-token",
        }),
        useUser: () => ({
            user: { id: "user_123", fullName: "Test User", primaryEmailAddress: "test@example.com" },
        }),
        ClerkProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    };
});

// --- Mock our custom API hook ---
vi.mock("@/lib/api", () => {
    return {
        useApi: () => ({
            request: vi.fn(async (url: string) => {
                if (url === "/api/v1/accounts") {
                    return [
                        {
                            id: 1,
                            name: "Test Account",
                            currency: "USD",
                            created_at: "2025-01-01T00:00:00Z",
                            updated_at: "2025-01-02T00:00:00Z",
                        },
                    ];
                }
                return [];
            }),
        }),
    };
});

describe("AccountsPage", () => {
    it("renders account list", async () => {
        render(<AccountsPage />);
        expect(await screen.findByText("Test Account")).toBeInTheDocument();
    });
});
