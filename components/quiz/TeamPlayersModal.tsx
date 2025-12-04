import React, { useState, useEffect, useMemo } from 'react';
import { useTranslations } from '../../hooks/useTranslations';
import { ClassStudent } from '../../data/classStudentData';
import { resolveAvatar, defaultAvatar } from '../../src/avatarAssets';

interface TeamPlayersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDone: (teamName: string, members: string[]) => void;
  studentName: string;
  classRoster: ClassStudent[];
  teams: { [teamName: string]: string[] };
  currentQuizId?: number;
}

const MemberAvatar: React.FC<{ avatar?: string; name: string }> = ({ avatar, name }) => {
  const src = resolveAvatar(avatar || undefined) || defaultAvatar();
  return (
    <img
      src={src}
      alt={name}
      className="w-12 h-12 rounded-full object-cover border-2 border-white/50"
    />
  );
};

const TeamPlayersModal: React.FC<TeamPlayersModalProps> = ({ isOpen, onClose, onDone, studentName, classRoster, teams, currentQuizId }) => {
    const { t } = useTranslations();
    const [selectedTeam, setSelectedTeam] = useState<string>('');
    const [isCreatingNewTeam, setIsCreatingNewTeam] = useState(false);
    const [newTeamName, setNewTeamName] = useState('');
    const [selectedMembers, setSelectedMembers] = useState<string[]>([studentName]);
    const [searchQuery, setSearchQuery] = useState('');
    const [invitationSent, setInvitationSent] = useState<string[]>([]);

    const studentAvatarMap = useMemo(() => {
        const map = new Map<string, string>();
        classRoster.forEach(student => {
            if (student.name && student.avatar) {
                map.set(student.name, student.avatar);
            }
        });
        return map;
    }, [classRoster]);

    useEffect(() => {
        if (isOpen) {
            setSelectedTeam('');
            setIsCreatingNewTeam(false);
            setNewTeamName('');
            setSelectedMembers([studentName]);
            setSearchQuery('');
            setInvitationSent([]);
        }
    }, [isOpen, studentName]);

    if (!isOpen) return null;

    const handleSelectTeam = (teamName: string) => {
        setSelectedTeam(teamName);
        setIsCreatingNewTeam(false);
        setSelectedMembers(teams[teamName] || []);
    };

    const handleInvite = (name: string) => {
        // Here you would typically send an invitation to the student
        // For now, we'll just mark them as invited
        setInvitationSent(prev => [...prev, name]);
    };

    const handleDone = () => {
        if (isCreatingNewTeam && newTeamName.trim() && selectedMembers.length > 0) {
            onDone(newTeamName.trim(), selectedMembers);
        } else if (!isCreatingNewTeam && selectedTeam && teams[selectedTeam]) {
            onDone(selectedTeam, teams[selectedTeam]);
        }
    };
    
    const availableStudents = classRoster.filter(student => 
        student.name !== studentName &&
        student.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div
                className="relative w-[360px] bg-gradient-to-b from-[#1e3a8a] via-[#2c1250] to-[#1a0b2e] rounded-2xl p-6 flex flex-col items-center border border-brand-light-purple/50 text-white"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-3xl font-bold font-orbitron mb-6">Choose Your Team</h2>
                
                <div className="w-full mb-4">
                    <h3 className="font-semibold text-gray-300 mb-2">Existing Teams</h3>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                        {Object.keys(teams).length > 0 ? Object.keys(teams).map(teamName => (
                            <button 
                                key={teamName}
                                onClick={() => handleSelectTeam(teamName)}
                                className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${selectedTeam === teamName && !isCreatingNewTeam ? 'bg-brand-accent' : 'bg-brand-deep-purple/50 hover:bg-brand-deep-purple'}`}
                            >
                                {teamName} ({teams[teamName].length} members)
                            </button>
                        )) : <p className="text-gray-400 text-sm">No teams created yet.</p>}
                    </div>
                </div>

                <div className="w-full mb-6">
                    <button 
                        onClick={() => {
                            setIsCreatingNewTeam(true);
                            setSelectedTeam('');
                            setSelectedMembers([studentName]);
                        }}
                        className={`w-full text-center px-4 py-2 rounded-lg transition-colors ${isCreatingNewTeam ? 'bg-brand-accent' : 'bg-brand-deep-purple/50 hover:bg-brand-deep-purple'}`}
                    >
                        Create New Team
                    </button>
                </div>

                {isCreatingNewTeam && (
                    <div className="w-full space-y-4 animate-fade-in">
                        <div>
                            <label className="font-semibold text-gray-300 mb-2 block text-left">Team Name</label>
                            <input
                                type="text"
                                value={newTeamName}
                                onChange={(e) => setNewTeamName(e.target.value)}
                                placeholder="Enter your new team name"
                                className="w-full bg-brand-deep-purple/50 border border-brand-light-purple/50 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-glow"
                            />
                        </div>
                        <div>
                            <label className="font-semibold text-gray-300 mb-2 block text-left">Invite Members</label>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search for students to invite..."
                                className="w-full bg-brand-deep-purple/50 border border-brand-light-purple/50 rounded-lg px-4 py-3 mb-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-glow"
                            />
                            <div className="max-h-48 overflow-y-auto p-2 bg-brand-deep-purple/30 rounded-lg">
                                {availableStudents.map(student => (
                                    <div key={student.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/10">
                                        <div className="flex items-center">
                                            <MemberAvatar avatar={student.avatar} name={student.name} />
                                            <span className="ml-3 font-semibold">{student.name}</span>
                                        </div>
                                        <button
                                            onClick={() => handleInvite(student.name)}
                                            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${invitationSent.includes(student.name) ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-brand-accent hover:bg-opacity-80 text-white'}`}
                                            disabled={invitationSent.includes(student.name)}
                                        >
                                            {invitationSent.includes(student.name) ? 'Invited' : 'Invite'}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="w-full">
                            <h4 className="font-semibold text-gray-300 mb-2 text-left">Team Members</h4>
                            <div className="flex flex-wrap gap-2 p-2 bg-brand-deep-purple/30 rounded-lg min-h-[60px]">
                                {selectedMembers.map(memberName => (
                                    <div key={memberName} className="flex items-center bg-brand-accent/80 rounded-full px-3 py-1">
                                        <MemberAvatar avatar={studentAvatarMap.get(memberName)} name={memberName} />
                                        <span className="text-sm ml-2">{memberName}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                <div className="w-full flex space-x-4 mt-8">
                    <button onClick={onClose} className="w-full bg-brand-mid-purple/80 border border-brand-light-purple text-white font-semibold py-3 rounded-lg transition-colors hover:bg-brand-light-purple/80">
                        {t('cancel')}
                    </button>
                    <button 
                        onClick={handleDone} 
                        disabled={(!isCreatingNewTeam && !selectedTeam) || (isCreatingNewTeam && (!newTeamName.trim() || selectedMembers.length <= 1))}
                        className="w-full bg-brand-accent text-white font-semibold py-3 rounded-lg transition-all hover:bg-opacity-90 hover:shadow-glow disabled:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                    >
                        {isCreatingNewTeam ? 'Create & Start Quiz' : 'Join Team & Start'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TeamPlayersModal;