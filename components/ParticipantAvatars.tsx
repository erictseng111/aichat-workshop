
import React from 'react';
import type { Participant } from '../types';

const PALETTE = ['#F94144', '#F3722C', '#F8961E', '#F9C74F', '#90BE6D', '#43AA8B', '#577590', '#4D908E'];

const getInitials = (name: string) => {
    const names = name.trim().split(' ');
    if (names.length > 1) {
        return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
};

const getColor = (id: string) => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return PALETTE[Math.abs(hash) % PALETTE.length];
};

interface ParticipantAvatarsProps {
  participants: Participant[];
}

const ParticipantAvatars: React.FC<ParticipantAvatarsProps> = ({ participants }) => {
  const displayedParticipants = participants.slice(0, 5);
  const hiddenCount = participants.length - displayedParticipants.length;

  return (
    <div className="flex items-center">
        <div className="flex -space-x-3">
            {displayedParticipants.map((p) => (
                <div 
                    key={p.id}
                    title={p.name}
                    className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm border-2 border-white shadow-md"
                    style={{ backgroundColor: getColor(p.id) }}
                >
                    {getInitials(p.name)}
                </div>
            ))}
            {hiddenCount > 0 && (
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-slate-700 bg-slate-200 border-2 border-white shadow-md">
                    +{hiddenCount}
                </div>
            )}
        </div>
        <span className="ml-4 font-semibold text-slate-600">{participants.length} 人參與中</span>
    </div>
  );
};

export default ParticipantAvatars;