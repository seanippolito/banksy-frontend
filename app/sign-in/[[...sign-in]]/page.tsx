import { SignIn } from "@clerk/nextjs";

export default function Page() {
    return (
        <main className="min-h-screen grid place-items-center p-6">
            <SignIn
                appearance={{ elements: { card: "shadow-sm border rounded-2xl" } }}
                path="/sign-in"
                routing="path"
                signUpUrl="/sign-up"
            />
        </main>
    );
}