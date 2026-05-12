"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { Spin } from "antd";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { verifyToken } from "@/services/auth.service";

const publicRoutes = new Set(["/login"]);

export default function AuthGate({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const router = useRouter();
  const pathname = usePathname() || "/";
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const hydrate = useAuthStore((state) => state.hydrate);
  const logout = useAuthStore((state) => state.logout);

  const isAuthenticated = useMemo(() => Boolean(token && user), [token, user]);
  const isPublicRoute = publicRoutes.has(pathname);

  useEffect(() => {
    hydrate();
    setHydrated(true);
  }, [hydrate]);

  useEffect(() => {
    if (!hydrated) return;

    if (!isAuthenticated && !isPublicRoute) {
      router.replace("/login");
      return;
    }

    if (isAuthenticated && pathname === "/login") {
      router.replace("/jobs");
    }
  }, [hydrated, isAuthenticated, isPublicRoute, pathname, router]);

  useEffect(() => {
    if (!hydrated || !isAuthenticated || isPublicRoute) return;

    let cancelled = false;

    const verify = async () => {
      try {
        await verifyToken();
      } catch {
        if (cancelled) return;
        logout();
        router.replace("/login");
      }
    };

    verify();

    return () => {
      cancelled = true;
    };
  }, [hydrated, isAuthenticated, isPublicRoute, logout, router]);

  if (!hydrated) {
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
        <Spin />
      </div>
    );
  }

  if (!isAuthenticated && !isPublicRoute) return null;
  if (isAuthenticated && pathname === "/login") return null;

  return children;
}
