// apps/frontend/lib/api.ts
"use client";
import { useAuth } from "@clerk/nextjs";
import { useCallback } from "react";

export function useApi() {
    const { getToken } = useAuth();

    const request = useCallback(async <T,>(path: string, init: RequestInit = {}): Promise<T> => {
        const token = await getToken({ template: "banksy-backend" });
        const headers = new Headers(init.headers || {});
        if (token) headers.set("Authorization", `Bearer ${token}`);

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, {
            ...init,
            headers,
            cache: "no-store",
        });
        if (!res.ok) throw new Error(`API error ${res.status}`);
        return res.json() as Promise<T>;
    }, [getToken]);

    return { request };
}
