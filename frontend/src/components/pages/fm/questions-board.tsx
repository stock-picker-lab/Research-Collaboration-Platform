import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  User,
  Calendar,
  MessageSquare
} from 'lucide-react';

interface Question {
  id: string;
  title: string;
  company: string;
  researcher: string;
  priority: 'P0' | 'P1' | 'P2';
  date: string;
  status: 'pending' | 'answered' | 'closed';
  replies?: number;
}

const QuestionsBoardPage: React.FC = () => {
  const [questions] = useState<Question[]>([
    {
      id: '1',
      title: '茅台库存去化情况如何?',
      company: '贵州茅台',
      researcher: '张研究员',
      priority: 'P0',
      date: '2026-03-20',
      status: 'pending',
      replies: 0
    },
    {
      id: '2',
      title: '系列酒增速能否持续?',
      company: '贵州茅台',
      researcher: '张研究员',
      priority: 'P1',
      date: '2026-03-19',
      status: 'pending',
      replies: 0
    },
    {
      id: '3',
      title: '直销占比提升对渠道的影响',
      company: '贵州茅台',
      researcher: '张研究员',
      priority: 'P1',
      date: '2026-03-18',
      status: 'answered',
      replies: 1
    },
    {
      id: '4',
      title: '电池技术路线如何选择?',
      company: '宁德时代',
      researcher: '李研究员',
      priority: 'P1',
      date: '2026-03-17',
      status: 'answered',
      replies: 2
    },
    {
      id: '5',
      title: 'Q1销量指引是否保守?',
      company: '比亚迪',
      researcher: '王研究员',
      priority: 'P0',
      date: '2026-03-15',
      status: 'closed',
      replies: 3
    }
  ]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'P0': return 'bg-red-100 text-red-700 border-red-300';
      case 'P1': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'P2': return 'bg-blue-100 text-blue-700 border-blue-300';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const columns = [
    {
      id: 'pending',
      title: '待答复',
      icon: <Clock className="w-5 h-5 text-yellow-600" />,
      color: 'border-yellow-500',
      questions: questions.filter(q => q.status === 'pending')
    },
    {
      id: 'answered',
      title: '已答复',
      icon: <CheckCircle className="w-5 h-5 text-green-600" />,
      color: 'border-green-500',
      questions: questions.filter(q => q.status === 'answered')
    },
    {
      id: 'closed',
      title: '已关闭',
      icon: <XCircle className="w-5 h-5 text-gray-600" />,
      color: 'border-gray-500',
      questions: questions.filter(q => q.status === 'closed')
    }
  ];

  return (
    <div className="h-screen bg-gray-50 overflow-hidden flex flex-col">
      <div className="p-6 bg-white border-b">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">问题追踪</h2>
            <p className="text-sm text-gray-600">
              管理与研究员的问答协作
            </p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            新建问题
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto p-6">
        <div className="flex gap-6 h-full">
          {columns.map(column => (
            <div key={column.id} className="flex-1 min-w-[360px] flex flex-col">
              <div className={`flex items-center justify-between p-4 bg-white rounded-t-lg border-t-4 ${column.color}`}>
                <div className="flex items-center gap-2">
                  {column.icon}
                  <h3 className="font-semibold text-gray-900">{column.title}</h3>
                </div>
                <Badge variant="outline" className="text-sm">
                  {column.questions.length}
                </Badge>
              </div>

              <div className="flex-1 bg-gray-100 rounded-b-lg p-4 overflow-y-auto space-y-3">
                {column.questions.map(question => (
                  <Card 
                    key={question.id} 
                    className="hover:shadow-lg transition-shadow cursor-pointer"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <Badge className={`text-xs border ${getPriorityColor(question.priority)}`}>
                          {question.priority}
                        </Badge>
                        {question.replies !== undefined && question.replies > 0 && (
                          <div className="flex items-center gap-1 text-xs text-gray-600">
                            <MessageSquare className="w-3 h-3" />
                            <span>{question.replies}</span>
                          </div>
                        )}
                      </div>

                      <h4 className="font-semibold text-gray-900 mb-2 text-sm leading-tight">
                        {question.title}
                      </h4>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <Badge variant="outline" className="text-xs">
                            {question.company}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <User className="w-3 h-3" />
                          <span>{question.researcher}</span>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <Calendar className="w-3 h-3" />
                          <span>{question.date}</span>
                        </div>
                      </div>

                      {column.id === 'pending' && (
                        <div className="mt-3 pt-3 border-t">
                          <Button size="sm" variant="outline" className="w-full text-xs">
                            查看详情
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}

                {column.questions.length === 0 && (
                  <div className="text-center py-12 text-gray-500 text-sm">
                    暂无{column.title}问题
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuestionsBoardPage;