// apps/frontend/app/dashboard/me-widget.tsx
"use client";
import useSWR from "swr";
import { useApi } from "@/lib/api";

export default function MeWidget() {
    const { request } = useApi();
    const { data, error, isLoading } = useSWR(
        "/api/v1/users/me",
        (key) => request(key),
        {
            revalidateOnFocus: false,
            dedupingInterval: 60_000,   // 1min: identical requests are coalesced
            shouldRetryOnError: false,
        }
    );

    if (isLoading) return null;
    if (error) return <div className="text-sm text-red-600">Failed to load profile</div>;
    if (!data) return null;

    return (
        <pre className="text-xs bg-gray-50 p-3 rounded-lg">
      {JSON.stringify(data, null, 2)}
    </pre>
    );
}
