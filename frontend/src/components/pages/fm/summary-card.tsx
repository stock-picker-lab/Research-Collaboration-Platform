/**
 * 摘要卡页 - 简化版
 */
import React from 'react';

const SummaryCardPage: React.FC = () => {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">摘要卡(3-3-2-1)</h2>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">
          功能开发中：3个核心结论、3个关键变化、2个风险点、1个建议问题
        </p>
      </div>
    </div>
  );
};

export default SummaryCardPage;
