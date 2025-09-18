import React, { useState } from 'react';
import type { Participant, Group } from '../types';
import { PlusIcon, UserIcon } from './icons';

interface GroupingPanelProps {
  participants: Participant[];
  groups: Group[];
  setGroups: React.Dispatch<React.SetStateAction<Group[]>>;
  assignParticipantToGroup: (participantId: string, groupId: string | null) => void;
}

const GroupingPanel: React.FC<GroupingPanelProps> = ({ participants, groups, setGroups, assignParticipantToGroup }) => {
  const [dragTarget, setDragTarget] = useState<string | null>(null);

  const unassignedParticipants = participants.filter(p => !p.groupId);

  const handleAddGroup = () => {
    const newGroup: Group = {
      id: `group-${Date.now()}`,
      name: `Group ${groups.length + 1}`,
    };
    setGroups(prev => [...prev, newGroup]);
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, participantId: string) => {
    e.dataTransfer.setData('participantId', participantId);
    e.currentTarget.style.opacity = '0.5';
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.style.opacity = '1';
    setDragTarget(null);
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>, groupId: string | null) => {
    e.preventDefault();
    const participantId = e.dataTransfer.getData('participantId');
    const participant = participants.find(p => p.id === participantId);
    if (participant && participant.groupId !== groupId) {
      assignParticipantToGroup(participantId, groupId);
    }
    setDragTarget(null);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button onClick={handleAddGroup} className="bg-gradient-to-r from-green-600 to-emerald-500 text-white px-6 py-3 rounded-lg font-bold hover:opacity-90 transition-all shadow-lg shadow-green-500/30 flex items-center gap-2 transform hover:scale-105">
          <PlusIcon className="w-5 h-5" />
          新增組別
        </button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Unassigned */}
        <div 
          className={`col-span-1 lg:col-span-4 p-4 rounded-lg border-2 min-h-[150px] transition-all duration-300 ${dragTarget === 'unassigned' ? 'border-solid ring-2 ring-indigo-400 bg-indigo-50' : 'border-dashed border-slate-300 bg-slate-100/70'}`}
          onDrop={(e) => handleDrop(e, null)}
          onDragOver={handleDragOver}
          onDragEnter={() => setDragTarget('unassigned')}
          onDragLeave={() => setDragTarget(null)}
        >
          <h4 className="font-bold text-slate-700 mb-3 text-center">未分組成員</h4>
          <div className="flex flex-wrap gap-3 justify-center p-2">
            {unassignedParticipants.map(p => (
              <div key={p.id} draggable onDragStart={(e) => handleDragStart(e, p.id)} onDragEnd={handleDragEnd} className="flex items-center gap-2 bg-white p-2 rounded-md shadow-sm cursor-grab border">
                <UserIcon className="w-5 h-5 text-slate-500" />
                <span className="font-semibold">{p.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Groups */}
        {groups.map(group => (
          <div 
            key={group.id} 
            className={`col-span-1 lg:col-span-2 p-4 rounded-xl border-t-4 border-indigo-500 min-h-[200px] transition-all duration-300 ${dragTarget === group.id ? 'ring-2 ring-indigo-400 scale-105 shadow-xl' : 'bg-white shadow-md'}`}
            onDrop={(e) => handleDrop(e, group.id)}
            onDragOver={handleDragOver}
            onDragEnter={() => setDragTarget(group.id)}
            onDragLeave={() => setDragTarget(null)}
          >
            <h4 className="font-bold text-lg text-slate-800 mb-3">{group.name}</h4>
            <div className="space-y-2">
              {participants.filter(p => p.groupId === group.id).map(p => (
                <div key={p.id} draggable onDragStart={(e) => handleDragStart(e, p.id)} onDragEnd={handleDragEnd} className="flex items-center gap-2 bg-slate-50 p-2 rounded-md shadow-sm cursor-grab border">
                  <UserIcon className="w-5 h-5 text-indigo-500" />
                  <span className="font-semibold">{p.name}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default GroupingPanel;
