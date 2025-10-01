import React from "react";

export const useAuth = () => ({
    getToken: async () => "fake-token",
    isSignedIn: true,
    userId: "test-user-id",
});

export const useUser = () => ({
    user: {
        id: "test-user-id",
        fullName: "Test User",
        emailAddresses: [{ emailAddress: "test@example.com" }],
    },
});

// ✅ simpler version, no React.FC typing needed
export const ClerkProvider = ({ children }: { children: React.ReactNode }) => (
    <div data-testid="clerk-provider">{children}</div>
);
