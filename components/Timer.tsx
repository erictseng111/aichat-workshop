import React, { useState, useEffect } from 'react';

interface TimerProps {
  durationInMinutes: number;
  title: string;
  onComplete?: () => void;
}

const Timer: React.FC<TimerProps> = ({ durationInMinutes, title, onComplete }) => {
  const [timeLeft, setTimeLeft] = useState(durationInMinutes * 60);

  useEffect(() => {
    if (timeLeft <= 0) {
      if (onComplete) {
        onComplete();
      }
      return;
    }

    const intervalId = setInterval(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [timeLeft, onComplete]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const timeColor = timeLeft < 60 ? 'text-red-500' : 'text-slate-700';

  return (
    <div className="text-center">
      <h3 className="text-sm font-semibold text-slate-500 tracking-wider uppercase">{title}</h3>
      <div className={`text-4xl font-mono font-bold ${timeColor} mt-1`}>
        <span>{minutes.toString().padStart(2, '0')}</span>:
        <span>{seconds.toString().padStart(2, '0')}</span>
      </div>
    </div>
  );
};

export default Timer;