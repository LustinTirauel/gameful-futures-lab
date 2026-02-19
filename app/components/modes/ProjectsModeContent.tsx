import CharacterLayer from '../CharacterLayer';
import ProjectsLayer from '../ProjectsLayer';
import { projects } from '../../data/content';
import type { Mode } from '../../types/navigation';

type ProjectsModeContentProps = {
  mode: Mode;
  scene3DFailed: boolean;
  reactionId: string | null;
  isRunning: boolean;
  onReact: (personId: string) => void;
  onSelectPerson: (personId: string) => void;
  selectedProject: string | null;
  onProjectSelect: (projectId: string) => void;
};

export default function ProjectsModeContent({
  mode,
  scene3DFailed,
  reactionId,
  isRunning,
  onReact,
  onSelectPerson,
  selectedProject,
  onProjectSelect,
}: ProjectsModeContentProps) {
  return (
    <>
      {(mode === 'projects' || scene3DFailed) && (
        <CharacterLayer
          mode={mode}
          reactionId={reactionId}
          isRunning={isRunning}
          onReact={onReact}
          onSelectPerson={onSelectPerson}
        />
      )}

      {mode === 'projects' && (
        <ProjectsLayer
          projects={projects}
          selectedProject={selectedProject}
          onProjectSelect={onProjectSelect}
        />
      )}
    </>
  );
}
