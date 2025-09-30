"use client";

import { useParams } from "next/navigation";
import useSWR from "swr";
import { useApi } from "@/lib/api";
import Link from "next/link";
import { useState } from "react";

type Account = {
    id: number;
    name: string;
    currency: string;
    created_at: string;
};

type Tx = {
    id: number;
    account_id: number;
    amount: number;
    type: "DEBIT" | "CREDIT";
    description?: string | null;
    created_at: string;
};

export default function AccountDetailPage() {
    const { id } = useParams(); // account id from URL
    const { request } = useApi();

    const { data: account, error: accError } = useSWR<Account>(
        id ? `/api/v1/accounts/${id}` : null,
        (k) => request(k),
        { revalidateOnFocus: false }
    );

    const { data: txs, isLoading, mutate } = useSWR<Tx[]>(
        id ? `/api/v1/transactions?account_id=${id}` : null,
        (k) => request(k),
        { revalidateOnFocus: false }
    );

    // Add transaction form state
    const [type, setType] = useState<"DEBIT" | "CREDIT">("DEBIT");
    const [amount, setAmount] = useState("");
    const [desc, setDesc] = useState("");

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        const cents = Math.round(parseFloat(amount || "0") * 100);
        if (!cents || cents <= 0) return;

        await request<Tx>("/api/v1/transactions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                account_id: Number(id),
                amount: cents,
                type,
                description: desc || null,
            }),
        });
        setAmount("");
        setDesc("");
        mutate();
    };

    if (accError) return <div className="p-6 text-red-600">Account not found.</div>;

    return (
        <main className="p-6 space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">{account?.name || "Account"}</h1>
                <Link
                    href="/accounts"
                    className="text-sm font-medium text-blue-600 hover:underline"
                >
                    Back to Accounts
                </Link>
            </div>

            {/* Account Info */}
            {account && (
                <div className="border rounded-lg p-4 bg-gray-50">
                    <p className="font-medium">
                        {account.name} ({account.currency})
                    </p>
                    <p className="text-sm text-gray-500">
                        Created {new Date(account.created_at).toLocaleDateString()}
                    </p>
                </div>
            )}

            {/* Add Transaction Form */}
            <form
                onSubmit={submit}
                className="bg-white border rounded-lg shadow-sm p-4 flex flex-wrap gap-3 items-center"
            >
                <select
                    className="border rounded-lg px-3 py-2 text-sm"
                    value={type}
                    onChange={(e) => setType(e.target.value as "DEBIT" | "CREDIT")}
                >
                    <option value="DEBIT">Debit</option>
                    <option value="CREDIT">Credit</option>
                </select>

                <input
                    className="border rounded-lg px-3 py-2 text-sm w-40"
                    placeholder="Amount (USD)"
                    inputMode="decimal"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                />
                <input
                    className="border rounded-lg px-3 py-2 text-sm flex-1 min-w-[200px]"
                    placeholder="Description (optional)"
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                />
                <button
                    disabled={!amount}
                    className="rounded-lg bg-blue-600 text-white px-4 py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition"
                >
                    Add Transaction
                </button>
            </form>

            {/* Transactions */}
            {isLoading && <div className="text-sm text-gray-500">Loading…</div>}
            {txs && txs.length === 0 && (
                <div className="text-sm text-gray-500">No transactions yet.</div>
            )}

            <ul className="space-y-3">
                {txs?.map((tx) => (
                    <li
                        key={tx.id}
                        className="flex justify-between items-center border rounded-lg p-4 bg-white shadow-sm"
                    >
                        <div>
                            <p className="text-sm font-medium">
                                {tx.description || (
                                    <span className="text-gray-500">No description</span>
                                )}
                            </p>
                            <p className="text-xs text-gray-500">
                                {new Date(tx.created_at).toLocaleString()}
                            </p>
                        </div>
                        <div className="text-right">
                            <p
                                className={`font-semibold ${
                                    tx.type === "CREDIT" ? "text-emerald-600" : "text-rose-600"
                                }`}
                            >
                                {tx.type === "CREDIT" ? "+" : "-"} ${(tx.amount / 100).toFixed(2)}
                            </p>
                            <p className="text-xs text-gray-500">Acct #{tx.account_id}</p>
                        </div>
                    </li>
                ))}
            </ul>
        </main>
    );
}
