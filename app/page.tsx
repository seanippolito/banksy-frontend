import Link from "next/link";
import { currentUser, auth } from "@clerk/nextjs/server";

export default async function HomePage() {
    const { userId } = await auth();
    const user = userId ? await currentUser() : null;

    return (
        <main className="min-h-screen flex flex-col">
            <header className="flex items-center justify-between px-6 py-4 border-b">
                <div className="text-xl font-semibold">🏦 Banksy</div>
                <nav className="flex items-center gap-4">
                    {user ? (
                        <>
                            <span className="text-sm">Hi, {user.firstName ?? "there"}!</span>
                            <Link href="/dashboard" className="text-sm underline">
                                Dashboard
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link href="/sign-in" className="text-sm underline">
                                Sign in
                            </Link>
                            <Link
                                href="/sign-up"
                                className="rounded-lg px-3 py-1.5 border text-sm hover:bg-gray-50"
                            >
                                Create account
                            </Link>
                        </>
                    )}
                </nav>
            </header>

            <section className="flex-1 grid place-items-center px-6">
                <div className="max-w-2xl text-center space-y-6">
                    <h1 className="text-4xl font-bold tracking-tight">
                        Modern banking for builders.
                    </h1>
                    <p className="text-base text-gray-600 leading-relaxed">
                        Banksy is a secure, developer banking platform. Open an account,
                        move money, track spend, and integrate finance into your apps.
                    </p>
                    <div className="flex items-center justify-center gap-3">
                        <Link
                            href="/sign-up"
                            className="rounded-xl px-4 py-2 border font-medium hover:bg-gray-50"
                        >
                            Get started
                        </Link>
                        <Link href="#features" className="text-sm underline">
                            Learn more
                        </Link>
                    </div>
                </div>
            </section>

            <footer className="px-6 py-6 text-center text-xs text-gray-500 border-t">
                © {new Date().getFullYear()} Banksy. All rights reserved.
            </footer>
        </main>
    );
}
