import Link from "next/link";
import { Package } from "lucide-react";

export function Logo() {
    return (
        <Link href="/" className="flex items-center gap-2" aria-label="SB Bundles Home">
            <Package className="h-7 w-7 text-primary" />
            <span className="font-headline text-2xl font-bold whitespace-nowrap">
                SB Bundles
            </span>
        </Link>
    );
}
