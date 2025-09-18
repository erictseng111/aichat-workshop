import React from 'react';
import type { FlowchartType, MatrixQuadrant, Group } from '../types';
import { TrophyIcon, SparklesIcon, VoteIcon } from './icons';

interface Stage4PanelProps {
  flowcharts: FlowchartType[];
  groups: Group[];
}

const getQuadrantInfo = (quadrant: MatrixQuadrant | null) => {
    switch (quadrant) {
        case 'q1': return { label: 'Q1: 立即開發', style: 'bg-red-100 text-red-800' };
        case 'q2': return { label: 'Q2: 中長期規劃', style: 'bg-green-100 text-green-800' };
        case 'q3': return { label: 'Q3: 簡單腳本處理', style: 'bg-yellow-100 text-yellow-800' };
        case 'q4': return { label: 'Q4: 暫不考慮', style: 'bg-slate-200 text-slate-800' };
        default: return { label: '未分類', style: 'bg-slate-100 text-slate-600' };
    }
};

const getMedalStyle = (index: number) => {
    if (index === 0) return { border: 'border-amber-400', shadow: 'shadow-amber-500/30', bg: 'bg-amber-50', iconColor: 'text-amber-500' };
    if (index === 1) return { border: 'border-slate-400', shadow: 'shadow-slate-500/30', bg: 'bg-slate-50', iconColor: 'text-slate-500' };
    if (index === 2) return { border: 'border-orange-400', shadow: 'shadow-orange-500/30', bg: 'bg-orange-50', iconColor: 'text-orange-600' };
    return { border: 'border-slate-200', shadow: 'shadow-slate-500/10', bg: 'bg-white', iconColor: 'text-slate-400' };
}

const Stage4Panel: React.FC<Stage4PanelProps> = ({ flowcharts, groups }) => {
  const sortedFlowcharts = [...flowcharts].sort((a, b) => b.votes - a.votes);

  const getGroupName = (groupId: string) => groups.find(g => g.id === groupId)?.name;

  return (
    <div className="space-y-12">
      <div className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl shadow-md border border-slate-200/80">
        <h3 className="text-2xl font-bold text-slate-800 text-center">活動七：投票結果總覽</h3>
        <p className="text-slate-500 mt-1 text-center mb-8">基於團隊共識，以下是本次工作坊的重點方案排序：</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedFlowcharts.map((flowchart, index) => {
            const quadrantInfo = getQuadrantInfo(flowchart.matrixPosition);
            const medalStyle = getMedalStyle(index);
            const groupName = getGroupName(flowchart.groupId);
            return (
              <div 
                key={flowchart.id} 
                className={`p-5 rounded-xl border-2 transition-all transform hover:-translate-y-1 ${medalStyle.border} ${medalStyle.shadow} ${medalStyle.bg} shadow-lg`}
              >
                <div className="flex justify-between items-start">
                    <div>
                        <div className="flex flex-wrap gap-2 mb-2">
                          <span className={`inline-block px-3 py-1 text-xs font-bold rounded-full ${quadrantInfo.style}`}>
                              {quadrantInfo.label}
                          </span>
                          {groupName && <span className="inline-block px-3 py-1 text-xs font-bold rounded-full bg-indigo-100 text-indigo-800">{groupName}</span>}
                        </div>
                        <h4 className="text-lg font-bold text-slate-800">{flowchart.title}</h4>
                    </div>
                    {index < 3 && <TrophyIcon className={`w-8 h-8 flex-shrink-0 ${medalStyle.iconColor}`} />}
                </div>
                <div className="mt-4 flex items-center gap-2 text-slate-600 font-semibold">
                    <VoteIcon className="w-6 h-6 text-amber-500" />
                    <span className="text-2xl font-black text-slate-800">{flowchart.votes}</span>
                    <span>票</span>
                </div>
              </div>
            );
          })}
           {sortedFlowcharts.length === 0 && <p className="text-slate-500 text-center col-span-full py-10">尚無投票結果可顯示。</p>}
        </div>
      </div>

      <div className="bg-gradient-to-br from-slate-800 to-slate-900 text-white p-8 rounded-2xl shadow-2xl border border-slate-700">
         <h3 className="text-3xl font-black text-center mb-2">後續行動 (Next Actions)</h3>
         <p className="text-slate-300 text-center mb-8 max-w-3xl mx-auto">工作坊的結束是專案的開始。下一步將由 Eric 和顧問負責人推動以下事項：</p>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-slate-200">
            <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700">
                <h4 className="font-bold text-lg text-indigo-300 mb-2">1. 資訊數位化與整理</h4>
                <p className="text-slate-300">將工作坊產出的所有資訊（便利貼、流程圖、艾森豪矩陣）進行數位化整理，創建一份結構化的任務清單。</p>
            </div>
            <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700">
                <h4 className="font-bold text-lg text-indigo-300 mb-2">2. 任務拆解與規劃</h4>
                <p className="text-slate-300">基於艾森豪矩陣，將第一、二象限的方案分解為具體任務，並明確各任務的 SMART Goals、負責人、時間表與所需資源。</p>
            </div>
            <div className="md:col-span-2 bg-slate-800/50 p-6 rounded-lg border border-slate-700">
                <h4 className="font-bold text-lg text-indigo-300 mb-2">3. 團隊溝通與導入</h4>
                <p className="text-slate-300">這份任務清單將成為與技術團隊溝通、導入專案管理工具（如 Asana）的重要文件，確保每個環節都有人負責、有期限可追蹤。</p>
            </div>
         </div>
      </div>

      <div className="text-center py-10">
        <div className="inline-flex items-center justify-center p-4 bg-green-100 rounded-full mb-4">
            <SparklesIcon className="w-12 h-12 text-green-600" />
        </div>
        <h2 className="text-4xl font-black text-slate-800">恭喜！本次工作坊圓滿成功！</h2>
        <p className="text-slate-500 mt-2 text-lg">感謝所有參與者的貢獻與投入。</p>
      </div>
    </div>
  );
};

export default Stage4Panel;
