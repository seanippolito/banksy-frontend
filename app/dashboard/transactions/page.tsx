"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import useSWR from "swr";
import { useApi } from "@/lib/api";
import Link from "next/link";

type Account = { id: number; name: string; currency: string };
type Tx = {
    id: number;
    account_id: number;
    amount: number;
    type: "DEBIT" | "CREDIT";
    description?: string | null;
    created_at: string;
};

export default function TransactionsPage() {
    const { request } = useApi();
    const searchParams = useSearchParams();

    const { data: accounts } = useSWR<Account[]>("/api/v1/accounts", (k) => request(k));

    // Pick account from query param if present
    const queryAccountId = searchParams.get("account_id");
    const [accountId, setAccountId] = useState<number | null>(
        queryAccountId ? Number(queryAccountId) : null
    );

    const { data: txs, mutate, isLoading } = useSWR<Tx[]>(
        accountId ? `/api/v1/transactions?account_id=${accountId}` : null,
        (k) => request(k)
    );

    const [type, setType] = useState<"DEBIT" | "CREDIT">("DEBIT");
    const [amount, setAmount] = useState<string>("");
    const [desc, setDesc] = useState<string>("");
    const [saving, setSaving] = useState(false);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!accountId) return;
        const cents = Math.round(parseFloat(amount || "0") * 100);
        if (!cents || cents <= 0) return;

        setSaving(true);
        try {
            await request<Tx>("/api/v1/transactions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    account_id: accountId,
                    amount: cents,
                    type,
                    description: desc || null,
                }),
            });
            setAmount("");
            setDesc("");
            mutate();
        } finally {
            setSaving(false);
        }
    };

    const currentAccount = accounts?.find((a) => a.id === accountId);

    return (
        <main className="p-6 space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
                <Link
                    href="/dashboard"
                    className="text-sm font-medium text-blue-600 hover:underline"
                >
                    Back to Dashboard
                </Link>
            </div>

            {/* Account Picker */}
            <div className="flex gap-3 items-center">
                <label className="text-sm font-medium">Account:</label>
                <select
                    className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                    value={accountId ?? ""}
                    onChange={(e) =>
                        setAccountId(e.target.value ? Number(e.target.value) : null)
                    }
                >
                    <option value="">Select an account…</option>
                    {accounts?.map((a) => (
                        <option key={a.id} value={a.id}>
                            {a.name} ({a.currency})
                        </option>
                    ))}
                </select>
            </div>

            {/* Account Info */}
            {currentAccount && (
                <div className="p-4 border rounded-lg bg-gray-50">
                    <h2 className="text-lg font-semibold">{currentAccount.name}</h2>
                    <p className="text-sm text-gray-600">
                        Currency: {currentAccount.currency}
                    </p>
                </div>
            )}

            {/* Add Transaction Form */}
            {accountId && (
                <form
                    onSubmit={submit}
                    className="p-4 border rounded-lg bg-white shadow-sm flex flex-wrap gap-3 items-center"
                >
                    <select
                        className="border rounded-lg px-3 py-2 text-sm"
                        value={type}
                        onChange={(e) => setType(e.target.value as "DEBIT" | "CREDIT")}
                    >
                        <option value="DEBIT">DEBIT</option>
                        <option value="CREDIT">CREDIT</option>
                    </select>

                    <input
                        className="border rounded-lg px-3 py-2 text-sm w-40"
                        placeholder="Amount"
                        inputMode="decimal"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                    />
                    <input
                        className="border rounded-lg px-3 py-2 text-sm flex-1"
                        placeholder="Description (optional)"
                        value={desc}
                        onChange={(e) => setDesc(e.target.value)}
                    />
                    <button
                        disabled={!accountId || saving}
                        className="rounded-lg bg-blue-600 text-white px-4 py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition"
                    >
                        {saving ? "Adding..." : "Add Transaction"}
                    </button>
                </form>
            )}

            {/* Transactions List */}
            {isLoading && <div className="text-sm text-gray-500">Loading…</div>}
            {!isLoading && accountId && txs && txs.length === 0 && (
                <div className="text-sm text-gray-500">No transactions yet.</div>
            )}

            {txs && txs.length > 0 && (
                <div className="overflow-x-auto border rounded-lg shadow-sm">
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-50 text-left text-gray-600">
                        <tr>
                            <th className="px-4 py-2">Date</th>
                            <th className="px-4 py-2">Description</th>
                            <th className="px-4 py-2">Type</th>
                            <th className="px-4 py-2 text-right">Amount</th>
                        </tr>
                        </thead>
                        <tbody>
                        {txs.map((tx) => (
                            <tr key={tx.id} className="border-t">
                                <td className="px-4 py-2">
                                    {new Date(tx.created_at).toLocaleString()}
                                </td>
                                <td className="px-4 py-2">
                                    {tx.description || (
                                        <span className="text-gray-400">No description</span>
                                    )}
                                </td>
                                <td className="px-4 py-2">
                    <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                            tx.type === "CREDIT"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-rose-100 text-rose-700"
                        }`}
                    >
                      {tx.type}
                    </span>
                                </td>
                                <td className="px-4 py-2 text-right font-medium">
                                    {tx.type === "CREDIT" ? "+" : "-"} $
                                    {(tx.amount / 100).toFixed(2)}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </main>
    );
}
