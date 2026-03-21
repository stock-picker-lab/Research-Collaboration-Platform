/**
 * 数据表格组件 - 基于 TDesign Table 封装
 */
import React from 'react';
import { Table } from 'tdesign-react';

export interface ColumnDef<T> {
  key: string;
  title: string;
  width?: number;
  align?: 'left' | 'center' | 'right';
  ellipsis?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  loading?: boolean;
  rowKey?: string;
  hoverable?: boolean;
  onRowClick?: (row: T) => void;
}

function DataTable<T extends Record<string, any>>({
  columns,
  data,
  loading = false,
  rowKey = 'id',
  hoverable = true,
  onRowClick,
}: DataTableProps<T>) {
  const tableColumns = columns.map((col) => ({
    colKey: col.key,
    title: col.title,
    width: col.width,
    align: col.align,
    ellipsis: col.ellipsis,
    cell: (props: { row: T }) => col.render?.(props.row[col.key], props.row),
  }));

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
        onRowClick={onRowClick ? ({ row }: { row: T }) => onRowClick(row) : undefined}
      />
    </div>
  );
}

export default DataTable;