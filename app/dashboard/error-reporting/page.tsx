"use client";

import useSWR from "swr";
import { useApi } from "@/lib/api";
import { useState } from "react";

type ErrorLog = {
    id: number;
    user_id: number | null;
    error_code: string | null;
    message: string;
    location: string | null;
    created_at: string;
};

export default function ErrorReportingPage() {
    const { request } = useApi();
    const { data, isLoading, error } = useSWR<ErrorLog[]>(
        "/api/v1/errors",
        (key) => request<ErrorLog[]>(key),
        { revalidateOnFocus: false }
    );

    return (
        <main className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold">Error Reporting</h1>
            </div>

            {isLoading && <div className="text-sm text-gray-500">Loading errors…</div>}
            {error && <div className="text-sm text-red-600">Failed to load errors</div>}

            <ul className="space-y-4">
                {data?.map((err) => (
                    <ErrorCard key={err.id} log={err} />
                ))}
            </ul>
        </main>
    );
}

function ErrorCard({ log }: { log: ErrorLog }) {
    const [expanded, setExpanded] = useState(false);

    const shortStack = log.message.split("\n").slice(-5).join("\n");

    return (
        <li className="border rounded-xl p-4 shadow-sm hover:shadow-md transition bg-white">
            <div className="flex justify-between items-center">
                <div>
                    <div className="font-medium text-rose-600">
                        {log.error_code || "Unknown Error"}
                    </div>
                    <div className="text-xs text-gray-500">
                        {new Date(log.created_at).toLocaleString()} • User ID:{" "}
                        {log.user_id ?? "N/A"}
                    </div>
                    {log.location && (
                        <div className="text-xs text-gray-400">at {log.location}</div>
                    )}
                </div>
            </div>

            <pre className="mt-3 text-xs bg-gray-50 p-3 rounded-lg overflow-x-auto max-h-40">
        {expanded ? log.message : shortStack}
      </pre>

            <button
                onClick={() => setExpanded(!expanded)}
                className="mt-2 text-xs text-blue-600 hover:underline"
            >
                {expanded ? "Show less" : "Show full stacktrace"}
            </button>
        </li>
    );
}
