
import React, { useState } from 'react';
import type { IntentType, StickyNoteType, FlowchartType, FlowStepType, FlowchartEditorState } from '../types';
import { FlowStepActor } from '../types';
import { PlusIcon, UserIcon, BotIcon, TrashIcon } from './icons';

const ActivityDescription: React.FC<{ title: string; duration: number; description: string; children: React.ReactNode }> = ({ title, duration, description, children }) => (
    <div className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl shadow-md border border-slate-200/80">
        <div className="flex justify-between items-start mb-6">
            <div>
                <h3 className="text-2xl font-bold text-slate-800">{title}</h3>
                <p className="text-slate-500 mt-1">{description}</p>
            </div>
            <span className="text-lg font-semibold text-indigo-600 bg-indigo-100 px-4 py-1.5 rounded-full whitespace-nowrap">{duration} 分鐘</span>
        </div>
        <div>{children}</div>
    </div>
);

interface Stage2PanelProps {
  intents: IntentType[];
  stickyNotes: StickyNoteType[];
  flowcharts: FlowchartType[];
  setFlowcharts: React.Dispatch<React.SetStateAction<FlowchartType[]>>;
  flowchartEditor: FlowchartEditorState;
  setFlowchartEditor: (updater: React.SetStateAction<FlowchartEditorState>) => void;
}

const Stage2Panel: React.FC<Stage2PanelProps> = ({ intents, stickyNotes, flowcharts, setFlowcharts, flowchartEditor, setFlowchartEditor }) => {
  const [activity, setActivity] = useState<3 | 4>(3);
  const { selectedIntentId, currentSteps } = flowchartEditor;
  const [newStep, setNewStep] = useState({ actor: FlowStepActor.User, description: '' });

  const intentsWithNotes = intents.filter(intent => stickyNotes.some(note => note.intentId === intent.id));

  const handleAddStep = () => {
    if (newStep.description.trim() === '') return;
    setFlowchartEditor(prev => ({
      ...prev,
      currentSteps: [...prev.currentSteps, { ...newStep, id: `step-${Date.now()}` }],
    }));
    setNewStep({ actor: newStep.actor, description: '' }); // Keep the actor for next step
  };
  
  const handleDeleteStep = (stepId: string) => {
    setFlowchartEditor(prev => ({
      ...prev,
      currentSteps: prev.currentSteps.filter(step => step.id !== stepId),
    }));
  }

  const handleSaveFlowchart = () => {
    if (!selectedIntentId || currentSteps.length === 0) return;
    const intentName = intents.find(i => i.id === selectedIntentId)?.name || 'Untitled';
    const newFlowchart: FlowchartType = {
      id: `flow-${Date.now()}`,
      title: `${intentName} - 流程`,
      steps: currentSteps,
      matrixPosition: null,
      votes: 0
    };
    setFlowcharts(prev => [...prev, newFlowchart]);
    // Reset editor for next creation
    setFlowchartEditor({ selectedIntentId: '', currentSteps: [] });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-center space-x-2 mb-6 bg-slate-200/80 p-1.5 rounded-full w-fit mx-auto">
        <button onClick={() => setActivity(3)} className={`px-8 py-2 rounded-full font-semibold transition-all ${activity === 3 ? 'bg-white text-indigo-600 shadow-md' : 'bg-transparent text-slate-600'}`}>活動三：任務流程圖繪製</button>
        <button onClick={() => setActivity(4)} className={`px-8 py-2 rounded-full font-semibold transition-all ${activity === 4 ? 'bg-white text-indigo-600 shadow-md' : 'bg-transparent text-slate-600'}`}>活動四：流程原型簡報</button>
      </div>

      {activity === 3 && (
        <ActivityDescription title="活動三：任務流程圖繪製" duration={20} description="針對高價值痛點，分組設計具體的「以任務為中心」對話流程圖。">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left side: Flowchart creator */}
            <div className="bg-slate-50/70 p-4 rounded-lg border border-slate-200/80">
              <h4 className="font-bold text-lg mb-4 text-slate-700">流程設計器</h4>
              <select 
                value={selectedIntentId}
                onChange={(e) => setFlowchartEditor({ selectedIntentId: e.target.value, currentSteps: [] })}
                className="w-full p-3 bg-white border-2 border-slate-200 rounded-lg mb-4 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400"
              >
                <option value="">選擇一個意圖開始設計...</option>
                {intentsWithNotes.map(intent => (
                  <option key={intent.id} value={intent.id}>{intent.name}</option>
                ))}
              </select>

              {selectedIntentId && (
                <>
                  <div className="flex gap-2 mb-4">
                    <select
                        value={newStep.actor}
                        onChange={(e) => setNewStep(prev => ({ ...prev, actor: e.target.value as FlowStepActor }))}
                        className="p-3 bg-white border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400"
                    >
                        <option value={FlowStepActor.User}>用戶</option>
                        <option value={FlowStepActor.Bot}>機器人</option>
                    </select>
                    <input
                      type="text"
                      placeholder="輸入對話步驟描述..."
                      value={newStep.description}
                      onChange={(e) => setNewStep(prev => ({...prev, description: e.target.value}))}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddStep()}
                      className="flex-grow p-3 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400"
                    />
                    <button onClick={handleAddStep} className="bg-indigo-500 text-white p-3 rounded-lg hover:bg-indigo-600 transition-colors">
                      <PlusIcon className="w-5 h-5"/>
                    </button>
                  </div>
                  <button onClick={handleSaveFlowchart} className="w-full bg-gradient-to-r from-green-600 to-emerald-500 text-white font-bold py-3 px-4 rounded-lg hover:opacity-90 transition-all shadow-lg shadow-green-500/30 transform hover:scale-105">
                    儲存流程圖
                  </button>
                </>
              )}
            </div>
            {/* Right side: Live preview */}
            <div className="bg-slate-50/70 p-4 rounded-lg border border-slate-200/80">
                <h4 className="font-bold text-lg mb-4 text-center text-slate-700">流程預覽</h4>
                <div className="space-y-4">
                    {currentSteps.map(step => (
                        <div key={step.id} className={`flex items-start gap-3 group ${step.actor === FlowStepActor.User ? 'justify-end' : 'justify-start'}`}>
                            {step.actor === FlowStepActor.Bot && <BotIcon className="w-8 h-8 text-white bg-green-500 p-1.5 rounded-full flex-shrink-0" />}
                            <div className={`relative max-w-xs lg:max-w-md p-3 rounded-lg ${step.actor === FlowStepActor.User ? 'bg-indigo-500 text-white rounded-br-none' : 'bg-white text-slate-700 rounded-bl-none shadow-sm'}`}>
                                <p>{step.description}</p>
                                <button onClick={() => handleDeleteStep(step.id)} className="absolute -top-2 -right-2 p-1 text-slate-400 bg-white rounded-full hover:text-red-500 hover:bg-red-100 transition opacity-0 group-hover:opacity-100 shadow">
                                    <TrashIcon className="w-4 h-4"/>
                                </button>
                            </div>
                            {step.actor === FlowStepActor.User && <UserIcon className="w-8 h-8 text-white bg-indigo-500 p-1.5 rounded-full flex-shrink-0" />}
                        </div>
                    ))}
                    {currentSteps.length === 0 && <div className="text-slate-400 text-center py-12">在這裡預覽您的對話流程...</div>}
                </div>
            </div>
          </div>
        </ActivityDescription>
      )}

      {activity === 4 && (
        <ActivityDescription title="活動四：流程原型簡報" duration={15} description="各組分享設計，獲取反饋，共同優化。">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
                {flowcharts.length === 0 && <p className="text-slate-500 text-center col-span-full py-10">目前尚無流程圖可供簡報。</p>}
                {flowcharts.map(flowchart => (
                    <div key={flowchart.id} className="bg-slate-50/70 p-4 rounded-lg border-2 border-slate-200/80">
                        <h4 className="font-bold text-xl text-slate-800 mb-4 pb-3 border-b-2 border-slate-200">{flowchart.title}</h4>
                        <div className="space-y-3">
                            {flowchart.steps.map(step => (
                                <div key={step.id} className="flex items-start gap-3">
                                    {step.actor === FlowStepActor.User ? <UserIcon className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" /> : <BotIcon className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />}
                                    <p className="text-sm text-slate-700">{step.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </ActivityDescription>
      )}
    </div>
  );
};

export default Stage2Panel;
