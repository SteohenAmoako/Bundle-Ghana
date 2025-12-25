import { Logo } from "@/components/logo";

export function Footer() {
    return (
        <footer className="w-full border-t border-border/40">
            <div className="container flex h-20 items-center justify-between text-sm text-muted-foreground">
                <Logo />
                <p>&copy; {new Date().getFullYear()} SB Bundles. All rights reserved.</p>
            </div>
        </footer>
    );
}
