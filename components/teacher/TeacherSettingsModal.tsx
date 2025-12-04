import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    DarkModeIcon, LanguageIcon, NotificationIcon,
    HelpIcon, AboutUsIcon, PrivacyIcon, LogoutIcon,
    MusicIcon, UploadIcon, TrashIcon,
} from '../icons';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTranslations } from '../../hooks/useTranslations';
import { DashboardView, View } from '../../data/quizzes';
import { usePersistentState } from '../../hooks/usePersistentState';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  setView: (view: DashboardView) => void;
  setAppView: (view: View) => void;
}

// Use public paths so background music also works in production.
// Ensure these files exist under public/Image/BG MUSIC/ in your project.
const defaultMusic = [
    { name: 'Science Quiz 1', type: 'default' as const, url: '/Image/BG MUSIC/SQ1.mp3' },
    { name: 'SQ2.mp3', type: 'default' as const, url: '/Image/BG MUSIC/SQ2.mp3' },
    { name: 'SQ3.mp3', type: 'default' as const, url: '/Image/BG MUSIC/SQ3.mp3' },
];

type Music = { name: string; type: 'default' | 'uploaded'; url: string };

const ToggleSwitch: React.FC<{ checked: boolean, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }> = ({ checked, onChange }) => (
    <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" checked={checked} onChange={onChange} className="sr-only peer" />
        <div className="w-11 h-6 bg-gray-300 dark:bg-brand-deep-purple rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-accent"></div>
    </label>
);

const SettingsItem: React.FC<{ icon: React.ReactNode, label: React.ReactNode, children: React.ReactNode }> = ({ icon, label, children }) => (
    <div className="flex items-center justify-between py-2.5">
        <div className="flex items-center space-x-3">
            {icon}
            <span className="font-semibold text-gray-800 dark:text-white">{label}</span>
        </div>
        <div>{children}</div>
    </div>
);

const LinkItem: React.FC<{ icon: React.ReactNode, label: string, onClick?: () => void }> = ({ icon, label, onClick }) => (
     <button onClick={onClick} className="flex items-center justify-between w-full py-2.5 group">
        <div className="flex items-center space-x-3">
            {icon}
            <span className="font-semibold text-gray-800 dark:text-white group-hover:underline">{label}</span>
        </div>
    </button>
);


const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, isDarkMode, onToggleDarkMode, setView, setAppView }) => {
    const [isNotificationOn, setNotification] = usePersistentState('notificationOn', false);
    const [isMusicOn, setMusic] = usePersistentState('musicOn', true);
    const [volume, setVolume] = usePersistentState('musicVolume', 50);
    const [currentTrackIndex, setCurrentTrackIndex] = usePersistentState('currentTrackIndex', 0);
    
    const [musicList, setMusicList] = useState<Music[]>(() => {
        try {
            const storedValue = window.localStorage.getItem('musicList');
            if (storedValue) {
                const storedList: Music[] = JSON.parse(storedValue);
                const refreshedList: Music[] = defaultMusic.map(dm => {
                    const fromStore = storedList.find(s => s.type === 'default' && s.name === dm.name);
                    return { ...(fromStore || dm), url: dm.url };
                });

                const uploaded = storedList.filter(s => s.type === 'uploaded');
                
                return [...refreshedList, ...uploaded];
            }
        } catch (e) {
            console.error("Failed to load music list from storage", e);
        }
        return defaultMusic;
    });

    useEffect(() => {
        try {
            window.localStorage.setItem('musicList', JSON.stringify(musicList));
        } catch (e) {
            console.error("Failed to save music list to storage", e);
        }
    }, [musicList]);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const volumeAnimationRef = useRef<number>();

    const handleTrackEnded = useCallback(() => {
        if (musicList.length > 0) {
            setCurrentTrackIndex(prevIndex => (prevIndex + 1) % musicList.length);
        }
    }, [musicList.length, setCurrentTrackIndex]);

    useEffect(() => {
        if (!audioRef.current) {
            let audio = document.getElementById('background-audio-player') as HTMLAudioElement;
            if (!audio) {
                audio = document.createElement('audio');
                audio.id = 'background-audio-player';
                document.body.appendChild(audio);
            }
            audioRef.current = audio;
        }
        const audio = audioRef.current;
        audio.onended = handleTrackEnded;

        return () => {
            if (audio) {
                audio.onended = null;
            }
        };
    }, [handleTrackEnded]);

    useEffect(() => {
        const audio = audioRef.current;
        if (audio) {
            if (volumeAnimationRef.current) {
                cancelAnimationFrame(volumeAnimationRef.current);
            }

            const targetVolume = volume / 100;
            const startVolume = audio.volume;
            const difference = targetVolume - startVolume;
            const duration = 100; // ms for a smooth but responsive transition
            let startTime: number | null = null;

            const animateVolume = (timestamp: number) => {
                if (!startTime) startTime = timestamp;
                const progress = timestamp - startTime;
                const fraction = Math.min(progress / duration, 1);
                audio.volume = startVolume + difference * fraction;

                if (progress < duration) {
                    volumeAnimationRef.current = requestAnimationFrame(animateVolume);
                }
            };

            volumeAnimationRef.current = requestAnimationFrame(animateVolume);
        }
    }, [volume]);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        if (musicList.length === 0) {
            if (!audio.paused) audio.pause();
            audio.src = '';
            return;
        }

        const safeIndex = currentTrackIndex >= musicList.length ? 0 : currentTrackIndex;
        if (safeIndex !== currentTrackIndex) {
            setCurrentTrackIndex(safeIndex);
            return; 
        }

        const currentTrack = musicList[safeIndex];
        audio.loop = false;

        if (isMusicOn && currentTrack) {
            if (audio.src !== currentTrack.url) {
                audio.src = currentTrack.url;
            }
            audio.play().catch(error => console.error("Audio play failed:", error));
        } else {
            audio.pause();
        }
    }, [isMusicOn, currentTrackIndex, musicList, setCurrentTrackIndex]);

    const { language, setLanguage } = useLanguage();
    const { t } = useTranslations();

    const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setLanguage(e.target.value as 'en' | 'fil');
    };

    const handleHelpClick = () => {
        onClose();
        setAppView('help');
    };
    
    const handleAboutUsClick = () => {
        onClose();
        setAppView('aboutUs');
    };

    const handlePrivacyPolicyClick = () => {
        onClose();
        setAppView('privacyPolicy');
    };

    const handleLogout = () => {
        onClose();
        setAppView('main');
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const url = e.target?.result as string;
                if (url) {
                    setMusicList(prevList => [...prevList, { name: file.name, type: 'uploaded', url }]);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDeleteMusic = (indexToDelete: number) => {
        const newList = musicList.filter((_, index) => index !== indexToDelete);

        if (indexToDelete < currentTrackIndex) {
            setCurrentTrackIndex(i => i - 1);
        } else if (indexToDelete === currentTrackIndex && currentTrackIndex >= newList.length) {
            setCurrentTrackIndex(0);
        }
        
        setMusicList(newList);
    };

    const handleTrackSelect = (index: number) => {
        setCurrentTrackIndex(index);
    };

    if (!isOpen) {
        return null;
    }
  
    return (
        <>
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-20 p-4" onClick={onClose}>
                <div 
                    className="w-full max-w-sm rounded-2xl p-[2px] bg-gradient-to-b from-blue-500 to-brand-accent shadow-glow"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="relative bg-gray-50 dark:bg-[#21103F] rounded-[14px] p-6 flex flex-col text-gray-800 dark:text-white">
                        <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-gray-800 dark:text-white/70 dark:hover:text-white transition-colors" aria-label="Close">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        <h2 className="text-2xl font-bold font-orbitron mb-4">{t('settings')}</h2>
                        
                        <div className="divide-y divide-gray-200 dark:divide-brand-light-purple/30">
                            <div className="py-2.5">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <MusicIcon />
                                        <span className="font-semibold text-gray-800 dark:text-white">{t('music')}</span>
                                    </div>
                                    <ToggleSwitch checked={isMusicOn} onChange={() => setMusic(!isMusicOn)} />
                                </div>
                                {isMusicOn && (
                                    <div className="mt-4 space-y-4">
                                        <div className="flex items-center space-x-3">
                                            <label htmlFor="volume-slider" className="font-semibold text-sm text-gray-800 dark:text-white w-16">{t('volume')}</label>
                                            <div className="w-full">
                                                <input
                                                    id="volume-slider"
                                                    type="range"
                                                    min="0"
                                                    max="100"
                                                    value={volume}
                                                    onChange={(e) => setVolume(Number(e.target.value))}
                                                    className="w-full h-1 bg-gray-300 dark:bg-brand-deep-purple rounded-lg appearance-none cursor-pointer"
                                                    style={{
                                                        background: `linear-gradient(to right, #A78BFA ${volume}%, #4B2A85 ${volume}%)`,
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <h3 className="font-semibold text-sm text-gray-800 dark:text-white">{t('playlist')}</h3>
                                            <ul className="max-h-32 overflow-y-auto bg-gray-100 dark:bg-brand-deep-purple/50 rounded-md p-2 space-y-1 border border-gray-200 dark:border-brand-light-purple/30">
                                                {musicList.map((music, index) => (
                                                    <li key={music.name + index}
                                                        className={`flex items-center justify-between p-2 text-sm cursor-pointer rounded-md ${index === currentTrackIndex ? 'bg-brand-accent/30 text-brand-accent font-bold' : 'text-gray-700 dark:text-gray-200'} hover:bg-brand-accent/20`}
                                                        onClick={() => handleTrackSelect(index)}
                                                    >
                                                        <span className="truncate" title={music.name}>{music.name}</span>
                                                        {music.type === 'uploaded' && (
                                                            <button onClick={(e) => {e.stopPropagation(); handleDeleteMusic(index)}} className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-500/10">
                                                                <TrashIcon />
                                                            </button>
                                                        )}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div>
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                onChange={handleFileChange}
                                                className="hidden"
                                                accept="audio/*"
                                            />
                                            <button
                                                onClick={handleUploadClick}
                                                className="w-full flex items-center justify-center space-x-2 bg-transparent border border-gray-300 dark:border-brand-light-purple/80 text-gray-800 dark:text-white font-semibold py-2 px-4 rounded-lg
                                                             transition-all duration-300 ease-in-out
                                                             hover:bg-gray-100 dark:hover:bg-brand-light-purple/20 hover:shadow-glow
                                                             focus:outline-none focus:ring-2 focus:ring-brand-glow focus:ring-opacity-75"
                                            >
                                                <UploadIcon />
                                                <span>{t('uploadMusic')}</span>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <SettingsItem icon={<DarkModeIcon />} label={t('darkMode')}>
                                <ToggleSwitch checked={isDarkMode} onChange={onToggleDarkMode} />
                            </SettingsItem>
                            <SettingsItem icon={<LanguageIcon />} label={t('language')}>
                                <select 
                                    value={language}
                                    onChange={handleLanguageChange}
                                    className="bg-gray-100 dark:bg-brand-deep-purple border border-gray-300 dark:border-brand-light-purple/50 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-brand-glow"
                                >
                                    <option value="en">{t('english')}</option>
                                    <option value="fil">{t('filipino')}</option>
                                </select>
                            </SettingsItem>
                            <SettingsItem icon={<NotificationIcon />} label={t('notificationToggle')}>
                                <ToggleSwitch checked={isNotificationOn} onChange={() => setNotification(!isNotificationOn)} />
                            </SettingsItem>
                            <LinkItem icon={<HelpIcon />} label={t('help')} onClick={handleHelpClick} />
                            <LinkItem icon={<AboutUsIcon />} label={t('aboutUs')} onClick={handleAboutUsClick} />
                            <LinkItem icon={<PrivacyIcon />} label={t('privacyPolicy')} onClick={handlePrivacyPolicyClick} />
                        </div>

                        <button 
                            onClick={handleLogout}
                            className="w-full bg-transparent border border-gray-300 dark:border-brand-light-purple/80 text-gray-800 dark:text-white font-semibold py-3 px-4 rounded-lg
                                         flex items-center justify-center mt-6
                                         transition-all duration-300 ease-in-out
                                         hover:bg-gray-100 dark:hover:bg-brand-light-purple/20 hover:shadow-glow
                                         focus:outline-none focus:ring-2 focus:ring-brand-glow focus:ring-opacity-75">
                            <LogoutIcon />
                            {t('logout')}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default SettingsModal;