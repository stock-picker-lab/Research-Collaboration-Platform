"use client";

import { useEffect, useState } from "react";
import { managementAPI } from "@/lib/api";

export default function ManagementPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await managementAPI.stats();
        setStats(res.data);
      } catch (err) {
        console.error("Failed to fetch management stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const taskOverview = stats?.task_overview || {};
  const questionStats = stats?.question_stats || {};
  const weeklyOutput = stats?.weekly_output || {};

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-sm font-bold">
            投
          </div>
          <h1 className="text-lg font-semibold text-gray-900">团队效率看板</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6">
        {/* 统计卡片 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500">进行中任务</p>
            <p className="text-3xl font-bold text-blue-600 mt-1">
              {(taskOverview.pending || 0) + (taskOverview.in_progress || 0)}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500">已完成任务</p>
            <p className="text-3xl font-bold text-green-600 mt-1">
              {taskOverview.completed || 0}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500">问题响应率</p>
            <p className="text-3xl font-bold text-indigo-600 mt-1">
              {questionStats.response_rate || 0}%
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500">本周产出</p>
            <p className="text-3xl font-bold text-amber-600 mt-1">
              {(weeklyOutput.documents || 0) + (weeklyOutput.conclusions || 0)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 任务概览 */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">📊 任务状态分布</h3>
            <div className="space-y-3">
              {[
                { key: "pending", label: "待处理", color: "bg-gray-400" },
                { key: "in_progress", label: "进行中", color: "bg-blue-500" },
                { key: "under_review", label: "待复核", color: "bg-yellow-500" },
                { key: "completed", label: "已完成", color: "bg-green-500" },
              ].map((item) => {
                const count = taskOverview[item.key] || 0;
                const total = Object.values(taskOverview).reduce(
                  (a: number, b: any) => a + (Number(b) || 0), 0
                ) as number;
                const pct = total > 0 ? (count / total) * 100 : 0;
                return (
                  <div key={item.key}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">{item.label}</span>
                      <span className="text-gray-900 font-medium">{count}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${item.color}`}
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 本周产出 */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">📈 本周研究产出</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg text-center">
                <p className="text-2xl font-bold text-blue-600">{weeklyOutput.documents || 0}</p>
                <p className="text-sm text-gray-600 mt-1">新增文档</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg text-center">
                <p className="text-2xl font-bold text-green-600">{weeklyOutput.conclusions || 0}</p>
                <p className="text-sm text-gray-600 mt-1">更新结论卡</p>
              </div>
              <div className="p-4 bg-indigo-50 rounded-lg text-center">
                <p className="text-2xl font-bold text-indigo-600">{questionStats.total || 0}</p>
                <p className="text-sm text-gray-600 mt-1">总提问数</p>
              </div>
              <div className="p-4 bg-amber-50 rounded-lg text-center">
                <p className="text-2xl font-bold text-amber-600">{questionStats.answered || 0}</p>
                <p className="text-sm text-gray-600 mt-1">已答复数</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
