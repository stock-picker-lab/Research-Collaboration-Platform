"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // 优先从 Zustand store 获取角色，若无则从 localStorage 获取
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("user_role");

    if (!token) {
      router.push("/login");
      return;
    }

    // 根据角色跳转到对应首页
    switch (role) {
      case "researcher":
        router.push("/researcher");
        break;
      case "pm":
        router.push("/fm");
        break;
      case "leader":
        router.push("/leader");
        break;
      case "admin":
        router.push("/admin");
        break;
      default:
        router.push("/researcher");
    }
    setChecking(false);
  }, [router]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">正在加载...</p>
        </div>
      </div>
    );
  }

  return null;
}
