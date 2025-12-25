"use client";

import { usePaystackPayment } from 'react-paystack';
import { Button, type ButtonProps } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { CreditCard } from 'lucide-react';

interface PaystackButtonProps {
    email: string;
    amount: number; // in GHS
    onSuccess: (reference: any) => void;
    onClose: () => void;
    buttonProps?: ButtonProps;
    children?: React.ReactNode;
}

const PaystackButton = ({ email, amount, onSuccess, onClose, buttonProps, children }: PaystackButtonProps) => {
    const { toast } = useToast();

    // Paystack amount is in pesewas (GHS * 100)
    const paystackAmount = Math.round(amount * 100);

    const config = {
        reference: (new Date()).getTime().toString(),
        email,
        amount: paystackAmount,
        publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '',
        currency: 'GHS',
    };

    const initializePayment = usePaystackPayment(config);

    const handlePayment = () => {
        if (!config.publicKey) {
            console.error("Paystack public key is not set. Please set NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY in your .env.local file.");
            toast({
                title: "Configuration Error",
                description: "Payment gateway is not configured. Please contact support.",
                variant: "destructive"
            });
            return;
        }
        initializePayment({
            onSuccess: (reference) => {
                toast({
                    title: "Payment successful!",
                    description: `Transaction reference: ${reference.reference}`
                });
                onSuccess(reference);
            },
            onClose: () => {
                onClose();
            }
        });
    };

    return (
        <Button onClick={handlePayment} {...buttonProps}>
            {children || (
                <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Deposit via Paystack
                </>
            )}
        </Button>
    );
};

export default PaystackButton;
