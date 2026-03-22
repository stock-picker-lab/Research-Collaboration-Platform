/**
 * 基金经理 - 决策前资料包
 * 路径: /fm/decision-pack
 * 功能: 选择标的、整合相关文档、生成决策资料包并导出PDF
 */
'use client';

import React, { useState, useEffect } from 'react';
import { Button, Card, Select, Checkbox, Tabs, Table, MessagePlugin, Loading } from 'tdesign-react';
import { DownloadIcon, FileIcon } from 'tdesign-icons-react';
import PageHeader from '@/components/common/PageHeader';
import { getCompanies } from '@/services/companyService';
import { getDocumentsByCompany } from '@/services/documentService';
import { getConclusionsByCompany } from '@/services/conclusionService';
import type { Company, Document, ConclusionCard } from '@/types';

const DecisionPackPage: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [conclusions, setConclusions] = useState<ConclusionCard[]>([]);
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
  const [selectedConclusions, setSelectedConclusions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('reports');

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    if (selectedCompany) {
      fetchCompanyData();
    }
  }, [selectedCompany]);

  const fetchCompanies = async () => {
    try {
      const data = await getCompanies({ page: 1, page_size: 100 });
      setCompanies(Array.isArray(data) ? data : (data as any).items || []);
    } catch (error) {
      MessagePlugin.error('加载公司列表失败');
    }
  };

  const fetchCompanyData = async () => {
    if (!selectedCompany) return;
    
    try {
      setLoading(true);
      const [docsData, conclusionsData] = await Promise.all([
        getDocumentsByCompany(String(selectedCompany)),
        getConclusionsByCompany(String(selectedCompany))
      ]);
      setDocuments(docsData);
      setConclusions(conclusionsData);
      setSelectedDocs([]);
      setSelectedConclusions([]);
    } catch (error) {
      MessagePlugin.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = (type: 'docs' | 'conclusions', checked: boolean) => {
    if (type === 'docs') {
      setSelectedDocs(checked ? documents.map(d => String(d.id)) : []);
    } else {
      setSelectedConclusions(checked ? conclusions.map(c => String(c.id)) : []);
    }
  };

  const handleExportPDF = async () => {
    if (!selectedCompany) {
      MessagePlugin.warning('请先选择标的');
      return;
    }
    
    if (selectedDocs.length === 0 && selectedConclusions.length === 0) {
      MessagePlugin.warning('请至少选择一项内容');
      return;
    }

    try {
      setLoading(true);
      // TODO: 实现PDF导出功能
      await new Promise(resolve => setTimeout(resolve, 1000));
      MessagePlugin.success('决策资料包生成成功!');
    } catch (error) {
      MessagePlugin.error('导出失败');
    } finally {
      setLoading(false);
    }
  };

  const companyOptions = companies.map(c => ({
    label: `${c.name} (${c.ticker})`,
    value: c.id
  }));

  const documentColumns = [
    {
      colKey: 'checkbox',
      title: (
        <Checkbox
          checked={documents.length > 0 && selectedDocs.length === documents.length}
          indeterminate={selectedDocs.length > 0 && selectedDocs.length < documents.length}
          onChange={(checked) => handleSelectAll('docs', checked)}
        />
      ),
      width: 50,
      cell: ({ row }: any) => (
        <Checkbox
          checked={selectedDocs.includes(row.id)}
          onChange={(checked) => {
            setSelectedDocs(checked ? [...selectedDocs, row.id] : selectedDocs.filter(id => id !== row.id));
          }}
        />
      )
    },
    {
      colKey: 'title',
      title: '标题',
      ellipsis: true,
      width: 300
    },
    {
      colKey: 'doc_type',
      title: '类型',
      width: 100
    },
    {
      colKey: 'created_at',
      title: '日期',
      width: 120,
      cell: ({ row }: any) => new Date(row.created_at).toLocaleDateString()
    },
    {
      colKey: 'file_size',
      title: '大小',
      width: 100,
      cell: ({ row }: any) => row.file_size ? `${(row.file_size / 1024 / 1024).toFixed(2)} MB` : '-'
    }
  ];

  const conclusionColumns = [
    {
      colKey: 'checkbox',
      title: (
        <Checkbox
          checked={conclusions.length > 0 && selectedConclusions.length === conclusions.length}
          indeterminate={selectedConclusions.length > 0 && selectedConclusions.length < conclusions.length}
          onChange={(checked) => handleSelectAll('conclusions', checked)}
        />
      ),
      width: 50,
      cell: ({ row }: any) => (
        <Checkbox
          checked={selectedConclusions.includes(row.id)}
          onChange={(checked) => {
            setSelectedConclusions(checked ? [...selectedConclusions, row.id] : selectedConclusions.filter(id => id !== row.id));
          }}
        />
      )
    },
    {
      colKey: 'stance',
      title: '观点',
      width: 100
    },
    {
      colKey: 'core_logic',
      title: '核心逻辑',
      ellipsis: true,
      width: 300
    },
    {
      colKey: 'target_price',
      title: '目标价',
      width: 100
    },
    {
      colKey: 'created_at',
      title: '日期',
      width: 120,
      cell: ({ row }: any) => new Date(row.created_at).toLocaleDateString()
    }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* 页面标题栏 */}
      <PageHeader
        title="决策前资料包"
        subtitle="整合相关文档和结论卡,生成决策资料包"
      />

      {/* 标的选择器 */}
      <Card>
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
            选择标的:
          </label>
          <Select
            value={selectedCompany as any}
            onChange={(value: any) => setSelectedCompany(String(value))}
            options={companyOptions}
            placeholder="请选择标的公司"
            className="flex-1 max-w-md"
            filterable
          />
          <Button
            theme="primary"
            icon={<DownloadIcon />}
            onClick={handleExportPDF}
            loading={loading}
            disabled={!selectedCompany || (selectedDocs.length === 0 && selectedConclusions.length === 0)}
          >
            导出资料包 PDF
          </Button>
        </div>
      </Card>

      {/* 文档选择区域 */}
      {selectedCompany && (
        <Card>
          <Loading loading={loading} size="small">
            <Tabs
              value={activeTab}
              onChange={(value: any) => setActiveTab(String(value))}
              placement="top"
            >
              <Tabs.TabPanel value="reports" label={`研报 (${documents.filter(d => d.doc_type === 'research_report').length})`}>
                <div className="py-4">
                  <Table
                    data={documents.filter(d => d.doc_type === 'research_report')}
                    columns={documentColumns}
                    rowKey="id"
                    bordered
                    hover
                    size="small"
                    maxHeight={400}
                    empty="暂无研报"
                  />
                </div>
              </Tabs.TabPanel>

              <Tabs.TabPanel value="announcements" label={`公告 (${documents.filter(d => d.doc_type === 'announcement').length})`}>
                <div className="py-4">
                  <Table
                    data={documents.filter(d => d.doc_type === 'announcement')}
                    columns={documentColumns}
                    rowKey="id"
                    bordered
                    hover
                    size="small"
                    maxHeight={400}
                    empty="暂无公告"
                  />
                </div>
              </Tabs.TabPanel>

              <Tabs.TabPanel value="annual-reports" label={`年报 (${documents.filter(d => d.doc_type === 'annual_report').length})`}>
                <div className="py-4">
                  <Table
                    data={documents.filter(d => d.doc_type === 'annual_report')}
                    columns={documentColumns}
                    rowKey="id"
                    bordered
                    hover
                    size="small"
                    maxHeight={400}
                    empty="暂无年报"
                  />
                </div>
              </Tabs.TabPanel>

              <Tabs.TabPanel value="conclusions" label={`结论卡 (${conclusions.length})`}>
                <div className="py-4">
                  <Table
                    data={conclusions}
                    columns={conclusionColumns}
                    rowKey="id"
                    bordered
                    hover
                    size="small"
                    maxHeight={400}
                    empty="暂无结论卡"
                  />
                </div>
              </Tabs.TabPanel>
            </Tabs>
          </Loading>
        </Card>
      )}

      {/* 提示信息 */}
      {!selectedCompany && (
        <Card>
          <div className="text-center py-12">
            <FileIcon size="48px" className="text-gray-300 mb-4" />
            <p className="text-gray-500">请先选择标的公司</p>
          </div>
        </Card>
      )}

      {/* 已选择统计 */}
      {selectedCompany && (selectedDocs.length > 0 || selectedConclusions.length > 0) && (
        <Card className="bg-blue-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              已选择: <span className="font-medium">{selectedDocs.length}</span> 个文档,
              <span className="font-medium ml-2">{selectedConclusions.length}</span> 个结论卡
            </div>
            <Button
              size="small"
              theme="default"
              onClick={() => {
                setSelectedDocs([]);
                setSelectedConclusions([]);
              }}
            >
              清空选择
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default DecisionPackPage;
