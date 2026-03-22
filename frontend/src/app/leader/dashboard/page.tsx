/**
 * 研究所领导 - 团队效率看板
 * 路径: /leader/dashboard
 * 功能: 展示团队整体效率指标、产出趋势、响应效率等
 */
'use client';

import React, { useState, useEffect } from 'react';
import { Card, Select, Loading, MessagePlugin, Progress } from 'tdesign-react';
import { RefreshIcon, ChartIcon, TimeIcon, FileIcon, CheckCircleIcon } from 'tdesign-icons-react';
import PageHeader from '@/components/common/PageHeader';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';

type TimeRange = 'week' | 'month' | 'quarter';

const LeaderDashboardPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>('week');
  const [loading, setLoading] = useState(false);

  // 模拟数据 - 产出趋势
  const outputTrendData = [
    { date: '周一', reports: 8, conclusions: 12, responses: 15 },
    { date: '周二', reports: 12, conclusions: 18, responses: 22 },
    { date: '周三', reports: 10, conclusions: 15, responses: 18 },
    { date: '周四', reports: 15, conclusions: 20, responses: 25 },
    { date: '周五', reports: 14, conclusions: 19, responses: 21 },
    { date: '周六', reports: 5, conclusions: 8, responses: 10 },
    { date: '周日', reports: 3, conclusions: 5, responses: 7 },
  ];

  // 模拟数据 - 响应效率趋势
  const responseEfficiencyData = [
    { date: '周一', avgTime: 4.2, target: 4.0 },
    { date: '周二', avgTime: 3.8, target: 4.0 },
    { date: '周三', avgTime: 4.5, target: 4.0 },
    { date: '周四', avgTime: 3.5, target: 4.0 },
    { date: '周五', avgTime: 3.9, target: 4.0 },
    { date: '周六', avgTime: 5.2, target: 4.0 },
    { date: '周日', avgTime: 4.8, target: 4.0 },
  ];

  // 任务完成率数据
  const completionData = [
    { name: '已完成', value: 85, color: '#52c41a' },
    { name: '未完成', value: 15, color: '#d9d9d9' },
  ];

  const timeRangeOptions = [
    { label: '本周', value: 'week' },
    { label: '本月', value: 'month' },
    { label: '本季度', value: 'quarter' },
  ];

  const getTimeRangeLabel = () => {
    const labels = { week: '本周', month: '本月', quarter: '本季度' };
    return labels[timeRange];
  };

  const fetchDashboard = () => {
    // TODO: 实现真实数据加载
    MessagePlugin.info('数据已刷新');
  };

  return (
    <div className="p-6 space-y-6">
      {/* 页面标题栏 */}
      <PageHeader
        title="团队效率看板"
        subtitle="实时监控团队整体工作效率和产出质量"
      />

      {/* 时间范围选择器 */}
      <Card>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700">时间范围:</span>
            <Select
              value={timeRange}
              onChange={(value) => setTimeRange(value as TimeRange)}
              options={timeRangeOptions}
              style={{ width: 150 }}
            />
          </div>
          <div
            className="flex items-center gap-2 text-blue-600 cursor-pointer hover:text-blue-700"
            onClick={fetchDashboard}
          >
            <RefreshIcon />
            <span className="text-sm">刷新数据</span>
          </div>
        </div>
      </Card>

      <Loading loading={loading} size="large">
        {/* 核心指标卡片 */}
        <div className="grid grid-cols-4 gap-6">
          {/* 任务完成率 */}
          <Card className="hover:shadow-lg transition-shadow">
            <div className="flex flex-col items-center">
              <div className="text-sm text-gray-500 mb-4">任务完成率</div>
              <div className="relative w-32 h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={completionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={60}
                      dataKey="value"
                      startAngle={90}
                      endAngle={-270}
                    >
                      {completionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">85%</div>
                  </div>
                </div>
              </div>
              <div className="mt-4 text-xs text-gray-500 flex items-center gap-1">
                <ChartIcon size="14px" className="text-green-500" />
                <span>较上周 +5%</span>
              </div>
            </div>
          </Card>

          {/* 本周产出 */}
          <Card className="hover:shadow-lg transition-shadow">
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                <FileIcon size="20px" className="text-blue-500" />
                <span className="text-sm text-gray-500">{getTimeRangeLabel()}产出</span>
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-2">67</div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">研报:</span>
                  <span className="font-medium">38篇</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">结论卡:</span>
                  <span className="font-medium">29个</span>
                </div>
              </div>
              <div className="mt-4 text-xs text-gray-500 flex items-center gap-1">
                <ChartIcon size="14px" className="text-green-500" />
                <span>较上周 +12%</span>
              </div>
            </div>
          </Card>

          {/* 平均响应时间 */}
          <Card className="hover:shadow-lg transition-shadow">
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                <TimeIcon size="20px" className="text-orange-500" />
                <span className="text-sm text-gray-500">平均响应时间</span>
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-2">4.2h</div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">P0:</span>
                  <span className="font-medium text-green-600">1.5h ✓</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">P1:</span>
                  <span className="font-medium text-orange-500">4.8h</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">P2:</span>
                  <span className="font-medium">8.2h</span>
                </div>
              </div>
              <div className="mt-4 text-xs text-gray-500">
                目标: &lt; 4.0h
              </div>
            </div>
          </Card>

          {/* 研究覆盖率 */}
          <Card className="hover:shadow-lg transition-shadow">
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircleIcon size="20px" className="text-green-500" />
                <span className="text-sm text-gray-500">研究覆盖率</span>
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-4">92%</div>
              <Progress
                percentage={92}
                theme={'line' as any}
                size="small"
                className="mb-2"
              />
              <div className="text-sm text-gray-600">
                已覆盖 <span className="font-medium">138/150</span> 家公司
              </div>
              <div className="mt-4 text-xs text-gray-500 flex items-center gap-1">
                <ChartIcon size="14px" className="text-green-500" />
                <span>较上月 +3%</span>
              </div>
            </div>
          </Card>
        </div>

        {/* 产出趋势图 */}
        <Card>
          <h3 className="text-lg font-bold mb-4">{getTimeRangeLabel()}产出趋势</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={outputTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="reports" name="研报" fill="#1890ff" />
              <Bar dataKey="conclusions" name="结论卡" fill="#52c41a" />
              <Bar dataKey="responses" name="问题响应" fill="#faad14" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* 响应效率趋势图 */}
        <Card>
          <h3 className="text-lg font-bold mb-4">响应效率趋势 (小时)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={responseEfficiencyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="avgTime"
                name="实际响应时间"
                stroke="#1890ff"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="target"
                name="目标时间"
                stroke="#f5222d"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-4 text-sm text-gray-600 flex items-center gap-2">
            <span className="inline-block w-3 h-3 bg-blue-500 rounded"></span>
            <span>实际响应时间</span>
            <span className="inline-block w-8 h-0.5 bg-red-500 ml-4" style={{ borderTop: '2px dashed #f5222d' }}></span>
            <span>目标时间线 (4.0h)</span>
          </div>
        </Card>

        {/* 提示信息 */}
        <Card className="bg-blue-50">
          <h4 className="font-bold text-blue-900 mb-2">📊 数据说明</h4>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• 任务完成率 = 已完成任务数 / 总任务数</li>
            <li>• 响应时间从问题提出到研究员给出初步回答的平均时长</li>
            <li>• 覆盖率 = 有研究产出的公司数 / 池内公司总数</li>
            <li>• 数据每小时更新一次</li>
          </ul>
        </Card>
      </Loading>
    </div>
  );
};

export default LeaderDashboardPage;
