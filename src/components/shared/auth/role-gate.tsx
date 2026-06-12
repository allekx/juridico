import type { UserRole } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth/session";

interface RoleGateProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export async function RoleGate({
  allowedRoles,
  children,
  fallback = null,
}: RoleGateProps) {
  const user = await getCurrentUser();

  if (!user || !allowedRoles.includes(user.role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
