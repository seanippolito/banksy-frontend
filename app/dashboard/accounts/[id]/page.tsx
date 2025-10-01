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

type Holder = {
    id: number;
    user_id: number;
    account_id: number;
    holder_type: string;
};

export default function AccountDetailPage() {
    const { id } = useParams<{ id: string }>(); // account id from URL
    const { request } = useApi();

    const { data: user } = useSWR<User>(
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

    const { data: txs, mutate: mutateTxs } = useSWR<Tx[]>(
        id ? `/api/v1/transactions?account_id=${id}` : null,
        (k) => request(k),
        { revalidateOnFocus: false }
    );

    const { data: cards, mutate: mutateCards } = useSWR<Card[]>(
        `/api/v1/cards?account_id=${id}`,
        (k) => request(k),
        { revalidateOnFocus: false }
    );

    const { data: holders, mutate, isLoading, error } = useSWR<Holder[]>(
        id ? `/api/v1/account-holders/${id}/holders` : null,
        (key) => request<Holder[]>(key),
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

    const [holderType, setHolderType] = useState("JOINT");
    const [userId, setUserId] = useState("");
    const [saving, setSaving] = useState(false);

    const onAddHolder = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userId) return;
        setSaving(true);
        try {
            await request(`/api/v1/account-holders/${id}/holders`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_id: userId,
                    account_id: account?.id,
                    holder_type: holderType,
                }),
            });
            setUserId("");
            setHolderType("JOINT");
            mutate();
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    const onRemoveHolder = async (holderId: number) => {
        if (!confirm("Remove this account holder?")) return;
        try {
            await request(`/api/v1/account-holders/holders/${holderId}`, {
                method: "DELETE",
            });
            mutate();
        } catch (err) {
            console.error(err);
        }
    };

    if (accError) return <div className="p-6 text-red-600">Account not found.</div>;

    return (
        <main className="p-6 space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">{account?.name || "Account"}</h1>
                <div className="flex gap-3 mt-4">
                    <Link
                        href={`/dashboard/statements?account_id=${account?.id}`}
                        className="rounded-lg border btn-accent px-4 py-2 text-sm hover:bg-gray-50"
                    >
                        View Statements
                    </Link>
                </div>
                <Link
                    href="/dashboard/accounts"
                    className="text-sm font-medium hover:underline"
                >
                    Back to Accounts
                </Link>
            </div>

            {/* Account Info */}
            {account && (
                <div className="border rounded-lg p-4 card">
                    <p className="font-medium">
                        {account.name} ({account.currency})
                    </p>
                    <p className="text-sm text-gray-500">
                        Created {new Date(account.created_at).toLocaleDateString()}
                    </p>
                </div>
            )}

            <section className="space-y-4 mt-8">
                <h2 className="text-lg font-semibold">Account Holders</h2>

                <form onSubmit={onAddHolder} className="flex flex-wrap items-center gap-2">
                    <input
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                        placeholder="User ID"
                        className="border rounded-lg px-3 py-2 text-sm"
                    />
                    <select
                        value={holderType}
                        onChange={(e) => setHolderType(e.target.value)}
                        className="border border-secondary rounded-lg px-3 py-2 text-sm text-highlight"
                    >
                        <option value="PRIMARY">PRIMARY</option>
                        <option value="JOINT">JOINT</option>
                        <option value="TRUST">TRUST</option>
                        <option value="BUSINESS">BUSINESS</option>
                        <option value="OTHER">OTHER</option>
                    </select>
                    <button
                        disabled={saving || !userId}
                        className="rounded-lg px-3 py-2 border text-sm btn-accent disabled:opacity-50"
                    >
                        {saving ? "Adding…" : "Add Holder"}
                    </button>
                </form>

                {isLoading && <div className="text-sm text-gray-500">Loading holders…</div>}
                {error && (
                    <div className="text-sm text-red-600">Failed to load account holders</div>
                )}

                <ul className="space-y-2">
                    {holders?.map((h) => (
                        <li
                            key={h.id}
                            className="border rounded-lg p-3 flex items-center justify-between"
                        >
                            <div>
                                <div className="font-medium">User #{h.user_id}</div>
                                <div className="text-xs text-highlight">{h.holder_type}</div>
                            </div>
                            <button
                                onClick={() => onRemoveHolder(h.id)}
                                className="text-sm text-red-600 hover:underline"
                            >
                                Remove
                            </button>
                        </li>
                    ))}
                </ul>
            </section>

            <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium">Cards</h2>
                <button
                    disabled={shipping}
                    onClick={shipCard}
                    className="px-3 py-2 btn-accent rounded-lg disabled:opacity-50"
                >
                    {shipping ? "Shipping…" : "Ship Card"}
                </button>
            </div>

            <ul className="space-y-3">
                {cards?.filter((c) => (c.account_id === account?.id)).map((c) => (
                    <li key={c.id} className="card border rounded-lg p-3 shadow-sm flex justify-between">
                        <div>
                            <div className="font-medium">**** **** **** {c.card_number_last4}</div>
                            <div className="text-xs text-danger">
                                Expires {c.expiration_month}/{c.expiration_year}
                            </div>
                        </div>
                        <div>
                            <div className="text-xs text-muted">{account?.name}</div>
                            <div className="text-s text-highlight">{user?.first_name} {user?.last_name}</div>
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
                className="border rounded-lg shadow-sm p-4 flex flex-wrap gap-3 items-center"
            >
                <select
                    className="border border-secondary rounded-lg px-3 py-2 text-sm text-highlight"
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
                    className="rounded-lg btn-accent text-white px-4 py-2 text-sm font-medium disabled:opacity-50 transition"
                >
                    Add Transaction
                </button>
            </form>

            {/* Transactions */}
            {isLoading && <div className="text-sm text-muted">Loading…</div>}
            {txs && txs.length === 0 && (
                <div className="text-sm text-muted">No transactions yet.</div>
            )}

            <ul className="space-y-1">
                {txs?.map((tx) => (
                    <li
                        key={tx.id}
                        className={`flex justify-between items-center p-4 rounded-lg
                        ${tx.type === "CREDIT" ? "bg-accent dark:bg-slate-900 hover:bg-accent-purple/10 transition-colors text-accent" : "bg-accent dark:bg-slate-800 hover:bg-accent-purple/10 transition-colors text-danger"}
                        shadow-sm`}
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
                                className="font-semibold"
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
