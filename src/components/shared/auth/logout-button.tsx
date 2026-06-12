"use client";

import { useTransition } from "react";
import { LogOut } from "lucide-react";
import { logoutAction } from "@/actions/auth/logout";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LogoutButtonProps {
  variant?: "default" | "ghost" | "outline";
  showIcon?: boolean;
  sidebar?: boolean;
}

export function LogoutButton({
  variant = "ghost",
  showIcon = true,
  sidebar = false,
}: LogoutButtonProps) {
  const [isPending, startTransition] = useTransition();

  function handleLogout() {
    startTransition(() => {
      logoutAction();
    });
  }

  return (
    <Button
      variant={variant}
      onClick={handleLogout}
      disabled={isPending}
      className={cn(
        "w-full justify-start gap-2",
        sidebar &&
          "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
      )}
    >
      {showIcon && <LogOut className="h-4 w-4" strokeWidth={1.5} />}
      {isPending ? "Saindo..." : "Sair"}
    </Button>
  );
}
