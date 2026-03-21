/**
 * 模态框表单组件
 */
import React from 'react';
import { Dialog, Form, FormModel, Input, Select, Textarea, Switch, Button, Space, NumberInput } from 'tdesign-react';

const { FormItem } = Form;

interface FormField {
  key: string;
  label: string;
  type: 'input' | 'textarea' | 'select' | 'switch' | 'number';
  placeholder?: string;
  options?: { label: string; value: string | number }[];
  required?: boolean;
  rules?: any[];
  width?: number;
  props?: Record<string, any>;
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
  const form = React.useRef<FormModel>(new FormModel());

  const handleSubmit = async () => {
    const values = await form.current.validate();
    if (values) {
      onSubmit(values);
    }
  };

  const renderField = (field: FormField) => {
    switch (field.type) {
      case 'textarea':
        return <Textarea placeholder={field.placeholder} {...field.props} />;
      case 'select':
        return (
          <Select placeholder={field.placeholder} options={field.options} {...field.props} />
        );
      case 'switch':
        return <Switch {...field.props} />;
      case 'number':
        return <NumberInput placeholder={field.placeholder} {...field.props} />;
      default:
        return <Input placeholder={field.placeholder} {...field.props} />;
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
      draggable={true}
      placement="center"
    >
      <Form ref={form} initialData={initialValues} labelWidth={100} layout="vertical">
        {fields.map((field) => (
          <FormItem
            key={field.key}
            label={field.label}
            name={field.key}
            required={field.required}
            rules={field.rules}
          >
            {renderField(field)}
          </FormItem>
        ))}
      </Form>
    </Dialog>
  );
};

export default ModalForm;