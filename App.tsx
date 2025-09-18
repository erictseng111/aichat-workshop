import React, { useState } from 'react';
import Stage1Panel from './components/Stage1Panel';
import Stage2Panel from './components/Stage2Panel';
import Stage3Panel from './components/Stage3Panel';
import Stage4Panel from './components/Stage4Panel';
import Timer from './components/Timer';
import LoginScreen from './components/LoginScreen';
import ParticipantAvatars from './components/ParticipantAvatars';
import { useWorkshopState } from './hooks/useWorkshopState';
import { CheckIcon, ChevronLeftIcon, ChevronRightIcon } from './components/icons';

const STAGE_CONFIG = [
  { id: 1, title: "痛點盤點與情境定義", duration: 25 },
  { id: 2, title: "任務導向流程設計", duration: 35 },
  { id: 3, title: "方案共識與優先排序", duration: 15 },
  { id: 4, title: "總結與後續步驟", duration: 10 },
];

function App() {
  const [localParticipantId, setLocalParticipantId] = useState(() => sessionStorage.getItem('participantId'));

  const {
    state,
    addParticipant,
    setWorkshopStatus,
    setCurrentStage,
    setStickyNotes,
    setIntents,
    setGroups,
    assignParticipantToGroup,
    setFlowcharts,
    setFlowchartEditorForGroup,
    setIsVoting,
  } = useWorkshopState();

  const { status, currentStage, participants, stickyNotes, intents, groups, flowcharts, flowchartEditor, isVoting } = state;

  const localParticipant = participants.find(p => p.id === localParticipantId);
  const isFacilitator = localParticipant?.isFacilitator || false;

  const handleJoin = (name: string) => {
    const newParticipant = addParticipant(name);
    sessionStorage.setItem('participantId', newParticipant.id);
    setLocalParticipantId(newParticipant.id);
  };

  const handleStart = () => {
    setWorkshopStatus('in_progress');
  };

  const goToNextStage = () => {
    if (!isFacilitator) return;
    if (currentStage < STAGE_CONFIG.length) {
      setCurrentStage(currentStage + 1);
    } else {
      setWorkshopStatus('completed');
    }
  };

  const goToPrevStage = () => {
    if (!isFacilitator) return;
    if (status === 'completed') {
      setWorkshopStatus('in_progress');
    }
    setCurrentStage(Math.max(1, currentStage - 1));
  };

  if (status === 'not_started' || !localParticipant) {
    return (
      <LoginScreen
        isFacilitator={localParticipant?.isFacilitator ?? false}
        participants={participants}
        onJoin={handleJoin}
        onStart={handleStart}
        hasJoined={!!localParticipant}
      />
    );
  }
  
  const currentConfig = STAGE_CONFIG.find(s => s.id === currentStage) || STAGE_CONFIG[0];
  const isWorkshopComplete = status === 'completed';

  return (
    <div className="min-h-screen p-4 sm:p-8 lg:p-12">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10 text-center">
          <h1 className="text-5xl font-black text-slate-900">AI Workshop Facilitator</h1>
          <p className="text-slate-500 mt-3 text-lg">一個引導您完成對話式 AI 設計工作坊的工具</p>
        </header>

        <div className="bg-white/70 backdrop-blur-xl p-5 rounded-2xl shadow-lg border border-slate-200/80 mb-8 sticky top-4 z-10">
            <div className="flex items-center justify-between">
                <div className="flex-grow">
                    <ol className="flex items-center">
                        {STAGE_CONFIG.map((stage, index) => {
                            const isCompleted = currentStage > stage.id || isWorkshopComplete;
                            const isCurrent = currentStage === stage.id && !isWorkshopComplete;
                            return (
                                <li key={stage.id} className={`flex items-center ${index < STAGE_CONFIG.length - 1 ? 'flex-1' : ''}`}>
                                    <div className="flex flex-col items-center text-center">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300
                                            ${isCompleted ? 'bg-indigo-600 text-white' : ''}
                                            ${isCurrent ? 'bg-indigo-600 text-white ring-4 ring-indigo-200' : ''}
                                            ${!isCompleted && !isCurrent ? 'bg-slate-200 text-slate-500' : ''}
                                        `}>
                                            {isCompleted ? <CheckIcon className="w-6 h-6" /> : stage.id}
                                        </div>
                                        <p className={`mt-2 text-sm font-semibold transition-colors ${isCurrent || isCompleted ? 'text-indigo-600' : 'text-slate-500'}`}>{stage.title}</p>
                                    </div>
                                    
                                    {index < STAGE_CONFIG.length - 1 && (
                                        <div className="flex-1 h-1 bg-slate-200 mx-4 relative">
                                            <div className={`absolute top-0 left-0 h-1 bg-indigo-600 transition-all duration-500 ${currentStage > stage.id || isWorkshopComplete ? 'w-full' : 'w-0'}`}></div>
                                        </div>
                                    )}
                                </li>
                            );
                        })}
                    </ol>
                </div>
                 <div className="pl-8 ml-8 border-l border-slate-200 flex flex-col items-center gap-y-4">
                    <Timer title="階段計時器" durationInMinutes={currentConfig.duration} key={currentStage} />
                    <ParticipantAvatars participants={participants} />
                </div>
            </div>
        </div>
        
        <main>
          {currentStage === 1 && <Stage1Panel stickyNotes={stickyNotes} setStickyNotes={setStickyNotes} intents={intents} setIntents={setIntents} />}
          {currentStage === 2 && <Stage2Panel intents={intents} stickyNotes={stickyNotes} flowcharts={flowcharts} setFlowcharts={setFlowcharts} flowchartEditor={flowchartEditor} setFlowchartEditorForGroup={setFlowchartEditorForGroup} participants={participants} groups={groups} setGroups={setGroups} assignParticipantToGroup={assignParticipantToGroup} localParticipant={localParticipant} isFacilitator={isFacilitator} />}
          {currentStage === 3 && <Stage3Panel flowcharts={flowcharts} setFlowcharts={setFlowcharts} groups={groups} isVoting={isVoting} setIsVoting={setIsVoting} isFacilitator={isFacilitator} />}
          {currentStage === 4 && <Stage4Panel flowcharts={flowcharts} groups={groups} />}
        </main>
        
        <footer className={`mt-10 flex ${isFacilitator ? 'justify-between' : 'justify-center'} items-center`}>
          {isFacilitator ? (
            <>
              <button 
                onClick={goToPrevStage}
                disabled={currentStage === 1 && !isWorkshopComplete}
                className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-slate-300 text-slate-700 rounded-xl font-bold hover:bg-slate-100 hover:border-slate-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
              >
                <ChevronLeftIcon className="w-5 h-5" />
                上一步
              </button>
              <button 
                onClick={goToNextStage}
                disabled={isWorkshopComplete}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-500 text-white rounded-xl font-bold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-500/30 transform hover:scale-105"
              >
                {currentStage === STAGE_CONFIG.length ? '完成工作坊' : '下一步'}
                <ChevronRightIcon className="w-5 h-5" />
              </button>
            </>
          ) : (
             <p className="text-slate-500 italic animate-pulse">等待主持人引導至下一步...</p>
          )}
        </footer>
      </div>
    </div>
  );
}

export default App;
