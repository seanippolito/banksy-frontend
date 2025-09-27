import { SignUp } from "@clerk/nextjs";

export default function Page() {
    return (
        <main className="min-h-screen grid place-items-center p-6">
            <SignUp
                appearance={{ elements: { card: "shadow-sm border rounded-2xl" } }}
                path="/sign-up"
                routing="path"
                signInUrl="/sign-in"
            />
        </main>
    );
}
