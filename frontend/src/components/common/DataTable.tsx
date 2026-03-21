/**
 * 数据表格组件 - 基于 TDesign Table 封装
 */
import React from 'react';
import { Table, TableColumn, Pagination, Space, Button, Dropdown } from 'tdesign-react';
import type { DropdownProps } from 'tdesign-react';
import { MoreIcon, EditIcon, DeleteIcon, ViewIcon } from 'tdesign-react';

export interface ColumnDef<T> {
  key: string;
  title: string;
  width?: number;
  fixed?: 'left' | 'right';
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  ellipsis?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  loading?: boolean;
  rowKey: string | ((row: T) => string);
  selectable?: boolean;
  hoverable?: boolean;
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize: number) => void;
  };
  actions?: {
    label?: string;
    items: {
      label: string;
      value: string;
      icon?: React.ReactNode;
      danger?: boolean;
    }[];
    onClick: (value: string, row: T) => void;
  };
  onRowClick?: (row: T) => void;
}

function DataTable<T extends Record<string, any>>({
  columns,
  data,
  loading = false,
  rowKey,
  selectable = false,
  hoverable = true,
  pagination,
  actions,
  onRowClick,
}: DataTableProps<T>) {
  const tableColumns: TableColumn[] = columns.map((col) => ({
    colKey: col.key,
    title: col.title,
    width: col.width,
    fixed: col.fixed,
    align: col.align,
    sortable: col.sortable,
    ellipsis: col.ellipsis,
    cell: col.render ? (h, { row }) => col.render(row[col.key], row) : undefined,
  }));

  if (actions) {
    tableColumns.push({
      colKey: 'actions',
      title: '操作',
      width: 120,
      fixed: 'right',
      align: 'center',
      cell: (h, { row }) => (
        <Dropdown trigger="click" onClick={(data: { value: string }) => actions.onClick(data.value, row)}>
          <Button variant="text" size="small">
            <MoreIcon />
          </Button>
          <Dropdown.DropdownMenu>
            {actions.items.map((item) => (
              <Dropdown.DropdownItem key={item.value} value={item.value}>
                <Space>
                  {item.icon}
                  {item.label}
                </Space>
              </Dropdown.DropdownItem>
            ))}
          </Dropdown.DropdownMenu>
        </Dropdown>
      ),
    });
  }

  const handlePageChange = (pageInfo: { current: number; pageSize: number }) => {
    pagination?.onChange(pageInfo.current, pageInfo.pageSize);
  };

  return (
    <div className="data-table">
      <Table
        columns={tableColumns}
        data={data}
        rowKey={rowKey}
        loading={loading}
        hover={hoverable}
        stripe
        showHeader
        onRowClick={onRowClick ? ({ row }) => onRowClick(row) : undefined}
      />
      {pagination && (
        <div className="data-table-pagination">
          <Pagination
            total={pagination.total}
            current={pagination.current}
            pageSize={pagination.pageSize}
            onChange={handlePageChange}
            pageSizeOptions={[10, 20, 50, 100]}
          />
        </div>
      )}
    </div>
  );
}

export default DataTable;