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
            setCurrency("USD");
            mutate(); // refresh list
        } catch (e) {
            console.error(e);
        } finally {
            setSaving(false);
        }
    };

    return (
        <main className="p-6 space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Accounts</h1>
                <Link
                    href="/dashboard"
                    className="text-sm font-medium hover:underline"
                >
                    Back to Dashboard
                </Link>
            </div>

            {/* Create Account Form */}
            <form
                onSubmit={onCreate}
                className="flex flex-wrap items-center gap-3 foreground p-4 rounded-lg border"
            >
                <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Account name"
                    className="flex-1 border border-secondary rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                />
                <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="border border-secondary rounded-lg px-3 py-2 text-sm text-highlight focus:ring-2 focus:ring-blue-500"
                >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="JPY">JPY</option>
                </select>
                <button
                    disabled={saving || !name}
                    className="rounded-lg btn-accent text-highlight px-4 py-2 text-sm font-medium disabled:opacity-50 transition"
                >
                    {saving ? "Creating..." : "Create Account"}
                </button>
            </form>

            {/* Loading / Error States */}
            {isLoading && (
                <div className="text-sm text-gray-500">Loading accounts...</div>
            )}
            {error && (
                <div className="text-sm text-red-600">
                    Failed to load accounts. Please try again.
                </div>
            )}

            {/* Accounts List */}
            {data && data.length > 0 ? (
                <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {data.map((a) => (
                        <li
                            key={a.id}
                            className="rounded-xl border card p-5 shadow-sm hover:shadow-md transition"
                        >
                            <div className="flex justify-between items-center">
                                <h2 className="text-lg font-semibold">{a.name}</h2>
                                <span className="text-sm text-highlight">{a.currency}</span>
                            </div>
                            <p className="text-xs text-muted mt-1">
                                Created {new Date(a.created_at).toLocaleDateString()}
                            </p>
                            <div className="mt-4">
                                <Link href={`/dashboard/accounts/${a.id}`} passHref>
                                    <button className="rounded-lg px-3 py-1 border text-sm btn-accent">
                                        View Transactions
                                    </button>
                                </Link>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                !isLoading && (
                    <div className="text-sm text-gray-500">
                        No accounts yet. Create your first one above.
                    </div>
                )
            )}
        </main>
    );
}
