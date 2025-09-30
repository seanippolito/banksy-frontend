"use client";

import { Suspense } from "react";
import StatementsContent from "@/components/statements-content";

export default function StatementsPage() {
    return (
        <Suspense fallback={<div>Loading statements...</div>}>
            <StatementsContent />
        </Suspense>
    );
}
