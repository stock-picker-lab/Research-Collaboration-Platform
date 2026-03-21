/**
 * 研究员 - 文档库页面
 */
'use client';
import React, { useState } from 'react';
import { Card, Tag } from 'tdesign-react';
import { FileIcon } from 'tdesign-icons-react';
import { Layout } from '@/components/layout';
import { PageHeader } from '@/components/common';

interface Document {
  id: string;
  title: string;
  type: string;
  created_at: string;
  author: string;
}

export const DocumentsPage: React.FC = () => {
  const [documents] = useState<Document[]>([
    { id: '1', title: '宁德时代深度研究报告', type: '深度研究', created_at: '2026-03-20', author: '张三' },
    { id: '2', title: '光伏行业季度策略', type: '策略报告', created_at: '2026-03-18', author: '李四' },
    { id: '3', title: '隆基绿能财报点评', type: '财报点评', created_at: '2026-03-15', author: '王五' },
  ]);

  return (
    <Layout role="researcher">
      <PageHeader title="文档库" subtitle="管理您创建的研究文档" />
      <Card bordered>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {documents.map((doc) => (
            <div key={doc.id} style={{ display: 'flex', alignItems: 'center', padding: '12px', border: '1px solid #eee', borderRadius: 8 }}>
              <FileIcon style={{ marginRight: 12, color: '#0052d9' }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500 }}>{doc.title}</div>
                <div style={{ fontSize: 12, color: '#666' }}>{doc.author} · {doc.created_at}</div>
              </div>
              <Tag>{doc.type}</Tag>
            </div>
          ))}
        </div>
      </Card>
    </Layout>
  );
};

export default DocumentsPage;