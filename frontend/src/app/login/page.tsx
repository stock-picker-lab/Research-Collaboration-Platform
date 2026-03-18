"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authAPI } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await authAPI.login({ username, password });
      const { access_token, user } = res.data;
      localStorage.setItem("access_token", access_token);
      localStorage.setItem("user_role", user.role);
      localStorage.setItem("user_id", user.id);
      localStorage.setItem("user_name", user.name);
      router.push("/");
    } catch (err: any) {
      setError(err.response?.data?.detail || "登录失败，请检查用户名和密码");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 text-white text-2xl font-bold mb-4">
            投
          </div>
          <h1 className="text-2xl font-bold text-gray-900">投研协作平台</h1>
          <p className="text-sm text-gray-500 mt-1">Research Collaboration Copilot</p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleLogin}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8"
        >
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm border border-red-100">
              {error}
            </div>
          )}

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                用户名
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                placeholder="请输入用户名"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                密码
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                placeholder="请输入密码"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors"
            >
              {loading ? "登录中..." : "登录"}
            </button>
          </div>

          {/* Demo Accounts */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-400 text-center mb-3">演示账号</p>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
              <div className="p-2 bg-gray-50 rounded-lg">
                <p className="font-medium">研究员</p>
                <p>researcher1 / research123</p>
              </div>
              <div className="p-2 bg-gray-50 rounded-lg">
                <p className="font-medium">基金经理</p>
                <p>pm1 / pm123</p>
              </div>
              <div className="p-2 bg-gray-50 rounded-lg">
                <p className="font-medium">研究所领导</p>
                <p>leader1 / leader123</p>
              </div>
              <div className="p-2 bg-gray-50 rounded-lg">
                <p className="font-medium">管理员</p>
                <p>admin / admin123</p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
