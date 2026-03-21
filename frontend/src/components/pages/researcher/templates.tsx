import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText,
  TrendingUp,
  Building,
  CheckCircle,
  Clock,
  ArrowRight,
  Play
} from 'lucide-react';

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  steps: number;
  estimatedTime: string;
  icon: React.ReactNode;
}

interface WorkflowStep {
  id: string;
  name: string;
  status: 'completed' | 'in_progress' | 'pending';
  description: string;
}

const TemplatesPage: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const templates: Template[] = [
    {
      id: '1',
      name: '个股深度研究',
      description: '全面深度研究单个上市公司,形成完整投资结论',
      category: '公司研究',
      steps: 8,
      estimatedTime: '5-7天',
      icon: <Building className="w-8 h-8 text-blue-600" />
    },
    {
      id: '2',
      name: '财报季度点评',
      description: '快速点评季度财报,更新投资逻辑和假设',
      category: '财报分析',
      steps: 5,
      estimatedTime: '2-3天',
      icon: <TrendingUp className="w-8 h-8 text-green-600" />
    },
    {
      id: '3',
      name: '行业深度报告',
      description: '研究行业趋势、竞争格局和投资机会',
      category: '行业研究',
      steps: 10,
      estimatedTime: '10-15天',
      icon: <FileText className="w-8 h-8 text-purple-600" />
    }
  ];

  const workflowSteps: WorkflowStep[] = [
    {
      id: '1',
      name: '收集基础资料',
      status: 'completed',
      description: '财报、公告、研报等'
    },
    {
      id: '2',
      name: 'AI结构化摘要',
      status: 'completed',
      description: '自动提取核心指标和结论'
    },
    {
      id: '3',
      name: '同行对比分析',
      status: 'in_progress',
      description: '对比行业内主要竞品'
    },
    {
      id: '4',
      name: '财务建模',
      status: 'pending',
      description: '构建三表模型和估值模型'
    },
    {
      id: '5',
      name: '撰写投资逻辑',
      status: 'pending',
      description: '形成核心投资逻辑和结论'
    },
    {
      id: '6',
      name: '同行评审',
      status: 'pending',
      description: '团队内部评审'
    },
    {
      id: '7',
      name: '生成结论卡',
      status: 'pending',
      description: '生成标准化结论卡'
    },
    {
      id: '8',
      name: '推送基金经理',
      status: 'pending',
      description: '推送至相关基金经理'
    }
  ];

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'in_progress': return <Clock className="w-6 h-6 text-blue-600 animate-pulse" />;
      case 'pending': return <div className="w-6 h-6 rounded-full border-2 border-gray-300"></div>;
      default: return null;
    }
  };

  const completedSteps = workflowSteps.filter(s => s.status === 'completed').length;
  const progress = (completedSteps / workflowSteps.length) * 100;

  return (
    <div className="h-screen bg-gray-50 overflow-y-auto p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">研究模板</h2>
          <p className="text-sm text-gray-600">
            选择合适的研究模板,快速启动标准化研究流程
          </p>
        </div>

        {!selectedTemplate ? (
          <div className="grid grid-cols-3 gap-6">
            {templates.map(template => (
              <Card key={template.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedTemplate(template.id)}>
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                      {template.icon}
                    </div>
                    <Badge variant="outline" className="mb-2 text-xs">
                      {template.category}
                    </Badge>
                    <h3 className="font-semibold text-gray-900 text-lg mb-2">
                      {template.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      {template.description}
                    </p>
                    <div className="flex items-center justify-center gap-4 text-xs text-gray-500 mb-4">
                      <span>{template.steps} 个步骤</span>
                      <span>•</span>
                      <span>{template.estimatedTime}</span>
                    </div>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      <Play className="w-4 h-4 mr-2" />
                      开始研究
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div>
            <Button variant="outline" onClick={() => setSelectedTemplate(null)} className="mb-6">
              ← 返回模板列表
            </Button>

            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      个股深度研究 - 贵州茅台
                    </h3>
                    <p className="text-sm text-gray-600">
                      进行中 • 已完成 {completedSteps}/{workflowSteps.length} 步
                    </p>
                  </div>
                  <Badge className="bg-blue-100 text-blue-700 px-4 py-2 text-base">
                    进行中
                  </Badge>
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600">整体进度</span>
                    <span className="font-semibold text-gray-900">{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-blue-600 h-3 rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h4 className="font-semibold text-gray-900 mb-6">工作流步骤</h4>

                <div className="space-y-4">
                  {workflowSteps.map((step, index) => (
                    <div key={step.id} className="flex items-start gap-4">
                      <div className="flex flex-col items-center">
                        {getStepIcon(step.status)}
                        {index < workflowSteps.length - 1 && (
                          <div className="w-0.5 h-12 bg-gray-200 my-2"></div>
                        )}
                      </div>

                      <div className="flex-1 pb-4">
                        <div className="flex items-center justify-between mb-1">
                          <h5 className={`font-medium ${
                            step.status === 'completed' ? 'text-gray-900' :
                            step.status === 'in_progress' ? 'text-blue-600' :
                            'text-gray-500'
                          }`}>
                            {step.name}
                          </h5>
                          {step.status === 'completed' && (
                            <Badge className="bg-green-100 text-green-700 text-xs">已完成</Badge>
                          )}
                          {step.status === 'in_progress' && (
                            <Badge className="bg-blue-100 text-blue-700 text-xs">进行中</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{step.description}</p>
                        {step.status === 'in_progress' && (
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                            继续 <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default TemplatesPage;