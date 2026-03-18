"use client";

import { useEffect, useState } from "react";
import { workbenchAPI, alertAPI } from "@/lib/api";

interface TodoItem {
  id: string;
  title: string;
  priority: string;
  status: string;
  due_date?: string;
}

interface QuestionItem {
  id: string;
  question: string;
  asker_id: string;
  created_at: string;
}

const priorityColors: Record<string, string> = {
  urgent: "bg-red-100 text-red-700",
  high: "bg-orange-100 text-orange-700",
  medium: "bg-blue-100 text-blue-700",
  low: "bg-gray-100 text-gray-600",
};

const priorityLabels: Record<string, string> = {
  urgent: "紧急",
  high: "高",
  medium: "中",
  low: "低",
};

export default function WorkbenchPage() {
  const [data, setData] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [wbRes, alertRes] = await Promise.all([
          workbenchAPI.get(),
          alertAPI.list({ unread_only: true, page_size: 5 }),
        ]);
        setData(wbRes.data);
        setAlerts(alertRes.data.items || []);
      } catch (err) {
        console.error("Failed to fetch workbench data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const userName = typeof window !== "undefined" ? localStorage.getItem("user_name") || "研究员" : "研究员";

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
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
              投
            </div>
            <h1 className="text-lg font-semibold text-gray-900">研究员工作台</h1>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-gray-500 hover:text-gray-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {(data?.unread_alert_count || 0) > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {data.unread_alert_count}
                </span>
              )}
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium">
                {userName.charAt(0)}
              </div>
              <span className="text-sm text-gray-700">{userName}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-6">
        {/* 欢迎 + 统计 */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            早上好，{userName} 👋
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            今日有 {data?.todos?.length || 0} 个待办事项，
            {data?.pending_questions?.length || 0} 个待回复问题
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左列：待办 + 待回复 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 预警通知 */}
            {alerts.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                  <span className="text-red-500">🔔</span>
                  <h3 className="font-semibold text-gray-900">未读预警</h3>
                  <span className="ml-auto text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                    {alerts.length}
                  </span>
                </div>
                <div className="divide-y divide-gray-50">
                  {alerts.map((alert: any) => (
                    <div key={alert.id} className="px-5 py-3 hover:bg-gray-50 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium severity-${alert.severity?.toLowerCase()}`}>
                          {alert.severity}
                        </span>
                        <span className="text-sm font-medium text-gray-900">{alert.title}</span>
                      </div>
                      {alert.summary && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-1">{alert.summary}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 今日待办 */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900">📋 今日待办</h3>
              </div>
              <div className="divide-y divide-gray-50">
                {(data?.todos || []).length === 0 ? (
                  <div className="px-5 py-8 text-center text-gray-400 text-sm">
                    暂无待办事项 🎉
                  </div>
                ) : (
                  (data?.todos || []).map((todo: TodoItem) => (
                    <div key={todo.id} className="px-5 py-3 hover:bg-gray-50 cursor-pointer flex items-center gap-3">
                      <div className="w-5 h-5 rounded border-2 border-gray-300 flex-shrink-0"></div>
                      <span className="text-sm text-gray-800 flex-1">{todo.title}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${priorityColors[todo.priority] || ""}`}>
                        {priorityLabels[todo.priority] || todo.priority}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* 待回复问题 */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900">❓ 待回复问题</h3>
              </div>
              <div className="divide-y divide-gray-50">
                {(data?.pending_questions || []).length === 0 ? (
                  <div className="px-5 py-8 text-center text-gray-400 text-sm">
                    暂无待回复问题
                  </div>
                ) : (
                  (data?.pending_questions || []).map((q: QuestionItem) => (
                    <div key={q.id} className="px-5 py-3 hover:bg-gray-50 cursor-pointer">
                      <p className="text-sm text-gray-800">{q.question}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(q.created_at).toLocaleString("zh-CN")}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* 右列：快捷入口 + 最近文档 */}
          <div className="space-y-6">
            {/* 快捷入口 */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-4">⚡ 快捷操作</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "个股研究", icon: "📊", href: "/research/new" },
                  { label: "财报点评", icon: "📈", href: "/research/new?type=earnings" },
                  { label: "事件点评", icon: "📰", href: "/research/new?type=event" },
                  { label: "同行对比", icon: "🔄", href: "/research/new?type=peer" },
                  { label: "上传文档", icon: "📁", href: "/documents/upload" },
                  { label: "AI 问答", icon: "🤖", href: "/copilot" },
                ].map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    className="flex items-center gap-2 p-3 rounded-lg bg-gray-50 hover:bg-blue-50 hover:text-blue-700 transition-colors text-sm"
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* 最近文档 */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900">📄 最近文档</h3>
              </div>
              <div className="divide-y divide-gray-50">
                {(data?.recent_documents || []).map((doc: any) => (
                  <div key={doc.id} className="px-5 py-3 hover:bg-gray-50 cursor-pointer">
                    <p className="text-sm text-gray-800 line-clamp-1">{doc.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                        {doc.type}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(doc.created_at).toLocaleDateString("zh-CN")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
