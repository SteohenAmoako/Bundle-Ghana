"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { UsersTable } from "./users-table";
import { RecentTransactions } from "./recent-transactions";
import { Profile, Transaction } from "@/lib/definitions";

type View = "users" | "transactions";

export function DashboardClient({ users, transactions }: { users: Profile[], transactions: Transaction[] }) {
    const [view, setView] = useState<View>("users");

    return (
        <div>
            <div className="flex gap-2 mb-4">
                <Button onClick={() => setView("users")} variant={view === "users" ? "secondary" : "ghost"}>
                    All Users
                </Button>
                <Button onClick={() => setView("transactions")} variant={view === "transactions" ? "secondary" : "ghost"}>
                    All Transactions
                </Button>
            </div>

            {view === "users" && <UsersTable data={users} />}
            {view === "transactions" && <RecentTransactions data={transactions} />}
        </div>
    );
}
