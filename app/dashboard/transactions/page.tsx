"use client";

import { Suspense } from "react";
import TransactionsContent from "@/components/transactions-content";

export default function TransactionsPage() {
    return (
        <Suspense fallback={<div>Loading transactions...</div>}>
            <TransactionsContent />
        </Suspense>
    );
}