"use client";

import { useParams } from "next/navigation";
import useSWR from "swr";
import { useApi } from "@/lib/api";
import Link from "next/link";
import { useState } from "react";

type User = {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
};

type Account = {
    id: number;
    user_id: number;
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

type Card = {
    id: number;
    account_id: number;
    card_number_last4: string;
    card_type: string;
    expiration_month: number;
    expiration_year: number;
    status: string;
};

export default function AccountDetailPage() {
    const { id } = useParams<{ id: string }>(); // account id from URL
    const { request } = useApi();

    const { data: user, error: userError } = useSWR<User>(
        "/api/v1/users/me",
        (key) => request(key),
        {
            revalidateOnFocus: false,
            dedupingInterval: 60_000,   // 1min: identical requests are coalesced
            shouldRetryOnError: false,
        }
    );

    const { data: account, error: accError } = useSWR<Account>(
        id ? `/api/v1/accounts/${id}` : null,
        (k) => request(k),
        { revalidateOnFocus: false }
    );

    const { data: txs, isLoading, mutate: mutateTxs } = useSWR<Tx[]>(
        id ? `/api/v1/transactions?account_id=${id}` : null,
        (k) => request(k),
        { revalidateOnFocus: false }
    );

    const { data: cards, mutate: mutateCards } = useSWR<Card[]>(
        `/api/v1/cards?account_id=${id}`,
        (k) => request(k),
        { revalidateOnFocus: false }
    );

    // Add transaction form state
    const [type, setType] = useState<"DEBIT" | "CREDIT">("DEBIT");
    const [amount, setAmount] = useState("");
    const [desc, setDesc] = useState("");
    const [shipping, setShipping] = useState(false);

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
        mutateTxs();
    };

    const shipCard = async () => {
        setShipping(true);
        try {
            await request<Card>(`/api/v1/cards/ship/${id}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            });
            mutateCards();
        } finally {
            setShipping(false);
        }
    };

    if (accError) return <div className="p-6 text-red-600">Account not found.</div>;

    return (
        <main className="p-6 space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">{account?.name || "Account"}</h1>
                <Link
                    href="/dashboard/accounts"
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

            <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium">Cards</h2>
                <button
                    disabled={shipping}
                    onClick={shipCard}
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                    {shipping ? "Shipping…" : "Ship Card"}
                </button>
            </div>

            <ul className="space-y-3">
                {cards?
                    .filter((c) => (c.account_id === account?.id))
                    .map((c) => (
                    <li key={c.id} className="border rounded-lg p-3 shadow-sm flex justify-between">
                        <div>
                            <div className="font-medium">**** **** **** {c.card_number_last4}</div>
                            <div className="text-xs text-gray-600">
                                Expires {c.expiration_month}/{c.expiration_year}
                            </div>
                        </div>
                        <div>
                            <div className="text-xs text-gray-500">{account?.name}</div>
                            <div className="text-s text-gray-500">{user?.first_name} {user?.last_name}</div>
                        </div>
                    </li>
                    ))}
                {cards?.length === 0 && (
                    <li className="text-sm text-gray-500">No cards issued yet.</li>
                )}
            </ul>

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
