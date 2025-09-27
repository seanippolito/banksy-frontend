"use client";

import { useAuth } from "@clerk/nextjs";

export function useApi() {
    const { getToken } = useAuth();

    async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
        const token = await getToken({ template: "default" });
        const headers = new Headers(init.headers || {});
        if (token) headers.set("Authorization", `Bearer ${token}`);

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, {
            ...init,
            headers,
        });
        if (!res.ok) throw new Error(`API error ${res.status}`);
        return res.json() as Promise<T>;
    }

    return { request };
}