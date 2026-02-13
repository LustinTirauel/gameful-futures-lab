import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { people } from '../data/content';

type Mode = 'home' | 'people' | 'projects';

type CharacterLayerProps = {
  mode: Mode;
  reactionId: string | null;
  isRunning: boolean;
  onReact: (personId: string) => void;
  onSelectPerson: (personId: string) => void;
};

export default function CharacterLayer({
  mode,
  reactionId,
  isRunning,
  onReact,
  onSelectPerson,
}: CharacterLayerProps) {
  const sortedPeople = useMemo(() => [...people].sort((a, b) => a.name.localeCompare(b.name)), []);
  const activePeople = mode === 'people' ? sortedPeople : people;

  /** Handles click behavior for each character based on the active mode. */
  function handleCharacterClick(personId: string) {
    if (mode === 'home') {
      onReact(personId);
    } else if (mode === 'people') {
      onSelectPerson(personId);
    }
  }

  return (
    <section className="characters">
      {activePeople.map((person, index) => {
        const running = isRunning;
        return (
          <motion.article
            key={`${mode}-${person.id}`}
            className="char"
            style={{
              left: `${person.x}%`,
              top: `${person.y}%`,
              zIndex: person.zIndex,
            }}
            initial={{ x: -180, y: -20, opacity: 0.7 }}
            animate={{
              x: running ? 8 : 0,
              y: reactionId === person.id ? -16 : 0,
              opacity: 1,
              rotate: running ? [0, -2, 2, 0] : 0,
            }}
            transition={{ duration: running ? 0.9 : 0.35 }}
            onClick={() => handleCharacterClick(person.id)}
          >
            {mode === 'people' && <span className="nameplate">{person.name}</span>}
            {mode === 'home' ? '🙂' : '🏃'}
          </motion.article>
        );
      })}
    </section>
  );
}
