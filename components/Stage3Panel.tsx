import React, { useState } from 'react';
import type { FlowchartType, MatrixQuadrant } from '../types';
import { VoteIcon } from './icons';

interface Stage3PanelProps {
  flowcharts: FlowchartType[];
  setFlowcharts: React.Dispatch<React.SetStateAction<FlowchartType[]>>;
}

const Quadrant: React.FC<{
  title: string;
  quadrant: MatrixQuadrant;
  bgColor: string;
  textColor: string;
  children: React.ReactNode;
  onDrop: (quadrant: MatrixQuadrant) => void;
}> = ({ title, quadrant, bgColor, textColor, children, onDrop }) => {
  const [isOver, setIsOver] = useState(false);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsOver(true);
  };
  
  const handleDragLeave = () => {
    setIsOver(false);
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsOver(false);
    onDrop(quadrant);
  };
  
  return (
    <div 
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`rounded-xl p-4 ${bgColor} border-2 border-dashed border-slate-400/50 min-h-[250px] transition-all ${isOver ? 'scale-105 shadow-2xl' : ''}`}
    >
      <h3 className={`font-bold text-lg text-center ${textColor} mb-4`}>{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
};


const FlowchartCard: React.FC<{
    flowchart: FlowchartType;
    isVoting: boolean;
    onVote: (id: string) => void;
    onDragStart: (e: React.DragEvent<HTMLDivElement>, id: string) => void;
}> = ({ flowchart, isVoting, onVote, onDragStart }) => (
    <div
        draggable={!isVoting}
        onDragStart={(e) => onDragStart(e, flowchart.id)}
        className={`bg-white p-3 rounded-lg shadow-md relative group transition-all
            ${isVoting ? 'cursor-pointer hover:ring-2 hover:ring-indigo-500' : 'cursor-grab hover:shadow-lg hover:-translate-y-1'}`}
        onClick={() => isVoting && onVote(flowchart.id)}
    >
        <p className="font-semibold text-slate-800">{flowchart.title}</p>
        <div className="flex items-center gap-1 text-amber-500 mt-2">
           <VoteIcon className="w-5 h-5" />
           <span className="font-bold text-lg">{flowchart.votes}</span>
        </div>
        {isVoting && <div className="absolute inset-0 bg-indigo-500/10 rounded-lg pointer-events-none group-hover:bg-indigo-500/20 transition-colors"></div>}
    </div>
);


const Stage3Panel: React.FC<Stage3PanelProps> = ({ flowcharts, setFlowcharts }) => {
    const [isVoting, setIsVoting] = useState(false);
    const VOTE_LIMIT = 3;
    const [votesUsed, setVotesUsed] = useState(0);

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, flowchartId: string) => {
        e.dataTransfer.setData('flowchartId', flowchartId);
    };

    const handleDrop = (quadrant: MatrixQuadrant) => {
        const flowchartId = (window.event as DragEvent).dataTransfer.getData('flowchartId');
        setFlowcharts(prev => prev.map(f => f.id === flowchartId ? { ...f, matrixPosition: quadrant } : f));
    };

    const handleVote = (id: string) => {
        if (!isVoting || votesUsed >= VOTE_LIMIT) return;
        setFlowcharts(prev => prev.map(f => f.id === id ? { ...f, votes: f.votes + 1 } : f));
        setVotesUsed(prev => prev + 1);
    };

    const unassignedFlowcharts = flowcharts.filter(f => f.matrixPosition === null);

  return (
    <div className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl shadow-md border border-slate-200/80">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-2xl font-bold text-slate-800">活動五：方案評估與共識票選</h3>
          <p className="text-slate-500 mt-1">透過艾森豪矩陣達成下一步行動的共識，並透過三點投票建立共識。</p>
        </div>
        <span className="text-lg font-semibold text-indigo-600 bg-indigo-100 px-4 py-1.5 rounded-full">15 分鐘</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 bg-slate-100/70 p-4 rounded-xl border border-slate-200/80">
          <h4 className="font-bold text-center mb-4 text-slate-700">待辦方案</h4>
          <div className="space-y-3">
            {unassignedFlowcharts.map(f => (
                <FlowchartCard key={f.id} flowchart={f} isVoting={isVoting} onVote={handleVote} onDragStart={handleDragStart} />
            ))}
             {unassignedFlowcharts.length === 0 && <p className="text-slate-400 text-center pt-8">將方案拖曳至右方矩陣</p>}
          </div>
        </div>
        
        <div className="lg:col-span-3">
          <div className="relative">
            <div className="absolute top-1/2 -left-12 text-center -rotate-90 font-bold text-slate-600">重要</div>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-8 text-center font-bold text-slate-600">緊急</div>
            <div className="grid grid-cols-2 gap-4">
                <Quadrant title="Q1: 立即開發 (MVP)" quadrant="q1" bgColor="bg-red-100" textColor="text-red-800" onDrop={handleDrop}>
                    {flowcharts.filter(f=>f.matrixPosition === 'q1').map(f=><FlowchartCard key={f.id} flowchart={f} isVoting={isVoting} onVote={handleVote} onDragStart={handleDragStart} />)}
                </Quadrant>
                <Quadrant title="Q2: 中長期規劃" quadrant="q2" bgColor="bg-green-100" textColor="text-green-800" onDrop={handleDrop}>
                     {flowcharts.filter(f=>f.matrixPosition === 'q2').map(f=><FlowchartCard key={f.id} flowchart={f} isVoting={isVoting} onVote={handleVote} onDragStart={handleDragStart} />)}
                </Quadrant>
                <Quadrant title="Q3: 簡單腳本處理" quadrant="q3" bgColor="bg-yellow-100" textColor="text-yellow-800" onDrop={handleDrop}>
                     {flowcharts.filter(f=>f.matrixPosition === 'q3').map(f=><FlowchartCard key={f.id} flowchart={f} isVoting={isVoting} onVote={handleVote} onDragStart={handleDragStart} />)}
                </Quadrant>
                <Quadrant title="Q4: 暫不考慮" quadrant="q4" bgColor="bg-slate-200" textColor="text-slate-800" onDrop={handleDrop}>
                     {flowcharts.filter(f=>f.matrixPosition === 'q4').map(f=><FlowchartCard key={f.id} flowchart={f} isVoting={isVoting} onVote={handleVote} onDragStart={handleDragStart} />)}
                </Quadrant>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-8 flex justify-center items-center gap-4">
          <button 
            onClick={() => setIsVoting(!isVoting)} 
            className={`px-8 py-3 rounded-lg font-bold text-lg transition-all transform hover:scale-105 shadow-lg ${isVoting ? 'bg-red-500 text-white shadow-red-500/30' : 'bg-gradient-to-r from-indigo-600 to-blue-500 text-white shadow-indigo-500/30'}`}
          >
            {isVoting ? '結束投票' : '開始投票'}
          </button>
          {isVoting && (
            <div className="text-lg font-semibold bg-amber-200 text-amber-900 px-4 py-2 rounded-lg shadow-sm">
                剩餘票數: <span className="font-black">{VOTE_LIMIT - votesUsed}</span>
            </div>
          )}
      </div>

    </div>
  );
};

export default Stage3Panel;