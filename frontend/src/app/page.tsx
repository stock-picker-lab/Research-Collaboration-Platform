"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const role = localStorage.getItem("user_role");

    if (!token) {
      router.push("/login");
      return;
    }

    // 根据角色跳转到对应首页
    switch (role) {
      case "researcher":
        router.push("/workbench");
        break;
      case "pm":
        router.push("/dashboard");
        break;
      case "leader":
        router.push("/management");
        break;
      case "admin":
        router.push("/workbench");
        break;
      default:
        router.push("/workbench");
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
