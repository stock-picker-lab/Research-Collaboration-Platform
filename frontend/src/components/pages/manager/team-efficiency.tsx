/**
 * 团队效率看板 - 简化版
 */
import React from 'react';

const TeamEfficiencyPage: React.FC = () => {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">团队效率看板</h2>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">
          功能开发中：团队统计、研究员效率排行等
        </p>
      </div>
    </div>
  );
};

export default TeamEfficiencyPage;
