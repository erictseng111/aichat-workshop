
import React, { useState } from 'react';
import type { Participant } from '../types';
import { UserIcon } from './icons';

interface LoginScreenProps {
  isFacilitator: boolean;
  participants: Participant[];
  hasJoined: boolean;
  onJoin: (name: string) => void;
  onStart: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ isFacilitator, participants, hasJoined, onJoin, onStart }) => {
  const [name, setName] = useState('');

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onJoin(name.trim());
    }
  };

  const renderParticipantView = () => {
    if (hasJoined) {
      return (
        <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-800">您已成功加入！</h2>
            <p className="text-slate-500 mt-2 animate-pulse">請等待主持人開始工作坊...</p>
        </div>
      );
    }
    return (
      <>
        <h2 className="text-2xl font-bold text-center text-slate-800 mb-6">加入工作坊</h2>
        <form onSubmit={handleJoinSubmit} className="space-y-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="請輸入您的姓名"
            className="w-full text-center text-lg p-3 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition"
            required
          />
          <button type="submit" className="w-full bg-slate-800 text-white text-lg font-bold py-3 px-4 rounded-lg hover:bg-slate-900 transition-all transform hover:scale-105">
            進入
          </button>
        </form>
      </>
    );
  };

  const renderFacilitatorView = () => (
    <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">主持人控制台</h2>
        <button
            onClick={onStart}
            disabled={participants.length === 0}
            className="w-full bg-gradient-to-r from-indigo-600 to-blue-500 text-white text-lg font-bold py-4 px-4 rounded-lg hover:opacity-90 transition-all shadow-lg shadow-indigo-500/30 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
        >
            開始工作坊 ({participants.length})
        </button>
        <div className="mt-6">
            <h3 className="font-bold text-slate-600 mb-3">已加入的參與者:</h3>
            <div className="max-h-60 overflow-y-auto space-y-2 bg-slate-100 p-3 rounded-lg">
                {participants.length === 0 ? (
                    <p className="text-slate-400 py-4">等待參與者加入...</p>
                ) : (
                    participants.map(p => (
                        <div key={p.id} className="flex items-center justify-center gap-2 bg-white p-2 rounded-md shadow-sm">
                            <UserIcon className="w-5 h-5 text-indigo-500" />
                            <span className="font-semibold text-slate-700">{p.name}</span>
                        </div>
                    ))
                )}
            </div>
        </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-[#3f2b68] flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-2xl">
        <div className="text-center mb-8">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">AI Workshop</h1>
            <p className="text-slate-500">Facilitator</p>
        </div>
        {isFacilitator ? renderFacilitatorView() : renderParticipantView()}
      </div>
    </div>
  );
};

export default LoginScreen;