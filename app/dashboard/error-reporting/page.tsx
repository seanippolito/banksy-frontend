"use client";

import useSWR from "swr";
import { useApi } from "@/lib/api";
import Link from "next/link";

type ErrorLog = {
    id: number;
    user_id?: number;
    error_code?: number;
    message: string;
    location?: string;
    created_at: string;
};

export default function ErrorReportingPage() {
    const { request } = useApi();
    const { data, isLoading, error } = useSWR<ErrorLog[]>(
        "/api/v1/errors",
        (path: string) => request<ErrorLog[]>(path)
    );

    return (
        <main className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-semibold">Error Reporting</h1>
                <Link href="/dashboard" className="text-sm underline">
                    Back to Dashboard
                </Link>
            </div>

            {isLoading && <div>Loading errors…</div>}
            {error && <div className="text-red-600">Failed to load logs.</div>}

            <ul className="space-y-4">
                {data?.map((log) => (
                    <li key={log.id} className="border rounded-lg p-4 bg-red-50">
                        <div className="text-sm text-gray-600">
                            {new Date(log.created_at).toLocaleString()}
                        </div>
                        <div className="font-medium">
                            {log.location} • Code {log.error_code ?? "?"}
                        </div>
                        <pre className="text-xs whitespace-pre-wrap mt-2 bg-gray-100 p-2 rounded">
                          {log.message}
                        </pre>
                        {log.user_id && (
                            <div className="text-xs text-gray-500 mt-1">User ID: {log.user_id}</div>
                        )}
                    </li>
                ))}
            </ul>
        </main>
    );
}
