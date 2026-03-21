'use client';
import React from 'react';
import { Card, Table, Tag, Button, DatePicker, Select } from 'tdesign-react';
import { Layout } from '@/components/layout';
import { PageHeader } from '@/components/common';

const auditLogs = [
  { id: 1, user: '张三', action: '登录', object: '系统', ip: '192.168.1.100', time: '2026-03-21 10:30:00', result: '成功' },
  { id: 2, user: '李四', action: '上传文档', object: '宁德时代研报.pdf', ip: '192.168.1.101', time: '2026-03-21 10:25:00', result: '成功' },
  { id: 3, user: '王五', action: '修改持仓', object: '隆基绿能', ip: '192.168.1.102', time: '2026-03-21 10:20:00', result: '成功' },
  { id: 4, user: '赵六', action: '删除文档', object: '旧报告.docx', ip: '192.168.1.103', time: '2026-03-21 10:15:00', result: '失败' },
  { id: 5, user: '钱七', action: '修改权限', object: '研究员 -> 基金经理', ip: '192.168.1.104', time: '2026-03-21 10:10:00', result: '成功' },
];

const actionOptions = [
  { value: 'all', label: '全部' },
  { value: 'login', label: '登录' },
  { value: 'upload', label: '上传' },
  { value: 'download', label: '下载' },
  { value: 'delete', label: '删除' },
  { value: 'update', label: '修改' },
];

export const AuditPage: React.FC = () => {
  return (
    <Layout role="admin">
      <PageHeader title="审计日志" subtitle="平台操作审计追踪" />
      <Card>
        <div className="mb-4 flex gap-4">
          <Select placeholder="操作类型" options={actionOptions} value="all" style={{ width: 150 }} />
          <DatePicker placeholder="开始日期" mode="date" />
          <DatePicker placeholder="结束日期" mode="date" />
          <Button theme="primary">查询</Button>
          <Button theme="default">导出</Button>
        </div>
        <Table data={auditLogs} rowKey="id" columns={[
          { colKey: 'id', title: 'ID', width: 80 },
          { colKey: 'user', title: '用户', width: 120 },
          { colKey: 'action', title: '操作', width: 120 },
          { colKey: 'object', title: '操作对象', width: 200 },
          { colKey: 'ip', title: 'IP 地址', width: 150 },
          { colKey: 'time', title: '时间', width: 180 },
          {
            colKey: 'result',
            title: '结果',
            width: 100,
            cell: ({ row }) => (
              <Tag color={row.result === '成功' ? 'success' : 'danger'}>{row.result}</Tag>
            )
          },
        ]} />
      </Card>
    </Layout>
  );
};

export default AuditPage;