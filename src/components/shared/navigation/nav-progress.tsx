"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useLinkStatus } from "next/link";
import { cn } from "@/lib/utils";

interface NavProgressContextValue {
  registerPending: (pending: boolean) => void;
}

const NavProgressContext = createContext<NavProgressContextValue | null>(null);

export function NavProgressProvider({ children }: { children: React.ReactNode }) {
  const [pendingCount, setPendingCount] = useState(0);
  const isNavigating = pendingCount > 0;

  const registerPending = useCallback((pending: boolean) => {
    setPendingCount((count) => Math.max(0, count + (pending ? 1 : -1)));
  }, []);

  const value = useMemo(() => ({ registerPending }), [registerPending]);

  return (
    <NavProgressContext.Provider value={value}>
      <div
        className={cn(
          "pointer-events-none fixed inset-x-0 top-0 z-[100] h-0.5 origin-left bg-gold transition-transform duration-300",
          isNavigating ? "scale-x-100 opacity-100" : "scale-x-0 opacity-0"
        )}
        aria-hidden
      />
      {children}
    </NavProgressContext.Provider>
  );
}

export function NavLinkPendingTracker() {
  const context = useContext(NavProgressContext);
  const { pending } = useLinkStatus();

  useEffect(() => {
    if (!context || !pending) return;
    context.registerPending(true);
    return () => {
      context.registerPending(false);
    };
  }, [context, pending]);

  return null;
}
