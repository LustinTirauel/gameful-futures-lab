'use client';

import { motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import { people, projects } from './data/content';

type Mode = 'home' | 'people' | 'projects';

export default function Home() {
  const [mode, setMode] = useState<Mode>('home');
  const [selectedPerson, setSelectedPerson] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [reactionId, setReactionId] = useState<string | null>(null);

  const sortedPeople = useMemo(() => [...people].sort((a, b) => a.name.localeCompare(b.name)), []);
  const project = projects.find((item) => item.id === selectedProject);

  return (
    <main className="main">
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

      <section className="characters">
        {(mode === 'people' ? sortedPeople : people).map((person, index) => {
          const running = mode !== 'home';
          return (
            <motion.article
              key={`${mode}-${person.id}`}
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
                  setReactionId(person.id);
                  setTimeout(() => setReactionId(null), 500);
                } else if (mode === 'people') {
                  setSelectedPerson(person.id);
                }
              }}
            >
              {mode === 'people' && <span className="nameplate">{person.name}</span>}
              {mode === 'home' ? '🙂' : '🏃'}
            </motion.article>
          );
        })}
      </section>

      {mode === 'people' && selectedPerson && (
        <aside className="panel">
          {(() => {
            const person = people.find((item) => item.id === selectedPerson);
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
