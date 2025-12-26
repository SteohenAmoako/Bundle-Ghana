"use client";

import { PageHeader } from "@/components/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProfilePage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div>Loading...</div>
      </div>
    );
  }

  const displayName = user.user_metadata.full_name || "User";

  const userInitials =
    displayName
      ?.split(" ")
      .map((n) => n[0])
      .join("") ||
    user.email?.[0].toUpperCase() ||
    "U";

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
                <AvatarImage src={user.user_metadata.avatar_url || ""} alt={displayName} />
                <AvatarFallback>{userInitials}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-3xl">{displayName}</CardTitle>
                <CardDescription>{user.email}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold">Account Information</h3>
              <p className="text-sm text-muted-foreground">
                Update your personal details here.
              </p>
              <Button className="mt-2">Edit Profile</Button>
            </div>
            <hr />
            <div>
              <h3 className="font-semibold">Security</h3>
              <p className="text-sm text-muted-foreground">
                Change your password.
              </p>
              <Button variant="secondary" className="mt-2">
                Change Password
              </Button>
            </div>
            <hr />
            <div>
              <h3 className="font-semibold text-destructive">Danger Zone</h3>
              <p className="text-sm text-muted-foreground">
                Log out or delete your account and all associated data.
              </p>
              <div className="flex gap-2 mt-2">
                <Button variant="outline" onClick={logout}>
                    Logout
                </Button>
                <Button variant="destructive">Delete Account</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
