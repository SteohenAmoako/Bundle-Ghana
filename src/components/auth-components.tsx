"use client";

import { useAuth } from "@/context/auth-context";

export function AuthComponents({
  children,
  fallback,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (user) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}
