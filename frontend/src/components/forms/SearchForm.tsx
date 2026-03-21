/**
 * 搜索表单组件
 */
import React from 'react';
import { Form, FormModel, Input, Select, Button, Space, DatePicker } from 'tdesign-react';
import { SearchIcon, ReloadIcon } from 'tdesign-react';

const { FormItem } = Form;

interface SearchField {
  key: string;
  label: string;
  type: 'input' | 'select' | 'date' | 'daterange';
  placeholder?: string;
  options?: { label: string; value: string | number }[];
  width?: string;
}

interface SearchFormProps {
  fields: SearchField[];
  onSearch: (values: Record<string, any>) => void;
  onReset?: () => void;
  loading?: boolean;
}

const SearchForm: React.FC<SearchFormProps> = ({
  fields,
  onSearch,
  onReset,
  loading = false,
}) => {
  const form = React.useRef<FormModel>(new FormModel());

  const handleSubmit = (values: Record<string, any>) => {
    onSearch(values);
  };

  const handleReset = () => {
    form.current.reset();
    onReset?.();
  };

  const renderField = (field: SearchField) => {
    switch (field.type) {
      case 'select':
        return (
          <Select
            placeholder={field.placeholder || `请选择${field.label}`}
            options={field.options}
            clearable
          />
        );
      case 'date':
        return <DatePicker mode="date" placeholder={field.placeholder || field.label} />;
      case 'daterange':
        return <DatePicker mode="date-range" placeholder={field.placeholder || field.label} />;
      default:
        return <Input placeholder={field.placeholder || `请输入${field.label}`} />;
    }
  };

  return (
    <div className="search-form">
      <Form ref={form} onSubmit={handleSubmit} labelWidth={80} layout="inline">
        {fields.map((field) => (
          <FormItem key={field.key} label={field.label} name={field.key} style={{ width: field.width || 200 }}>
            {renderField(field)}
          </FormItem>
        ))}
        <FormItem>
          <Space>
            <Button type="submit" icon={<SearchIcon />} loading={loading}>
              搜索
            </Button>
            <Button variant="secondary" icon={<ReloadIcon />} onClick={handleReset}>
              重置
            </Button>
          </Space>
        </FormItem>
      </Form>
    </div>
  );
};

export default SearchForm;