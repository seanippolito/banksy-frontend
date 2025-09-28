"use client";

import { useState } from "react";
import useSWR from "swr";
import { useApi } from "@/lib/api";
import Link from "next/link";

type Account = {
    id: number;
    name: string;
    currency: string;
    created_at: string;
    updated_at: string;
};

export default function AccountsPage() {
    const { request } = useApi();
    const { data, mutate, isLoading, error } = useSWR<Account[]>(
        "/api/v1/accounts",
        (key) => request<Account[]>(key),
        { revalidateOnFocus: false }
    );

    const [name, setName] = useState("");
    const [currency, setCurrency] = useState("USD");
    const [saving, setSaving] = useState(false);

    const onCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name) return;
        setSaving(true);
        try {
            await request<Account>("/api/v1/accounts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, currency }),
            });
            setName("");
            mutate(); // refresh list
        } catch (e) {
            console.error(e);
        } finally {
            setSaving(false);
        }
    };

    return (
        <main className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold">Accounts</h1>
                <Link href="/dashboard" className="text-sm underline">
                    Back to Dashboard
                </Link>
            </div>

            <form onSubmit={onCreate} className="flex items-center gap-2">
                <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Account name"
                    className="border rounded-lg px-3 py-2 text-sm"
                />
                <input
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value.toUpperCase())}
                    placeholder="Currency"
                    className="border rounded-lg px-3 py-2 text-sm w-24"
                />
                <button
                    disabled={saving || !name}
                    className="rounded-lg px-3 py-2 border text-sm hover:bg-gray-50 disabled:opacity-50"
                >
                    {saving ? "Creating..." : "Create"}
                </button>
            </form>

            {isLoading && <div className="text-sm text-gray-500">Loading...</div>}
            {error && <div className="text-sm text-red-600">Failed to load accounts</div>}

            <ul className="space-y-2">
                {data?.map((a) => (
                    <li key={a.id} className="border rounded-lg p-3">
                        <div className="font-medium">{a.name}</div>
                        <div className="text-xs text-gray-600">
                            {a.currency} • Created {new Date(a.created_at).toLocaleString()}
                        </div>
                    </li>
                ))}
            </ul>
        </main>
    );
}
