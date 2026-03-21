/**
 * 结论卡页 - 简化版
 */
import React from 'react';

const ConclusionCardPage: React.FC = () => {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">结论卡</h2>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">
          功能开发中：核心逻辑、假设管理、观点时间线等
        </p>
      </div>
    </div>
  );
};

export default ConclusionCardPage;
