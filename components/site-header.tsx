import Link from "next/link";
import CustomUserButton from "@/components/custom-user-menu";
import {auth, currentUser} from "@clerk/nextjs/server";

export default async function SiteHeader() {
    const { userId } = await auth();
    const user = userId ? await currentUser() : null;

    return (
        <header className="sticky top-0 z-50 backdrop-blur border-b">
            <div className="flex items-center justify-between px-6 py-4 border-b">
                <Link href="/" className="text-base font-semibold">
                    🏦 Banksy
                </Link>

                <nav className="flex items-center gap-4">
                    {user ? (
                        <>
                            <span className="text-sm">Hi, {user.firstName ?? "there"}!</span>
                            {/* in SiteHeader nav */}
                            <Link href="/dashboard/accounts" className="text-sm hover:underline">Accounts</Link>
                            <Link href="/dashboard/transactions" className="text-sm hover:underline">Transactions</Link>
                            <Link href="/dashboard/error-reporting" className="text-sm hover:underline">Errors</Link>
                            <Link href="/dashboard" className="text-sm underline">
                                Dashboard
                            </Link>
                            <CustomUserButton/>
                        </>
                    ) : (
                        <>
                            <Link href="/sign-in" className="text-sm underline">
                                Sign in
                            </Link>
                            <Link
                                href="/sign-up"
                                className="border rounded-lg px-3 py-1 text-sm hover:bg-gray-50"
                            >
                                Create account
                            </Link>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
}