"use client";

import { useState } from "react";
import { useApi } from "@/lib/api";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

type StatementTransaction = {
    id: number;
    account_id: number;
    description: string;
    amount: number;
    type: string;
    created_at: string;
};

type Statement = {
    account_id: number;
    balance: number;
    transactions: StatementTransaction[];
};

export default function StatementsContent() {
    const { request } = useApi();
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [statements, setStatements] = useState<Statement[] | null>(null);
    const [loading, setLoading] = useState(false);
    const searchParams = useSearchParams();
    const preselectedAccountId = searchParams.get("account_id");

    const onGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!startDate || !endDate) return;
        setLoading(true);
        try {
            const res = await request<Statement[]>("/api/v1/statements", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ start_date: startDate, end_date: endDate }),
            });
            setStatements(res);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold">Statements</h1>
                <Link href="/dashboard" className="text-sm underline">
                    Back to Dashboard
                </Link>
            </div>

            <form onSubmit={onGenerate} className="flex flex-wrap gap-3 items-center">
                <div>
                    <label className="text-sm block mb-1">Start Date</label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="border rounded-lg px-3 py-2 text-sm"
                    />
                </div>
                <div>
                    <label className="text-sm block mb-1">End Date</label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="border rounded-lg px-3 py-2 text-sm"
                    />
                </div>
                <button
                    disabled={!startDate || !endDate || loading}
                    className="rounded-lg px-4 py-2 border text-sm hover:bg-gray-50 disabled:opacity-50"
                >
                    {loading ? "Generating…" : "Generate"}
                </button>
            </form>

            {!statements && !loading && (
                <p className="text-sm text-gray-500">No statements generated yet.</p>
            )}

            {statements?.map((s) => (
                <div
                    key={s.account_id}
                    className={`border rounded-lg p-4 space-y-3 bg-white shadow-sm ${
                        preselectedAccountId === String(s.account_id)
                            ? "ring-2 ring-emerald-500"
                            : ""
                    }`}
                >
                    <div className="flex justify-between items-center">
                        <h2 className="font-medium">Account #{s.account_id}</h2>
                        <span className="text-emerald-700 font-semibold">
                          Balance: ${(s.balance / 100).toFixed(2)}
                        </span>
                    </div>
                    <ul className="space-y-2">
                        {s.transactions.map((t) => (
                            <li
                                key={t.id}
                                className="flex justify-between text-sm border-b pb-1 last:border-b-0"
                            >
                                <div>
                                    <div>{t.description || "No description"}</div>
                                    <div className="text-xs text-gray-500">
                                        {new Date(t.created_at).toLocaleString()}
                                    </div>
                                </div>
                                <div
                                    className={
                                        t.type === "CREDIT"
                                            ? "text-emerald-600 font-medium"
                                            : "text-rose-600 font-medium"
                                    }
                                >
                                    {t.type === "CREDIT" ? "+" : "-"}$
                                    {(t.amount / 100).toFixed(2)}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </main>
    );
}
