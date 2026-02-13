'use client';

import { motion } from 'framer-motion';

type PersonTag = {
  id: string;
  name: string;
};

type PeopleRunwayProps = {
  people: PersonTag[];
  onSelectPerson: (personId: string) => void;
};

export default function PeopleRunway({ people, onSelectPerson }: PeopleRunwayProps) {
  return (
    <motion.section
      className="people-runway"
      initial={{ x: '100%', opacity: 0.3 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 1.1, ease: 'easeInOut' }}
      aria-label="People lineup"
    >
      <div className="people-runway-track" />
      <div className="people-runway-plates">
        {people.map((person) => (
          <button key={person.id} type="button" className="runway-nameplate" onClick={() => onSelectPerson(person.id)}>
            {person.name}
          </button>
        ))}
      </div>
    </motion.section>
  );
}
