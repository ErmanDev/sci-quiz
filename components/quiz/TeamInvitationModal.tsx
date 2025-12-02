import React from 'react';
import { useTranslations } from '../../hooks/useTranslations';

interface TeamInvitationModalProps {
  isOpen: boolean;
  inviterName: string;
  teamName: string;
  onAccept: () => void;
  onDecline: () => void;
}

const TeamInvitationModal: React.FC<TeamInvitationModalProps> = ({
  isOpen,
  inviterName,
  teamName,
  onAccept,
  onDecline,
}) => {
  const { t } = useTranslations();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="relative w-full max-w-sm bg-gradient-to-b from-[#1e3a8a] via-[#2c1250] to-[#1a0b2e] rounded-2xl p-6 flex flex-col items-center border border-brand-light-purple/50 text-white">
        <h2 className="text-2xl font-bold font-orbitron mb-4 text-center">Team Invitation</h2>
        <p className="text-center text-gray-300 mb-6">
          <span className="font-bold text-white">{inviterName}</span> has invited you to join the team: <span className="font-bold text-white">{teamName}</span>.
        </p>
        <div className="w-full flex space-x-4">
          <button
            onClick={onDecline}
            className="w-full bg-red-600/80 border border-red-500 text-white font-semibold py-3 rounded-lg transition-colors hover:bg-red-500"
          >
            {t('decline')}
          </button>
          <button
            onClick={onAccept}
            className="w-full bg-green-600/80 border border-green-500 text-white font-semibold py-3 rounded-lg transition-colors hover:bg-green-500"
          >
            {t('accept')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeamInvitationModal;