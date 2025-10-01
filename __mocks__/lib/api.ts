// __mocks__/lib/api.ts
import { vi } from "vitest";

export const useApi = () => ({
    request: vi.fn(async (url: string) => {
        if (url === "/api/v1/accounts") {
            return [{ id: 1, name: "Test Account", currency: "USD", created_at: "", updated_at: "" }];
        }
        return [];
    }),
});
