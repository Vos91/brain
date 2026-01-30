'use client';

import { useState } from 'react';
import { ArieFox } from './ArieFox';

type ArieState = 'sleeping' | 'idle' | 'thinking' | 'talking' | 'happy';

export const ArieDemo = () => {
  const [state, setState] = useState<ArieState>('idle');

  const states: ArieState[] = ['sleeping', 'idle', 'thinking', 'talking', 'happy'];

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center gap-8 p-8">
      <h1 className="text-3xl font-bold text-white">Arie de Beuker 🦊</h1>
      
      <div className="bg-slate-800 rounded-3xl p-8 shadow-2xl">
        <ArieFox state={state} size={300} />
      </div>

      <div className="flex gap-3 flex-wrap justify-center">
        {states.map((s) => (
          <button
            key={s}
            onClick={() => setState(s)}
            className={`px-6 py-3 rounded-full font-medium transition-all ${
              state === s
                ? 'bg-orange-500 text-white scale-105'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            {s === 'sleeping' && '😴'}
            {s === 'idle' && '👀'}
            {s === 'thinking' && '🤔'}
            {s === 'talking' && '💬'}
            {s === 'happy' && '😊'}
            {' '}
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      <p className="text-slate-400 text-sm max-w-md text-center">
        Klik op een state om Arie&apos;s mood te veranderen. 
        Hij knippert automatisch met zijn ogen!
      </p>
    </div>
  );
};

export default ArieDemo;
