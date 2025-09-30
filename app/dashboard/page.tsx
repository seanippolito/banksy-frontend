"use client";

import { useApi } from "@/lib/api";
import useSWR from "swr";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";

type Account = {
    id: number;
    name: string;
    currency: string;
    created_at: string;
    updated_at: string;
};

export default function DashboardPage() {
    const { request } = useApi();
    const { user, isLoaded } = useUser();

    const { data: accounts, isLoading, error } = useSWR<Account[]>(
        "/api/v1/accounts",
        (key) => request<Account[]>(key),
        { revalidateOnFocus: false }
    );

    if (!isLoaded) {
        return (
            <main className="min-h-screen grid place-items-center">
                <p className="text-gray-600">Loading…</p>
            </main>
        );
    }

    if (!user) {
        return (
            <main className="min-h-screen grid place-items-center">
                <div className="text-center space-y-3">
                    <p className="text-lg">You must be signed in to view the dashboard.</p>
                    <Link href="/sign-in" className="underline">
                        Sign in
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen p-6 space-y-10">
            <p className="text-sm text-gray-600">Welcome back, {user.firstName}!</p>

            {/* Quick Actions */}
            <section>
                <h2 className="text-lg font-medium mb-3">Quick Actions</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    <Link
                        href="/dashboard/accounts"
                        className="p-4 rounded-xl border shadow-sm bg-white hover:bg-gray-50 flex flex-col items-center text-center space-y-2"
                    >
                        <span className="text-2xl">🏦</span>
                        <span className="text-sm font-medium">Create Account</span>
                    </Link>
                    <Link
                        href="/money-transfer"
                        className="p-4 rounded-xl border shadow-sm bg-white hover:bg-gray-50 flex flex-col items-center text-center space-y-2"
                    >
                        <span className="text-2xl">💸</span>
                        <span className="text-sm font-medium">Money Transfer</span>
                    </Link>
                    <Link
                        href="/dashboard/transactions"
                        className="p-4 rounded-xl border shadow-sm bg-white hover:bg-gray-50 flex flex-col items-center text-center space-y-2"
                    >
                        <span className="text-2xl">📑</span>
                        <span className="text-sm font-medium">View Transactions</span>
                    </Link>
                    <Link
                        href="/dashboard/error-reporting"
                        className="p-4 rounded-xl border shadow-sm bg-white hover:bg-gray-50 flex flex-col items-center text-center space-y-2"
                    >
                        <span className="text-2xl">⚠️</span>
                        <span className="text-sm font-medium">Error Logs</span>
                    </Link>
                </div>
            </section>

            {/* Profile */}
            <section>
                <h2 className="text-lg font-medium mb-3">Your Profile</h2>
                <div className="border rounded-xl p-4 bg-white shadow-sm flex items-center gap-4">
                    <Image
                        src={user.imageUrl}
                        alt="avatar"
                        className="w-16 h-16 rounded-full border"
                        width={128}
                        height={128}
                        objectFit="cover"
                    />
                    <div>
                        <div className="font-medium">{user.fullName}</div>
                        <div className="text-sm text-gray-600">
                            {user.primaryEmailAddress?.emailAddress}
                        </div>
                        <div className="text-xs text-gray-500">
                            Member since{" "}
                            {new Date(user.createdAt ?? "").toLocaleDateString()}
                        </div>
                    </div>
                </div>
            </section>

            {/* Accounts */}
            <section>
                <h2 className="text-lg font-medium mb-3">Your Accounts</h2>
                {isLoading && <p className="text-sm text-gray-500">Loading accounts…</p>}
                {error && (
                    <p className="text-sm text-red-600">Failed to load accounts.</p>
                )}
                {accounts?.length === 0 && (
                    <p className="text-sm text-gray-500">
                        You don’t have any accounts yet.
                    </p>
                )}

                <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {accounts?.map((a) => (
                        <li
                            key={a.id}
                            className="border rounded-xl p-4 shadow-sm bg-white flex flex-col justify-between"
                        >
                            <div>
                                <div className="font-medium">{a.name}</div>
                                <div className="text-sm text-gray-600">
                                    {a.currency} • Created{" "}
                                    {new Date(a.created_at).toLocaleDateString()}
                                </div>
                            </div>
                            <Link
                                href={`/dashboard/accounts/${a.id}`}
                                className="mt-3 text-sm text-blue-600 hover:underline"
                            >
                                View Transactions →
                            </Link>
                        </li>
                    ))}
                </ul>
            </section>
        </main>
    );
}
