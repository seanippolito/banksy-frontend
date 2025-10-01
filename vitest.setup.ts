import "@testing-library/jest-dom";
import { vi } from "vitest";

// Auto-mock Clerk everywhere
vi.mock("@clerk/nextjs");
vi.mock("@/lib/api");

// Optional: mock fetch if your components call APIs
global.fetch = vi.fn(() =>
    Promise.resolve({
        json: () => Promise.resolve({}),
    })
) as any;