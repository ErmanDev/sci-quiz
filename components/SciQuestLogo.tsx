import React, { useState, useEffect } from 'react';
import logo from '../Image/LOGO.png';
import starsImage from '../Image/Screenshot_2025-11-23_152046-removebg-preview.png';

const styles = `
  @keyframes pulsing-glow {
    0%, 100% {
      filter: drop-shadow(0 0 10px rgba(0, 255, 255, 0.9)) drop-shadow(0 0 5px rgba(220, 220, 255, 1));
    }
    50% {
      filter: drop-shadow(0 0 45px rgba(0, 255, 255, 1)) drop-shadow(0 0 25px rgba(220, 220, 255, 1));
    }
  }

  @keyframes boil {
    0% {
      transform: translateY(0) scale(1);
      opacity: 0.8;
    }
    90% {
      opacity: 0.8;
    }
    100% {
      transform: translateY(-60px) scale(0.3);
      opacity: 0;
    }
  }

  @keyframes rotate-galaxy {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes twinkle {
    0%, 100% {
      opacity: 0.3;
      transform: scale(0.5);
      filter: drop-shadow(0 0 1px rgba(192, 132, 252, 0.5));
    }
    50% {
      opacity: 1;
      transform: scale(1);
      filter: drop-shadow(0 0 4px rgba(192, 132, 252, 1));
    }
  }
`;

interface SciQuestLogoProps {
  onAdminClick?: () => void;
}

const SciQuestLogo: React.FC<SciQuestLogoProps> = ({ onAdminClick }) => {
  const [clickCount, setClickCount] = useState(0);

  useEffect(() => {
    if (clickCount >= 5) {
      onAdminClick?.();
      setClickCount(0); 
    }
  }, [clickCount, onAdminClick]);

  const handleClick = () => {
    setClickCount(prev => prev + 1);
  };

  return (
    <>
      <style>{styles}</style>
      <div className="relative flex justify-center items-center" onClick={handleClick} style={{ cursor: 'pointer' }}>
        <img
          src={logo}
          alt="SciQuest Logo"
          className="h-24 w-24"
          style={{
            animation: 'pulsing-glow 3s ease-in-out infinite',
          }}
        />
        {/* Boiling Bubbles */}
        <div className="absolute w-3 h-3 bg-cyan-200/80 rounded-full" style={{ top: '25%', left: '48%', animation: 'boil 2.5s linear infinite', animationDelay: '0s' }} />
        <div className="absolute w-2 h-2 bg-cyan-200/80 rounded-full" style={{ top: '30%', left: '42%', animation: 'boil 3s linear infinite', animationDelay: '0.5s' }} />
        <div className="absolute w-1.5 h-1.5 bg-cyan-200/80 rounded-full" style={{ top: '28%', left: '55%', animation: 'boil 2s linear infinite', animationDelay: '1s' }} />
        <div className="absolute w-3 h-3 bg-cyan-200/80 rounded-full" style={{ top: '32%', left: '52%', animation: 'boil 3.5s linear infinite', animationDelay: '1.5s' }} />
        <div className="absolute w-1.5 h-1.5 bg-cyan-200/80 rounded-full" style={{ top: '20%', left: '45%', animation: 'boil 2.8s linear infinite', animationDelay: '0.2s' }} />

        {/* Galaxy Effect */}
        <div className="absolute" style={{ top: '50%', left: '30%', animation: 'rotate-galaxy 20s linear infinite' }}>
          <img
            src={starsImage}
            alt="Galaxy Stars"
            className="w-10 h-10 -translate-x-1/2 -translate-y-1/2"
            style={{ animation: 'twinkle 4s ease-in-out infinite' }}
          />
        </div>
      </div>
    </>
  );
};

export default SciQuestLogo;