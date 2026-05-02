"use client";

import { useState } from "react";
import { login } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth.store";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const setAuth = useAuthStore((s: any) => s.setAuth);
  const router = useRouter();

  const handleLogin = async () => {
    const res = await login({ phone, password });
    setAuth(res);

    if (res.user.role === "admin") router.push("/dashboard");
    else router.push("/jobs");
  };

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="space-y-4">
        <input placeholder="Phone" onChange={(e) => setPhone(e.target.value)} />
        <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
        <button onClick={handleLogin}>Login</button>
      </div>
    </div>
  );
}