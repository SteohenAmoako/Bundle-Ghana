"use client";
import { PageHeader } from "@/components/page-header";
import { OrdersTable } from "@/components/orders-table";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/context/auth-context";
import { supabase } from "@/lib/supabase/client";
import { useEffect, useState, useCallback } from "react";
import type { Transaction } from "@/lib/definitions";
import { Skeleton } from "@/components/ui/skeleton";

export default function OrdersPage() {
    const { user, loading: authLoading } = useAuth();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchTransactions = useCallback(async () => {
        if (!user) {
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('transactions')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) {
                console.error("Error fetching transactions:", error);
            } else {
                setTransactions(data || []);
            }
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (!authLoading) {
            fetchTransactions();
        }
    }, [authLoading, fetchTransactions]);

    return (
        <div className="container mx-auto max-w-6xl px-4 py-8 sm:py-12">
            <PageHeader
                title="My Orders"
                description="View your recent data bundle purchases and their status."
            />
            <div className="mt-8">
                <Card>
                    <CardContent className="p-4 sm:p-6">
                        {loading ? (
                            <div className="space-y-4">
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                        ) : (
                            <OrdersTable data={transactions} onRefresh={fetchTransactions} />
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
