"use client";

import useSWR from "swr";
import { useState } from "react";
import { useApi } from "@/lib/api";
import Link from "next/link";

type Account = { id: number; name: string; currency: string };
type Tx = { id: number; account_id: number; amount: number; type: "DEBIT"|"CREDIT"; description?: string | null; created_at: string };

export default function TransactionsPage() {
    const { request } = useApi();

    const { data: accounts } = useSWR<Account[]>("/api/v1/accounts", (k) => request(k), {
        revalidateOnFocus: false,
    });

    const [accountId, setAccountId] = useState<number | null>(null);
    const { data: txs, mutate, isLoading } = useSWR<Tx[]>(
        accountId ? `/api/v1/transactions?account_id=${accountId}` : null,
        (k) => request(k),
        { revalidateOnFocus: false }
    );

    const [type, setType] = useState<"DEBIT"|"CREDIT">("DEBIT");
    const [amount, setAmount] = useState<string>(""); // dollars input
    const [desc, setDesc] = useState<string>("");

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!accountId) return;
        const cents = Math.round(parseFloat(amount || "0") * 100);
        if (!cents || cents <= 0) return;

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
        mutate(); // refresh list
    };

    return (
        <main className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold">Transactions</h1>
                <Link href="/dashboard" className="text-sm underline">Back to Dashboard</Link>
            </div>

            <div className="flex gap-3 items-center">
                <label className="text-sm">Account:</label>
                <select
                    className="border rounded-lg px-3 py-2 text-sm"
                    value={accountId ?? ""}
                    onChange={(e) => setAccountId(e.target.value ? Number(e.target.value) : null)}
                >
                    <option value="">Select an account…</option>
                    {accounts?.map(a => (
                        <option key={a.id} value={a.id}>{a.name} ({a.currency})</option>
                    ))}
                </select>
            </div>

            <form onSubmit={submit} className="flex flex-wrap items-center gap-3">
                <select
                    className="border rounded-lg px-3 py-2 text-sm"
                    value={type}
                    onChange={(e) => setType(e.target.value as "DEBIT"|"CREDIT")}
                >
                    <option value="DEBIT">DEBIT</option>
                    <option value="CREDIT">CREDIT</option>
                </select>

                <input
                    className="border rounded-lg px-3 py-2 text-sm w-40"
                    placeholder="Amount (USD)"
                    inputMode="decimal"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                />
                <input
                    className="border rounded-lg px-3 py-2 text-sm w-72"
                    placeholder="Description (optional)"
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                />
                <button
                    disabled={!accountId}
                    className="rounded-lg px-3 py-2 border text-sm hover:bg-gray-50 disabled:opacity-50"
                >
                    Add
                </button>
            </form>

            {isLoading && <div className="text-sm text-gray-500">Loading…</div>}
            {txs && txs.length === 0 && <div className="text-sm text-gray-500">No transactions yet.</div>}

            <ul className="space-y-2">
                {txs?.map(tx => (
                    <li key={tx.id} className="border rounded-lg p-3 flex items-center justify-between">
                        <div className="space-y-1">
                            <div className="text-sm">{tx.description || <span className="text-gray-500">No description</span>}</div>
                            <div className="text-xs text-gray-600">
                                {new Date(tx.created_at).toLocaleString()}
                            </div>
                        </div>
                        <div className="text-right">
                            <div className={`font-medium ${tx.type === "CREDIT" ? "text-emerald-600" : "text-rose-600"}`}>
                                {tx.type === "CREDIT" ? "+" : "-"} ${(tx.amount/100).toFixed(2)}
                            </div>
                            <div className="text-xs text-gray-500">Acct #{tx.account_id}</div>
                        </div>
                    </li>
                ))}
            </ul>
        </main>
    );
}
