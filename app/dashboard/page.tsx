import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import MeWidget from "@/components/me-widget"

export default async function DashboardPage() {
    const { userId } = await auth();

    if (!userId) {
        return (
            <main className="min-h-screen grid place-items-center">
                <div className="text-center space-y-3">
                    <p className="text-lg">You must be signed in to view the dashboard.</p>
                    <Link href="/sign-in" className="underline">Sign in</Link>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen p-6">
            <h1 className="text-2xl font-semibold">Dashboard</h1>
            <p className="text-sm text-gray-600 mt-2">
                Welcome to your Banksy dashboard.
            </p>
            <MeWidget/>
        </main>
    );
}
