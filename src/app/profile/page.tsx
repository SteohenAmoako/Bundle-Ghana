import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
    // Mock user data
    const user = {
        name: "John Doe",
        email: "john.doe@example.com",
        initials: "JD",
        avatarUrl: "https://github.com/shadcn.png"
    }

    return (
        <div className="container mx-auto max-w-2xl px-4 py-8 sm:py-12">
            <PageHeader
                title="My Profile"
                description="View and manage your account details."
            />

            <div className="mt-8">
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-4">
                            <Avatar className="h-20 w-20">
                                <AvatarImage src={user.avatarUrl} alt={user.name} />
                                <AvatarFallback>{user.initials}</AvatarFallback>
                            </Avatar>
                            <div>
                                <CardTitle className="text-3xl">{user.name}</CardTitle>
                                <CardDescription>{user.email}</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <h3 className="font-semibold">Account Information</h3>
                            <p className="text-sm text-muted-foreground">Update your personal details here.</p>
                        </div>
                        <Button>Edit Profile</Button>
                        <hr/>
                        <div>
                            <h3 className="font-semibold">Security</h3>
                             <p className="text-sm text-muted-foreground">Change your password.</p>
                        </div>
                        <Button variant="secondary">Change Password</Button>
                        <hr/>
                         <div>
                            <h3 className="font-semibold text-destructive">Danger Zone</h3>
                             <p className="text-sm text-muted-foreground">Delete your account and all associated data.</p>
                        </div>
                        <Button variant="destructive">Delete Account</Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
