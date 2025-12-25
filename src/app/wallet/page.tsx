"use client";

import React, { useState } from 'react';
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Wallet as WalletIcon, ArrowDownCircle, ArrowUpCircle, Info } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { PaystackButton } from 'react-paystack';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const mockTransactions = [
    { id: 1, type: 'deposit', amount: 50.00, date: '2024-07-27', description: 'Paystack Deposit' },
    { id: 2, type: 'purchase', amount: -10.00, date: '2024-07-27', description: 'MTN 1GB Bundle' },
    { id: 3, type: 'purchase', amount: -20.00, date: '2024-07-26', description: 'Telecel 3GB Bundle' },
    { id: 4, type: 'deposit', amount: 25.00, date: '2024-07-25', description: 'Paystack Deposit' },
];


interface PaystackDepositFormProps {
    userEmail: string;
    onSuccess: (details: any) => void;
    onCloseDialog: () => void;
    currentBalance: number;
}

function PaystackDepositForm({ userEmail, onSuccess, currentBalance, onCloseDialog }: PaystackDepositFormProps) {
    const [amount, setAmount] = useState('');
    const { toast } = useToast();

    const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '';
    const amountInPesewas = Math.round(parseFloat(amount || '0') * 100);

    const handlePaymentSuccess = (reference: any) => {
        try {
            const paymentDetails = {
                reference: reference.reference,
                amount: parseFloat(amount),
                transactionId: reference.transaction,
                status: 'success',
                message: `Successfully deposited ${amount} GHS`
            };
            onSuccess(paymentDetails);
            setAmount('');
            toast({
                title: "Deposit Successful!",
                description: `${amount} GHS has been added to your wallet.`
            });
            onCloseDialog(); // Close dialog on success
        } catch (error) {
            console.error('Error processing deposit:', error);
            toast({
                title: "Error",
                description: "There was an error processing your deposit. Please contact support.",
                variant: "destructive"
            });
        }
    };

    const handleClose = () => {
        // This is called when the Paystack modal is closed
    };
    
    const componentProps = {
        reference: (new Date()).getTime().toString(),
        email: userEmail,
        amount: amountInPesewas,
        publicKey,
        currency: 'GHS',
        text: 'Deposit Money',
        onSuccess: handlePaymentSuccess,
        onClose: handleClose,
    };

    const isValidAmount = () => {
        const numAmount = parseFloat(amount);
        return !isNaN(numAmount) && numAmount >= 1 && numAmount <= 1000000;
    };

    if (!publicKey) {
         return (
             <Alert variant="destructive">
                 <Info className="h-4 w-4" />
                 <AlertTitle>Configuration Error</AlertTitle>
                 <AlertDescription>
                    Payment gateway is not configured. Please contact support.
                 </AlertDescription>
             </Alert>
         );
    }

    return (
        <div className="grid gap-6">
            <Card className="bg-accent/10 border-accent/30">
                <CardHeader>
                    <CardTitle className='text-accent'>Current Balance</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-3xl font-bold text-accent">
                        GHS {currentBalance?.toFixed(2) || '0.00'}
                    </p>
                </CardContent>
            </Card>

            <div className="grid gap-2">
                <Label htmlFor="amount">Amount to Deposit (GHS)</Label>
                <Input
                    id="amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount (min: 1 GHS)"
                    min="1"
                    step="0.01"
                />
                <p className="text-xs text-muted-foreground">
                    Minimum deposit: 1 GHS
                </p>
            </div>

            {amount && isValidAmount() && (
                <Alert variant="default" className="bg-success/10 border-success/30">
                    <AlertTitle className='text-success'>Payment Preview</AlertTitle>
                    <AlertDescription className="flex justify-between items-center text-foreground">
                        <span>You will pay:</span>
                        <span className="font-bold text-lg">GHS {parseFloat(amount).toFixed(2)}</span>
                    </AlertDescription>
                </Alert>
            )}

            <div className="mt-4">
                 {isValidAmount() ? (
                    <PaystackButton {...componentProps} className={cn(buttonVariants(), "w-full")} />
                ) : (
                    <Button disabled className="w-full">
                        Enter a valid amount
                    </Button>
                )}
            </div>
            
            <Card className="mt-4 bg-muted/50">
                <CardHeader>
                    <CardTitle className="text-base">Payment Information</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="text-sm text-muted-foreground space-y-2">
                        <li className='flex items-center gap-2'>✓ Secure payment via Paystack</li>
                        <li className='flex items-center gap-2'>✓ Accept all major cards & Mobile Money</li>
                        <li className='flex items-center gap-2'>✓ Instant wallet credit</li>
                    </ul>
                </CardContent>
            </Card>
        </div>
    );
}

export default function WalletPage() {
    const [balance, setBalance] = useState(50.00);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const userEmail = "customer@example.com";

    const handleDepositSuccess = (paymentDetails: { amount: number; }) => {
        setBalance(prevBalance => prevBalance + paymentDetails.amount);
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
                            <p className="text-4xl font-bold">GHS {balance.toFixed(2)}</p>
                        </CardContent>
                        <CardFooter>
                            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button className="w-full">
                                        <PlusCircle className="mr-2 h-4 w-4" /> Add Money
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-md">
                                    <DialogHeader>
                                        <DialogTitle>Add Money to Your Wallet</DialogTitle>
                                        <DialogDescription>
                                            Enter an amount and complete the payment to top up your balance.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <PaystackDepositForm 
                                        userEmail={userEmail} 
                                        onSuccess={handleDepositSuccess}
                                        currentBalance={balance}
                                        onCloseDialog={() => setIsDialogOpen(false)}
                                    />
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
