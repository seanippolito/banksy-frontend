"use client";

import { useState } from "react";
import useSWR from "swr";
import { useApi } from "@/lib/api";
import Link from "next/link";

type Account = {
    id: number;
    name: string;
    currency: string;
};

type MoneyTransfer = {
    transfer_id: string;
    sender_account_id: number;
    recipient_account_id: number;
    amount: number;
    description?: string | null;
    created_at: string;
};

export default function MoneyTransferPage() {
    const { request } = useApi();

    // Load accounts
    const { data: accounts, isLoading, error } = useSWR<Account[]>(
        "/api/v1/accounts",
        (key) => request<Account[]>(key),
        { revalidateOnFocus: false }
    );

    // Form state
    const [sender, setSender] = useState<number | "">("");
    const [recipient, setRecipient] = useState<number | "">("");
    const [amount, setAmount] = useState("");
    const [desc, setDesc] = useState("");
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState<MoneyTransfer | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg(null);
        setSuccess(null);

        if (!sender || !recipient || !amount) {
            setErrorMsg("Please fill out all fields.");
            return;
        }
        if (sender === recipient) {
            setErrorMsg("Sender and recipient cannot be the same account.");
            return;
        }

        const cents = Math.round(parseFloat(amount) * 100);
        if (!cents || cents <= 0) {
            setErrorMsg("Amount must be greater than zero.");
            return;
        }

        setSaving(true);
        try {
            const res = await request<MoneyTransfer>("/api/v1/money-transfers", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    sender_account_id: sender,
                    recipient_account_id: recipient,
                    amount: cents,
                    description: desc || null,
                }),
            });
            setSuccess(res);
            setAmount("");
            setDesc("");
            setSender("");
            setRecipient("");
        } catch (err: any) {
            setErrorMsg("Transfer failed. Please try again.");
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    return (
        <main className="p-6 space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold">Start a Money Transfer</h1>
                <Link href="/dashboard" className="text-sm underline">
                    Back to Dashboard
                </Link>
            </div>

            {/* Form */}
            <form onSubmit={onSubmit} className="space-y-4 max-w-lg">
                <div>
                    <label className="block text-sm mb-1">Sender Account</label>
                    <select
                        className="border rounded-lg px-3 py-2 text-sm w-full"
                        value={sender}
                        onChange={(e) => setSender(e.target.value ? Number(e.target.value) : "")}
                    >
                        <option value="">Select account…</option>
                        {accounts?.map((a) => (
                            <option key={a.id} value={a.id}>
                                {a.name} ({a.currency})
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm mb-1">Recipient Account</label>
                    <select
                        className="border rounded-lg px-3 py-2 text-sm w-full"
                        value={recipient}
                        onChange={(e) =>
                            setRecipient(e.target.value ? Number(e.target.value) : "")
                        }
                    >
                        <option value="">Select account…</option>
                        {accounts?.map((a) => (
                            <option key={a.id} value={a.id}>
                                {a.name} ({a.currency})
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm mb-1">Amount (USD)</label>
                    <input
                        type="number"
                        inputMode="decimal"
                        className="border rounded-lg px-3 py-2 text-sm w-full"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                    />
                </div>

                <div>
                    <label className="block text-sm mb-1">Description (optional)</label>
                    <input
                        className="border rounded-lg px-3 py-2 text-sm w-full"
                        value={desc}
                        onChange={(e) => setDesc(e.target.value)}
                        placeholder="Enter a note for this transfer"
                    />
                </div>

                {errorMsg && <p className="text-sm text-red-600">{errorMsg}</p>}
                {success && (
                    <p className="text-sm text-green-600">
                        ✅ Transfer complete! ID: {success.transfer_id}
                    </p>
                )}

                <button
                    disabled={saving}
                    className="rounded-lg px-4 py-2 bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:opacity-50"
                >
                    {saving ? "Transferring…" : "Submit Transfer"}
                </button>
            </form>

            {/* Account List for context */}
            <section>
                <h2 className="text-lg font-medium mb-3">Your Accounts</h2>
                {isLoading && <p className="text-sm text-gray-500">Loading accounts…</p>}
                {error && <p className="text-sm text-red-600">Failed to load accounts.</p>}
                <ul className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                    {accounts?.map((a) => (
                        <li key={a.id} className="border rounded-lg p-3 bg-white shadow-sm">
                            <div className="font-medium">{a.name}</div>
                            <div className="text-xs text-gray-600">{a.currency}</div>
                        </li>
                    ))}
                </ul>
            </section>
        </main>
    );
}
