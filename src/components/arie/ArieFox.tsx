'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

type ArieState = 'sleeping' | 'idle' | 'thinking' | 'talking' | 'happy';

interface ArieFoxProps {
  state?: ArieState;
  size?: number;
  className?: string;
  autoAnimate?: boolean;
}

export const ArieFox = ({ 
  state = 'idle', 
  size = 200,
  className = '',
  autoAnimate = true,
}: ArieFoxProps) => {
  const [currentState, setCurrentState] = useState<ArieState>(state);
  const [blinkTrigger, setBlinkTrigger] = useState(0);

  // Auto blink every 3-5 seconds when not sleeping
  useEffect(() => {
    if (!autoAnimate || currentState === 'sleeping') return;
    
    const interval = setInterval(() => {
      setBlinkTrigger(prev => prev + 1);
    }, 3000 + Math.random() * 2000);
    
    return () => clearInterval(interval);
  }, [autoAnimate, currentState]);

  // Sync with prop changes
  useEffect(() => {
    setCurrentState(state);
  }, [state]);

  const eyeVariants = {
    open: { scaleY: 1 },
    blink: { 
      scaleY: [1, 0.1, 1],
      transition: { duration: 0.15, times: [0, 0.5, 1] }
    },
    sleeping: { scaleY: 0.1 },
    happy: { scaleY: 0.6, borderRadius: '50% 50% 50% 50%' },
  };

  const earVariants = {
    idle: { rotate: 0 },
    listening: { 
      rotate: [0, 5, -5, 0],
      transition: { duration: 0.5, repeat: Infinity, repeatDelay: 2 }
    },
    thinking: {
      rotate: [-5, 5],
      transition: { duration: 0.8, repeat: Infinity, repeatType: 'reverse' as const }
    },
  };

  const tailVariants = {
    idle: {
      rotate: [0, 5, -5, 0],
      transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
    },
    happy: {
      rotate: [-15, 15],
      transition: { duration: 0.3, repeat: Infinity, repeatType: 'reverse' as const }
    },
    sleeping: {
      rotate: 0,
    },
  };

  const bodyVariants = {
    idle: {
      y: [0, -2, 0],
      transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' }
    },
    sleeping: {
      y: [0, 2, 0],
      transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' }
    },
    thinking: {
      y: [0, -3, 0],
      transition: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' }
    },
    talking: {
      y: [0, -1, 0],
      transition: { duration: 0.3, repeat: Infinity }
    },
    happy: {
      y: [0, -5, 0],
      transition: { duration: 0.5, repeat: Infinity, ease: 'easeOut' }
    },
  };

  const getEyeState = () => {
    if (currentState === 'sleeping') return 'sleeping';
    if (currentState === 'happy') return 'happy';
    return 'open';
  };

  const getTailState = () => {
    if (currentState === 'happy') return 'happy';
    if (currentState === 'sleeping') return 'sleeping';
    return 'idle';
  };

  const getEarState = () => {
    if (currentState === 'thinking') return 'thinking';
    if (currentState === 'sleeping') return 'idle';
    return 'listening';
  };

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      className={className}
      initial={false}
      animate={currentState}
      variants={bodyVariants}
    >
      {/* Background circle */}
      <circle cx="100" cy="100" r="95" fill="#FFF8F0" />
      
      {/* Tail */}
      <motion.g
        style={{ originX: '70px', originY: '150px' }}
        variants={tailVariants}
        animate={getTailState()}
      >
        <ellipse
          cx="55"
          cy="145"
          rx="25"
          ry="15"
          fill="#F97316"
          transform="rotate(-30, 55, 145)"
        />
        <ellipse
          cx="38"
          cy="138"
          rx="12"
          ry="8"
          fill="#FFF8F0"
          transform="rotate(-30, 38, 138)"
        />
      </motion.g>

      {/* Body */}
      <ellipse cx="100" cy="145" rx="45" ry="35" fill="#F97316" />
      
      {/* Chest fur */}
      <ellipse cx="100" cy="150" rx="25" ry="20" fill="#FFF8F0" />

      {/* Head */}
      <circle cx="100" cy="85" r="45" fill="#F97316" />
      
      {/* Inner face (lighter) */}
      <ellipse cx="100" cy="95" rx="32" ry="28" fill="#FFEDD5" />

      {/* Left ear */}
      <motion.g
        style={{ originX: '70px', originY: '55px' }}
        variants={earVariants}
        animate={getEarState()}
      >
        <polygon
          points="60,55 70,15 85,50"
          fill="#F97316"
        />
        <polygon
          points="65,50 72,25 80,48"
          fill="#FFEDD5"
        />
      </motion.g>

      {/* Right ear */}
      <motion.g
        style={{ originX: '130px', originY: '55px' }}
        variants={earVariants}
        animate={getEarState()}
      >
        <polygon
          points="140,55 130,15 115,50"
          fill="#F97316"
        />
        <polygon
          points="135,50 128,25 120,48"
          fill="#FFEDD5"
        />
      </motion.g>

      {/* Left eye */}
      <motion.ellipse
        cx="80"
        cy="80"
        rx="8"
        ry="10"
        fill="#1E293B"
        variants={eyeVariants}
        animate={getEyeState()}
        key={`left-eye-${blinkTrigger}`}
        initial="open"
        style={{ originY: '80px' }}
      />
      
      {/* Left eye shine */}
      {currentState !== 'sleeping' && (
        <circle cx="83" cy="77" r="3" fill="white" />
      )}

      {/* Right eye */}
      <motion.ellipse
        cx="120"
        cy="80"
        rx="8"
        ry="10"
        fill="#1E293B"
        variants={eyeVariants}
        animate={getEyeState()}
        key={`right-eye-${blinkTrigger}`}
        initial="open"
        style={{ originY: '80px' }}
      />
      
      {/* Right eye shine */}
      {currentState !== 'sleeping' && (
        <circle cx="123" cy="77" r="3" fill="white" />
      )}

      {/* Nose */}
      <ellipse cx="100" cy="98" rx="6" ry="5" fill="#1E293B" />
      
      {/* Nose shine */}
      <ellipse cx="102" cy="96" rx="2" ry="1.5" fill="#475569" />

      {/* Mouth */}
      <AnimatePresence mode="wait">
        {currentState === 'talking' ? (
          <motion.ellipse
            key="mouth-open"
            cx="100"
            cy="110"
            rx="8"
            ry="6"
            fill="#1E293B"
            initial={{ ry: 2 }}
            animate={{ ry: [4, 8, 4] }}
            transition={{ duration: 0.2, repeat: Infinity }}
          />
        ) : currentState === 'happy' ? (
          <motion.path
            key="mouth-happy"
            d="M 88 105 Q 100 120 112 105"
            stroke="#1E293B"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
          />
        ) : currentState === 'sleeping' ? (
          <motion.g key="mouth-sleeping">
            <path
              d="M 92 108 Q 100 112 108 108"
              stroke="#1E293B"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />
            {/* Zzz */}
            <motion.text
              x="135"
              y="65"
              fontSize="14"
              fill="#94A3B8"
              fontWeight="bold"
              animate={{ 
                y: [65, 55, 65],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              z
            </motion.text>
            <motion.text
              x="145"
              y="50"
              fontSize="12"
              fill="#94A3B8"
              fontWeight="bold"
              animate={{ 
                y: [50, 40, 50],
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
            >
              z
            </motion.text>
          </motion.g>
        ) : (
          <motion.path
            key="mouth-neutral"
            d="M 95 108 L 100 110 L 105 108"
            stroke="#1E293B"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
        )}
      </AnimatePresence>

      {/* Thinking bubble */}
      {currentState === 'thinking' && (
        <motion.g
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
        >
          <circle cx="150" cy="45" r="4" fill="#94A3B8" />
          <circle cx="160" cy="35" r="6" fill="#94A3B8" />
          <circle cx="175" cy="25" r="12" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="2" />
          <motion.text
            x="175"
            y="30"
            fontSize="12"
            fill="#64748B"
            textAnchor="middle"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            ?
          </motion.text>
        </motion.g>
      )}

      {/* Blush (when happy) */}
      {currentState === 'happy' && (
        <>
          <motion.ellipse
            cx="65"
            cy="95"
            rx="8"
            ry="5"
            fill="#FCA5A5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
          />
          <motion.ellipse
            cx="135"
            cy="95"
            rx="8"
            ry="5"
            fill="#FCA5A5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
          />
        </>
      )}

      {/* Whiskers */}
      <g stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round">
        <line x1="55" y1="90" x2="75" y2="95" />
        <line x1="55" y1="100" x2="75" y2="100" />
        <line x1="145" y1="90" x2="125" y2="95" />
        <line x1="145" y1="100" x2="125" y2="100" />
      </g>
    </motion.svg>
  );
};

export default ArieFox;
