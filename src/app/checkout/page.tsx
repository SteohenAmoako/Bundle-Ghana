"use client";

import { useCart } from "@/hooks/use-cart";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, Wallet } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import PaystackButton from "@/components/paystack-button";

export default function CheckoutPage() {
    const { cartItems, totalPrice, clearCart } = useCart();
    const router = useRouter();
    const { toast } = useToast();
    
    // Mock data - in a real app, this would come from user state/API
    const userEmail = "customer@example.com";
    const walletBalance = 50.00; 

    const isSufficient = walletBalance >= totalPrice;

    const handlePayWithWallet = () => {
        // In a real app, this would trigger API calls to purchase bundles
        toast({
            title: "Purchase Successful!",
            description: "Your data bundles have been sent.",
        });
        clearCart();
        router.push('/orders');
    }

    const handlePaystackSuccess = (reference: any) => {
        console.log("Paystack success reference:", reference);
        // Here you would typically:
        // 1. Verify the transaction with your backend.
        // 2. Update the user's wallet balance.
        // 3. Potentially re-try the purchase if that was the flow.
        router.push('/wallet');
    };

    const handlePaystackClose = () => {
        console.log("Paystack dialog closed.");
    };

    return (
        <div className="container mx-auto max-w-3xl px-4 py-8 sm:py-12">
            <PageHeader
                title="Checkout"
                description="Review your order and complete your purchase."
            />

            {cartItems.length === 0 ? (
                <div className="mt-16 text-center">
                    <p className="text-xl font-semibold">Your cart is empty.</p>
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
                                        Your wallet balance (GHS {walletBalance.toFixed(2)}) is not enough to cover this purchase. Please deposit funds.
                                    </AlertDescription>
                                </Alert>
                            )}
                            <div className="flex flex-col gap-4 sm:flex-row">
                                <Button className="w-full" onClick={handlePayWithWallet} disabled={!isSufficient}>
                                    <Wallet className="mr-2 h-4 w-4" />
                                    Pay with Wallet (GHS {walletBalance.toFixed(2)})
                                </Button>
                                <PaystackButton
                                    email={userEmail}
                                    amount={totalPrice}
                                    onSuccess={handlePaystackSuccess}
                                    onClose={handlePaystackClose}
                                    buttonProps={{ variant: "secondary", className: "w-full" }}
                                >
                                </PaystackButton>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
