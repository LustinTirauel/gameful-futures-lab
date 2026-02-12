'use client';

import { motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import LandingScene3D from './components/LandingScene3D';
import { characterConfigs, people, projects } from './data/content';

type Mode = 'home' | 'people' | 'projects';

const modeMovementBehavior: Record<Mode, 'idle' | 'run'> = {
  home: 'idle',
  people: 'run',
  projects: 'run',
};

function CharacterBlocks({
  mode,
  selectedMode,
  reactionId,
  onReact,
  onSelectPerson
}: {
  mode: Mode;
  selectedMode: Mode;
  reactionId: string | null;
  onReact: (personId: string) => void;
  onSelectPerson: (personId: string) => void;
}) {
  const sortedPeople = useMemo(() => [...people].sort((a, b) => a.name.localeCompare(b.name)), []);

  return (
    <section className="characters">
      {(selectedMode === 'people' ? sortedPeople : people).map((person, index) => {
        const running = modeMovementBehavior[selectedMode] === 'run';
        return (
          <motion.article
            key={`${selectedMode}-${person.id}`}
            className="char"
            initial={{ x: -180, opacity: 0.7 }}
            animate={{
              x: running ? index * 8 : 0,
              y: reactionId === person.id ? -16 : 0,
              opacity: 1,
              rotate: running ? [0, -2, 2, 0] : 0
            }}
            transition={{ duration: running ? 0.9 : 0.35 }}
            onClick={() => {
              if (mode === 'home') {
                onReact(person.id);
              } else if (mode === 'people') {
                onSelectPerson(person.id);
              }
            }}
          >
            {selectedMode === 'people' && <span className="nameplate">{person.name}</span>}
            {selectedMode === 'home' ? '🙂' : '🏃'}
          </motion.article>
        );
      })}
    </section>
  );
}

export default function Home() {
  const [mode, setMode] = useState<Mode>('home');
  const [selectedPerson, setSelectedPerson] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [reactionId, setReactionId] = useState<string | null>(null);
  const [scene3DFailed, setScene3DFailed] = useState(false);

  const sortedPeople = useMemo(() => [...people].sort((a, b) => a.name.localeCompare(b.name)), []);
  const project = projects.find((item) => item.id === selectedProject);
  const sceneCharacters = useMemo(
    () => people.map((person) => ({ id: person.id, config: characterConfigs[person.id] })),
    [],
  );

  return (
    <main className="main">
      {mode === 'home' && !scene3DFailed && (
        <LandingScene3D
          characters={sceneCharacters}
          movementBehavior={modeMovementBehavior[mode]}
          onRuntimeError={() => setScene3DFailed(true)}
        />
      )}

      <nav className="nav">
        {(['home', 'people', 'projects'] as Mode[]).map((item) => (
          <button
            key={item}
            className={item === mode ? 'active' : ''}
            onClick={() => {
              setMode(item);
              setSelectedPerson(null);
              setSelectedProject(null);
            }}
          >
            {item[0].toUpperCase() + item.slice(1)}
          </button>
        ))}
      </nav>

      {mode === 'home' && (
        <div className="center-copy">
          <h1>Gameful Futures Lab</h1>
          <p>We build futures through games and play!</p>
        </div>
      )}

      {mode === 'home' && scene3DFailed && (
        <CharacterBlocks
          mode="home"
          selectedMode="home"
          reactionId={reactionId}
          onReact={(personId) => {
            setReactionId(personId);
            setTimeout(() => setReactionId(null), 500);
          }}
          onSelectPerson={() => undefined}
        />
      )}

      {mode !== 'home' && (
        <CharacterBlocks
          mode={mode}
          selectedMode={mode}
          reactionId={reactionId}
          onReact={(personId) => {
            setReactionId(personId);
            setTimeout(() => setReactionId(null), 500);
          }}
          onSelectPerson={(personId) => setSelectedPerson(personId)}
        />
      )}

      {mode === 'people' && selectedPerson && (
        <aside className="panel">
          {(() => {
            const person = sortedPeople.find((item) => item.id === selectedPerson);
            if (!person) return null;
            return (
              <>
                <h3>{person.name}</h3>
                <p>{person.bio}</p>
                <p>
                  <strong>Tags:</strong> {person.tags.join(', ')}
                </p>
              </>
            );
          })()}
        </aside>
      )}

      {mode === 'projects' && (
        <section className="plates">
          {projects.map((item) => (
            <article key={item.id} className="plate" onClick={() => setSelectedProject(item.id)}>
              <h3>{item.title}</h3>
              <p>{item.summary}</p>
            </article>
          ))}
        </section>
      )}

      {mode === 'projects' && project && (
        <aside className="panel">
          <h3>{project.title}</h3>
          <p>{project.summary}</p>
          <div dangerouslySetInnerHTML={{ __html: project.detailsHtml }} />
          <p>
            <strong>Team:</strong> {project.memberIds.join(', ')}
          </p>
        </aside>
      )}

      <section className="future">
        <strong>Prepared for next versions:</strong>
        <ul>
          <li>Blog/news page with editable posts</li>
          <li>User-submitted project form with HTML sanitization</li>
          <li>BibTeX-driven publications page</li>
          <li>People tag filters with "run away" behavior</li>
        </ul>
      </section>

      <div className="vignette" />
    </main>
  );
}
