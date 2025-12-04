import React, { useState, useRef } from 'react';
import CropAvatarModal from './CropAvatarModal';
import { useTranslations } from '../../hooks/useTranslations';
import { ProfileData } from '../StudentDashboard';
import AvatarSelection from '../AvatarSelection';
import { resolveAvatar } from '../../src/avatarAssets';

interface EditProfileModalProps {
  onClose: () => void;
  onSave: (newProfile: Partial<ProfileData>) => void;
  profile: ProfileData;
}

const CustomAvatarUpload: React.FC<{ src: string | null, isSelected?: boolean, onClick: () => void }> = ({ src, isSelected, onClick }) => (
    <button onClick={onClick} className={`relative w-16 h-16 rounded-full flex items-center justify-center bg-black/30 border-2 overflow-hidden transition-all duration-200 ${isSelected ? 'border-brand-glow bg-brand-light-purple/50' : 'border-brand-light-purple/50'}`}>\n        {src ? (
            <img src={src} alt="Custom avatar" className="w-full h-full object-cover" />
        ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
        )}
        <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-brand-accent rounded-full flex items-center justify-center border-2 border-[#21103F]">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v12" />
            </svg>
        </div>
    </button>
);


const EditProfileModal: React.FC<EditProfileModalProps> = ({ onClose, onSave, profile }) => {
    const [name, setName] = useState(profile.name);
    const [bio, setBio] = useState(profile.bio);
    const { t } = useTranslations();

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [imageToCrop, setImageToCrop] = useState<string | null>(null);

    const getAvatarFilename = (path: string | null | undefined): string | null => {
        if (!path) return null;
        // If it's a full URL or data URI, treat as custom avatar
        if (/^https?:\/\//i.test(path) || path.startsWith('data:')) return null;
        const parts = path.split('/');
        const filename = parts[parts.length - 1];
        // A simple check to see if it's likely one of our preset avatars
        return filename.includes('.') ? filename : null; 
    };

    const initialAvatarFile = getAvatarFilename(profile.avatar);
    const isCustomAvatarInitially = profile.avatar && !initialAvatarFile;

    const [selectedAvatar, setSelectedAvatar] = useState<string | null>(initialAvatarFile || 'initials');
    const [customAvatar, setCustomAvatar] = useState<string | null>(isCustomAvatarInitially ? profile.avatar : null);

    const handleCustomAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const result = e.target?.result;
                if (typeof result === 'string') {
                    setImageToCrop(result);
                }
            };
            reader.readAsDataURL(file);
        }
        event.target.value = ''; // Reset input
    };

    const handleCrop = (croppedImage: string) => {
        setCustomAvatar(croppedImage);
        setSelectedAvatar('custom');
        setImageToCrop(null);
    };

    const handleSelectAvatar = (avatar: string) => {
        setSelectedAvatar(avatar);
        setCustomAvatar(null);
    };

    const handleSave = () => {
        let finalAvatar: string | null = null;
        if (selectedAvatar === 'custom') {
            finalAvatar = customAvatar;
        } else if (selectedAvatar && selectedAvatar !== 'initials') {
            // Store the filename, but at render-time we resolve it to a bundled URL.
            const src = resolveAvatar(selectedAvatar);
            finalAvatar = src || selectedAvatar;
        }
        onSave({ name, bio, avatar: finalAvatar });
    };

    return (
        <>
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-20 p-4" onClick={onClose}>
                <div 
                    className="w-[360px] rounded-2xl p-[3px] bg-gradient-to-b from-blue-500 to-brand-accent shadow-glow"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="relative bg-[#21103F] rounded-[14px] p-6 flex flex-col items-center text-white">
                        <button onClick={onClose} className="absolute top-2 right-2 text-white/70 hover:text-white transition-colors" aria-label="Close">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        <h2 className="text-2xl font-bold font-orbitron mb-6">{t('editProfile')}</h2>
                        
                        <div className="w-full mb-6">
                            <p className="text-sm font-semibold text-left mb-3 text-gray-300">{t('chooseAvatar')}</p>
                            <div className="flex justify-between items-center px-2 mb-4">
                                <div className="flex items-center space-x-3">
                                    <button 
                                        onClick={() => setSelectedAvatar('initials')}
                                        className={`w-16 h-16 flex items-center justify-center font-bold text-2xl bg-brand-accent rounded-full transition-all duration-200 ${selectedAvatar === 'initials' ? 'ring-2 ring-brand-glow' : 'ring-2 ring-transparent'}`}
                                    >
                                        {name.substring(0, 2).toUpperCase()}
                                    </button>
                                </div>
                                <CustomAvatarUpload 
                                    src={customAvatar}
                                    isSelected={selectedAvatar === 'custom'}
                                    onClick={handleCustomAvatarClick}
                                />
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    className="hidden"
                                    accept="image/*"
                                    aria-label="Upload custom avatar"
                                />
                            </div>
                            <div className="max-h-60 overflow-y-auto p-2 bg-black/20 rounded-lg scrollbar-none [&::-webkit-scrollbar]:hidden">
                                <AvatarSelection 
                                    selectedAvatar={selectedAvatar}
                                    onSelectAvatar={handleSelectAvatar}
                                />
                            </div>
                        </div>

                        <div className="w-full space-y-4 text-left">
                            <div>
                                <label className="text-sm font-semibold text-gray-300 mb-1 block">{t('name')}</label>
                                <input value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-[#130825] border border-brand-light-purple/50 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-glow focus:border-transparent transition-all duration-300" />
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-gray-300 mb-1 block">{t('bio')}</label>
                                <input value={bio} onChange={(e) => setBio(e.target.value)} className="w-full bg-[#130825] border border-brand-light-purple/50 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-glow focus:border-transparent transition-all duration-300" />
                            </div>
                        </div>

                        <div className="w-full flex space-x-4 mt-8">
                            <button 
                                onClick={onClose}
                                className="w-full bg-[#3D2569] text-white font-semibold py-3 rounded-lg transition-colors hover:bg-brand-light-purple"
                            >
                                {t('cancel')}
                            </button>
                            <button 
                                onClick={handleSave}
                                className="w-full bg-brand-accent text-white font-semibold py-3 rounded-lg transition-all duration-300 hover:bg-opacity-90 hover:shadow-glow"
                            >
                                {t('save')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            {imageToCrop && (
                <CropAvatarModal 
                    imageSrc={imageToCrop} 
                    onClose={() => setImageToCrop(null)} 
                    onCrop={handleCrop}
                />
            )}
        </>
    );
};

export default EditProfileModal;