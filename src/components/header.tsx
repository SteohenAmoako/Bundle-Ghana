import Link from "next/link";
import { Logo } from "@/components/logo";
import { CartIcon } from "@/components/cart-icon";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Wallet } from "lucide-react";

const navLinks = [
    { href: "/", label: "Buy Data" },
    { href: "/orders", label: "My Orders" },
    { href: "/wallet", label: "Wallet" },
];

export function Header() {
    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 max-w-6xl items-center">
                <div className="mr-auto md:mr-4 hidden md:flex">
                    <Logo />
                </div>
                
                <div className="md:hidden flex-none">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <Menu className="h-6 w-6" />
                                <span className="sr-only">Toggle Menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                            <SheetHeader>
                               <SheetTitle className="sr-only">Menu</SheetTitle>
                            </SheetHeader>
                            <nav className="flex flex-col gap-4 mt-8">
                                <div className="mb-4">
                                    <Logo />
                                </div>
                                {navLinks.map((link) => (
                                    <Link key={link.href} href={link.href} className="text-lg font-medium text-foreground/70 hover:text-foreground">
                                        {link.label}
                                    </Link>
                                ))}
                            </nav>
                        </SheetContent>
                    </Sheet>
                </div>

                <div className="flex flex-1 items-center justify-center md:justify-end md:space-x-2">
                    <div className="md:hidden">
                        <Logo />
                    </div>
                    <nav className="hidden md:flex items-center gap-6 text-sm">
                        {navLinks.map((link) => (
                            <Link key={link.href} href={link.href} className="font-medium text-foreground/70 transition-colors hover:text-foreground">
                                {link.label}
                            </Link>
                        ))}
                    </nav>
                    <div className="flex items-center gap-4 ml-auto md:ml-0 flex-none">
                         <Button variant="ghost" className="p-0 h-auto" asChild>
                            <Link href="/wallet" className="flex items-center gap-2">
                               <Wallet className="h-5 w-5 text-muted-foreground" />
                               <span className="font-semibold text-sm">GHS 50.00</span>
                            </Link>
                        </Button>
                        <CartIcon />
                    </div>
                </div>
            </div>
        </header>
    );
}
