/**
 * 搜索表单组件
 */
import React from 'react';
import { Input, Select, Button } from 'tdesign-react';

interface SearchField {
  key: string;
  label: string;
  type: 'input' | 'select';
  placeholder?: string;
  options?: { label: string; value: string }[];
}

interface SearchFormProps {
  fields: SearchField[];
  onSearch: (values: Record<string, any>) => void;
}

const SearchForm: React.FC<SearchFormProps> = ({ fields, onSearch }) => {
  const [values, setValues] = React.useState<Record<string, any>>({});

  const handleChange = (key: string, value: any) => {
    setValues(prev => ({ ...prev, [key]: value }));
  };

  const handleSearch = () => {
    onSearch(values);
  };

  const handleReset = () => {
    setValues({});
    onSearch({});
  };

  return (
    <div className="flex gap-4 mb-4">
      {fields.map((field) => (
        <div key={field.key} className="flex items-center gap-2">
          <label className="text-sm text-gray-600">{field.label}</label>
          {field.type === 'select' ? (
            <Select
              placeholder={field.placeholder}
              options={field.options}
              value={values[field.key]}
              onChange={(v) => handleChange(field.key, v)}
              style={{ width: 150 }}
            />
          ) : (
            <Input
              placeholder={field.placeholder}
              value={values[field.key] || ''}
              onChange={(v) => handleChange(field.key, v)}
              style={{ width: 150 }}
            />
          )}
        </div>
      ))}
      <Button theme="primary" onClick={handleSearch}>查询</Button>
      <Button onClick={handleReset}>重置</Button>
    </div>
  );
};

export default SearchForm;