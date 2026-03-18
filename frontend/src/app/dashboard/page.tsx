"use client";

import { useEffect, useState } from "react";
import { dashboardAPI } from "@/lib/api";

const stanceLabels: Record<string, { text: string; color: string }> = {
  bullish: { text: "看多", color: "bg-green-100 text-green-700" },
  neutral: { text: "中性", color: "bg-gray-100 text-gray-700" },
  cautious: { text: "谨慎", color: "bg-yellow-100 text-yellow-700" },
  bearish: { text: "回避", color: "bg-red-100 text-red-700" },
};

const confidenceIcons: Record<string, string> = {
  high: "🟢",
  medium: "🟡",
  low: "🔴",
};

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await dashboardAPI.get();
        setData(res.data);
      } catch (err) {
        console.error("Failed to fetch dashboard", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const userName = typeof window !== "undefined" ? localStorage.getItem("user_name") || "基金经理" : "基金经理";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-sm font-bold">
              投
            </div>
            <h1 className="text-lg font-semibold text-gray-900">决策驾驶舱</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-medium">
              {userName.charAt(0)}
            </div>
            <span className="text-sm text-gray-700">{userName}</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {userName}，今日市场动态 📊
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 重点变化 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900">🔥 重点变化</h3>
                <p className="text-xs text-gray-400 mt-0.5">近 7 天持仓及观察池标的重要变化</p>
              </div>
              <div className="divide-y divide-gray-50">
                {(data?.key_changes || []).length === 0 ? (
                  <div className="px-5 py-8 text-center text-gray-400 text-sm">暂无重点变化</div>
                ) : (
                  (data?.key_changes || []).map((change: any) => (
                    <div key={change.id} className="px-5 py-3 hover:bg-gray-50 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">{change.type}</span>
                        <span className="text-sm font-medium text-gray-900 line-clamp-1">{change.title}</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(change.created_at).toLocaleString("zh-CN")}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* 右列：摘要卡 + 我的问题 */}
          <div className="space-y-6">
            {/* 摘要卡 */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900">📋 研究结论</h3>
              </div>
              <div className="divide-y divide-gray-50">
                {(data?.summary_cards || []).map((card: any) => (
                  <div key={card.id} className="px-5 py-3 hover:bg-gray-50 cursor-pointer">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${stanceLabels[card.stance]?.color || ""}`}>
                        {stanceLabels[card.stance]?.text || card.stance}
                      </span>
                      <span className="text-sm">{confidenceIcons[card.confidence_level] || ""}</span>
                    </div>
                    {card.thesis && (
                      <p className="text-sm text-gray-700 line-clamp-2">{card.thesis}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      更新于 {new Date(card.updated_at).toLocaleDateString("zh-CN")}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* 我的问题 */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">❓ 我的问题</h3>
                <a href="/questions/new" className="text-xs text-blue-600 hover:text-blue-700">
                  发起提问 →
                </a>
              </div>
              <div className="divide-y divide-gray-50">
                {(data?.my_questions || []).length === 0 ? (
                  <div className="px-5 py-8 text-center text-gray-400 text-sm">暂无问题</div>
                ) : (
                  (data?.my_questions || []).map((q: any) => (
                    <div key={q.id} className="px-5 py-3 hover:bg-gray-50 cursor-pointer">
                      <p className="text-sm text-gray-800 line-clamp-1">{q.question}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs px-1.5 py-0.5 rounded ${
                          q.status === "answered" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                        }`}>
                          {q.status === "answered" ? "已答复" : q.status === "open" ? "待答复" : q.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
