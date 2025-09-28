"use client";

import { SignedIn, SignOutButton, useUser } from "@clerk/nextjs";
import { useState } from "react";

export default function CustomUserMenu() {
    const { user } = useUser();
    const [open, setOpen] = useState(false);

    return (
        <div className="relative">
            <SignedIn>
                <button
                    className="flex items-center gap-1 px-0.5 py-0.5 rounded-full hover:bg-gray-50"
                    onClick={() => setOpen((v) => !v)}
                    aria-haspopup="menu"
                    aria-expanded={open}
                >
                    <img
                        src={user?.imageUrl ?? "/avatar.svg"}
                        alt="Profile"
                        className="h-8 w-8 rounded-full"
                    />
                </button>

                {open && (
                    <div
                        className="absolute right-0 mt-2 w-48 rounded-xl border bg-white shadow-lg p-2"
                        role="menu"
                    >
                        <div className="px-3 py-2 text-sm text-gray-700">
                            {user?.firstName ? `Hi, ${user.firstName}` : "Account"}
                        </div>
                        <hr className="my-1"/>
                        <SignOutButton signOutOptions={{sessionId: undefined}} redirectUrl="/">
                            <button
                                className="text-red-400 w-full text-left px-3 py-2 text-sm hover:bg-gray-200 rounded-md"
                                role="menuitem">
                                Sign out
                            </button>
                        </SignOutButton>
                    </div>
                )}
            </SignedIn>
        </div>
    );
}
