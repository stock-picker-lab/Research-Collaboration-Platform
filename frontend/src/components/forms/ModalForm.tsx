/**
 * 模态框表单组件
 */
import React from 'react';
import { Dialog, Input, Textarea, Select } from 'tdesign-react';

interface FormField {
  key: string;
  label: string;
  type: 'input' | 'textarea' | 'select';
  placeholder?: string;
  options?: { label: string; value: string | number }[];
}

interface ModalFormProps {
  title: string;
  visible: boolean;
  fields: FormField[];
  initialValues?: Record<string, any>;
  onSubmit: (values: Record<string, any>) => void;
  onClose: () => void;
  loading?: boolean;
  width?: number;
}

const ModalForm: React.FC<ModalFormProps> = ({
  title,
  visible,
  fields,
  initialValues = {},
  onSubmit,
  onClose,
  loading = false,
  width = 600,
}) => {
  const [values, setValues] = React.useState(initialValues);

  React.useEffect(() => {
    setValues(initialValues);
  }, [initialValues]);

  const handleChange = (key: string, value: any) => {
    setValues(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    onSubmit(values);
  };

  const renderField = (field: FormField) => {
    switch (field.type) {
      case 'textarea':
        return <Textarea placeholder={field.placeholder} value={values[field.key] || ''} onChange={(v) => handleChange(field.key, v)} />;
      case 'select':
        return <Select placeholder={field.placeholder} options={field.options} value={values[field.key]} onChange={(v) => handleChange(field.key, v)} />;
      default:
        return <Input placeholder={field.placeholder} value={values[field.key] || ''} onChange={(v) => handleChange(field.key, v)} />;
    }
  };

  return (
    <Dialog
      visible={visible}
      header={title}
      width={width}
      onClose={onClose}
      onConfirm={handleSubmit}
      confirmLoading={loading}
      draggable
      placement="center"
    >
      <div className="space-y-4">
        {fields.map((field) => (
          <div key={field.key} className="flex items-center gap-4">
            <label className="w-24 text-right text-gray-600">{field.label}</label>
            <div className="flex-1">{renderField(field)}</div>
          </div>
        ))}
      </div>
    </Dialog>
  );
};

export default ModalForm;