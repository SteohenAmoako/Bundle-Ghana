"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { Badge } from "./ui/badge";

export function CartIcon() {
    const { itemCount } = useCart();
    return (
        <Button asChild variant="ghost" size="icon" className="relative">
            <Link href="/cart">
                <ShoppingBag className="h-6 w-6" />
                {itemCount > 0 && (
                    <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 justify-center rounded-full p-0">
                        {itemCount}
                    </Badge>
                )}
                <span className="sr-only">View Shopping Cart</span>
            </Link>
        </Button>
    );
}
