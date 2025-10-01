import Link from "next/link";

export default async function HomePage() {
    return (
        <section className="flex-1 grid place-items-center px-6">
            <div className="max-w-2xl text-center space-y-6">
                <h1 className="text-highlight text-4xl font-bold tracking-tight">
                    Modern banking for builders.
                </h1>
                <p className="text-base text-muted leading-relaxed">
                    Banksy is a secure, developer banking platform. Open an account,
                    move money, track spend, and integrate finance into your apps.
                </p>
                <div className="flex items-center justify-center gap-3">
                    <Link
                        href="/sign-up"
                        className="btn-accent rounded-xl px-4 py-2 border font-medium"
                    >
                        Get started
                    </Link>
                    <Link href="#features" className="text-sm hover:underline">
                        Learn more
                    </Link>
                </div>
            </div>
        </section>
    );
}
