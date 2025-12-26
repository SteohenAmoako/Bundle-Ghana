"use client";

import { useCart } from "@/hooks/use-cart";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, Wallet, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import PaystackButton from "@/components/paystack-button";
import { useAuth } from "@/context/auth-context";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function CheckoutPage() {
    const { cartItems, totalPrice, clearCart } = useCart();
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    
    const [walletBalance, setWalletBalance] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isFetchingBalance, setIsFetchingBalance] = useState(true);

    useEffect(() => {
        const fetchWalletBalance = async () => {
            if (!user) {
                setIsFetchingBalance(false);
                return;
            };

            setIsFetchingBalance(true);
            const { data, error } = await supabase
                .from('profiles')
                .select('wallet_balance')
                .eq('id', user.id)
                .single();

            if (error) {
                console.error("Error fetching wallet balance:", error);
                toast({
                    title: "Error",
                    description: "Could not fetch wallet balance.",
                    variant: "destructive",
                });
            } else {
                setWalletBalance(data.wallet_balance);
            }
            setIsFetchingBalance(false);
        };

        if (!authLoading) {
            fetchWalletBalance();
        }
    }, [user, authLoading, toast]);


    const isSufficient = walletBalance >= totalPrice;

    const handlePayWithWallet = async () => {
        if (!user) {
             toast({
                title: "Authentication Error",
                description: "You must be logged in to make a purchase.",
                variant: "destructive",
            });
            return;
        }

        setIsProcessing(true);

        for (const item of cartItems) {
             const { error } = await supabase.rpc('purchase_bundle_and_log_transaction', {
                p_user_id: user.id,
                p_amount: item.price,
                p_transaction_code: `PUR-${Date.now()}`, 
                p_status: 'success', // This should be updated based on actual API call result
                p_recipient_msisdn: item.recipientMsisdn,
                p_network_id: item.networkId,
                p_shared_bundle: item.sharedBundle,
                p_bundle_amount: item.dataAmount,
                p_description: `Purchase of ${item.dataAmount} for ${item.recipientMsisdn}`
            });

            if (error) {
                console.error("Purchase error for item:", item.cartId, error);
                toast({
                    title: "Purchase Failed",
                    description: `Could not purchase ${item.dataAmount}. ${error.message}`,
                    variant: "destructive",
                });
                setIsProcessing(false);
                return; // Stop processing further items if one fails
            }
        }
        
        toast({
            title: "Purchase Successful!",
            description: "Your data bundles have been sent.",
        });
        clearCart();
        router.push('/orders');
        setIsProcessing(false);
    }

    const handlePaystackSuccess = (reference: any) => {
        // This flow will now be handled on the wallet page. 
        // User should deposit first, then come back to checkout.
        toast({
            title: "Deposit Successful",
            description: "Your wallet has been credited. You can now complete the purchase.",
        });
        router.push('/wallet?redirect=/checkout');
    };

    const handlePaystackClose = () => {
        console.log("Paystack dialog closed.");
    };

    if (authLoading || isFetchingBalance) {
         return <div className="text-center p-12">Loading...</div>
    }

    return (
        <div className="container mx-auto max-w-3xl px-4 py-8 sm:py-12">
            <PageHeader
                title="Checkout"
                description="Review your order and complete your purchase."
            />

            {cartItems.length === 0 ? (
                <div className="mt-16 text-center">
                    <ShoppingBag className="mx-auto h-24 w-24 text-muted-foreground/30" />
                    <p className="mt-4 text-xl font-semibold">Your cart is empty.</p>
                    <Button asChild className="mt-4">
                        <Link href="/">Go Shopping</Link>
                    </Button>
                </div>
            ) : (
                <div className="mt-8 grid gap-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Order Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {cartItems.map(item => (
                                <div key={item.cartId} className="flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold">{item.dataAmount} for {item.recipientMsisdn}</p>
                                        <p className="text-sm text-muted-foreground">{item.networkName}</p>
                                    </div>
                                    <p>GHS {item.price.toFixed(2)}</p>
                                </div>
                            ))}
                            <hr />
                            <div className="flex justify-between text-lg font-bold">
                                <p>Total</p>
                                <p>GHS {totalPrice.toFixed(2)}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Payment Method</CardTitle>
                            <CardDescription>Choose how you want to pay for your order.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {!isSufficient && (
                                <Alert variant="destructive">
                                    <Info className="h-4 w-4" />
                                    <AlertTitle>Insufficient Balance</AlertTitle>
                                    <AlertDescription>
                                        Your wallet balance (GHS {walletBalance.toFixed(2)}) is not enough to cover this purchase. Please deposit funds first.
                                        <Button variant="link" className="p-0 h-auto ml-1" asChild>
                                            <Link href="/wallet">Go to Wallet</Link>
                                        </Button>
                                    </AlertDescription>
                                </Alert>
                            )}
                            <div className="flex flex-col gap-4 sm:flex-row">
                                <Button className="w-full" onClick={handlePayWithWallet} disabled={!isSufficient || isProcessing}>
                                    <Wallet className="mr-2 h-4 w-4" />
                                    {isProcessing ? 'Processing...' : `Pay with Wallet (GHS ${walletBalance.toFixed(2)})`}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
