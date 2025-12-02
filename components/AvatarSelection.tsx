import React from 'react';

const avatars = [
    'Aqua.png', 'Atom.jpeg', 'Beakie.jpeg', 'Cal.png', 'Cel-L.png', 'Cerebra.jpeg',
    'Chem.jpeg', 'Cosmo.jpeg', 'Dino.jpeg', 'Dr. Glitch.jpeg', 'Eco.jpeg', 'Edison.jpeg',
    'Explorer Girl.jpeg', 'Fungi.png', 'Gas.png', 'Goldie.jpeg', 'Helix.png', 'Kilo.png',
    'Liquid.png', 'Magna.jpeg', 'Micro.png', 'Newton.png', 'Professor Quark.jpeg',
    'Rings.png', 'Rocky.jpeg', 'Solid.png', 'Sparkie.png', 'Squeaky.jpeg', 'Stormy.jpeg',
    'Sunny.png', 'Tech-Whiz Boy.jpeg', 'Terra.jpeg', 'Vinnie.jpeg', 'Volta.jpeg', 'Zoom.png'
];

interface AvatarSelectionProps {
  selectedAvatar: string | null;
  onSelectAvatar: (avatar: string) => void;
}

const AvatarSelection: React.FC<AvatarSelectionProps> = ({ selectedAvatar, onSelectAvatar }) => {
  return (
    <div className="grid grid-cols-4 gap-4">
      {avatars.map(avatar => (
        <button
          key={avatar}
          onClick={() => onSelectAvatar(avatar)}
          className={`rounded-full transition-all duration-200 ${selectedAvatar === avatar ? 'ring-2 ring-brand-glow' : 'ring-2 ring-transparent'}`}
        >
          <img src={`/Image/AVATAR/${avatar}`} alt={avatar} className="w-16 h-16 rounded-full object-cover" />
        </button>
      ))}
    </div>
  );
};

export default AvatarSelection;