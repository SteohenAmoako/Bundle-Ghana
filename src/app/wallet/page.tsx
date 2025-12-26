
"use client";

import React, { useState }from 'react';
import { PageHeader } from "@/components/page-header";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Wallet as WalletIcon, ArrowDownCircle, ArrowUpCircle, Info } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { usePaystackPayment } from 'react-paystack';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAuth } from '@/context/auth-context';
import { supabase } from '@/lib/supabase/client';
import type { Order } from '@/lib/definitions';
import { useEffect } from 'react';

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

    const config = {
        reference: (new Date()).getTime().toString(),
        email: userEmail,
        amount: amountInPesewas,
        publicKey,
        currency: 'GHS',
    };

    const initializePayment = usePaystackPayment(config);

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
                    <Button onClick={() => initializePayment(componentProps)} className="w-full">
                        Deposit Money
                    </Button>
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
    const { user, loading } = useAuth();
    const [balance, setBalance] = useState(0.00);
    const [transactions, setTransactions] = useState<Order[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const fetchWalletData = async () => {
        if (!user) return;

        // Fetch wallet balance
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('wallet_balance')
            .eq('id', user.id)
            .single();

        if (profileError) {
            console.error('Error fetching wallet balance:', profileError);
        } else {
            setBalance(profile.wallet_balance);
        }

        // Fetch transactions
        const { data: transactionsData, error: transactionsError } = await supabase
            .from('transactions')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(10);
        
        if (transactionsError) {
            console.error('Error fetching transactions:', transactionsError);
        } else {
            // This is a temporary mapping, you'll need to adjust your UI or data structure
            const mappedTransactions: Order[] = transactionsData.map((tx: any) => ({
                id: tx.id,
                transactionCode: tx.transaction_code || tx.id.slice(0, 8),
                recipientMsisdn: tx.recipient_msisdn || 'N/A',
                network: tx.network_id === 1 ? 'MTN' : tx.network_id === 2 ? 'Telecel' : 'AirtelTigo',
                bundle: tx.bundle_amount || tx.transaction_type,
                price: tx.amount,
                date: tx.created_at,
                status: tx.status === 'success' ? 'Completed' : 'Failed',
            }));
            setTransactions(mappedTransactions);
        }
    };
    
    useEffect(() => {
        fetchWalletData();
    }, [user]);


    const handleDepositSuccess = async (paymentDetails: { amount: number, reference: string }) => {
        if (!user) return;

        const { error } = await supabase.rpc('add_to_wallet_and_log_transaction', {
            p_user_id: user.id,
            p_amount: paymentDetails.amount,
            p_transaction_type: 'deposit',
            p_status: 'success',
            p_transaction_code: paymentDetails.reference,
            p_description: `Paystack Deposit: ${paymentDetails.reference}`
        });

        if (error) {
            console.error('Error updating balance:', error);
        } else {
            // Re-fetch wallet data to get updated balance and transactions
            await fetchWalletData();
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div>Loading...</div>
            </div>
        );
    }

    if (!user) {
         return (
            <div className="flex justify-center items-center h-screen">
                <div>Please log in to view your wallet.</div>
            </div>
        );
    }

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
                                        userEmail={user.email!} 
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
                                {transactions.length > 0 ? transactions.map((tx) => (
                                    <div key={tx.id} className="flex items-center py-4">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                                            {tx.bundle === 'deposit' ? 
                                                <ArrowDownCircle className="h-5 w-5 text-success" /> : 
                                                <ArrowUpCircle className="h-5 w-5 text-destructive" />
                                            }
                                        </div>
                                        <div className="ml-4 flex-grow">
                                            <p className="font-semibold">{tx.bundle === 'deposit' ? 'Wallet Deposit' : tx.bundle}</p>
                                            <p className="text-sm text-muted-foreground">{new Date(tx.date).toLocaleString()}</p>
                                        </div>
                                        <p className={cn(
                                            "font-semibold",
                                            tx.bundle === 'deposit' ? 'text-success' : 'text-destructive'
                                        )}>
                                            {tx.bundle === 'deposit' ? `+${tx.price.toFixed(2)}` : `-${tx.price.toFixed(2)}`}
                                        </p>
                                    </div>
                                )) : (
                                    <p className="text-center text-muted-foreground py-8">No transactions yet.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
