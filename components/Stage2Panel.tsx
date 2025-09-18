import React, { useState } from 'react';
import type { IntentType, StickyNoteType, FlowchartType, FlowStepType, FlowchartEditorState, Participant, Group, FlowchartEditorStepState } from '../types';
import { FlowStepActor, BotResponseType } from '../types';
import { PlusIcon, UserIcon, BotIcon, TrashIcon, XCircleIcon, PencilIcon } from './icons';
import GroupingPanel from './GroupingPanel';

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
  setFlowchartEditorForGroup: (groupId: string, updater: React.SetStateAction<FlowchartEditorStepState>) => void;
  participants: Participant[];
  groups: Group[];
  setGroups: React.Dispatch<React.SetStateAction<Group[]>>;
  assignParticipantToGroup: (participantId: string, groupId: string | null) => void;
  localParticipant: Participant;
  isFacilitator: boolean;
}

const Stage2Panel: React.FC<Stage2PanelProps> = (props) => {
  const { 
    intents, stickyNotes, flowcharts, setFlowcharts, 
    flowchartEditor, setFlowchartEditorForGroup,
    participants, groups, setGroups, assignParticipantToGroup,
    localParticipant, isFacilitator
  } = props;
  
  const [activity, setActivity] = useState<'grouping' | 'drawing' | 'presenting'>('grouping');
  const [editingFlowchartId, setEditingFlowchartId] = useState<string | null>(null);
  
  const localParticipantGroupId = localParticipant.groupId;
  const currentGroupEditorState = localParticipantGroupId ? (flowchartEditor[localParticipantGroupId] || { selectedIntentId: '', currentSteps: [] }) : null;
  
  const [newStep, setNewStep] = useState<Omit<FlowStepType, 'id'>>({ actor: FlowStepActor.User, description: '', responseType: BotResponseType.TEXT, options: [] });
  const [newOptionText, setNewOptionText] = useState('');

  const intentsWithNotes = intents.filter(intent => stickyNotes.some(note => note.intentId === intent.id));
  const groupFlowcharts = flowcharts.filter(f => f.groupId === localParticipantGroupId);

  const handleSetSelectedIntent = (intentId: string) => {
    if (!localParticipantGroupId) return;
    setFlowchartEditorForGroup(localParticipantGroupId, (prev) => ({
      ...prev,
      selectedIntentId: intentId,
      currentSteps: intentId === prev.selectedIntentId ? prev.currentSteps : [],
    }));
  };
  
  const handleAddStep = () => {
    if (!localParticipantGroupId || !currentGroupEditorState || newStep.description.trim() === '') return;
    const finalStep: FlowStepType = { ...newStep, id: `step-${Date.now()}`};
    if (finalStep.actor === FlowStepActor.User) {
        delete finalStep.responseType;
        delete finalStep.options;
    }
    setFlowchartEditorForGroup(localParticipantGroupId, (prev) => ({
      ...prev,
      currentSteps: [...prev.currentSteps, finalStep],
    }));
    setNewStep({ actor: newStep.actor, description: '', responseType: BotResponseType.TEXT, options: [] });
  };
  
  const handleDeleteStep = (stepId: string) => {
    if (!localParticipantGroupId) return;
    setFlowchartEditorForGroup(localParticipantGroupId, (prev) => ({
      ...prev,
      currentSteps: prev.currentSteps.filter(step => step.id !== stepId),
    }));
  }

  const handleAddOption = () => {
    if (newOptionText.trim() === '') return;
    setNewStep(prev => ({...prev, options: [...(prev.options || []), newOptionText]}));
    setNewOptionText('');
  }

  const handleRemoveOption = (index: number) => {
    setNewStep(prev => ({...prev, options: (prev.options || []).filter((_, i) => i !== index)}));
  }

  const handleSaveFlowchart = () => {
    if (!localParticipantGroupId || !currentGroupEditorState || !currentGroupEditorState.selectedIntentId || currentGroupEditorState.currentSteps.length === 0) return;
    
    const intentName = intents.find(i => i.id === currentGroupEditorState.selectedIntentId)?.name || 'Untitled';
    
    if (editingFlowchartId) {
        setFlowcharts(prev => prev.map(f => f.id === editingFlowchartId ? {
            ...f,
            title: `${intentName} - 流程`,
            steps: currentGroupEditorState.currentSteps,
            intentId: currentGroupEditorState.selectedIntentId,
        } : f));
    } else {
        const newFlowchart: FlowchartType = {
          id: `flow-${Date.now()}`,
          title: `${intentName} - 流程`,
          steps: currentGroupEditorState.currentSteps,
          intentId: currentGroupEditorState.selectedIntentId,
          matrixPosition: null,
          votes: 0,
          groupId: localParticipantGroupId,
        };
        setFlowcharts(prev => [...prev, newFlowchart]);
    }
    
    setEditingFlowchartId(null);
    setFlowchartEditorForGroup(localParticipantGroupId, { selectedIntentId: '', currentSteps: [] });
  };

  const handleEditFlowchart = (flowchartId: string) => {
    if (!localParticipantGroupId) return;
    const flowchartToEdit = flowcharts.find(f => f.id === flowchartId);
    if (!flowchartToEdit) return;

    setEditingFlowchartId(flowchartId);
    setFlowchartEditorForGroup(localParticipantGroupId, {
        selectedIntentId: flowchartToEdit.intentId,
        currentSteps: flowchartToEdit.steps,
    });
  };

  const handleDeleteFlowchart = (flowchartId: string) => {
    if (window.confirm('您確定要刪除這個流程圖嗎？')) {
        setFlowcharts(prev => prev.filter(f => f.id !== flowchartId));
        if (editingFlowchartId === flowchartId) {
            setEditingFlowchartId(null);
            if (localParticipantGroupId) {
                setFlowchartEditorForGroup(localParticipantGroupId, { selectedIntentId: '', currentSteps: [] });
            }
        }
    }
  };

  const handleCancelEdit = () => {
     setEditingFlowchartId(null);
     if (localParticipantGroupId) {
        setFlowchartEditorForGroup(localParticipantGroupId, { selectedIntentId: '', currentSteps: [] });
     }
  };
  
  const flowchartsByGroup = flowcharts.reduce((acc, flowchart) => {
    (acc[flowchart.groupId] = acc[flowchart.groupId] || []).push(flowchart);
    return acc;
  }, {} as Record<string, FlowchartType[]>);
  
  const renderStep = (step: FlowStepType, isPreview: boolean) => {
      const baseClasses = isPreview ? "max-w-xs lg:max-w-md p-3" : "p-3";

      if (step.actor === FlowStepActor.Bot) {
          return (
              <div className="flex items-start gap-3 justify-start group">
                  <BotIcon className={`w-8 h-8 text-white bg-green-500 p-1.5 rounded-full flex-shrink-0 ${!isPreview ? 'mt-1' : ''}`} />
                  <div className={`${baseClasses} rounded-lg bg-white text-slate-700 rounded-bl-none shadow-sm relative w-full`}>
                      <p className="font-medium">{step.description}</p>
                      {step.responseType === BotResponseType.BUTTONS && (
                          <div className="mt-3 flex flex-wrap gap-2">
                              {(step.options || []).map((opt, i) => (
                                  <span key={i} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full">{opt}</span>
                              ))}
                          </div>
                      )}
                      {step.responseType === BotResponseType.FREE_TEXT_INPUT && (
                         <div className="mt-2 text-sm text-slate-400 italic border-t pt-2">
                            -- 等待使用者輸入 --
                         </div>
                      )}
                      {isPreview && <button onClick={() => handleDeleteStep(step.id)} className="absolute -top-2 -right-2 p-1 text-slate-400 bg-white rounded-full hover:text-red-500 hover:bg-red-100 transition opacity-0 group-hover:opacity-100 shadow"><TrashIcon className="w-4 h-4"/></button>}
                  </div>
              </div>
          );
      }
      // User step
      return (
          <div className="flex items-start gap-3 justify-end group">
              <div className={`${baseClasses} rounded-lg bg-indigo-500 text-white rounded-br-none relative`}>
                  <p>{step.description}</p>
                  {isPreview && <button onClick={() => handleDeleteStep(step.id)} className="absolute -top-2 -left-2 p-1 text-slate-400 bg-white rounded-full hover:text-red-500 hover:bg-red-100 transition opacity-0 group-hover:opacity-100 shadow"><TrashIcon className="w-4 h-4"/></button>}
              </div>
              <UserIcon className="w-8 h-8 text-white bg-indigo-500 p-1.5 rounded-full flex-shrink-0" />
          </div>
      );
  };


  return (
    <div className="space-y-8">
      <div className="flex items-center justify-center space-x-2 mb-6 bg-slate-200/80 p-1.5 rounded-full w-fit mx-auto">
        <button onClick={() => setActivity('grouping')} className={`px-8 py-2 rounded-full font-semibold transition-all ${activity === 'grouping' ? 'bg-white text-indigo-600 shadow-md' : 'bg-transparent text-slate-600'}`}>活動三：團隊分組</button>
        <button onClick={() => setActivity('drawing')} className={`px-8 py-2 rounded-full font-semibold transition-all ${activity === 'drawing' ? 'bg-white text-indigo-600 shadow-md' : 'bg-transparent text-slate-600'}`}>活動四：任務流程圖繪製</button>
        <button onClick={() => setActivity('presenting')} className={`px-8 py-2 rounded-full font-semibold transition-all ${activity === 'presenting' ? 'bg-white text-indigo-600 shadow-md' : 'bg-transparent text-slate-600'}`}>活動五：流程原型簡報</button>
      </div>
      
      {activity === 'grouping' && (
        <ActivityDescription title="活動三：團隊分組" duration={5} description="主持人將參與者分配到不同的小組進行協作。">
          {isFacilitator ? (
            <GroupingPanel participants={participants} groups={groups} setGroups={setGroups} assignParticipantToGroup={assignParticipantToGroup} />
          ) : (
            <div className="text-center p-12 text-slate-500 font-semibold text-lg">
              <p className="animate-pulse">等待主持人進行分組...</p>
            </div>
          )}
        </ActivityDescription>
      )}

      {activity === 'drawing' && (
        <ActivityDescription title="活動四：任務流程圖繪製" duration={20} description="針對高價值痛點，分組設計具體的「以任務為中心」對話流程圖。">
          {!localParticipantGroupId ? (
             <div className="text-center p-12 text-slate-500 font-semibold text-lg">您尚未被分配到任何組別。</div>
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-50/70 p-4 rounded-lg border border-slate-200/80 space-y-4">
              <h4 className="font-bold text-lg text-slate-700">流程設計器</h4>

              <div className="mt-4 space-y-2 bg-white/50 p-3 rounded-lg border">
                <h5 className="font-semibold text-slate-600">本組已儲存的流程圖</h5>
                {groupFlowcharts.length === 0 ? (
                  <p className="text-sm text-slate-400 p-2">尚未儲存任何流程圖。</p>
                ) : (
                  <div className="space-y-2 max-h-40 overflow-y-auto p-1">
                    {groupFlowcharts.map(f => (
                      <div key={f.id} className="bg-white p-2 rounded-md shadow-sm flex justify-between items-center border">
                        <span className="font-medium text-slate-700">{f.title}</span>
                        <div className="flex items-center gap-1">
                          <button onClick={() => handleEditFlowchart(f.id)} className="p-1 text-slate-500 hover:text-indigo-600 rounded-full hover:bg-indigo-100 transition" title="編輯">
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDeleteFlowchart(f.id)} className="p-1 text-slate-500 hover:text-red-600 rounded-full hover:bg-red-100 transition" title="刪除">
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <hr className="my-2" />

              <select 
                value={currentGroupEditorState?.selectedIntentId || ''}
                onChange={(e) => handleSetSelectedIntent(e.target.value)}
                className="w-full p-3 bg-white border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400"
                disabled={!!editingFlowchartId}
              >
                <option value="">選擇一個意圖開始設計...</option>
                {intentsWithNotes.map(intent => ( <option key={intent.id} value={intent.id}>{intent.name}</option>))}
              </select>

              {currentGroupEditorState?.selectedIntentId && (
                <div className="bg-white/70 p-4 rounded-lg border border-slate-200 space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <label className="font-semibold">角色</label>
                    <label className="font-semibold">回覆類型</label>
                    <select value={newStep.actor} onChange={(e) => setNewStep(prev => ({ ...prev, actor: e.target.value as FlowStepActor }))} className="p-3 bg-white border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400">
                        <option value={FlowStepActor.User}>用戶</option>
                        <option value={FlowStepActor.Bot}>機器人</option>
                    </select>
                    <select value={newStep.responseType} onChange={(e) => setNewStep(prev => ({ ...prev, responseType: e.target.value as BotResponseType }))} className="p-3 bg-white border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400" disabled={newStep.actor !== FlowStepActor.Bot}>
                        <option value={BotResponseType.TEXT}>純文字</option>
                        <option value={BotResponseType.BUTTONS}>文字與按鈕</option>
                        <option value={BotResponseType.FREE_TEXT_INPUT}>請求使用者輸入</option>
                    </select>
                  </div>
                  
                  <textarea placeholder="輸入對話步驟描述..." value={newStep.description} onChange={(e) => setNewStep(prev => ({...prev, description: e.target.value}))} className="w-full p-3 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 min-h-[80px]" />
                  
                  {newStep.actor === FlowStepActor.Bot && newStep.responseType === BotResponseType.BUTTONS && (
                    <div className="space-y-2 p-3 bg-slate-100 rounded-lg">
                      <label className="font-semibold text-sm text-slate-600">按鈕選項</label>
                      <div className="flex gap-2">
                        <input type="text" placeholder="新增選項文字..." value={newOptionText} onChange={e => setNewOptionText(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleAddOption()} className="flex-grow p-2 border-2 border-slate-200 rounded-lg text-sm" />
                        <button onClick={handleAddOption} className="bg-blue-500 text-white p-2 rounded-lg text-sm font-bold hover:bg-blue-600">新增</button>
                      </div>
                      <div className="flex flex-wrap gap-2 pt-2">
                        {(newStep.options || []).map((opt, i) => (
                          <div key={i} className="flex items-center gap-1 bg-blue-200 text-blue-900 text-sm font-medium px-2 py-1 rounded-full">
                            <span>{opt}</span>
                            <button onClick={() => handleRemoveOption(i)} className="text-blue-600 hover:text-blue-900"><XCircleIcon className="w-4 h-4" /></button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button onClick={handleAddStep} className="flex-grow bg-indigo-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-600 transition-colors flex items-center justify-center gap-2"><PlusIcon className="w-5 h-5"/>新增步驟</button>
                    <button onClick={handleSaveFlowchart} className="flex-grow bg-gradient-to-r from-green-600 to-emerald-500 text-white font-bold py-3 px-4 rounded-lg hover:opacity-90 transition-all shadow-lg shadow-green-500/30">
                      {editingFlowchartId ? '更新流程圖' : '儲存流程圖'}
                    </button>
                  </div>
                   {editingFlowchartId && (
                    <button onClick={handleCancelEdit} className="w-full mt-2 bg-slate-200 text-slate-700 font-bold py-2 px-4 rounded-lg hover:bg-slate-300 transition-colors">
                      或建立一個新的流程圖
                    </button>
                  )}
                </div>
              )}
            </div>
            <div className="bg-slate-50/70 p-4 rounded-lg border border-slate-200/80">
                <h4 className="font-bold text-lg mb-4 text-center text-slate-700">流程預覽</h4>
                <div className="space-y-4">
                    {currentGroupEditorState?.currentSteps.map(step => (
                        <div key={step.id}>
                          {renderStep(step, true)}
                        </div>
                    ))}
                    {!currentGroupEditorState || currentGroupEditorState.currentSteps.length === 0 && <div className="text-slate-400 text-center py-12">在這裡預覽您的對話流程...</div>}
                </div>
            </div>
          </div>
          )}
        </ActivityDescription>
      )}

      {activity === 'presenting' && (
        <ActivityDescription title="活動五：流程原型簡報" duration={10} description="各組分享設計，獲取反饋，共同優化。">
            <div className="space-y-8 mt-4">
                {flowcharts.length === 0 && <p className="text-slate-500 text-center col-span-full py-10">目前尚無流程圖可供簡報。</p>}
                {Object.entries(flowchartsByGroup).map(([groupId, groupFlowcharts]) => (
                  <div key={groupId} className="bg-slate-50/50 p-4 rounded-xl border-2 border-slate-200/80">
                    <h3 className="text-xl font-bold text-indigo-700 mb-4 pb-3 border-b-2 border-slate-200">
                      {groups.find(g => g.id === groupId)?.name || '未命名組別'}
                    </h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {groupFlowcharts.map(flowchart => (
                          <div key={flowchart.id} className="bg-white p-4 rounded-lg shadow-sm border">
                              <h4 className="font-bold text-lg text-slate-800 mb-3">{flowchart.title}</h4>
                              <div className="space-y-4">
                                  {flowchart.steps.map(step => (
                                    <div key={step.id}>
                                       {renderStep(step, false)}
                                    </div>
                                  ))}
                              </div>
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