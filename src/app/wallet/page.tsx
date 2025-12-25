"use client";

import React, { useState } from 'react';
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Wallet as WalletIcon, ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import PaystackButton from '@/components/paystack-button';
import { useRouter } from 'next/navigation';

const mockTransactions = [
    { id: 1, type: 'deposit', amount: 50.00, date: '2024-07-27', description: 'Paystack Deposit' },
    { id: 2, type: 'purchase', amount: -10.00, date: '2024-07-27', description: 'MTN 1GB Bundle' },
    { id: 3, type: 'purchase', amount: -20.00, date: '2024-07-26', description: 'Telecel 3GB Bundle' },
    { id: 4, type: 'deposit', amount: 25.00, date: '2024-07-25', description: 'Paystack Deposit' },
];

export default function WalletPage() {
    const [amount, setAmount] = useState(10);
    const router = useRouter();

    // Mock data
    const userEmail = "customer@example.com";

    const handlePaystackSuccess = (reference: any) => {
        console.log("Paystack success reference:", reference);
        // Here you would typically:
        // 1. Verify the transaction with your backend.
        // 2. Update the user's wallet balance.
        // 3. Refresh the transaction list.
        // For now, we just log and maybe route them somewhere.
        router.refresh();
    };

    const handlePaystackClose = () => {
        console.log("Paystack dialog closed.");
    };

    return (
        <div className="container mx-auto max-w-4xl px-4 py-8 sm:py-12">
            <PageHeader
                title="My Wallet"
                description="Manage your balance and view your transaction history."
            />

            <div className="mt-8 grid gap-8 md:grid-cols-3">
                <div className="md:col-span-1">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg text-muted-foreground">
                                <WalletIcon className="h-5 w-5" />
                                Current Balance
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-4xl font-bold">GHS 50.00</p>
                        </CardContent>
                        <CardFooter>
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button className="w-full">
                                        <PlusCircle className="mr-2 h-4 w-4" /> Add Money
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[425px]">
                                    <DialogHeader>
                                        <DialogTitle>Add money to your wallet</DialogTitle>
                                        <DialogDescription>
                                            Enter the amount you want to deposit and proceed to Paystack.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="amount" className="text-right">
                                                Amount
                                            </Label>
                                            <Input 
                                                id="amount" 
                                                value={amount}
                                                onChange={(e) => setAmount(Number(e.target.value))}
                                                type="number" 
                                                className="col-span-3" 
                                            />
                                        </div>
                                    </div>
                                    <PaystackButton
                                        email={userEmail}
                                        amount={amount}
                                        onSuccess={handlePaystackSuccess}
                                        onClose={handlePaystackClose}
                                        buttonProps={{ className: "w-full" }}
                                    >
                                        Proceed to Paystack
                                    </PaystackButton>
                                </DialogContent>
                            </Dialog>
                        </CardFooter>
                    </Card>
                </div>
                <div className="md:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Transaction History</CardTitle>
                            <CardDescription>Your most recent transactions.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="divide-y divide-border">
                                {mockTransactions.map((tx) => (
                                    <div key={tx.id} className="flex items-center py-4">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                                            {tx.amount > 0 ? 
                                                <ArrowDownCircle className="h-5 w-5 text-success" /> : 
                                                <ArrowUpCircle className="h-5 w-5 text-destructive" />
                                            }
                                        </div>
                                        <div className="ml-4 flex-grow">
                                            <p className="font-semibold">{tx.description}</p>
                                            <p className="text-sm text-muted-foreground">{tx.date}</p>
                                        </div>
                                        <p className={cn(
                                            "font-semibold",
                                            tx.amount > 0 ? 'text-success' : 'text-destructive'
                                        )}>
                                            {tx.amount > 0 ? `+${tx.amount.toFixed(2)}` : tx.amount.toFixed(2)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
