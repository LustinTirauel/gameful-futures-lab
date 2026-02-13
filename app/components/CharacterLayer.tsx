import { motion, useReducedMotion, type TargetAndTransition } from 'framer-motion';
import { useMemo } from 'react';
import { people, type CharacterBehavior } from '../data/content';

type Mode = 'home' | 'people' | 'projects';

type CharacterLayerProps = {
  mode: Mode;
  reactionId: string | null;
  movementBehavior: CharacterBehavior;
  onReact: (personId: string) => void;
  onSelectPerson: (personId: string) => void;
};

const behaviorEmoji: Record<CharacterBehavior, string> = {
  lookAround: '👀',
  fishing: '🎣',
  snoring: '😴',
  talking: '🗨️',
  campfire: '🪵',
};

function getBehaviorPose(
  behavior: CharacterBehavior,
  reduceMotion: boolean,
  delay: number,
): TargetAndTransition {
  if (reduceMotion) {
    return { rotate: 0, y: 0, transition: { duration: 0.2, delay } };
  }

  switch (behavior) {
    case 'lookAround':
      return {
        rotate: [0, -1.6, 1.5, 0],
        transition: { duration: 7.8, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut', delay },
      };
    case 'fishing':
      return {
        rotate: [0, -1, 1, -2.8, 0],
        y: [0, 0, -1, -5, 0],
        transition: {
          duration: 6.6,
          repeat: Number.POSITIVE_INFINITY,
          times: [0, 0.4, 0.6, 0.72, 1],
          ease: 'easeInOut',
          delay,
        },
      };
    case 'snoring':
      return {
        y: [0, -3, 0],
        transition: { duration: 4.8, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut', delay },
      };
    case 'talking':
      return {
        y: [0, -2, 0],
        transition: { duration: 3.8, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut', delay },
      };
    case 'campfire':
      return {
        y: [0, -1.5, 0],
        transition: { duration: 5.2, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut', delay },
      };
  }
}

export default function CharacterLayer({
  mode,
  reactionId,
  movementBehavior,
  onReact,
  onSelectPerson,
}: CharacterLayerProps) {
  const reduceMotion = useReducedMotion();
  const sortedPeople = useMemo(() => [...people].sort((a, b) => a.name.localeCompare(b.name)), []);
  const activePeople = mode === 'people' ? sortedPeople : people;

  function handleCharacterClick(personId: string) {
    if (mode === 'home') {
      onReact(personId);
    } else if (mode === 'people') {
      onSelectPerson(personId);
    }
  }

  return (
    <section className="characters">
      {activePeople.map((person) => {
        const running = movementBehavior === 'run';
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
              rotate: running && !reduceMotion ? [0, -1.4, 1.4, 0] : 0,
            }}
            transition={{ duration: running ? 0.9 : 0.35, delay: index * 0.08 }}
            onClick={() => handleCharacterClick(person.id)}
          >
            {mode === 'people' && <span className="nameplate">{person.name}</span>}

            <motion.div
              className="char-core"
              animate={getBehaviorPose(person.behavior, !!reduceMotion, 0.15 + index * 0.22)}
            >
              {behaviorEmoji[person.behavior]}
            </motion.div>

            {person.behavior === 'snoring' && (
              <motion.span
                className="fx-bubble"
                animate={
                  reduceMotion
                    ? { opacity: 0.4, y: 0, x: 0 }
                    : {
                        opacity: [0, 0.55, 0],
                        y: [0, -9, -16],
                        x: [0, 2, 4],
                      }
                }
                transition={{ duration: 3.3, repeat: Number.POSITIVE_INFINITY, delay: 0.4 + index * 0.2 }}
              >
                Zzz
              </motion.span>
            )}

            {person.behavior === 'talking' && (
              <motion.span
                className="fx-bubble"
                animate={
                  reduceMotion
                    ? { scale: 1, y: 0, opacity: 0.75 }
                    : {
                        scale: [0.96, 1.04, 0.96],
                        y: [0, -4, 0],
                        opacity: [0.6, 0.95, 0.6],
                      }
                }
                transition={{ duration: 2.4, repeat: Number.POSITIVE_INFINITY, delay: 0.5 + index * 0.18 }}
              >
                ...
              </motion.span>
            )}

            {(person.behavior === 'campfire' || person.behavior === 'talking') && (
              <motion.div
                className="campfire"
                animate={
                  reduceMotion
                    ? { opacity: 0.8, scale: 1 }
                    : {
                        opacity: [0.68, 0.88, 0.72, 0.93, 0.75],
                        scale: [0.95, 1.04, 0.98, 1.07, 0.96],
                      }
                }
                transition={{
                  duration: 2.1,
                  repeat: Number.POSITIVE_INFINITY,
                  times: [0, 0.25, 0.5, 0.75, 1],
                  delay: 0.35 + index * 0.12,
                }}
              />
            )}
          </motion.article>
        );
      })}
    </section>
  );
}
