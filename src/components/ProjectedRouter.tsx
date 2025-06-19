"use client";
import { useRouter } from "next/router";
import { ReactNode, useEffect, useState } from "react";

type RouteProps = {
  children: ReactNode;
};

export const ProtectedRoute = ({ children }: RouteProps) => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        router.replace("/sign-in");
        setIsAuthenticated(false);
      } else {
        setIsAuthenticated(true);
      }
    }
  }, [router]);

  if (isAuthenticated === null) return null;
  return <>{children}</>;
};

export const PublicRoute = ({ children }: RouteProps) => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken");
      if (token) {
        router.replace("/");
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    }
  }, [router]);

  if (isAuthenticated === null) return null;
  return <>{children}</>;
};
