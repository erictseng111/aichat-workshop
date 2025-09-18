import React, { useState } from 'react';
import type { StickyNoteType, IntentType } from '../types';
import { PlusIcon, TrashIcon } from './icons';

const NOTE_STYLES = [
  { bg: 'bg-yellow-100', border: 'border-yellow-200', text: 'text-yellow-900', rotate: 'transform -rotate-1' },
  { bg: 'bg-green-100', border: 'border-green-200', text: 'text-green-900', rotate: 'transform rotate-1' },
  { bg: 'bg-pink-100', border: 'border-pink-200', text: 'text-pink-900', rotate: 'transform rotate-2' },
  { bg: 'bg-blue-100', border: 'border-blue-200', text: 'text-blue-900', rotate: 'transform -rotate-2' },
  { bg: 'bg-purple-100', border: 'border-purple-200', text: 'text-purple-900', rotate: 'transform rotate-1' },
];

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

interface Stage1PanelProps {
  stickyNotes: StickyNoteType[];
  setStickyNotes: React.Dispatch<React.SetStateAction<StickyNoteType[]>>;
  intents: IntentType[];
  setIntents: React.Dispatch<React.SetStateAction<IntentType[]>>;
}

const Stage1Panel: React.FC<Stage1PanelProps> = ({ stickyNotes, setStickyNotes, intents, setIntents }) => {
  const [activity, setActivity] = useState<1 | 2>(1);
  const [newNoteText, setNewNoteText] = useState('');
  const [newIntentName, setNewIntentName] = useState('');
  
  // State for drag & drop UI feedback
  const [dragTarget, setDragTarget] = useState<string | null>(null);
  const [lastDroppedNoteId, setLastDroppedNoteId] = useState<string | null>(null);

  const addStickyNote = () => {
    if (newNoteText.trim() === '') return;
    const newNote: StickyNoteType = {
      id: `note-${Date.now()}`,
      text: newNoteText,
      intentId: null,
    };
    setStickyNotes(prev => [...prev, newNote]);
    setNewNoteText('');
  };

  const deleteStickyNote = (id: string) => {
    setStickyNotes(prev => prev.filter(note => note.id !== id));
  };
  
  const addIntent = () => {
    if (newIntentName.trim() === '') return;
    const newIntent: IntentType = {
      id: `intent-${Date.now()}`,
      name: newIntentName,
    };
    setIntents(prev => [...prev, newIntent]);
    setNewIntentName('');
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, noteId: string) => {
    e.dataTransfer.setData('noteId', noteId);
    e.currentTarget.style.opacity = '0.5';
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.style.opacity = '1';
    setDragTarget(null); // Clean up drag target on drag end
  };
  
  const handleDropOnIntent = (e: React.DragEvent<HTMLDivElement>, intentId: string) => {
    e.preventDefault();
    const noteId = e.dataTransfer.getData('noteId');
    const currentNote = stickyNotes.find(n => n.id === noteId);

    if (currentNote && currentNote.intentId !== intentId) {
        setStickyNotes(prevNotes => prevNotes.map(note =>
          note.id === noteId ? { ...note, intentId } : note
        ));
        setLastDroppedNoteId(noteId);
        setTimeout(() => setLastDroppedNoteId(null), 500);
    }
    setDragTarget(null);
  };
  
  const handleDropOnBoard = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const noteId = e.dataTransfer.getData('noteId');
    const currentNote = stickyNotes.find(n => n.id === noteId);

    if (currentNote && currentNote.intentId !== null) {
        setStickyNotes(prevNotes => prevNotes.map(note =>
          note.id === noteId ? { ...note, intentId: null } : note
        ));
        setLastDroppedNoteId(noteId);
        setTimeout(() => setLastDroppedNoteId(null), 500);
    }
    setDragTarget(null);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const unclassifiedNotes = stickyNotes.filter(note => note.intentId === null);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-center space-x-2 mb-6 bg-slate-200/80 p-1.5 rounded-full w-fit mx-auto">
        <button onClick={() => setActivity(1)} className={`px-8 py-2 rounded-full font-semibold transition-all ${activity === 1 ? 'bg-white text-indigo-600 shadow-md' : 'bg-transparent text-slate-600'}`}>活動一：情境問題大爆炸</button>
        <button onClick={() => setActivity(2)} className={`px-8 py-2 rounded-full font-semibold transition-all ${activity === 2 ? 'bg-white text-indigo-600 shadow-md' : 'bg-transparent text-slate-600'}`}>活動二：對話意圖與實體分類</button>
      </div>

      {activity === 1 && (
        <ActivityDescription title="活動一：情境問題大爆炸" duration={15} description="鼓勵團隊成員迅速寫下他們在處理重複性問題時所經歷的真實對話情境。">
            <div className="flex gap-4 my-4">
                <input
                    type="text"
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addStickyNote()}
                    placeholder="寫下一個問題與其情境..."
                    className="flex-grow p-3 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition"
                />
                <button onClick={addStickyNote} className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white px-6 py-3 rounded-lg font-bold hover:opacity-90 transition-all shadow-lg shadow-indigo-500/30 flex items-center gap-2 transform hover:scale-105">
                    <PlusIcon className="w-5 h-5" />
                    新增便利貼
                </button>
            </div>
            <div className="mt-6 p-4 bg-slate-100/70 rounded-lg min-h-[300px] border border-slate-200/80">
                <div className="flex flex-wrap gap-4">
                    {stickyNotes.map((note, index) => {
                        const style = NOTE_STYLES[index % NOTE_STYLES.length];
                        return (
                         <div key={note.id} className={`${style.bg} ${style.border} ${style.text} ${style.rotate} p-4 rounded-md shadow-sm relative min-w-[200px] max-w-[250px] border transition-shadow hover:shadow-lg`}>
                            <p className="break-words font-medium">{note.text}</p>
                            <button onClick={() => deleteStickyNote(note.id)} className="absolute top-1 right-1 p-1 text-slate-500 hover:text-red-600 rounded-full hover:bg-red-100 opacity-50 hover:opacity-100 transition">
                                <TrashIcon className="w-4 h-4" />
                            </button>
                        </div>
                    )})}
                </div>
            </div>
        </ActivityDescription>
      )}

      {activity === 2 && (
        <ActivityDescription title="活動二：對話意圖與實體分類" duration={10} description="將所有便利貼內容，初步歸納為「意圖」與「語義槽」。">
          <div className="flex gap-4 my-4">
            <input
              type="text"
              value={newIntentName}
              onChange={(e) => setNewIntentName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addIntent()}
              placeholder="新增意圖分類 (e.g., documentation)..."
              className="flex-grow p-3 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition"
            />
            <button onClick={addIntent} className="bg-gradient-to-r from-green-600 to-emerald-500 text-white px-6 py-3 rounded-lg font-bold hover:opacity-90 transition-all shadow-lg shadow-green-500/30 flex items-center gap-2 transform hover:scale-105">
              <PlusIcon className="w-5 h-5" />
              新增意圖
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
             <div 
                className={`relative col-span-1 md:col-span-2 lg:col-span-3 p-4 rounded-lg border-2 min-h-[150px] transition-all duration-300 ${dragTarget === 'unclassified-board' ? 'border-solid ring-2 ring-indigo-400 bg-indigo-50' : 'border-dashed border-slate-300 bg-slate-100/70'}`}
                onDrop={handleDropOnBoard}
                onDragOver={handleDragOver}
                onDragEnter={() => setDragTarget('unclassified-board')}
                onDragLeave={() => setDragTarget(null)}
             >
                {dragTarget === 'unclassified-board' && (
                  <div className="absolute inset-0 bg-indigo-100/50 flex justify-center items-center rounded-lg pointer-events-none z-10">
                      <p className="text-indigo-600 font-bold text-lg">Drop to Unclassify</p>
                  </div>
                )}
                <h4 className="font-bold text-slate-700 mb-3 text-center">未分類便利貼</h4>
                <div className="flex flex-wrap gap-3 justify-center">
                    {unclassifiedNotes.map((note) => {
                      const style = NOTE_STYLES[stickyNotes.findIndex(sn => sn.id === note.id) % NOTE_STYLES.length];
                      return (
                        <div key={note.id} draggable onDragStart={(e) => handleDragStart(e, note.id)} onDragEnd={handleDragEnd}
                             className={`p-3 rounded-md shadow-sm cursor-grab ${style.bg} ${style.border} ${style.text} ${style.rotate} border ${lastDroppedNoteId === note.id ? 'animate-drop-in' : ''}`}>
                            {note.text}
                        </div>
                      )
                    })}
                </div>
             </div>
            {intents.map((intent) => (
              <div 
                key={intent.id} 
                className={`relative p-4 rounded-xl border-t-4 border-indigo-500 transition-all duration-300 ${dragTarget === intent.id ? 'ring-2 ring-indigo-400 scale-105 shadow-xl' : 'bg-white shadow-md'}`}
                onDrop={(e) => handleDropOnIntent(e, intent.id)}
                onDragOver={handleDragOver}
                onDragEnter={() => setDragTarget(intent.id)}
                onDragLeave={() => setDragTarget(null)}
              >
                {dragTarget === intent.id && (
                  <div className="absolute inset-0 bg-indigo-100/50 flex justify-center items-center rounded-xl pointer-events-none z-10">
                    <p className="text-indigo-600 font-bold text-lg">Assign to "{intent.name}"</p>
                  </div>
                )}
                <h4 className="font-bold text-lg text-slate-800 mb-3">{intent.name}</h4>
                <div className="space-y-2 min-h-[100px]">
                    {stickyNotes.filter(note => note.intentId === intent.id).map((note) => {
                      const style = NOTE_STYLES[stickyNotes.findIndex(sn => sn.id === note.id) % NOTE_STYLES.length];
                      return (
                        <div key={note.id} draggable onDragStart={(e) => handleDragStart(e, note.id)} onDragEnd={handleDragEnd}
                            className={`p-3 rounded-md shadow-sm cursor-grab ${style.bg} ${style.border} ${style.text} ${style.rotate} border ${lastDroppedNoteId === note.id ? 'animate-drop-in' : ''}`}>
                            {note.text}
                        </div>
                      )
                    })}
                </div>
              </div>
            ))}
          </div>
        </ActivityDescription>
      )}
    </div>
  );
};

export default Stage1Panel;
